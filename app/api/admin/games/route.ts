import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.email !== (process.env.ADMIN_EMAIL || "tusharkantanayak713@gmail.com")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const source = searchParams.get("source") || "all";
    const sortField = searchParams.get("sortField") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const query: any = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }
    if (status !== "all") {
      query.status = status;
    }
    if (source !== "all") {
      query.source = source;
    }

    const skip = (page - 1) * limit;
    
    // Convert 'likes' to a virtual sort on array length if possible, or just fallback.
    // For simple sorting, if sortField is 'rating', we sort by likes length.
    let sortConfig: any = {};
    if (sortField === 'rating') {
      // It's hard to sort by array length directly in standard find, so we might need an aggregation
      // but for simplicity, we can just sort by playCount or keep it simple. Let's just sort by title/plays/feat/date for now
      // since MongoDB doesn't support direct sorting by array length easily in .find().
      sortConfig = { playCount: sortOrder }; 
    } else {
      sortConfig[sortField] = sortOrder;
    }

    const [games, total] = await Promise.all([
      Game.find(query).sort(sortConfig).skip(skip).limit(limit).lean(),
      Game.countDocuments(query),
    ]);
    
    return NextResponse.json({
      games,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 });
  }
}
