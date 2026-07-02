import { MetadataRoute } from 'next';
import dbConnect from '@/lib/mongodb';
import Game from '@/models/Game';

export const revalidate = 86400; // Revalidate every 24 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Replace with your actual domain when you deploy!
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://games.bluebuff.in';
  
  try {
    await dbConnect();
    
    // Fetch all published games
    const games = await Game.find({ status: 'published' }).select('slug updatedAt createdAt').lean();
    
    // Fetch all categories dynamically
    const categories = await Game.distinct("category", { status: "published" });
    const validCategories = categories
      .filter((c: any) => typeof c === 'string' && c.trim() !== '')
      .map((c: string) => c.toLowerCase())
      .filter((value: string, index: number, self: string[]) => self.indexOf(value) === index);

    // Core static routes
    const routes: MetadataRoute.Sitemap = [
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

    // Dynamic game routes
    const gameRoutes: MetadataRoute.Sitemap = games.map((game: any) => ({
      url: `${baseUrl}/games/${game.slug}`,
      lastModified: new Date(game.updatedAt || game.createdAt || new Date()),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    // Dynamic category routes
    const categoryRoutes: MetadataRoute.Sitemap = validCategories.map((category: string) => ({
      url: `${baseUrl}/category/${category}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

    return [...routes, ...categoryRoutes, ...gameRoutes];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      }
    ];
  }
}
