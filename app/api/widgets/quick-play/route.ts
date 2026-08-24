import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";

export async function GET() {
  try {
    await dbConnect();
    // Fetch a featured or popular game
    const game = await Game.findOne({ isPublished: true })
      .sort({ playsCount: -1, rating: -1 })
      .select("title slug thumbnail")
      .lean();

    const title = game ? `Game of the Day: ${game.title}` : "Instant Free Games";
    const gameUrl = game ? `games/${game.slug}` : "";

    return NextResponse.json({
      title,
      gameUrl,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      title: "Play Free Games Instantly",
      gameUrl: "",
      updatedAt: new Date().toISOString(),
    });
  }
}
