import Link from 'next/link';
import GameImage from '@/components/game/GameImage';
import { RotateCcw } from 'lucide-react';

interface ContinuePlayingRowProps {
  games: any[];
}

export default function ContinuePlayingRow({ games }: ContinuePlayingRowProps) {
  if (!games || games.length === 0) return null;

  const displayGames = games.slice(0, 10);

  return (
    <section className="space-y-2.5 sm:space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 tracking-tight">
          <RotateCcw className="w-4 h-4 text-white" />
          Continue Playing
        </h2>
        <Link href="/profile" className="text-zinc-400 hover:text-white text-xs font-semibold transition-colors">
          View more
        </Link>
      </div>
      
      <div className="flex overflow-x-auto gap-3.5 sm:gap-4 pb-2 pt-1 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-none snap-x snap-mandatory scroll-smooth touch-pan-x">
        {displayGames.map(game => (
          <Link
            href={`/games/${game.slug}`}
            key={game.slug}
            className="flex flex-col items-center flex-shrink-0 group snap-start cursor-pointer select-none"
          >
            {/* Story Ring */}
            <div className="p-[2px] rounded-full bg-white/20 group-hover:bg-white/50 transition-all duration-200 shadow-sm">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-black p-[2px]">
                <div className="w-full h-full rounded-full overflow-hidden relative bg-zinc-900">
                  <GameImage 
                    src={game.thumbnailUrl} 
                    alt={game.title}
                    priority={true}
                    sizes="64px"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Game Title */}
            <span className="text-[11px] font-medium text-zinc-400 group-hover:text-zinc-200 truncate w-16 sm:w-18 text-center mt-1.5 transition-colors">
              {game.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
