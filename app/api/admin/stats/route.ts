import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";
import User from "@/models/User";
import Subscriber from "@/models/Subscriber";
import GuestSession from "@/models/GuestSession";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.email !== (process.env.ADMIN_EMAIL || "tusharkantanayak713@gmail.com")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalGames,
      totalSubscribers,
      activeLoggedInUsers24h,
      activeGuests24h,
      activeGuests7d,
      newGuests7d,
      newUsers7d,
      games,
      totalGuestSessions,
      guestSessionsWithPlays,
    ] = await Promise.all([
      User.countDocuments(),
      Game.countDocuments({ status: "published" }),
      Subscriber.countDocuments(),
      User.countDocuments({ lastActiveAt: { $gte: oneDayAgo } }),
      GuestSession.countDocuments({ lastActiveAt: { $gte: oneDayAgo } }),
      GuestSession.countDocuments({ lastActiveAt: { $gte: sevenDaysAgo } }),
      GuestSession.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Game.find({}, "playCount title slug").lean(),
      GuestSession.countDocuments(),
      GuestSession.find(
        { recentlyPlayed: { $exists: true, $not: { $size: 0 } } },
        "recentlyPlayed"
      ).lean(),
    ]);

    // Count slug frequency across all guest sessions
    const slugCountMap: Record<string, number> = {};
    for (const gs of guestSessionsWithPlays) {
      for (const slug of (gs as any).recentlyPlayed || []) {
        slugCountMap[slug] = (slugCountMap[slug] || 0) + 1;
      }
    }

    const topGuestGameSlugs = Object.entries(slugCountMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([slug, count]) => ({ slug, count }));

    const gameMap = new Map(games.map((g: any) => [g.slug, g.title]));
    const topGuestGames = topGuestGameSlugs.map(({ slug, count }) => ({
      slug,
      title: (gameMap.get(slug) as string) || slug,
      count,
    }));

    const activeUsers24h = activeLoggedInUsers24h + activeGuests24h;
    const totalPlays = games.reduce((sum: number, game: any) => sum + (game.playCount || 0), 0);

    // Get Top 5 games overall
    const topGamesOverall = [...games]
      .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
      .slice(0, 5)
      .map(g => ({ slug: g.slug, title: g.title, playCount: g.playCount || 0 }));

    // Get Recent Signups Trend (Last 7 days)
    const recentUsersDocs = await User.find({ createdAt: { $gte: sevenDaysAgo } }, "createdAt").lean();
    const signupsByDate: Record<string, number> = {};
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split("T")[0];
      signupsByDate[dateStr] = 0;
    }

    recentUsersDocs.forEach((u: any) => {
      if (u.createdAt) {
        const d = new Date(u.createdAt);
        const dateStr = d.toISOString().split("T")[0];
        if (signupsByDate[dateStr] !== undefined) {
          signupsByDate[dateStr]++;
        }
      }
    });

    const recentSignups = Object.entries(signupsByDate).map(([date, count]) => ({ date, count }));

    return NextResponse.json({
      totalUsers,
      totalGames,
      totalPlays,
      activeUsers24h,
      newUsers7d,
      totalSubscribers,
      totalGuestSessions,
      activeGuests24h,
      activeGuests7d,
      newGuests7d,
      activeLoggedInUsers24h,
      topGuestGames,
      topGamesOverall,
      recentSignups
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}