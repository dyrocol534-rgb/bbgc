"use client";
import Link from 'next/link';
import { Play } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function FeaturedCarousel({ games }: { games: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (games.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % games.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [games.length]);

  if (!games?.length) return null;

  const game = games[currentIndex];

  return (
    <div className="relative w-full h-[250px] sm:h-[400px] lg:h-[500px] rounded-2xl overflow-hidden bg-zinc-800 shadow-2xl">
      <img 
        src={game.thumbnailUrl} 
        alt={game.title} 
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-transparent" />
      
      <div className="absolute bottom-0 left-0 p-4 sm:p-6 md:p-12 max-w-2xl w-full">
        <div className="flex items-center gap-2 mb-3">
          {game.category?.map((cat: string) => (
            <span key={cat} className="px-3 py-1 bg-primary/80 backdrop-blur-sm text-xs font-bold uppercase rounded-full text-indigo-50">
              {cat}
            </span>
          ))}
        </div>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-2 md:mb-4 tracking-tight drop-shadow-lg">
          {game.title}
        </h1>
        <p className="text-zinc-300 text-sm md:text-lg mb-4 md:mb-8 line-clamp-2 md:line-clamp-3 max-w-xl">
          {game.description}
        </p>
        
        <Link href={`/games/${game.slug}`} className="inline-flex items-center gap-2 md:gap-3 bg-white text-zinc-900 px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-base md:text-lg hover:bg-zinc-200 transition-colors shadow-xl">
          <Play className="fill-current w-5 h-5 md:w-6 md:h-6" />
          Play Now
        </Link>
      </div>

      {games.length > 1 && (
        <div className="absolute bottom-6 right-8 flex gap-2">
          {games.map((_, i) => (
            <button 
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-3 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-indigo-500 w-8' : 'bg-zinc-600 w-3 hover:bg-zinc-400'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
