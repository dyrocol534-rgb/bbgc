import Link from 'next/link';

interface ContinuePlayingRowProps {
  games: any[];
}

export default function ContinuePlayingRow({ games }: ContinuePlayingRowProps) {
  if (!games || games.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Continue playing</h2>
        <Link href="/profile" className="text-primary-light hover:text-primary-hover text-sm font-medium transition-colors">
          View more
        </Link>
      </div>
      
      <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none snap-x">
        {games.map(game => (
          <Link href={`/games/${game.slug}`} key={game.slug} className="flex-shrink-0 group snap-start">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border border-border-main group-hover:border-primary-light transition-colors shadow-lg relative bg-surface-hover">
              <img 
                src={game.thumbnailUrl} 
                alt={game.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
