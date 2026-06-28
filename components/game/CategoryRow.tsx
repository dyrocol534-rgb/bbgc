import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import GameCard from './GameCard';

interface CategoryRowProps {
  title: string;
  categorySlug?: string;
  games: any[];
}

export default function CategoryRow({ title, categorySlug, games }: CategoryRowProps) {
  if (!games || games.length === 0) return null;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-text-main">{title}</h2>
        {categorySlug && (
          <Link href={`/category/${categorySlug}`} className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group">
            View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
      <div className="grid grid-rows-2 grid-flow-col gap-3 sm:gap-4 overflow-x-auto pb-2 snap-x auto-cols-[85px] sm:auto-cols-[105px] md:auto-cols-[125px] lg:auto-cols-[145px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        {games.map(game => (
          <div key={game._id} className="snap-start h-full">
            <GameCard game={game} />
          </div>
        ))}
      </div>
    </div>
  );
}
