import Link from 'next/link';
import GameCard from '@/components/game/GameCard';
import { GameCardData } from '@/lib/services/gameService';
import { getHorizontalBentoSpanClass, getImageContainerClass } from '@/lib/bento';
import HorizontalScrollContainer from './HorizontalScrollContainer';

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

  // Display up to 18 games for a rich 2-row horizontal scrollable layout
  const displayGames = games.slice(0, 18);

  return (
    <section className="space-y-2.5 sm:space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
          <Icon className="w-5 h-5 text-white shrink-0" />
          {title}
        </h2>
        <Link
          href={`/category/${categorySlug}`}
          className="text-zinc-400 hover:text-white text-xs sm:text-sm font-semibold transition-colors"
        >
          View more
        </Link>
      </div>

      <HorizontalScrollContainer>
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
                priority={index < 4}
              />
            </div>
          );
        })}
      </HorizontalScrollContainer>
    </section>
  );
}
