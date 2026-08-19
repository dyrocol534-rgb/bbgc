import { NextResponse } from "next/server";
import { getCachedPublishedCategories } from "@/lib/services/gameService";

export async function GET() {
  try {
    const categories = await getCachedPublishedCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
