import { MetadataRoute } from 'next';
import dbConnect from '@/lib/mongodb';
import Game from '@/models/Game';

export const revalidate = 86400; // Revalidate every 24 hours

const GAMES_PER_SITEMAP = 1000;

/**
 * Next.js generateSitemaps chunks the sitemap into indexed files:
 * e.g. /sitemap/0.xml, /sitemap/1.xml, etc. and generates a sitemap index at /sitemap.xml
 */
export async function generateSitemaps(): Promise<{ id: number }[]> {
  try {
    await dbConnect();
    const totalGames = await Game.countDocuments({ status: 'published' });
    const numSitemaps = Math.max(1, Math.ceil(totalGames / GAMES_PER_SITEMAP));
    return Array.from({ length: numSitemaps }, (_, i) => ({ id: i }));
  } catch (error) {
    console.error("Error generating sitemap indices:", error);
    return [{ id: 0 }];
  }
}

export default async function sitemap(props?: { id: Promise<number> | number }): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://games.bluebuff.in';

  let sitemapId = 0;
  if (props && 'id' in props) {
    const rawId = typeof props.id === 'object' && props.id !== null ? await props.id : props.id;
    sitemapId = Number(rawId) || 0;
  }

  try {
    await dbConnect();

    const skip = sitemapId * GAMES_PER_SITEMAP;

    // Fetch chunked published games for this sitemap ID
    const games = await Game.find({ status: 'published' })
      .select('slug updatedAt createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(GAMES_PER_SITEMAP)
      .lean();

    const gameRoutes: MetadataRoute.Sitemap = games.map((game: any) => ({
      url: `${baseUrl}/games/${game.slug}`,
      lastModified: new Date(game.updatedAt || game.createdAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Only include static & category routes on the first sitemap chunk (id === 0)
    if (sitemapId === 0) {
      const categories = await Game.distinct("category", { status: "published" });
      const validCategories = categories
        .filter((c: any) => typeof c === 'string' && c.trim() !== '')
        .map((c: string) => c.toLowerCase())
        .filter((value: string, index: number, self: string[]) => self.indexOf(value) === index);

      const staticRoutes: MetadataRoute.Sitemap = [
        '',
        '/category/new',
        '/category/popular',
        '/category/updated',
        '/category/originals',
        '/category/multiplayer',
        '/category/action',
        '/category/puzzle',
        '/category/racing',
        '/category/sports',
        '/category/adventure',
        '/category/shooting',
        '/category/io',
        '/privacy',
        '/terms',
        '/contact',
        '/faq',
      ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : route.startsWith('/category') ? 0.8 : 0.5,
      }));

      const categoryRoutes: MetadataRoute.Sitemap = validCategories.map((category: string) => ({
        url: `${baseUrl}/category/${category}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));

      return [...staticRoutes, ...categoryRoutes, ...gameRoutes];
    }

    return gameRoutes;
  } catch (error) {
    console.error(`Sitemap generation error for id ${sitemapId}:`, error);
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      }
    ];
  }
}
