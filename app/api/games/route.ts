import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const featured = searchParams.get('featured') === 'true';
    
    let dbQuery: any = { status: "published" };
    if (category) {
      dbQuery.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }
    if (query) {
      dbQuery.title = { $regex: new RegExp(query, 'i') };
    }
    if (featured) {
      dbQuery.featured = true;
    }
    
    const games = await Game.find(dbQuery)
      .sort({ playCount: -1, createdAt: -1 })
      .limit(limit)
      .lean();
      
    return NextResponse.json({ games });
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    const newGame = await Game.create({
      ...data,
      status: "draft"
    });
    
    return NextResponse.json({ game: newGame }, { status: 201 });
  } catch (error) {
    console.error("Error creating game:", error);
    return NextResponse.json({ error: "Failed to create game" }, { status: 500 });
  }
}
