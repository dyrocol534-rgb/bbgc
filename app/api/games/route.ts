import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const featured = searchParams.get('featured') === 'true';
    const sort = searchParams.get('sort');
    const excludeIds = searchParams.get('exclude')?.split(',').filter(Boolean) || [];
    
    let dbQuery: any = { status: "published" };
    if (category) {
      dbQuery.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }
    let isSearch = false;
    let trimmedQuery = "";
    if (query && query.trim()) {
      trimmedQuery = query.trim();
      const escaped = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');
      dbQuery.$or = [
        { title: { $regex: searchRegex } },
        { category: { $regex: searchRegex } },
        { tags: { $regex: searchRegex } },
      ];
      isSearch = true;
    }
    if (featured) {
      dbQuery.featured = true;
    }
    if (excludeIds.length > 0 && sort === 'random') {
      const mongoose = (await import('mongoose')).default;
      dbQuery._id = { $nin: excludeIds.map(id => new mongoose.Types.ObjectId(id)) };
    }
    
    const skip = (page - 1) * limit;
    const isAutocomplete = Boolean(query && limit <= 20);
    
    let total = 0;
    let hasMore = false;
    let games: any[] = [];
    
    if (sort === 'random') {
      total = await Game.countDocuments(dbQuery);
      const maxSkip = Math.max(0, total - limit);
      const randomSkip = maxSkip > 0 ? Math.floor(Math.random() * (maxSkip + 1)) : 0;
      games = await Game.find(dbQuery)
        .select('_id slug title thumbnailUrl category playCount rating')
        .skip(randomSkip)
        .limit(limit)
        .lean();
      hasMore = games.length === limit;
    } else if (isSearch) {
      // Find matching candidates and rank them by relevance
      const candidateLimit = Math.min(Math.max((skip + limit) * 4, 60), 300);
      const candidates = await Game.find(dbQuery)
        .select('_id slug title thumbnailUrl category playCount rating')
        .sort({ playCount: -1 })
        .limit(candidateLimit)
        .lean();

      const lowerQuery = trimmedQuery.toLowerCase();
      const escaped = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const wholeWordRegex = new RegExp(`\\b${escaped}\\b`, 'i');

      const scored = candidates.map((g: any) => {
        const title = (g.title || '').toLowerCase();
        let score = 0;
        if (title === lowerQuery) {
          score = 1000; // Exact title match
        } else if (title.startsWith(lowerQuery)) {
          score = 800; // Starts with query
        } else if (wholeWordRegex.test(title)) {
          score = 600; // Contains full word in title
        } else if (title.includes(lowerQuery)) {
          score = 400; // Substring in title
        } else if (Array.isArray(g.category) && g.category.some((c: string) => c.toLowerCase().includes(lowerQuery))) {
          score = 200; // Category match
        } else {
          score = 100; // Tag match
        }
        return { game: g, score };
      });

      scored.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (b.game.playCount || 0) - (a.game.playCount || 0);
      });

      const sortedGames = scored.map(item => item.game);
      games = sortedGames.slice(skip, skip + limit);
      total = sortedGames.length;
      hasMore = skip + limit < sortedGames.length;
    } else {
      // High-performance pagination: fetch limit + 1 to determine hasMore without expensive full collection scans
      const fetched = await Game.find(dbQuery)
        .select('_id slug title thumbnailUrl category playCount rating')
        .sort({ playCount: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit + 1)
        .lean();

      hasMore = fetched.length > limit;
      games = hasMore ? fetched.slice(0, limit) : fetched;
      total = isAutocomplete ? games.length : (hasMore ? skip + limit + 1 : skip + games.length);
    }

    const cacheHeader = (sort === 'random' || isAutocomplete)
      ? "no-store"
      : "public, s-maxage=60, stale-while-revalidate=300";

    return NextResponse.json(
      {
        games,
        total,
        page,
        limit,
        hasMore,
      },
      {
        headers: {
          "Cache-Control": cacheHeader,
        },
      }
    );
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    const existingGame = await Game.findOne({ $or: [{ slug: data.slug }, { playUrl: data.playUrl }] });
    if (existingGame) {
      return NextResponse.json({ error: "Game already exists" }, { status: 409 });
    }
    
    const newGame = await Game.create({
      ...data,
      status: "draft"
    });
    
    if (newGame.status === "published") {
      try {
        revalidateTag("games", "max");
        revalidateTag("published-games", "max");
        revalidateTag("published-categories", "max");
        revalidatePath("/");
      } catch (e) {
        console.error("Cache revalidation error:", e);
      }
    }

    return NextResponse.json({ game: newGame }, { status: 201 });
  } catch (error) {
    console.error("Error creating game:", error);
    return NextResponse.json({ error: "Failed to create game" }, { status: 500 });
  }
}
