import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.email !== (process.env.ADMIN_EMAIL || "tusharkantanayak713@gmail.com")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    const games = await Game.find({ status: "published" }).select("_id title slug playUrl").lean();
    
    return NextResponse.json(games);
  } catch (error: any) {
    console.error("Scanner URLs fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
