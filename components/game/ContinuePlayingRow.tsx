import Link from 'next/link';
import GameImage from '@/components/game/GameImage';

interface ContinuePlayingRowProps {
  games: any[];
}

export default function ContinuePlayingRow({ games }: ContinuePlayingRowProps) {
  if (!games || games.length === 0) return null;

  const displayGames = games.slice(0, 6);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Continue playing</h2>
        <Link href="/profile" className="text-primary-light hover:text-primary-hover text-sm font-medium transition-colors">
          View more
        </Link>
      </div>
      
      <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none snap-x snap-mandatory scroll-smooth touch-pan-x">
        {displayGames.map(game => (
          <Link href={`/games/${game.slug}`} key={game.slug} className="flex-shrink-0 group snap-start">
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden border border-border-main group-hover:border-primary-light transition-all shadow-lg relative bg-surface-hover flex-shrink-0">
              <GameImage 
                src={game.thumbnailUrl} 
                alt={game.title}
                priority={true}
                sizes="(max-width: 640px) 96px, 128px"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
