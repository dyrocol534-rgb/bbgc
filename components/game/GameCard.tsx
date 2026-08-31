import Link from 'next/link';
import { cn } from '@/lib/utils';
import GameImage from '@/components/game/GameImage';

interface GameCardProps {
  game: {
    title: string;
    slug: string;
    thumbnailUrl: string;
    playCount: number;
    category: string[];
  };
  className?: string;
  imageContainerClassName?: string;
  priority?: boolean;
}

export default function GameCard({ game, className, imageContainerClassName, priority = false }: GameCardProps) {
  return (
    <Link href={`/games/${game.slug}`} className={cn("group flex flex-col h-full transform-gpu", className)}>
      <div className={cn("relative w-full rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 group-hover:border-orange-500/40 transition-colors duration-200 flex-1 flex items-center justify-center", imageContainerClassName || "aspect-square")}>
        <GameImage src={game.thumbnailUrl || ''} alt={game.title} priority={priority} />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-3 pointer-events-none">
          <div className="text-white font-semibold text-xs sm:text-sm line-clamp-1 drop-shadow-md">{game.title}</div>
        </div>
      </div>
      <div className="mt-1.5 px-1 text-center shrink-0">
        <h3 className="text-xs sm:text-sm font-medium text-zinc-300 truncate group-hover:text-orange-300 transition-colors duration-150">{game.title}</h3>
      </div>
    </Link>
  );
}
