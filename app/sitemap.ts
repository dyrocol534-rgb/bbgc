import { MetadataRoute } from 'next';
import dbConnect from '@/lib/mongodb';
import Game from '@/models/Game';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://cloud-games-demo.vercel.app'; // Replace with actual domain
  
  try {
    await dbConnect();
    const games = await Game.find({ status: 'published' }).select('slug updatedAt').lean();
    
    const gameUrls = games.map((game: any) => ({
      url: `${baseUrl}/games/${game.slug}`,
      lastModified: game.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const categories = ['action', 'puzzle', 'racing', 'sports'];
    const categoryUrls = categories.map((cat) => ({
      url: `${baseUrl}/category/${cat}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      ...categoryUrls,
      ...gameUrls,
    ];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
      }
    ];
  }
}
