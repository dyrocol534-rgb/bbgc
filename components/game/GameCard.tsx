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
    <Link href={`/games/${game.slug}`} className={cn("group block flex flex-col h-full", className)}>
      <div className={cn("relative w-full rounded-2xl overflow-hidden bg-zinc-800/80 shadow-lg flex-1 flex items-center justify-center", imageContainerClassName || "aspect-square")}>
        <GameImage src={game.thumbnailUrl || ''} alt={game.title} priority={priority} />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <div className="text-white font-medium">{game.title}</div>
        </div>
      </div>
      <div className="mt-2 px-1 text-center shrink-0">
        <h3 className="text-xs sm:text-sm font-medium text-zinc-300 truncate group-hover:text-white transition-colors">{game.title}</h3>
      </div>
    </Link>
  );
}
