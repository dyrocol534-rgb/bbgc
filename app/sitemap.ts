import { MetadataRoute } from 'next';
import dbConnect from '@/lib/mongodb';
import Game from '@/models/Game';

export const revalidate = 43200; // Revalidate every 12 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rawBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://games.bluebuff.in';
  const baseUrl = rawBaseUrl.replace(/\/+$/, '');

  try {
    await dbConnect();

    // Fetch published games
    const games = await Game.find({ status: 'published' })
      .select('slug updatedAt createdAt')
      .sort({ createdAt: -1 })
      .limit(10000)
      .lean();

    const gameRoutes: MetadataRoute.Sitemap = games.map((game: any) => ({
      url: `${baseUrl}/games/${game.slug}`,
      lastModified: new Date(game.updatedAt || game.createdAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

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
      '/category/arcade',
      '/leaderboard',
      '/rewards',
      '/faq',
      '/contact',
      '/privacy',
      '/terms',
      '/dmca',
    ].map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: (route === '' || route.startsWith('/category') || route === '/leaderboard') ? 'daily' as const : 'monthly' as const,
      priority: route === '' ? 1.0 : route.startsWith('/category') ? 0.85 : route === '/leaderboard' || route === '/rewards' ? 0.7 : 0.4,
    }));

    const categoryRoutes: MetadataRoute.Sitemap = validCategories.map((category: string) => ({
      url: `${baseUrl}/category/${category}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

    return [...staticRoutes, ...categoryRoutes, ...gameRoutes];
  } catch (error) {
    console.error(`Sitemap generation error:`, error);
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
