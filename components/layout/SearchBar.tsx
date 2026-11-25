"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, X, ChevronRight, Gamepad2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

// In-memory LRU search cache across component mounts
const memorySearchCache = new Map<string, any[]>();
const MAX_CACHE_SIZE = 50;

function getCachedSearch(key: string): any[] | null {
  if (memorySearchCache.has(key)) {
    return memorySearchCache.get(key) || [];
  }
  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem(`search_cache_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        memorySearchCache.set(key, parsed);
        return parsed;
      }
    } catch {
      // Ignore sessionStorage failure
    }
  }
  return null;
}

function setCachedSearch(key: string, data: any[]) {
  if (memorySearchCache.size >= MAX_CACHE_SIZE) {
    const firstKey = memorySearchCache.keys().next().value;
    if (firstKey) memorySearchCache.delete(firstKey);
  }
  memorySearchCache.set(key, data);
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(`search_cache_${key}`, JSON.stringify(data));
    } catch {
      // Ignore sessionStorage full
    }
  }
}

function formatCount(num?: number): string {
  if (!num) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num.toString();
}

export default function SearchBar({ 
  isMobile = false, 
  autoFocus = false,
  onClose 
}: { 
  isMobile?: boolean; 
  autoFocus?: boolean;
  onClose?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const router = useRouter();

  useEffect(() => {
    const trimmed = query.trim().toLowerCase();

    if (trimmed.length < 2) {
      setResults([]);
      setShowDropdown(false);
      setIsSearching(false);
      setSelectedIndex(-1);
      return;
    }

    // 1. Instant Cache Check (0ms latency, zero backend hit)
    const cachedResults = getCachedSearch(trimmed);
    if (cachedResults) {
      setResults(cachedResults);
      setShowDropdown(true);
      setIsSearching(false);
      setSelectedIndex(-1);
      return;
    }

    // 2. Cancel previous pending fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 3. Debounced network fetch (200ms) with increased limit (12 items)
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/games?q=${encodeURIComponent(trimmed)}&limit=12`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        const games = data.games || [];
        
        // Cache result for instant subsequent lookups
        setCachedSearch(trimmed, games);
        setResults(games);
        setShowDropdown(true);
        setSelectedIndex(-1);
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Search error:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && selectedIndex < results.length) {
      const selectedGame = results[selectedIndex];
      router.push(`/games/${selectedGame.slug}`);
      setShowDropdown(false);
      if (onClose) onClose();
      return;
    }

    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowDropdown(false);
      if (onClose) onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleResultClick = () => {
    setShowDropdown(false);
    setQuery("");
    if (onClose) onClose();
  };

  return (
    <div className={clsx("relative w-full", !isMobile && "group")} ref={containerRef}>
      <form onSubmit={handleSubmit} className="relative">
        <button 
          type="submit"
          className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white transition-colors z-10 cursor-pointer"
          title="Search"
        >
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin text-zinc-400" /> : <Search className="w-4 h-4 stroke-[2.2]" />}
        </button>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (query.trim().length > 1) setShowDropdown(true); }}
          placeholder="Search games..."
          className={clsx(
            "w-full text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none transition-all",
            isMobile 
              ? "bg-white/[0.06] hover:bg-white/[0.09] focus:bg-black/90 border border-white/[0.1] focus:border-white/20 rounded-full h-[36px] pl-10 pr-9" 
              : "bg-surface-hover/50 border border-zinc-700 rounded-full py-2 pl-11 pr-10 focus:border-transparent group-hover:bg-surface-hover focus:ring-2 focus:ring-primary-hover"
          )}
          autoFocus={autoFocus}
        />
        {query.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setShowDropdown(false);
              setSelectedIndex(-1);
              if (onClose) onClose();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white transition-colors z-10 cursor-pointer"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Prominent Search Results Dropdown */}
      {showDropdown && (
        <div 
          className={clsx(
            "bg-zinc-950/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden z-50",
            isMobile
              ? "fixed left-2.5 right-2.5 top-[102px] max-h-[75vh]"
              : "absolute top-full left-0 right-0 mt-2 max-h-[500px]"
          )}
        >
          {results.length > 0 ? (
            <div className="flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/[0.08] bg-white/[0.02]">
                <span className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase flex items-center gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5 text-primary-light" />
                  Games ({results.length})
                </span>
                <span className="text-[11px] text-zinc-500 hidden sm:inline">
                  Use ↑ ↓ to navigate, Enter to select
                </span>
              </div>

              {/* Scrollable list of game results */}
              <div className="max-h-[55vh] sm:max-h-[380px] overflow-y-auto divide-y divide-white/[0.04]">
                {results.map((game, index) => (
                  <Link
                    key={game._id}
                    href={`/games/${game.slug}`}
                    onClick={handleResultClick}
                    className={clsx(
                      "flex items-center gap-3 p-2.5 sm:p-3 hover:bg-white/[0.08] transition-colors group cursor-pointer",
                      index === selectedIndex && "bg-white/[0.12]"
                    )}
                  >
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-zinc-900 border border-white/[0.08]">
                      <Image 
                        src={game.thumbnailUrl} 
                        alt={game.title} 
                        fill 
                        sizes="48px" 
                        className="object-cover group-hover:scale-105 transition-transform duration-200" 
                      />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-semibold text-sm text-white group-hover:text-primary-light transition-colors truncate">
                        {game.title}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        {game.category && game.category.length > 0 && (
                          <span className="text-[11px] font-medium text-primary-light bg-primary/15 px-2 py-0.5 rounded-full truncate">
                            {game.category[0]}
                          </span>
                        )}
                        {typeof game.playCount === "number" && game.playCount > 0 && (
                          <span className="text-[11px] text-zinc-400">
                            {formatCount(game.playCount)} plays
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-zinc-500 group-hover:text-white transition-colors pr-1">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </Link>
                ))}
              </div>

              {/* View all results link */}
              <Link 
                href={`/search?q=${encodeURIComponent(query.trim())}`}
                onClick={handleResultClick}
                className="p-3 text-center text-sm font-semibold text-primary-light hover:text-white hover:bg-white/[0.06] transition-colors border-t border-white/[0.08] bg-white/[0.02] flex items-center justify-center gap-1.5"
              >
                <span>View all results for "{query}"</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="p-6 text-center text-zinc-400">
              <p className="text-sm font-medium text-white mb-1">No games found for "{query}"</p>
              <p className="text-xs text-zinc-500">Try searching with a genre like "action", "car", "puzzle", or a game title.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
