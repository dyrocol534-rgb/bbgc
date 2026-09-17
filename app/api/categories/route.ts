import { NextResponse } from "next/server";
import { getCachedPublishedCategories } from "@/lib/services/gameService";

export async function GET() {
  try {
    const categories = await getCachedPublishedCategories();
    return NextResponse.json(
      { categories },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
