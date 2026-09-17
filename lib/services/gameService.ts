import { unstable_cache } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";
import GuestSession from "@/models/GuestSession";

export interface GameCardData {
  _id: string;
  slug: string;
  title: string;
  thumbnailUrl: string;
  category: string[];
  playCount: number;
}

export interface GameDetailData extends GameCardData {
  description: string;
  tags: string[];
  source: "own" | "aggregated";
  buildType: "html5" | "unity-webgl" | "construct" | "iframe-external";
  playUrl: string;
  width: number;
  height: number;
  orientation: "landscape" | "portrait" | "any";
  rating: { avg: number; count: number };
  status: "draft" | "published";
  featured: boolean;
  verified?: boolean;
  likes: string[];
  dislikes: string[];
  developer: string;
  platforms: string;
  createdAt: string;
  updatedAt: string;
}

export function serializeGameCard(doc: any): GameCardData {
  return {
    _id: doc._id?.toString() || "",
    slug: doc.slug || "",
    title: doc.title || "",
    thumbnailUrl: doc.thumbnailUrl || "",
    category: Array.isArray(doc.category) ? doc.category : [],
    playCount: typeof doc.playCount === "number" ? doc.playCount : 0,
  };
}

export function serializeGameDetail(doc: any): GameDetailData {
  return {
    _id: doc._id?.toString() || "",
    slug: doc.slug || "",
    title: doc.title || "",
    description: doc.description || "",
    thumbnailUrl: doc.thumbnailUrl || "",
    category: Array.isArray(doc.category) ? doc.category : [],
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    source: doc.source || "aggregated",
    buildType: doc.buildType || "html5",
    playUrl: doc.playUrl || "",
    width: typeof doc.width === "number" ? doc.width : 800,
    height: typeof doc.height === "number" ? doc.height : 600,
    orientation: doc.orientation || "any",
    playCount: typeof doc.playCount === "number" ? doc.playCount : 0,
    rating: {
      avg: doc.rating?.avg ?? 0,
      count: doc.rating?.count ?? 0,
    },
    status: doc.status || "draft",
    featured: Boolean(doc.featured),
    verified: Boolean(doc.verified),
    likes: Array.isArray(doc.likes) ? doc.likes.map((id: any) => id.toString()) : [],
    dislikes: Array.isArray(doc.dislikes) ? doc.dislikes.map((id: any) => id.toString()) : [],
    developer: doc.developer || "Bluebuff Games",
    platforms: doc.platforms || "Browser (desktop, mobile, tablet)",
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
  };
}

/**
 * High-performance in-memory Fisher-Yates shuffle
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Cached pool of top published games for instant in-memory random sampling.
 * Revalidated every 300 seconds (5 minutes) or on demand.
 */
export const getCachedPublishedGamePool = unstable_cache(
  async (): Promise<GameCardData[]> => {
    try {
      await dbConnect();
      const games = await Game.find({ status: "published" })
        .select("_id slug title thumbnailUrl category playCount")
        .sort({ playCount: -1, createdAt: -1 })
        .limit(300)
        .lean();
      return games.map(serializeGameCard);
    } catch (error) {
      console.error("Error fetching cached game pool:", error);
      return [];
    }
  },
  ["published-games-pool"],
  { revalidate: 300, tags: ["published-games"] }
);

/**
 * Fetch initial games for homepage with cached random sampling on page 1
 * and indexed pagination on subsequent pages.
 */
export async function getInitialHomeGames(page: number = 1, limit: number = 24): Promise<GameCardData[]> {
  try {
    if (page === 1) {
      const pool = await getCachedPublishedGamePool();
      if (pool.length > 0) {
        return shuffleArray(pool).slice(0, limit);
      }
    }

    // Fallback or subsequent pages
    await dbConnect();
    const skip = (page - 1) * limit;
    const games = await Game.find({ status: "published" })
      .select("_id slug title thumbnailUrl category playCount")
      .sort({ playCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    return games.map(serializeGameCard);
  } catch (error) {
    console.error("Error fetching initial home games:", error);
    return [];
  }
}

/**
 * Fetch a single published game by its slug with 24-hour ISR cache and tag invalidation
 */
export const getPublishedGameBySlug = (slug: string) =>
  unstable_cache(
    async (): Promise<GameDetailData | null> => {
      try {
        await dbConnect();
        const game = await Game.findOne({ slug, status: "published" }).lean();
        if (!game) return null;
        return serializeGameDetail(game);
      } catch (error) {
        console.error(`Error fetching game by slug (${slug}):`, error);
        return null;
      }
    },
    [`game-detail-${slug}`],
    { revalidate: 86400, tags: ["games", `game-${slug}`] }
  )();

/**
 * Fetch random suggested games instantly from cached game pool without $sample aggregation overhead
 */
export async function getRandomSuggestedGames(currentSlug: string, count: number = 12): Promise<GameCardData[]> {
  try {
    const pool = await getCachedPublishedGamePool();
    const filtered = pool.filter((g) => g.slug !== currentSlug);

    if (filtered.length > 0) {
      return shuffleArray(filtered).slice(0, count);
    }

    // Fallback: direct indexed DB query if cache is empty
    await dbConnect();
    const games = await Game.find({ status: "published", slug: { $ne: currentSlug } })
      .select("_id slug title thumbnailUrl category playCount")
      .limit(count)
      .lean();
    return games.map(serializeGameCard);
  } catch (error) {
    console.error("Error fetching random suggested games:", error);
    return [];
  }
}

/**
 * Pick a random single published game slug (e.g. for "Surprise Me" button)
 */
export async function getRandomSingleGameSlug(): Promise<string | null> {
  try {
    const pool = await getCachedPublishedGamePool();
    if (pool.length > 0) {
      const randomIndex = Math.floor(Math.random() * pool.length);
      return pool[randomIndex].slug;
    }

    await dbConnect();
    const total = await Game.countDocuments({ status: "published" });
    if (total === 0) return null;

    const randomSkip = Math.floor(Math.random() * total);
    const game = await Game.findOne({ status: "published" })
      .select("slug")
      .skip(randomSkip)
      .lean();

    return game ? game.slug : null;
  } catch (error) {
    console.error("Error getting random single game slug:", error);
    return null;
  }
}

/**
 * Fetch published games filtered by category with 24-hour ISR cache and tag invalidation
 */
export const getPublishedGamesByCategory = (category: string) =>
  unstable_cache(
    async (): Promise<GameCardData[]> => {
      try {
        await dbConnect();
        const query: any = { status: "published" };
        let sort: any = { playCount: -1 };
        let limitAmount = 0;

        const cat = category.toLowerCase();

        if (cat === "new") {
          sort = { createdAt: -1 };
          limitAmount = 18;
        } else if (cat === "popular") {
          sort = { playCount: -1 };
          limitAmount = 18;
        } else if (cat === "updated") {
          sort = { updatedAt: -1 };
          limitAmount = 18;
        } else if (cat === "featured") {
          sort = { playCount: -1 };
          query.featured = true;
          limitAmount = 18;
        } else if (cat === "io" || cat === ".io") {
          query.category = { $regex: /^\.?io$/i };
        } else {
          query.category = { $regex: new RegExp(`^${category}$`, "i") };
        }

        const queryBuilder = Game.find(query)
          .sort(sort)
          .select("_id slug title thumbnailUrl category playCount");

        if (limitAmount > 0) {
          queryBuilder.limit(limitAmount);
        }

        const games = await queryBuilder.lean();
        return games.map(serializeGameCard);
      } catch (error) {
        console.error(`Error fetching category games (${category}):`, error);
        return [];
      }
    },
    [`category-games-${category.toLowerCase()}`],
    { revalidate: 86400, tags: ["games", `category-${category.toLowerCase()}`] }
  )();

/**
 * Fetch games matching a specific list of slugs while preserving the order of slugs
 */
export async function getGamesBySlugs(slugs: string[]): Promise<GameCardData[]> {
  if (!slugs || slugs.length === 0) return [];
  try {
    await dbConnect();
    const games = await Game.find({ slug: { $in: slugs }, status: "published" })
      .select("_id slug title thumbnailUrl category playCount")
      .lean();

    const gameMap = new Map(games.map((g) => [g.slug, serializeGameCard(g)]));
    return slugs.map((slug) => gameMap.get(slug)).filter((g): g is GameCardData => Boolean(g));
  } catch (error) {
    console.error("Error fetching games by slugs:", error);
    return [];
  }
}

/**
 * Retrieve recently played games for an authenticated user or guest session
 */
export async function getRecentGamesForUserOrGuest(
  session: any,
  guestId?: string,
  limit: number = 6
): Promise<GameCardData[]> {
  try {
    let recentSlugs: string[] = [];

    if (session?.user && (session.user as any).recentlyPlayed?.length > 0) {
      recentSlugs = (session.user as any).recentlyPlayed.slice(0, limit);
    } else if (guestId) {
      await dbConnect();
      const guest = await GuestSession.findOne({ guestId }).lean();
      if (guest && guest.recentlyPlayed?.length > 0) {
        recentSlugs = guest.recentlyPlayed.slice(0, limit);
      }
    }

    if (recentSlugs.length > 0) {
      return await getGamesBySlugs(recentSlugs);
    }
    return [];
  } catch (error) {
    console.error("Error fetching recent games for user/guest:", error);
    return [];
  }
}

/**
 * Cached list of all published categories.
 * Revalidated every 3600 seconds (1 hour).
 */
export const getCachedPublishedCategories = unstable_cache(
  async (): Promise<string[]> => {
    try {
      await dbConnect();
      const categories = await Game.distinct("category", { status: "published" });
      const validCategories = categories
        .filter((c: any) => typeof c === "string" && c.trim() !== "")
        .map((c: string) => {
          const lower = c.trim().toLowerCase();
          return lower === ".io" ? "io" : lower;
        })
        .filter((value: string, index: number, self: string[]) => self.indexOf(value) === index)
        .sort();
      return validCategories;
    } catch (error) {
      console.error("Error fetching published categories:", error);
      return [];
    }
  },
  ["published-categories-list"],
  { revalidate: 3600, tags: ["published-categories"] }
);

