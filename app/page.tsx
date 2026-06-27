import GameCard from "@/components/game/GameCard";
import CategoryRow from "@/components/game/CategoryRow";
import FeaturedCarousel from "@/components/game/FeaturedCarousel";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";
import { Gamepad2 } from "lucide-react";

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

async function getGamesByCategory(category: string) {
  try {
    await dbConnect();
    const games = await Game.find({ status: "published", category: { $regex: new RegExp(`^${category}$`, 'i') } })
      .sort({ playCount: -1 })
      .limit(10)
      .lean();
    return JSON.parse(JSON.stringify(games));
  } catch (error) {
    console.error(`Error fetching ${category} games:`, error);
    return [];
  }
}

async function getRecentGames() {
  try {
    await dbConnect();
    const games = await Game.find({ status: "published" })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    return JSON.parse(JSON.stringify(games));
  } catch (error) {
    console.error(`Error fetching recent games:`, error);
    return [];
  }
}

export default async function Home() {
  const featuredGames = await getFeaturedGames();
  const actionGames = await getGamesByCategory("action");
  const puzzleGames = await getGamesByCategory("puzzle");
  const recentGames = await getRecentGames();

  // If DB is completely empty (no mock data yet), show a friendly message
  const hasGames = featuredGames.length > 0 || actionGames.length > 0 || puzzleGames.length > 0 || recentGames.length > 0;

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {!hasGames && (
        <div className="text-center py-32 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(var(--primary-rgb),0.15)] border border-primary/20">
            <Gamepad2 className="w-10 h-10 text-primary-light" />
          </div>
          <h2 className="text-3xl font-bold text-text-main mb-4 tracking-tight">Welcome to CloudGames!</h2>
          <p className="text-text-secondary max-w-md mx-auto text-lg leading-relaxed">
            Your database is connected, but no published games were found yet. Head over to the admin dashboard to upload and publish some games.
          </p>
        </div>
      )}

      {featuredGames.length > 0 && (
        <section>
          <FeaturedCarousel games={featuredGames} />
        </section>
      )}

      {recentGames.length > 0 && (
        <section>
          <CategoryRow title="New Releases" games={recentGames} />
        </section>
      )}

      {actionGames.length > 0 && (
        <section>
          <CategoryRow title="Action Games" games={actionGames} categorySlug="action" />
        </section>
      )}

      {puzzleGames.length > 0 && (
        <section>
          <CategoryRow title="Puzzle Games" games={puzzleGames} categorySlug="puzzle" />
        </section>
      )}
    </div>
  );
}
