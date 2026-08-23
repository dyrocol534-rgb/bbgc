import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";

export const dynamic = "force-dynamic";

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
    const { gameId, gameIds } = body;

    await dbConnect();

    // If single gameId is provided
    if (gameId) {
      const game = await Game.findById(gameId);
      if (!game) {
        return NextResponse.json({ error: "Game not found" }, { status: 404 });
      }

      const prompt = `You are a world-class gaming SEO copywriter for "Bluebuff Games" (a premier free instant browser games portal where games run directly with zero downloads or installs).

Write a compelling, high-converting, SEO-optimized game description for the following browser game:

Game Title: ${game.title}
Category: ${Array.isArray(game.category) ? game.category.join(", ") : game.category || "Action/Arcade"}
Tags/Keywords: ${Array.isArray(game.tags) ? game.tags.join(", ") : "free online game, unblocked, browser game"}
${game.description ? `Current Details: ${game.description}` : ""}

Requirements:
1. Length: 120-200 words (2 concise paragraphs).
2. Structure:
   - Paragraph 1: High-energy opening hook explaining what the game is about and core objective.
   - Paragraph 2: Exciting features, controls, and highlighting that it is 100% free with no download or install needed on PC, Chromebook, and mobile.
3. Tone: Fun, engaging, clear, and natural.
4. DO NOT use markdown headers (no ## or ###).
5. Return ONLY the description text.`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;
      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        return NextResponse.json({ error: `Gemini error: ${errText}` }, { status: 502 });
      }

      const data = await response.json();
      const newDesc = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (newDesc) {
        game.description = newDesc;
        game.updatedAt = new Date();
        await game.save();

        return NextResponse.json({
          success: true,
          gameId: game._id,
          description: newDesc
        });
      }
    }

    // If batch gameIds are provided (limit to 15 per batch to prevent timeouts)
    if (Array.isArray(gameIds) && gameIds.length > 0) {
      const idsToProcess = gameIds.slice(0, 15);
      const games = await Game.find({ _id: { $in: idsToProcess } });
      const updatedGames: Array<{ id: string; title: string }> = [];

      for (const game of games) {
        try {
          const prompt = `Write a 2-paragraph, 120-180 word SEO-optimized game description for "${game.title}" (Category: ${game.category?.join(", ") || "Action"}). Mention that players can play it 100% free with no download, install, or registration on Bluebuff Games. Return ONLY the description text.`;
          
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;
          const response = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 400 }
            })
          });

          if (response.ok) {
            const data = await response.json();
            const desc = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (desc) {
              game.description = desc;
              game.updatedAt = new Date();
              await game.save();
              updatedGames.push({ id: game._id.toString(), title: game.title });
            }
          }
        } catch (e) {
          console.error(`Failed to generate SEO description for game ${game.title}:`, e);
        }
      }

      return NextResponse.json({
        success: true,
        updatedCount: updatedGames.length,
        updatedGames
      });
    }

    return NextResponse.json({ error: "Missing gameId or gameIds" }, { status: 400 });

  } catch (error: any) {
    console.error("Batch AI Enhance Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
