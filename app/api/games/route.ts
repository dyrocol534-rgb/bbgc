import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const featured = searchParams.get('featured') === 'true';
    const sort = searchParams.get('sort');
    const excludeIds = searchParams.get('exclude')?.split(',').filter(Boolean) || [];
    
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
    if (excludeIds.length > 0) {
      const mongoose = (await import('mongoose')).default;
      dbQuery._id = { $nin: excludeIds.map(id => new mongoose.Types.ObjectId(id)) };
    }
    
    const skip = (page - 1) * limit;
    
    let games;
    let total;
    
    if (sort === 'random') {
      games = await Game.aggregate([
        { $match: dbQuery },
        { $sample: { size: limit } }
      ]);
      total = await Game.countDocuments(dbQuery); // total remaining
    } else {
      games = await Game.find(dbQuery)
        .sort({ playCount: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
      total = await Game.countDocuments(dbQuery);
    }
      
    return NextResponse.json({ games, total, page, limit, hasMore: sort === 'random' ? games.length === limit : skip + games.length < total });
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    const existingGame = await Game.findOne({ $or: [{ slug: data.slug }, { playUrl: data.playUrl }] });
    if (existingGame) {
      return NextResponse.json({ error: "Game already exists" }, { status: 409 });
    }
    
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
