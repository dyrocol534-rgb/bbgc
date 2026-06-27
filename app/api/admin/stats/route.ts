import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.email !== "tusharkantanayak713@gmail.com") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    
    const totalUsers = await User.countDocuments();
    const totalGames = await Game.countDocuments();
    
    const games = await Game.find({}, 'playCount');
    const totalPlays = games.reduce((sum, game) => sum + (game.playCount || 0), 0);

    return NextResponse.json({
      totalUsers,
      totalGames,
      totalPlays
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
