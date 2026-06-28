import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.email !== (process.env.ADMIN_EMAIL || "tusharkantanayak713@gmail.com")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const category = searchParams.get("category") || "All";
    
    // Using GameMonetize JSON API Feed since GameDistribution is unreachable
    const num = 50;
    let url = `https://gamemonetize.com/feed.php?format=0&num=${num}&page=${page}`;
    
    if (category !== "All") {
      url += `&category=${encodeURIComponent(category)}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from GameMonetize: ${response.status}`);
    }

    const data = await response.json();
    
    await dbConnect();
    const urls = Array.isArray(data) ? data.map((g: any) => g.url) : [];
    const existingGames = await Game.find({ playUrl: { $in: urls } }).select('playUrl').lean();
    const importedUrls = existingGames.map(g => g.playUrl);

    return NextResponse.json({ items: data, importedUrls });
  } catch (error: any) {
    console.error("GameMonetize Fetch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
