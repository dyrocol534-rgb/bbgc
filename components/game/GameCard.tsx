import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

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
}

export default function GameCard({ game, className, imageContainerClassName }: GameCardProps) {
  return (
    <Link href={`/games/${game.slug}`} className={cn("group block flex flex-col h-full", className)}>
      <div className={cn("relative w-full rounded-2xl overflow-hidden bg-surface-hover shadow-lg flex-1", imageContainerClassName || "aspect-square")}>
        <Image 
          src={game.thumbnailUrl} 
          alt={game.title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          className="object-cover transform group-hover:scale-105 transition-transform duration-300"
        />
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
