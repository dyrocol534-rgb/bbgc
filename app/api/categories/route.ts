import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";

export async function GET() {
  try {
    await dbConnect();
    
    // Find all unique categories from published games
    const categories = await Game.distinct("category", { status: "published" });
    
    // Some categories might be empty or null, filter them out and sort alphabetically
    const validCategories = categories
      .filter((c: any) => typeof c === 'string' && c.trim() !== '')
      .map((c: string) => c.toLowerCase()) // Normalize to lowercase for sorting
      // Remove duplicates after lowercase normalization
      .filter((value: string, index: number, self: string[]) => self.indexOf(value) === index)
      .sort();

    return NextResponse.json({ categories: validCategories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
