import { NextResponse } from "next/server";
import { getRandomSingleGameSlug } from "@/lib/services/gameService";

export const dynamic = "force-dynamic"; // Ensure random on every call

export async function GET() {
  try {
    const slug = await getRandomSingleGameSlug();

    if (!slug) {
      return NextResponse.json({ error: "No games found" }, { status: 404 });
    }

    return NextResponse.json({ slug });
  } catch (error: any) {
    console.error("Failed to fetch random game:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
