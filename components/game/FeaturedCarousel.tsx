"use client";
import Link from 'next/link';
import { Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

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
    <div className="relative w-full h-[200px] sm:h-[280px] lg:h-[320px] xl:h-[360px] rounded-2xl overflow-hidden bg-surface-hover shadow-2xl">
      {games.map((g, i) => (
        <Image
          key={g._id || i}
          src={g.thumbnailUrl}
          alt={g.title}
          fill
          priority={i === 0}
          className={`object-cover transition-opacity duration-1000 ease-in-out ${
            i === currentIndex ? "opacity-50" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
      
      <div className="absolute bottom-0 left-0 p-4 sm:p-6 md:p-10 max-w-2xl w-full">
        <div className="flex items-center gap-2 mb-2">
          {game.category?.map((cat: string) => (
            <span key={cat} className="px-2 py-0.5 bg-primary/80 backdrop-blur-sm text-[10px] sm:text-xs font-bold uppercase rounded-full text-white">
              {cat}
            </span>
          ))}
        </div>
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white mb-1 sm:mb-3 tracking-tight drop-shadow-lg leading-tight">
          {game.title}
        </h1>
        <p className="text-zinc-300 text-xs sm:text-sm md:text-base mb-3 sm:mb-6 line-clamp-1 sm:line-clamp-2 max-w-xl">
          {game.description}
        </p>
        
        <Link href={`/games/${game.slug}`} className="inline-flex items-center gap-1.5 sm:gap-2 bg-white text-black px-4 py-2 sm:px-6 sm:py-3 rounded-full font-bold text-sm sm:text-base hover:bg-zinc-200 transition-colors shadow-lg">
          <Play className="fill-current w-4 h-4 sm:w-5 sm:h-5" />
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
