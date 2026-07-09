"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import GameCard from "@/components/game/GameCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { getBentoSpanClass, getImageContainerClass } from "@/lib/bento";

interface GameData {
  _id: string;
  title: string;
  slug: string;
  thumbnailUrl: string;
  playCount: number;
  category: string[];
}

interface InfiniteGameGridProps {
  initialPage?: number;
  sortType?: 'random' | 'popular';
  startIndex?: number;
  excludeIds?: string;
  hasMoreInitial?: boolean;
}

export default function InfiniteGameGrid({ 
  initialPage = 1, 
  sortType = 'random', 
  startIndex = 0,
  excludeIds = "",
  hasMoreInitial = true
}: InfiniteGameGridProps) {
  const [games, setGames] = useState<GameData[]>([]);
  const [page, setPage] = useState(initialPage + 1);
  const [hasMore, setHasMore] = useState(hasMoreInitial);
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMoreGames = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentExcludeIds = [...excludeIds.split(',').filter(Boolean), ...games.map(g => g._id)].join(',');
      const { data } = await axios.get(`/api/games?page=${page}&limit=24&sort=${sortType}&exclude=${currentExcludeIds}`);
      
      if (data.games.length > 0) {
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
  }, [games, page, sortType, excludeIds]);

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

  return (
    <>
      {games.map((game, i) => {
        const index = startIndex + i;
        const spanClass = getBentoSpanClass(index);
        const imageContainerClass = getImageContainerClass(spanClass);
        
        return (
          <div
            key={`${game._id}-${index}`}
            className={`${spanClass} game-card-enter`}
            style={{ animationDelay: `${Math.min(i % 24, 12) * 40}ms` }}
          >
            <GameCard 
              game={game} 
              className="h-full w-full"
              imageContainerClassName={imageContainerClass}
              priority={false}
            />
          </div>
        );
      })}

      {hasMore && Array.from({ length: 8 }).map((_, i) => {
        const index = startIndex + games.length + i;
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

      {!hasMore && games.length > 0 && (
        <div className="col-span-full text-center py-12 text-zinc-500">
          You&apos;ve reached the end! 🎮
        </div>
      )}
    </>
  );
}
