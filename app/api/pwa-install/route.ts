import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import AppInstall from "@/models/AppInstall";
import Game from "@/models/Game";

export async function POST(req: NextRequest) {
  try {
    const { deviceType, userAgent, gameSlug, gameTitle, installType } = await req.json();
    
    await dbConnect();
    
    const isGameSave = Boolean(gameSlug);

    await AppInstall.create({
      deviceType: deviceType || "Unknown",
      userAgent: userAgent || "Unknown",
      gameSlug: gameSlug || null,
      gameTitle: gameTitle || null,
      installType: installType || (isGameSave ? "game" : "app"),
      installedAt: new Date(),
    });

    if (gameSlug) {
      await Game.updateOne({ slug: gameSlug }, { $inc: { savedCount: 1 } }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to log PWA install", error);
    return NextResponse.json({ error: "Failed to log PWA install" }, { status: 500 });
  }
}
