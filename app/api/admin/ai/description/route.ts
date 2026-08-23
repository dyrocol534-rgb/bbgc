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
1. Length: 120-220 words (2-3 concise paragraphs).
2. Structure:
   - Paragraph 1: High-energy opening hook explaining what the game is about and the main objective.
   - Paragraph 2: Core gameplay features, power-ups, levels, or challenges that make it exciting.
   - Paragraph 3: Mention that players can enjoy it instantly for free in their web browser with no download, install, or registration on PC, Chromebook, or mobile.
3. Tone: Fun, engaging, clear, and natural.
4. DO NOT use markdown headers (no ## or ###). Write clean, readable paragraphs with natural spacing.
5. Return ONLY the description text without any conversational preamble or quotes.`;

    // Attempt Gemini 2.5 Flash first, then fallback to Gemini 1.5 Flash if needed
    const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-pro"];
    let generatedText = "";
    let lastError = "";

    for (const model of modelsToTry) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
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
              maxOutputTokens: 600,
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText && candidateText.trim()) {
            generatedText = candidateText.trim();
            break;
          }
        } else {
          const errData = await response.text();
          lastError = `Model ${model} error (${response.status}): ${errData}`;
          console.warn(`[Gemini API] ${lastError}`);
        }
      } catch (err: any) {
        lastError = err.message || "Network error querying Gemini API";
        console.warn(`[Gemini API] Model ${model} failed:`, err);
      }
    }

    if (!generatedText) {
      return NextResponse.json(
        { error: `Gemini AI failed to generate content: ${lastError || "No response generated"}` },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      description: generatedText
    });

  } catch (error: any) {
    console.error("Gemini AI Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
