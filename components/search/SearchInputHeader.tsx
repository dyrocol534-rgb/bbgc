"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

interface SearchInputHeaderProps {
  initialQuery: string;
  totalGames: number;
}

export default function SearchInputHeader({ initialQuery, totalGames }: SearchInputHeaderProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/search");
    }
  };

  const handleClear = () => {
    setQuery("");
    router.push("/search");
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Top Search Input Row */}
      <form onSubmit={handleSearch} className="relative max-w-2xl">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search action, racing, puzzle, 3D games..."
            className="w-full bg-zinc-900/90 border border-zinc-700/80 hover:border-zinc-500 focus:border-primary-hover focus:ring-2 focus:ring-primary-hover/30 rounded-2xl py-3.5 pl-12 pr-24 text-base text-white placeholder:text-zinc-500 focus:outline-none transition-all shadow-inner"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-16 p-1.5 text-zinc-400 hover:text-white transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 px-3.5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95"
          >
            Search
          </button>
        </div>
      </form>

      {/* Results Title & Count */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-zinc-800/80 pb-3 gap-2">
        <h1 className="text-xl md:text-2xl font-bold text-text-main truncate">
          {initialQuery ? `Search results for "${initialQuery}"` : "All Searchable Games"}
        </h1>
        <p className="text-zinc-400 text-sm whitespace-nowrap">
          {initialQuery
            ? `Found ${totalGames} ${totalGames === 1 ? "game" : "games"}`
            : "Type a keyword above to find games instantly"}
        </p>
      </div>
    </div>
  );
}
