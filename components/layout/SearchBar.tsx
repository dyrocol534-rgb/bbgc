"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

export default function SearchBar({ isMobile = false, onClose }: { isMobile?: boolean, onClose?: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 1) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/games?q=${encodeURIComponent(query.trim())}&limit=5`);
          const data = await res.json();
          setResults(data.games || []);
          setShowDropdown(true);
        } catch (error) {
          console.error(error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300);
    return () => clearTimeout(timer);
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
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowDropdown(false);
      if (onClose) onClose();
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
          className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-primary-light transition-colors z-10"
          title="Search"
        >
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </button>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.trim().length > 1) setShowDropdown(true); }}
          placeholder="Search games..."
          className={clsx(
            "w-full text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary-hover transition-all",
            isMobile 
              ? "bg-zinc-800 border border-zinc-700 rounded-lg py-2 pl-11 pr-10" 
              : "bg-surface-hover/50 border border-zinc-700 rounded-full py-2 pl-11 pr-10 focus:border-transparent group-hover:bg-surface-hover"
          )}
          autoFocus={isMobile}
        />
        {(query.length > 0 || isMobile) && (
          <button
            type="button"
            onClick={() => {
              if (query.length > 0) {
                setQuery("");
                setShowDropdown(false);
              } else if (onClose) {
                onClose();
              }
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white transition-colors z-10"
            title={query.length > 0 ? "Clear search" : "Close search"}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50">
          {results.length > 0 ? (
            <div className="flex flex-col">
              {results.map((game) => (
                <Link
                  key={game._id}
                  href={`/games/${game.slug}`}
                  onClick={handleResultClick}
                  className="flex items-center gap-3 p-3 hover:bg-zinc-800 transition-colors border-b border-zinc-800/50 last:border-0"
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
                    <Image src={game.thumbnailUrl} alt={game.title} fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm text-white truncate">{game.title}</span>
                    {game.category && game.category.length > 0 && (
                      <span className="text-xs text-indigo-400 truncate">{game.category[0]}</span>
                    )}
                  </div>
                </Link>
              ))}
              <Link 
                href={`/search?q=${encodeURIComponent(query.trim())}`}
                onClick={handleResultClick}
                className="p-3 text-center text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors bg-zinc-900/50"
              >
                View all results for "{query}"
              </Link>
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-zinc-400">
              No games found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
