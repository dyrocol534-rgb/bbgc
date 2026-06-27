import { Metadata } from 'next';
import dbConnect from '@/lib/mongodb';
import Game from '@/models/Game';
import GameCard from '@/components/game/GameCard';

export const metadata: Metadata = {
  title: "Search Games - CloudGames",
};

async function searchGames(query: string) {
  try {
    await dbConnect();
    const games = await Game.find({ 
      status: "published",
      title: { $regex: new RegExp(query, 'i') }
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
      <div className="mb-8 border-b border-zinc-800 pb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-text-main">
          {query ? `Search results for "${query}"` : "Search Games"}
        </h1>
        <p className="text-zinc-400 mt-2">
          {query ? `Found ${games.length} games` : "Enter a search term in the navigation bar to find games."}
        </p>
      </div>

      {query && games.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900 rounded-2xl border border-border-main">
          <p className="text-zinc-400 text-lg">We couldn't find any games matching your search.</p>
        </div>
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
