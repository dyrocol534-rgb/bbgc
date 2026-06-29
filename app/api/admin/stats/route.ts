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

    const [totalUsers, totalGames, totalSubscribers, activeLoggedInUsers, activeGuests, newUsers7d, games] = await Promise.all([
      User.countDocuments(),
      Game.countDocuments(),
      Subscriber.countDocuments(),
      User.countDocuments({ lastActiveAt: { $gte: oneDayAgo } }),
      GuestSession.countDocuments({ lastActiveAt: { $gte: oneDayAgo } }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Game.find({}, 'playCount').lean()
    ]);
    
    const activeUsers24h = activeLoggedInUsers + activeGuests;
    const totalPlays = games.reduce((sum, game: any) => sum + (game.playCount || 0), 0);

    return NextResponse.json({
      totalUsers,
      totalGames,
      totalPlays,
      activeUsers24h,
      newUsers7d,
      totalSubscribers
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
