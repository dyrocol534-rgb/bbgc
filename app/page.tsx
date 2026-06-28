import GameCard from "@/components/game/GameCard";
import CategoryRow from "@/components/game/CategoryRow";
import FeaturedCarousel from "@/components/game/FeaturedCarousel";
import ContinuePlayingRow from "@/components/game/ContinuePlayingRow";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";
import { Gamepad2 } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Next.js 15 requires server components that access database without passing through 
// fetch to opt out of static rendering if they want fresh data, or you configure revalidation.
export const revalidate = 60; // Revalidate page every 60 seconds

async function getFeaturedGames() {
  try {
    await dbConnect();
    const games = await Game.find({ status: "published", featured: true }).lean();
    return JSON.parse(JSON.stringify(games));
  } catch (error) {
    console.error("Error fetching featured games:", error);
    return [];
  }
}

async function getSuggestedGames() {
  try {
    await dbConnect();
    // Sort by play count for popular suggestions
    const games = await Game.find({ status: "published" })
      .sort({ playCount: -1 })
      .limit(24)
      .lean();
    return JSON.parse(JSON.stringify(games));
  } catch (error) {
    console.error(`Error fetching suggested games:`, error);
    return [];
  }
}

async function getRecentGames() {
  try {
    await dbConnect();
    const games = await Game.find({ status: "published" })
      .sort({ createdAt: -1 })
      .limit(16)
      .lean();
    return JSON.parse(JSON.stringify(games));
  } catch (error) {
    console.error(`Error fetching recent games:`, error);
    return [];
  }
}

async function getCategoryGames(category: string, limit: number = 16) {
  try {
    await dbConnect();
    const games = await Game.find({ 
      status: "published", 
      category: { $regex: new RegExp(`^${category}$`, 'i') } 
    })
      .sort({ playCount: -1 })
      .limit(limit)
      .lean();
    return JSON.parse(JSON.stringify(games));
  } catch (error) {
    console.error(`Error fetching ${category} games:`, error);
    return [];
  }
}

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  const featuredGames = await getFeaturedGames();
  const suggestedGames = await getSuggestedGames();
  const recentGames = await getRecentGames();
  
  // Fetch specific categories for a richer homepage
  const actionGames = await getCategoryGames("action", 16);
  const arcadeGames = await getCategoryGames("arcade", 16);
  const puzzleGames = await getCategoryGames("puzzle", 16);
  const racingGames = await getCategoryGames("racing", 16);

  // Fetch user's recently played games if logged in
  let userRecentGames = [];
  if (session?.user && (session.user as any).recentlyPlayed?.length > 0) {
    try {
      await dbConnect();
      const recentSlugs = (session.user as any).recentlyPlayed.slice(0, 3);
      const games = await Game.find({ slug: { $in: recentSlugs } }).lean();
      
      // Preserve order
      const gameMap = new Map(games.map(g => [(g as any).slug, g]));
      userRecentGames = recentSlugs.map((slug: string) => gameMap.get(slug)).filter(Boolean);
    } catch (error) {
      console.error("Error fetching user recent games:", error);
    }
  }

  // If DB is completely empty (no mock data yet), show a friendly message
  const hasGames = featuredGames.length > 0 || suggestedGames.length > 0 || recentGames.length > 0;

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {!hasGames && (
        <div className="text-center py-32 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(var(--primary-rgb),0.15)] border border-primary/20">
            <Gamepad2 className="w-10 h-10 text-primary-light" />
          </div>
          <h2 className="text-3xl font-bold text-text-main mb-4 tracking-tight">Welcome to {process.env.NEXT_PUBLIC_SITE_NAME || "TapAndPlay"}!</h2>
          <p className="text-text-secondary max-w-md mx-auto text-lg leading-relaxed">
            Your database is connected, but no published games were found yet. Head over to the admin dashboard to upload and publish some games.
          </p>
        </div>
      )}

      {userRecentGames.length > 0 && (
        <ContinuePlayingRow games={userRecentGames} />
      )}

      {featuredGames.length > 0 && (
        <section>
          <FeaturedCarousel games={featuredGames} />
        </section>
      )}

      {suggestedGames.length > 0 && (
        <section>
          <CategoryRow title="Suggestions for you" games={suggestedGames} />
        </section>
      )}

      {actionGames.length > 0 && (
        <section>
          <CategoryRow title="Action Games" categorySlug="action" games={actionGames} />
        </section>
      )}

      {arcadeGames.length > 0 && (
        <section>
          <CategoryRow title="Arcade Classics" categorySlug="arcade" games={arcadeGames} />
        </section>
      )}

      {recentGames.length > 0 && (
        <section>
          <CategoryRow title="New Releases" games={recentGames} />
        </section>
      )}

      {puzzleGames.length > 0 && (
        <section>
          <CategoryRow title="Puzzle Games" categorySlug="puzzle" games={puzzleGames} />
        </section>
      )}

      {racingGames.length > 0 && (
        <section>
          <CategoryRow title="Racing & Driving" categorySlug="racing" games={racingGames} />
        </section>
      )}
    </div>
  );
}
