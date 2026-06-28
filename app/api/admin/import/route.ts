import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.email !== (process.env.ADMIN_EMAIL || "tusharkantanayak713@gmail.com")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    
    // Using GameMonetize JSON API Feed since GameDistribution is unreachable
    const num = 30;
    const url = `https://gamemonetize.com/feed.php?format=0&num=${num}&page=${page}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from GameMonetize: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("GameMonetize Fetch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
