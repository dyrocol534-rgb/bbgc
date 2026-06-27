import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await dbConnect();
    
    const game = await Game.findOneAndUpdate(
      { slug },
      { $inc: { playCount: 1 } },
      { new: true }
    ).lean();
    
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }
      
    return NextResponse.json({ success: true, playCount: game.playCount });
  } catch (error) {
    console.error("Error incrementing play count:", error);
    return NextResponse.json({ error: "Failed to increment play count" }, { status: 500 });
  }
}
