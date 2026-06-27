import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Game from '@/models/Game';
import GamePlayer from '@/components/game/GamePlayer';
import Link from 'next/link';

// Revalidate every hour since game pages don't change often
export const revalidate = 3600;

async function getGame(slug: string) {
  try {
    await dbConnect();
    const game = await Game.findOne({ slug, status: "published" }).lean();
    return game ? JSON.parse(JSON.stringify(game)) : null;
  } catch (error) {
    console.error("Error fetching game:", error);
    return null;
  }
}

async function getRelatedGames(category: string[], currentSlug: string) {
  try {
    await dbConnect();
    const games = await Game.find({
      status: "published",
      slug: { $ne: currentSlug },
      category: { $in: category }
    })
      .sort({ playCount: -1 })
      .limit(10)
      .lean();
    return JSON.parse(JSON.stringify(games));
  } catch (error) {
    console.error("Error fetching related games:", error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGame(slug);
  
  if (!game) {
    return { title: 'Game Not Found' };
  }

  return {
    title: `${game.title} - Play on CloudGames`,
    description: game.description,
    openGraph: {
      title: `${game.title} - Play Free Browser Games`,
      description: game.description,
      images: [{ url: game.thumbnailUrl }],
    }
  };
}

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = await getGame(slug);

  if (!game) {
    notFound();
  }

  const relatedGames = await getRelatedGames(game.category, game.slug);

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1400px]">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Main Content (Left on Desktop) */}
        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <GamePlayer game={game} />
          </div>

          <div className="bg-zinc-900 rounded-2xl p-4 sm:p-6 shadow-lg border border-border-main">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-text-main">{game.title}</h1>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {game.category?.map((cat: string) => (
                    <span key={cat} className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-md border border-zinc-700 capitalize">
                      {cat}
                    </span>
                  ))}
                  {game.tags?.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-surface-hover/50 text-zinc-400 text-xs rounded-md border border-border-strong/50">
                      #{tag}
                    </span>
                  ))}
                </div>

                <p className="text-zinc-300 leading-relaxed text-sm sm:text-base max-w-3xl whitespace-pre-line mb-5">
                  {game.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-8 max-w-3xl text-sm border-t border-border-main pt-4">
                  <div className="flex justify-between sm:justify-start gap-4">
                    <span className="text-zinc-500 font-medium sm:w-28 shrink-0">Developer:</span>
                    <span className="text-indigo-400 font-semibold">{game.developer || "CloudGames"}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start gap-4">
                    <span className="text-zinc-500 font-medium sm:w-28 shrink-0">Released:</span>
                    <span className="text-zinc-200 font-semibold">
                      {new Date(game.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between sm:justify-start gap-4">
                    <span className="text-zinc-500 font-medium sm:w-28 shrink-0">Last Updated:</span>
                    <span className="text-zinc-200 font-semibold">
                      {new Date(game.updatedAt || game.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between sm:justify-start gap-4">
                    <span className="text-zinc-500 font-medium sm:w-28 shrink-0">Game engine:</span>
                    <span className="text-zinc-200 font-semibold">
                      {game.buildType === 'html5' ? 'HTML5' : game.buildType === 'unity-webgl' ? 'Unity WebGL' : game.buildType}
                    </span>
                  </div>
                  
                  <div className="col-span-1 sm:col-span-2 pt-3 mt-1 border-t border-border-main/50 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <span className="text-zinc-500 font-medium sm:w-28 shrink-0">Platforms:</span>
                      <span className="text-zinc-200 font-semibold">{game.platforms || "Browser (desktop, mobile, tablet)"}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <span className="text-zinc-500 font-medium sm:w-28 shrink-0">Orientation:</span>
                      <span className="text-zinc-200 font-semibold capitalize">
                        {game.orientation === 'any' ? 'Landscape / Portrait' : game.orientation || 'Landscape / Portrait'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Suggested Games Sidebar (Right on Desktop, Below on Mobile) */}
        {relatedGames.length > 0 && (
          <aside className="w-full lg:w-[350px] xl:w-[400px] shrink-0">
            <div className="bg-zinc-900 rounded-2xl p-4 sm:p-5 shadow-lg border border-border-main">
              <h3 className="font-bold text-lg text-white mb-4">Play next</h3>
              <div className="grid grid-cols-2 gap-3">
                {relatedGames.map((g: any) => (
                  <Link key={g.slug} href={`/games/${g.slug}`} className="group block">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-800 shadow-md border border-border-main group-hover:border-indigo-500/50 transition-colors">
                      <img 
                        src={g.thumbnailUrl} 
                        alt={g.title} 
                        className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2 pt-6">
                        <p className="text-white text-xs font-bold truncate group-hover:text-indigo-300 transition-colors">{g.title}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
