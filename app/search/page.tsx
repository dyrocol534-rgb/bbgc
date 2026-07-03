import { Metadata } from 'next';
import dbConnect from '@/lib/mongodb';
import Game from '@/models/Game';
import GameCard from '@/components/game/GameCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchX } from 'lucide-react';

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Bluebuff Games';

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }
): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const query = typeof resolvedParams.q === 'string' ? resolvedParams.q.trim() : '';

  if (!query) {
    return {
      title: `Search Free Online Games | ${siteName}`,
      description: `Search thousands of free browser games on ${siteName}. No download needed – find action, puzzle, racing, sports games and more.`,
      robots: { index: false, follow: true },
    };
  }

  return {
    title: `"${query}" Games – Play Free Online | ${siteName}`,
    description: `Find free online ${query} games on ${siteName}. Play instantly in your browser – no download, no registration required.`,
    robots: { index: false, follow: true }, // search result pages should not be indexed
  };
}

async function searchGames(query: string) {
  try {
    await dbConnect();
    const games = await Game.find({ 
      status: "published",
      $or: [
        { title: { $regex: new RegExp(query, 'i') } },
        { slug: { $regex: new RegExp(query, 'i') } },
        { category: { $regex: new RegExp(query, 'i') } }
      ]
    })
      .sort({ playCount: -1 })
      .limit(50)
      .lean();
    return JSON.parse(JSON.stringify(games));
  } catch (error) {
    console.error("Error searching games:", error);
    return [];
  }
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams;
  const query = typeof resolvedParams.q === 'string' ? resolvedParams.q : '';
  
  const games = query ? await searchGames(query) : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-zinc-800 pb-3 gap-2">
        <h1 className="text-xl md:text-2xl font-bold text-text-main truncate">
          {query ? `Search results for "${query}"` : "Search Games"}
        </h1>
        <p className="text-zinc-400 text-sm whitespace-nowrap">
          {query ? `Found ${games.length} games` : "Enter a search term in the navigation bar"}
        </p>
      </div>

      {query && games.length === 0 ? (
        <EmptyState 
          icon={SearchX} 
          title="No Games Found" 
          description={`We couldn't find any games matching "${query}". Try searching for a different keyword or genre.`} 
          actionLabel="Browse All Games"
          actionHref="/"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {games.map((game: any) => (
            <GameCard key={game._id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
