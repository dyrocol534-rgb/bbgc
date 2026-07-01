"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import GameCard from "@/components/game/GameCard";
import { Skeleton } from "@/components/ui/Skeleton";

interface GameData {
  _id: string;
  title: string;
  slug: string;
  thumbnailUrl: string;
  playCount: number;
  category: string[];
}

interface InfiniteGameGridProps {
  initialGames: GameData[];
  initialPage?: number;
  sortType?: 'random' | 'popular';
}

export default function InfiniteGameGrid({ initialGames, initialPage = 1, sortType = 'random' }: InfiniteGameGridProps) {
  const [games, setGames] = useState<GameData[]>(initialGames);
  const [page, setPage] = useState(initialPage + 1); // Start fetching the *next* page
  const [hasMore, setHasMore] = useState(initialGames.length >= 24);
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMoreGames = useCallback(async () => {
    setIsLoading(true);
    try {
      const excludeIds = games.map(g => g._id).join(',');
      const { data } = await axios.get(`/api/games?page=${page}&limit=24&sort=${sortType}&exclude=${excludeIds}`);
      
      if (data.games.length > 0) {
        // filter out any duplicates just in case new games were added during scroll
        const newGames = data.games.filter(
          (newGame: GameData) => !games.some((existingGame) => existingGame._id === newGame._id)
        );
        setGames((prev) => [...prev, ...newGames]);
        setPage((prev) => prev + 1);
      }
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Error fetching more games:", error);
    } finally {
      setIsLoading(false);
    }
  }, [games, page]);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMoreGames();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [hasMore, isLoading, loadMoreGames]);

  // Helper to determine the span class for the bento grid
  const getBentoSpanClass = (index: number) => {
    // A pseudo-random but stable pattern for the bento box layout
    // 0: normal, 1: wide, 2: normal, 3: large (2x2), etc.
    const pattern = index % 14; 
    
    // Large square (2x2)
    if (pattern === 0 || pattern === 7) {
      return "col-span-2 row-span-2 md:col-span-2 md:row-span-2";
    }
    // Tall (1x2)
    if (pattern === 4 || pattern === 11) {
      return "col-span-1 row-span-2 md:col-span-1 md:row-span-2";
    }
    // Wide (2x1)
    if (pattern === 3 || pattern === 13) {
      return "col-span-2 row-span-1 md:col-span-2 md:row-span-1";
    }
    // Normal (1x1)
    return "col-span-1 row-span-1 md:col-span-1 md:row-span-1";
  };

  // Ensure normal squares keep their aspect ratio in the grid, but spanning elements stretch to fill
  const getImageContainerClass = (spanClass: string) => {
    if (spanClass.includes("row-span-2") || spanClass.includes("col-span-2")) {
      return "h-full w-full"; 
    }
    return "aspect-square";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-text-main flex items-center gap-3">
          All Games
        </h2>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 auto-rows-[minmax(100px,auto)] md:auto-rows-[minmax(120px,auto)] gap-2 sm:gap-3 grid-flow-dense pb-6">
        {games.map((game, index) => {
          const spanClass = getBentoSpanClass(index);
          const imageContainerClass = getImageContainerClass(spanClass);
          
          return (
            <div
              key={`${game._id}-${index}`}
              className={`${spanClass} game-card-enter`}
              style={{ animationDelay: `${Math.min(index % 24, 12) * 40}ms` }}
            >
              <GameCard 
                game={game} 
                className="h-full w-full"
                imageContainerClassName={imageContainerClass}
              />
            </div>
          );
        })}

        {hasMore && Array.from({ length: 8 }).map((_, i) => {
          const index = games.length + i;
          const spanClass = getBentoSpanClass(index);
          const imageContainerClass = getImageContainerClass(spanClass);
          
          return (
            <div 
              key={`skeleton-${i}`} 
              className={spanClass}
              ref={i === 0 ? observerTarget : null}
            >
              <Skeleton className={`${imageContainerClass} w-full rounded-2xl bg-zinc-800/80`} />
            </div>
          );
        })}
      </div>

      {!hasMore && games.length > 0 && (
        <div className="text-center py-12 text-zinc-500">
          You&apos;ve reached the end! 🎮
        </div>
      )}
    </div>
  );
}
