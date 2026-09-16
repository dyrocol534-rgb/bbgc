import Link from 'next/link';
import GameCard from '@/components/game/GameCard';
import { GameCardData } from '@/lib/services/gameService';
import { getHorizontalBentoSpanClass, getImageContainerClass } from '@/lib/bento';

interface HorizontalGameSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  categorySlug: string;
  games: GameCardData[];
}

export default function HorizontalGameSection({
  title,
  icon: Icon,
  categorySlug,
  games,
}: HorizontalGameSectionProps) {
  if (!games || games.length === 0) return null;

  const displayGames = games.slice(0, 9);

  return (
    <section className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
          <Icon className="w-5 h-5 text-orange-400 shrink-0" />
          {title}
        </h2>
        <Link
          href={`/category/${categorySlug}`}
          className="text-orange-400 hover:text-orange-300 text-xs sm:text-sm font-semibold transition-colors"
        >
          View more
        </Link>
      </div>

      <div className="grid grid-rows-2 [grid-auto-flow:column_dense] auto-cols-[105px] sm:auto-cols-[125px] md:auto-cols-[140px] auto-rows-[125px] sm:auto-rows-[145px] md:auto-rows-[160px] gap-2 sm:gap-2.5 overflow-x-auto pb-2 pt-1 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-none snap-x snap-mandatory scroll-smooth touch-pan-x">
        {displayGames.map((game, index) => {
          const spanClass = getHorizontalBentoSpanClass(index);
          const imageContainerClass = getImageContainerClass(spanClass);

          return (
            <div
              key={`${categorySlug}-${game.slug}-${index}`}
              className={`${spanClass} snap-start h-full`}
            >
              <GameCard
                game={game}
                imageContainerClassName={imageContainerClass}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
