import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.email !== (process.env.ADMIN_EMAIL || "tusharkantanayak713@gmail.com")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { ids } = await req.json();
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No game IDs provided" }, { status: 400 });
    }

    await dbConnect();
    
    // Find games to capture slugs for tag invalidation
    const gamesToDelete = await Game.find({ _id: { $in: ids } }, "slug").lean();
    
    const result = await Game.deleteMany({ _id: { $in: ids } });

    // Invalidate ISR caches
    try {
      revalidateTag("games", "max");
      revalidateTag("published-games", "max");
      revalidateTag("published-categories", "max");
      for (const g of gamesToDelete) {
        if (g.slug) revalidateTag(`game-${g.slug}`, "max");
      }
    } catch (e) {
      console.error("Cache revalidation error:", e);
    }

    return NextResponse.json({ 
      success: true, 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error("Batch delete error:", error);
    return NextResponse.json({ error: "Failed to batch delete games" }, { status: 500 });
  }
}

export const DELETE = POST;
