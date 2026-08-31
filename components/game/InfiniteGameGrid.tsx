"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import GameCard from "@/components/game/GameCard";
import GameCardSkeleton from "@/components/game/GameCardSkeleton";
import { getBentoSpanClass, getImageContainerClass } from "@/lib/bento";
import { RefreshCw } from "lucide-react";

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
  sortType = 'popular', 
  startIndex = 0,
  excludeIds = "",
  hasMoreInitial = true
}: InfiniteGameGridProps) {
  const [games, setGames] = useState<GameData[]>([]);
  const [hasMore, setHasMore] = useState(hasMoreInitial);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const observerTarget = useRef<HTMLDivElement>(null);
  const isIntersectingRef = useRef(false);
  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(hasMoreInitial);
  const pageRef = useRef(initialPage + 1);

  // Keep refs in sync with state
  isLoadingRef.current = isLoading;
  hasMoreRef.current = hasMore;

  // Track all game IDs currently shown to prevent duplicates
  const seenIdsRef = useRef<Set<string>>(
    new Set(excludeIds.split(',').filter(Boolean))
  );

  const loadMoreGames = useCallback(async () => {
    if (isLoadingRef.current || !hasMoreRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const currentPage = pageRef.current;
      const url = `/api/games?page=${currentPage}&limit=24&sort=${sortType}`;

      const { data } = await axios.get(url);
      
      if (data.games && Array.isArray(data.games) && data.games.length > 0) {
        const uniqueNewGames: GameData[] = [];
        for (const game of data.games) {
          if (!seenIdsRef.current.has(game._id)) {
            seenIdsRef.current.add(game._id);
            uniqueNewGames.push(game);
          }
        }

        // Advance page counter
        pageRef.current = currentPage + 1;

        // Determine if more games exist
        const moreAvailable = Boolean(
          data.hasMore ?? (data.total ? (currentPage * 24) < data.total : data.games.length === 24)
        );
        hasMoreRef.current = moreAvailable;
        setHasMore(moreAvailable);

        if (uniqueNewGames.length > 0) {
          setGames((prev) => [...prev, ...uniqueNewGames]);
        } else if (moreAvailable) {
          // If all games in this page were duplicates of the initial random pool,
          // immediately trigger the next page so the scroll doesn't stall!
          isLoadingRef.current = false;
          setIsLoading(false);
          loadMoreGames();
          return;
        }
      } else {
        hasMoreRef.current = false;
        setHasMore(false);
      }
    } catch (err: any) {
      console.error("Error fetching more games:", err);
      setError("Failed to load more games. Tap to retry.");
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [sortType]);

  // Observer to detect when user reaches the bottom
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      entries => {
        const isIntersecting = entries[0].isIntersecting;
        isIntersectingRef.current = isIntersecting;
        if (isIntersecting && hasMoreRef.current && !isLoadingRef.current) {
          loadMoreGames();
        }
      },
      { 
        root: null,
        rootMargin: "600px 0px", 
        threshold: 0.01 
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [loadMoreGames]);

  // After games render, if the sentinel is still in viewport (e.g. on tall displays), load next page
  useEffect(() => {
    if (isIntersectingRef.current && hasMoreRef.current && !isLoadingRef.current) {
      const timer = setTimeout(() => {
        if (isIntersectingRef.current && hasMoreRef.current && !isLoadingRef.current) {
          loadMoreGames();
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [games, loadMoreGames]);

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
            style={{ animationDelay: `${Math.min(i % 24, 12) * 35}ms` }}
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

      {/* Skeletons while actively loading new batch */}
      {isLoading && Array.from({ length: 8 }).map((_, i) => {
        const index = startIndex + games.length + i;
        const spanClass = getBentoSpanClass(index);
        const imageContainerClass = getImageContainerClass(spanClass);
        
        return (
          <GameCardSkeleton
            key={`skeleton-${index}`}
            spanClass={spanClass}
            imageContainerClass={imageContainerClass}
          />
        );
      })}

      {/* Persistent Invisible Sentinel for Intersection Observer */}
      <div 
        ref={observerTarget} 
        className="col-span-full h-4 w-full pointer-events-none opacity-0"
        aria-hidden="true"
      />

      {/* Error state with retry */}
      {error && (
        <div className="col-span-full text-center py-6 flex flex-col items-center justify-center gap-3">
          <p className="text-sm text-zinc-400">{error}</p>
          <button
            onClick={() => loadMoreGames()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl border border-zinc-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Loading
          </button>
        </div>
      )}

      {/* End of results message */}
      {!hasMore && games.length > 0 && !isLoading && (
        <div className="col-span-full text-center py-10 flex flex-col items-center justify-center text-zinc-500 text-xs">
          <div className="w-8 h-1 bg-zinc-800 rounded-full mb-3" />
          You&apos;ve reached the end! 🎮
        </div>
      )}
    </>
  );
}

