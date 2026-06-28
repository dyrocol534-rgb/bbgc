import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await dbConnect();
    
    // Increment global play count for the game
    const game = await Game.findOneAndUpdate(
      { slug },
      { $inc: { playCount: 1 } },
      { new: true }
    ).lean();
    
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Update user's recentlyPlayed history if logged in
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      // First, remove the game if it already exists to avoid duplicates
      await User.updateOne(
        { email: session.user.email },
        { $pull: { recentlyPlayed: slug } }
      );
      // Then, push it to the front and keep only the last 3
      await User.updateOne(
        { email: session.user.email },
        { 
          $push: { 
            recentlyPlayed: { 
              $each: [slug], 
              $position: 0, 
              $slice: 3 
            } 
          },
          $set: { lastActiveAt: new Date() }
        }
      );
    }
      
    return NextResponse.json({ success: true, playCount: game.playCount });
  } catch (error) {
    console.error("Error incrementing play count:", error);
    return NextResponse.json({ error: "Failed to increment play count" }, { status: 500 });
  }
}
