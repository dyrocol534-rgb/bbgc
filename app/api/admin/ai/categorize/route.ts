import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";

export const dynamic = "force-dynamic";

const CANONICAL_CATEGORIES = [
  "Action",
  "Adventure",
  "Arcade",
  "Board",
  "Card",
  "Clicker",
  "Driving",
  "Racing",
  "Puzzle",
  "Shooting",
  "Sports",
  "Multiplayer",
  "Casual",
  "Strategy",
  "3D",
  "io"
];

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const adminEmail = process.env.ADMIN_EMAIL || "tusharkantanayak713@gmail.com";

    if (!session || session.user?.email !== adminEmail) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key is not configured" }, { status: 500 });
    }

    const body = await req.json();
    const { gameId, title, description, category, tags, gameIds } = body;

    await dbConnect();

    // 1. Single game ID provided
    if (gameId) {
      const game = await Game.findById(gameId);
      if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });

      const prompt = `You are an expert game taxonomist for "Bluebuff Games".
Analyze the game below and assign accurate categories and search tags.

ALLOWED CANONICAL CATEGORIES:
${JSON.stringify(CANONICAL_CATEGORIES)}

Game Title: ${game.title}
Current Description: ${(game.description || "").slice(0, 300)}
Current Category: ${game.category?.join(", ") || "None"}
Current Tags: ${game.tags?.join(", ") || "None"}

INSTRUCTIONS:
1. Select 1 to 3 MOST ACCURATE categories strictly from the canonical list above.
2. Generate 4 to 7 player search tags (lowercase keywords).
3. Determine orientation: "landscape", "portrait", or "any".

Respond in ONLY this JSON format:
{
  "categories": ["Driving", "Racing", "3D"],
  "tags": ["car", "racing", "speed"],
  "orientation": "landscape"
}`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;
      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 600,
            responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        return NextResponse.json({ error: `Gemini error: ${errText}` }, { status: 502 });
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      const parsed = JSON.parse(rawText);

      const formattedCategories = (parsed.categories || []).map((c: string) => c.trim().toLowerCase().replace(/^\./, ''));
      const formattedTags = (parsed.tags || []).map((t: string) => t.trim().toLowerCase());
      const orientation = ["landscape", "portrait", "any"].includes(parsed.orientation) ? parsed.orientation : "any";

      game.category = formattedCategories;
      game.tags = formattedTags;
      game.orientation = orientation;
      game.updatedAt = new Date();
      await game.save();

      return NextResponse.json({
        success: true,
        gameId: game._id,
        categories: formattedCategories,
        tags: formattedTags,
        orientation
      });
    }

    // 2. Raw metadata query (for form auto-fill)
    if (title) {
      const prompt = `You are an expert game taxonomist for "Bluebuff Games".
Analyze the game below and assign accurate categories and search tags.

ALLOWED CANONICAL CATEGORIES:
${JSON.stringify(CANONICAL_CATEGORIES)}

Game Title: ${title}
Current Description: ${(description || "").slice(0, 300)}
Current Category: ${Array.isArray(category) ? category.join(", ") : (category || "")}
Current Tags: ${Array.isArray(tags) ? tags.join(", ") : (tags || "")}

Respond in ONLY this JSON format:
{
  "categories": ["Driving", "Racing", "3D"],
  "tags": ["car", "racing", "speed"],
  "orientation": "landscape"
}`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;
      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 600,
            responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        return NextResponse.json({ error: `Gemini error: ${errText}` }, { status: 502 });
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      const parsed = JSON.parse(rawText);

      return NextResponse.json({
        success: true,
        categories: (parsed.categories || []).map((c: string) => c.trim().toLowerCase().replace(/^\./, '')),
        tags: (parsed.tags || []).map((t: string) => t.trim().toLowerCase()),
        orientation: ["landscape", "portrait", "any"].includes(parsed.orientation) ? parsed.orientation : "any"
      });
    }

    return NextResponse.json({ error: "Missing gameId or title parameter" }, { status: 400 });
  } catch (error: any) {
    console.error("AI Categorize Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
