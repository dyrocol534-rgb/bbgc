import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";

export const dynamic = "force-dynamic"; // Ensure it's not cached

export async function GET() {
  try {
    await dbConnect();
    
    // Fetch a single random published game using MongoDB's $sample aggregation
    const randomGame = await Game.aggregate([
      { $match: { status: "published" } },
      { $sample: { size: 1 } },
      { $project: { slug: 1 } }
    ]);

    if (!randomGame || randomGame.length === 0) {
      return NextResponse.json({ error: "No games found" }, { status: 404 });
    }

    return NextResponse.json({ slug: randomGame[0].slug });
  } catch (error: any) {
    console.error("Failed to fetch random game:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
