import { NextRequest, NextResponse } from "next/server";
import { getPublishedGameBySlug } from "@/lib/services/gameService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const game = await getPublishedGameBySlug(slug);

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Bluebuff Games";
  const iconUrl = game.thumbnailUrl || "/icons/icon-192x192.png";

  const manifest = {
    id: `/games/${game.slug}?source=pwa`,
    name: `${game.title} - ${siteName}`,
    short_name: game.title.length > 15 ? game.title.slice(0, 15) : game.title,
    description: game.description || `Play ${game.title} free online instantly!`,
    start_url: `/games/${game.slug}?source=pwa`,
    scope: `/games/${game.slug}`,
    display: "standalone",
    orientation:
      game.orientation === "portrait"
        ? "portrait"
        : game.orientation === "landscape"
        ? "landscape"
        : "any",
    background_color: "#000000",
    theme_color: "#000000",
    categories: ["games", ...(Array.isArray(game.category) ? game.category : ["entertainment"])],
    icons: [
      {
        src: iconUrl,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: iconUrl,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: iconUrl,
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
