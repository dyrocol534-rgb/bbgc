import { Metadata } from 'next';
import dbConnect from '@/lib/mongodb';
import Game from '@/models/Game';
import GameCard from '@/components/game/GameCard';

export const revalidate = 3600;

async function getCategoryGames(category: string) {
  try {
    await dbConnect();
    const games = await Game.find({ 
      status: "published", 
      category: { $regex: new RegExp(`^${category}$`, 'i') } 
    })
      .sort({ playCount: -1 })
      .lean();
    return JSON.parse(JSON.stringify(games));
  } catch (error) {
    console.error(`Error fetching ${category} games:`, error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  return {
    title: `${category.charAt(0).toUpperCase() + category.slice(1)} Games - CloudGames`,
    description: `Play the best free online ${category} games on CloudGames.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const games = await getCategoryGames(category);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 border-b border-zinc-800 pb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white capitalize">{category} Games</h1>
        <p className="text-zinc-400 mt-2">Browse our collection of {games.length} {category} games.</p>
      </div>

      {games.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900 rounded-2xl border border-border-main">
          <p className="text-zinc-400 text-lg">No games found in this category yet.</p>
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
