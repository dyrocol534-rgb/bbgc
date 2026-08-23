import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
      return NextResponse.json({ error: "Gemini API key is not configured on the server" }, { status: 500 });
    }

    const body = await req.json();
    const { title, category, tags, currentDescription } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Game title is required" }, { status: 400 });
    }

    const prompt = `You are a world-class gaming SEO copywriter for "Bluebuff Games" (a premier free instant browser games portal where games run directly with zero downloads or installs).

Write a compelling, high-converting, SEO-optimized game description for the following browser game:

Game Title: ${title}
Category: ${Array.isArray(category) ? category.join(", ") : category || "Action/Arcade"}
Tags/Keywords: ${Array.isArray(tags) ? tags.join(", ") : tags || "free online game, unblocked, browser game"}
${currentDescription ? `Existing Rough Details: ${currentDescription}` : ""}

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
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Gemini API error (${response.status}): ${errText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const description = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!description) {
      return NextResponse.json(
        { error: "Gemini AI returned an empty response" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      description
    });

  } catch (error: any) {
    console.error("Gemini AI Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
