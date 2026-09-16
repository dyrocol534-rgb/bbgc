import Link from 'next/link';
import GameImage from '@/components/game/GameImage';
import { RotateCcw } from 'lucide-react';

interface ContinuePlayingRowProps {
  games: any[];
}

export default function ContinuePlayingRow({ games }: ContinuePlayingRowProps) {
  if (!games || games.length === 0) return null;

  const displayGames = games.slice(0, 6);

  return (
    <section className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
          <RotateCcw className="w-5 h-5 text-orange-400" />
          Continue Playing
        </h2>
        <Link href="/profile" className="text-orange-400 hover:text-orange-300 text-xs sm:text-sm font-semibold transition-colors">
          View more
        </Link>
      </div>
      
      <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-none snap-x snap-mandatory scroll-smooth touch-pan-x">
        {displayGames.map(game => (
          <Link href={`/games/${game.slug}`} key={game.slug} className="flex-shrink-0 group snap-start">
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden border border-white/5 group-hover:border-orange-500/40 transition-all shadow-md relative bg-zinc-900 flex-shrink-0">
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
