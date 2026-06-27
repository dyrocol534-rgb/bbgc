import Link from 'next/link';

interface GameCardProps {
  game: {
    title: string;
    slug: string;
    thumbnailUrl: string;
    playCount: number;
    category: string[];
  };
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <Link href={`/games/${game.slug}`} className="group block">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface-hover shadow-lg">
        <img 
          src={game.thumbnailUrl} 
          alt={game.title} 
          className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <div className="text-white font-medium">{game.title}</div>
        </div>
      </div>
      <div className="mt-2.5 px-1 text-center">
        <h3 className="text-sm font-medium text-zinc-300 truncate group-hover:text-white transition-colors">{game.title}</h3>
      </div>
    </Link>
  );
}
