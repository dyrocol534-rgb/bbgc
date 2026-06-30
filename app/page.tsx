import GameCard from "@/components/game/GameCard";
import ContinuePlayingRow from "@/components/game/ContinuePlayingRow";
import dynamic from "next/dynamic";
const InfiniteGameGrid = dynamic(() => import("@/components/game/InfiniteGameGrid"));
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";
import { Gamepad2 } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { cookies } from "next/headers";
import GuestSession from "@/models/GuestSession";

export const revalidate = 60; // Revalidate page every 60 seconds


async function getInitialAllGames() {
  try {
    await dbConnect();
    const games = await Game.aggregate([
      { $match: { status: "published" } },
      { $sample: { size: 24 } }
    ]);
    return JSON.parse(JSON.stringify(games));
  } catch (error) {
    console.error(`Error fetching initial games:`, error);
    return [];
  }
}

export default async function Home() {
  const session = await getServerSession(authOptions);

  const initialAllGames = await getInitialAllGames();

  // Fetch user's or guest's recently played games
  let userRecentGames = [];
  try {
    await dbConnect();
    let recentSlugs = [];
    
    if (session?.user && (session.user as any).recentlyPlayed?.length > 0) {
      recentSlugs = (session.user as any).recentlyPlayed.slice(0, 3);
    } else {
      // If not logged in, check for guest session
      const cookieStore = await cookies();
      const guestIdCookie = cookieStore.get('guestId');
      if (guestIdCookie?.value) {
        const guest = await GuestSession.findOne({ guestId: guestIdCookie.value }).lean();
        if (guest && guest.recentlyPlayed?.length > 0) {
          recentSlugs = guest.recentlyPlayed.slice(0, 3);
        }
      }
    }

    if (recentSlugs.length > 0) {
      const games = await Game.find({ slug: { $in: recentSlugs } }).lean();
      const gameMap = new Map(games.map(g => [(g as any).slug, g]));
      userRecentGames = recentSlugs.map((slug: string) => gameMap.get(slug)).filter(Boolean);
    }
  } catch (error) {
    console.error("Error fetching recent games:", error);
  }

  const hasGames = initialAllGames.length > 0;

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {!hasGames && (
        <div className="text-center py-32 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(var(--primary-rgb),0.15)] border border-primary/20">
            <Gamepad2 className="w-10 h-10 text-primary-light" />
          </div>
          <h2 className="text-3xl font-bold text-text-main mb-4 tracking-tight">Welcome to {process.env.NEXT_PUBLIC_SITE_NAME || "Bluebuff Games"}!</h2>
          <p className="text-text-secondary max-w-md mx-auto text-lg leading-relaxed">
            Your database is connected, but no published games were found yet. Head over to the admin dashboard to upload and publish some games.
          </p>
        </div>
      )}

      {userRecentGames.length > 0 && (
        <ContinuePlayingRow games={userRecentGames} />
      )}


      {initialAllGames.length > 0 && (
        <section>
          <InfiniteGameGrid initialGames={initialAllGames} />
        </section>
      )}
    </div>
  );
}
