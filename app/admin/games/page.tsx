"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { 
  Loader2, Trash2, Eye, EyeOff, Star, Pencil, Search, 
  ChevronLeft, ChevronRight, ShieldCheck, 
  ShieldAlert, Play, Sparkles, Tag, Gamepad2, SlidersHorizontal, 
  X, Filter, ThumbsUp, ThumbsDown, Calendar, User, ExternalLink,
  Smartphone
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { Skeleton } from "@/components/ui/Skeleton";
import { TableSkeleton } from "@/components/ui/ShimmerLoader";

interface GameData {
  _id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  featured: boolean;
  verified?: boolean;
  playCount: number;
  savedCount?: number;
  thumbnailUrl: string;
  likes?: string[];
  dislikes?: string[];
  createdAt: string;
  source: string;
  developer?: string;
  category?: string[];
}

function GameThumbnail({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-500 shrink-0">
        <Gamepad2 className="w-5 h-5 text-zinc-600" />
      </div>
    );
  }

  return (
    <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-zinc-900 border border-white/[0.08] shrink-0">
      <Image 
        src={src} 
        alt="" 
        width={44} 
        height={44} 
        onError={() => setError(true)}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
      />
    </div>
  );
}

export default function AdminGamesPage() {
  const [games, setGames] = useState<GameData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [enhancingIds, setEnhancingIds] = useState<Set<string>>(new Set());
  const [categorizingIds, setCategorizingIds] = useState<Set<string>>(new Set());
  const [isBatchEnhancing, setIsBatchEnhancing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGames, setTotalGames] = useState(0);

  // Selected game for detail modal
  const [selectedGame, setSelectedGame] = useState<GameData | null>(null);

  // Filter Popover State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  const activeFilterCount = (sourceFilter !== "all" ? 1 : 0) + 
                            (verifiedFilter !== "all" ? 1 : 0) + 
                            (statusFilter !== "all" ? 1 : 0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, sourceFilter, verifiedFilter, sortField, sortOrder]);

  useEffect(() => {
    fetchGames();
  }, [page, debouncedSearch, statusFilter, sourceFilter, verifiedFilter, sortField, sortOrder]);

  async function fetchGames() {
    setIsFetching(true);
    try {
      const { data } = await axios.get('/api/admin/games', {
        params: {
          page,
          limit: 50,
          search: debouncedSearch,
          status: statusFilter,
          source: sourceFilter,
          verified: verifiedFilter,
          sortField,
          sortOrder
        }
      });
      setGames(data.games);
      setTotalPages(data.totalPages);
      setTotalGames(data.total);
    } catch (error) {
      console.error("Failed to fetch games", error);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }

  async function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    try {
      await axios.patch(`/api/admin/games/${id}`, { status: newStatus });
      setGames(games.map(g => g._id === id ? { ...g, status: newStatus } : g));
      if (selectedGame?._id === id) {
        setSelectedGame(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Error updating status");
    }
  }

  async function toggleVerified(id: string, currentVerified?: boolean) {
    const newVerified = !currentVerified;
    try {
      await axios.patch(`/api/admin/games/${id}`, { verified: newVerified });
      setGames(games.map(g => g._id === id ? { ...g, verified: newVerified } : g));
      if (selectedGame?._id === id) {
        setSelectedGame(prev => prev ? { ...prev, verified: newVerified } : null);
      }
    } catch (error) {
      console.error("Failed to update verification", error);
      alert("Error updating verification");
    }
  }

  async function toggleFeatured(id: string, currentFeatured: boolean) {
    try {
      await axios.patch(`/api/admin/games/${id}`, { featured: !currentFeatured });
      setGames(games.map(g => g._id === id ? { ...g, featured: !currentFeatured } : g));
      if (selectedGame?._id === id) {
        setSelectedGame(prev => prev ? { ...prev, featured: !currentFeatured } : null);
      }
    } catch (error) {
      console.error("Failed to update featured", error);
      alert("Error updating featured status");
    }
  }

  async function deleteGame(id: string) {
    if (!window.confirm("Are you sure you want to completely delete this game? This cannot be undone.")) return;
    
    try {
      await axios.delete(`/api/admin/games/${id}`);
      setGames(games.filter(g => g._id !== id));
      setTotalGames(prev => Math.max(0, prev - 1));
      if (selectedGame?._id === id) {
        setSelectedGame(null);
      }
    } catch (error) {
      console.error("Failed to delete game", error);
      alert("Error deleting game");
    }
  }

  async function enhanceGameWithAI(gameId: string) {
    setEnhancingIds(prev => new Set(prev).add(gameId));
    try {
      const { data } = await axios.post('/api/admin/ai/batch-enhance', { gameId });
      if (data.success) {
        alert("✨ AI SEO description generated and updated successfully!");
      }
    } catch (error: any) {
      console.error("AI enhance error:", error);
      alert(`AI Enhance Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setEnhancingIds(prev => {
        const next = new Set(prev);
        next.delete(gameId);
        return next;
      });
    }
  }

  async function categorizeGameWithAI(gameId: string) {
    setCategorizingIds(prev => new Set(prev).add(gameId));
    try {
      const { data } = await axios.post('/api/admin/ai/categorize', { gameId });
      if (data.success && data.categories) {
        setGames(games.map(g => g._id === gameId ? { ...g, category: data.categories } : g));
        if (selectedGame?._id === gameId) {
          setSelectedGame(prev => prev ? { ...prev, category: data.categories } : null);
        }
        alert(`✨ AI Categorized: [${data.categories.join(", ")}]`);
      }
    } catch (error: any) {
      console.error("AI categorize error:", error);
      alert(`AI Categorize Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setCategorizingIds(prev => {
        const next = new Set(prev);
        next.delete(gameId);
        return next;
      });
    }
  }

  async function batchEnhancePageGames() {
    if (games.length === 0) return;
    if (!window.confirm(`Generate AI SEO descriptions for all ${games.length} games on this page?`)) return;
    setIsBatchEnhancing(true);
    try {
      const ids = games.map(g => g._id);
      const { data } = await axios.post('/api/admin/ai/batch-enhance', { gameIds: ids });
      if (data.success) {
        alert(`✨ Successfully generated AI SEO descriptions for ${data.updatedCount || 0} games!`);
      }
    } catch (error: any) {
      console.error("Batch AI error:", error);
      alert(`Batch AI Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsBatchEnhancing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-[1400px] mx-auto py-2">
        <div className="flex justify-between items-center pb-2">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
        <TableSkeleton rows={8} />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto">
      {/* Compact Frameless Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-6 h-6 rounded-[7px] bg-white/10 border border-white/15 flex items-center justify-center text-white shrink-0">
            <Gamepad2 className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Manage Games
          </h1>
          <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-300 border border-white/[0.08] font-mono">
            {totalGames}
          </span>
          {isFetching && !isLoading && <Loader2 className="w-3.5 h-3.5 text-white animate-spin ml-1" />}

          {/* AI SEO button right side of title */}
          <button
            onClick={batchEnhancePageGames}
            disabled={isBatchEnhancing || games.length === 0}
            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.1] rounded-full text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 active:scale-95 ml-1"
            title="Generate AI SEO descriptions for all games on this page"
          >
            {isBatchEnhancing ? <Loader2 className="w-3 h-3 animate-spin text-white" /> : <Sparkles className="w-3 h-3 text-white" />}
            <span>{isBatchEnhancing ? "Optimizing..." : "AI SEO"}</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2.5">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search games..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-[#101012] border border-white/[0.08] rounded-full text-xs text-zinc-200 placeholder-zinc-500 focus:border-white/50 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Unified Filter Button & Popover to Right of Search */}
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              aria-label="Filter games"
              className={clsx(
                "relative flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all border cursor-pointer active:scale-95 shrink-0",
                activeFilterCount > 0 || isFilterOpen
                  ? "bg-white/15 text-white border-white/30 shadow-xs"
                  : "bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border-white/[0.08]"
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-white" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-black text-[9.5px] font-bold flex items-center justify-center font-mono ring-2 ring-[#0d0d10]">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Filter Dropdown Popover */}
            {isFilterOpen && (
              <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-72 max-w-[calc(100vw-2rem)] p-3.5 bg-[#141417] border border-white/[0.12] rounded-[18px] shadow-2xl z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-white" />
                    Filters
                  </span>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSourceFilter("all");
                        setVerifiedFilter("all");
                        setStatusFilter("all");
                      }}
                      className="text-[10.5px] font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Reset All
                    </button>
                  )}
                </div>

                {/* Source Filter */}
                <div>
                  <label className="text-[10px] uppercase font-semibold text-zinc-400 block mb-1.5">Source</label>
                  <div className="grid grid-cols-3 gap-1 p-0.5 bg-black/40 border border-white/[0.06] rounded-[10px]">
                    {[
                      { id: "all", label: "All" },
                      { id: "aggregated", label: "Imported" },
                      { id: "own", label: "Uploaded" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSourceFilter(opt.id)}
                        className={clsx(
                          "py-1 px-1.5 text-[11px] rounded-[8px] font-medium transition-all text-center cursor-pointer",
                          sourceFilter === opt.id
                            ? "bg-white/[0.12] text-white font-semibold shadow-xs"
                            : "text-zinc-400 hover:text-zinc-200"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Verification Filter */}
                <div>
                  <label className="text-[10px] uppercase font-semibold text-zinc-400 block mb-1.5">Admin Check</label>
                  <div className="grid grid-cols-3 gap-1 p-0.5 bg-black/40 border border-white/[0.06] rounded-[10px]">
                    {[
                      { id: "all", label: "All" },
                      { id: "true", label: "Verified" },
                      { id: "false", label: "Needs Check" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setVerifiedFilter(opt.id)}
                        className={clsx(
                          "py-1 px-1.5 text-[11px] rounded-[8px] font-medium transition-all text-center cursor-pointer truncate",
                          verifiedFilter === opt.id
                            ? "bg-white/[0.12] text-white font-semibold shadow-xs"
                            : "text-zinc-400 hover:text-zinc-200"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-[10px] uppercase font-semibold text-zinc-400 block mb-1.5">Visibility Status</label>
                  <div className="grid grid-cols-3 gap-1 p-0.5 bg-black/40 border border-white/[0.06] rounded-[10px]">
                    {[
                      { id: "all", label: "All" },
                      { id: "published", label: "Live" },
                      { id: "draft", label: "Draft" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setStatusFilter(opt.id)}
                        className={clsx(
                          "py-1 px-1.5 text-[11px] rounded-[8px] font-medium transition-all text-center cursor-pointer",
                          statusFilter === opt.id
                            ? "bg-white/[0.12] text-white font-semibold shadow-xs"
                            : "text-zinc-400 hover:text-zinc-200"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {sourceFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] bg-white/[0.08] text-white border border-white/10">
                Source: {sourceFilter === "aggregated" ? "Imported" : "Uploaded"}
                <button type="button" onClick={() => setSourceFilter("all")} className="hover:text-white cursor-pointer ml-0.5">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {verifiedFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] bg-white/[0.08] text-white border border-white/10">
                Check: {verifiedFilter === "true" ? "Verified" : "Needs Check"}
                <button type="button" onClick={() => setVerifiedFilter("all")} className="hover:text-white cursor-pointer ml-0.5">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] bg-white/[0.08] text-white border border-white/10">
                Status: {statusFilter === "published" ? "Live" : "Draft"}
                <button type="button" onClick={() => setStatusFilter("all")} className="hover:text-white cursor-pointer ml-0.5">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Desktop Column Header Bar */}
      <div className="hidden lg:grid grid-cols-12 gap-3 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-white/[0.06] select-none">
        <div className="col-span-4">Game &amp; Developer</div>
        <div className="col-span-2">Category &amp; Source</div>
        <div className="col-span-2">Engagement &amp; Plays</div>
        <div className="col-span-2">Added Date</div>
        <div className="col-span-2 text-right pr-6">Status &amp; Actions</div>
      </div>

      {/* Clean List View with Enhanced Row Space Utilization */}
      {games.length === 0 ? (
        <div className="py-16 text-center text-zinc-500 text-xs">
          <Gamepad2 className="w-8 h-8 text-zinc-600 mx-auto mb-2 opacity-50" />
          No games found matching your filters.
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04] pt-1">
          {games.map((game) => (
            <div
              key={game._id}
              onClick={() => setSelectedGame(game)}
              className={clsx(
                "py-2.5 px-2 sm:px-3 hover:bg-white/[0.03] rounded-[14px] transition-colors cursor-pointer group",
                game.status === 'draft' && 'opacity-70'
              )}
            >
              {/* Desktop 12-Column Structured Row */}
              <div className="hidden lg:grid grid-cols-12 gap-3 items-center">
                {/* Col 1-4: Thumbnail & Game Info */}
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <GameThumbnail src={game.thumbnailUrl} alt={game.title} />
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-zinc-100 text-xs sm:text-sm truncate group-hover:text-white transition-colors leading-tight">
                        {game.title}
                      </h3>
                      {game.featured && (
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                      )}
                    </div>
                    
                    <p className="text-[10.5px] text-zinc-400 font-medium mt-0.5 truncate">
                      {game.developer || "Bluebuff Games"}
                    </p>
                  </div>
                </div>

                {/* Col 5-6: Category & Source */}
                <div className="col-span-2 min-w-0">
                  <div className="flex items-center gap-1 flex-wrap">
                    {game.category && game.category.length > 0 ? (
                      game.category.slice(0, 2).map((cat) => (
                        <span key={cat} className="px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-300 border border-white/[0.07] text-[10px] capitalize font-medium truncate">
                          {cat}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-zinc-500">Uncategorized</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-[9.5px]">
                    <span className={clsx(
                      "uppercase font-semibold px-1.5 py-0.2 rounded border text-[9px]",
                      game.source === "aggregated" 
                        ? "bg-white/[0.06] text-zinc-400 border-white/[0.08]" 
                        : "bg-indigo-500/10 text-indigo-300 border-indigo-500/20"
                    )}>
                      {game.source === "aggregated" ? "Imported" : "Original"}
                    </span>
                    {game.verified ? (
                      <span className="text-emerald-400 font-medium flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" /> Verified
                      </span>
                    ) : (
                      <span className="text-amber-400/80 font-medium flex items-center gap-0.5">
                        <ShieldAlert className="w-2.5 h-2.5" /> Review
                      </span>
                    )}
                  </div>
                </div>

                {/* Col 7-8: Engagement & Plays */}
                <div className="col-span-2 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-200 font-semibold flex-wrap">
                    <span className="flex items-center gap-1">
                      <Play className="w-3 h-3 text-zinc-500 fill-zinc-500" />
                      <span>{game.playCount.toLocaleString()} plays</span>
                    </span>
                    {typeof game.savedCount === "number" && game.savedCount > 0 && (
                      <span 
                        className="text-[9.5px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.2 rounded-full font-mono flex items-center gap-0.5" 
                        title={`${game.savedCount} users saved to device`}
                      >
                        <Smartphone className="w-2.5 h-2.5" />
                        {game.savedCount}
                      </span>
                    )}
                  </div>
                  {(() => {
                    const likesCount = game.likes?.length || 0;
                    const dislikesCount = game.dislikes?.length || 0;
                    const totalVotes = likesCount + dislikesCount;
                    const rating = totalVotes > 0 ? Math.round((likesCount / totalVotes) * 100) : null;
                    return (
                      <div className="flex items-center gap-1 text-[10px] font-mono mt-0.5">
                        {rating !== null ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <ThumbsUp className="w-2.5 h-2.5" />
                            <span>{rating}% ({totalVotes})</span>
                          </span>
                        ) : (
                          <span className="text-zinc-600">No ratings yet</span>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Col 9-10: Added Date & Slug */}
                <div className="col-span-2 min-w-0">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
                    <Calendar className="w-3 h-3 text-zinc-500 shrink-0" />
                    <span className="truncate">
                      {game.createdAt ? new Date(game.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently"}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-600 font-mono mt-0.5 truncate">
                    /{game.slug}
                  </p>
                </div>

                {/* Col 11-12: Status & Quick Actions */}
                <div className="col-span-2 flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStatus(game._id, game.status);
                    }}
                    className={clsx(
                      "px-2.5 py-0.8 rounded-full text-[10px] font-bold tracking-wide border uppercase transition-all cursor-pointer active:scale-95",
                      game.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                        : 'bg-white/[0.04] text-zinc-400 border-white/[0.08] hover:bg-white/[0.08]'
                    )}
                    title="Toggle Live/Draft"
                  >
                    {game.status === 'published' ? 'Live' : 'Draft'}
                  </button>

                  <Link
                    href={`/admin/games/${game._id}/edit`}
                    onClick={(e) => e.stopPropagation()}
                    className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
                    title="Edit Game"
                  >
                    <Pencil className="w-3 h-3" />
                  </Link>

                  <Link
                    href={`/games/${game.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
                    title="Play / View Live"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              </div>

              {/* Mobile Fallback (< lg) */}
              <div className="flex lg:hidden items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <GameThumbnail src={game.thumbnailUrl} alt={game.title} />
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-zinc-100 text-xs truncate group-hover:text-white transition-colors leading-tight">
                        {game.title}
                      </h3>
                      {game.featured && (
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-[10.5px] text-zinc-500 mt-0.5 truncate">
                      <span className="text-zinc-400 font-medium truncate">{game.developer || "Bluebuff Games"}</span>
                      {game.category && game.category.length > 0 && (
                        <>
                          <span className="text-zinc-600">•</span>
                          <span className="text-zinc-400 font-medium capitalize truncate">
                            {game.category[0]}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-[11px] text-zinc-400 font-medium">
                    {game.playCount.toLocaleString()}
                  </span>

                  <span className={clsx(
                    "px-2 py-0.5 text-center rounded-full text-[9.5px] font-semibold tracking-wide border uppercase",
                    game.status === 'published'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-white/[0.04] text-zinc-400 border-white/[0.08]'
                  )}>
                    {game.status === 'published' ? 'Live' : 'Draft'}
                  </span>

                  <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 px-1">
          <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">
            Showing <span className="text-zinc-300 font-mono">{(page - 1) * 50 + 1}</span> to <span className="text-zinc-300 font-mono">{Math.min(page * 50, totalGames)}</span> of <span className="text-zinc-300 font-mono">{totalGames}</span> results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isFetching}
              className="p-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center px-3 py-1 bg-black/40 border border-white/[0.08] rounded-full text-[11px] text-zinc-300 font-medium font-mono">
              Page {page} of {totalPages}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isFetching}
              className="p-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Detailed Game Sheet / Modal */}
      {selectedGame && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedGame(null);
          }}
        >
          <div className="bg-[#121214] border-t sm:border border-white/[0.1] rounded-t-[28px] sm:rounded-[24px] max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl shadow-black/80 overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
            {/* Modal Top Bar */}
            <div className="p-4 sm:p-5 pb-4 border-b border-white/[0.06] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative w-12 h-12 rounded-[14px] overflow-hidden bg-zinc-900 border border-white/10 shrink-0 shadow-md">
                  <Image 
                    src={selectedGame.thumbnailUrl} 
                    alt={selectedGame.title} 
                    width={48} 
                    height={48} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-semibold text-white tracking-tight truncate leading-tight">
                    {selectedGame.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400 truncate">
                    <span className="truncate">{selectedGame.developer || "Bluebuff"}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400 font-medium">
                      {selectedGame.source === "aggregated" ? "Imported" : "Uploaded"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedGame(null)}
                className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 custom-scrollbar">
              {/* Sleek Status Bar */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs">
                {/* Visibility Toggle */}
                <button
                  type="button"
                  onClick={() => toggleStatus(selectedGame._id, selectedGame.status)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all active:scale-95 cursor-pointer ${
                    selectedGame.status === 'published'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-white/[0.04] text-zinc-400 hover:text-white'
                  }`}
                >
                  {selectedGame.status === 'published' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{selectedGame.status === 'published' ? 'Live' : 'Draft'}</span>
                </button>

                {/* Admin Verification Toggle */}
                <button
                  type="button"
                  onClick={() => toggleVerified(selectedGame._id, selectedGame.verified)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all active:scale-95 cursor-pointer ${
                    selectedGame.verified
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-amber-500/15 text-amber-400'
                  }`}
                >
                  {selectedGame.verified ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                  <span>{selectedGame.verified ? 'Verified' : 'Unchecked'}</span>
                </button>

                {/* Featured Toggle */}
                <button
                  type="button"
                  onClick={() => toggleFeatured(selectedGame._id, selectedGame.featured)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all active:scale-95 cursor-pointer ${
                    selectedGame.featured
                      ? 'bg-amber-500/15 text-amber-400'
                      : 'bg-white/[0.04] text-zinc-400 hover:text-white'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${selectedGame.featured ? 'fill-amber-400' : ''}`} />
                  <span>{selectedGame.featured ? 'Featured' : 'Standard'}</span>
                </button>
              </div>

              {/* Simplified Clean Stats Strip */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/[0.06] text-center">
                <div>
                  <div className="text-[10.5px] text-zinc-500">Plays</div>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">
                    {selectedGame.playCount.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[10.5px] text-zinc-500">Votes</div>
                  <div className="text-xs font-semibold text-zinc-200 mt-1 flex items-center justify-center gap-1.5">
                    <span className="text-emerald-400 font-mono">+{selectedGame.likes?.length || 0}</span>
                    <span className="text-zinc-600">/</span>
                    <span className="text-rose-400 font-mono">-{selectedGame.dislikes?.length || 0}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10.5px] text-zinc-500">Category</div>
                  <div className="text-xs font-semibold text-zinc-200 mt-0.5 uppercase truncate">
                    {selectedGame.category?.[0] || "General"}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/games/${selectedGame.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-semibold transition-all active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Play</span>
                    <ExternalLink className="w-3 h-3 text-zinc-600" />
                  </Link>

                  <Link
                    href={`/admin/games/${selectedGame._id}/edit`}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.08] rounded-xl text-xs font-semibold transition-all active:scale-95"
                  >
                    <Pencil className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Edit</span>
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => categorizeGameWithAI(selectedGame._id)}
                    disabled={categorizingIds.has(selectedGame._id)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.06] rounded-xl text-xs font-medium transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {categorizingIds.has(selectedGame._id) ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    ) : (
                      <Tag className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                    <span>AI Tags</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => enhanceGameWithAI(selectedGame._id)}
                    disabled={enhancingIds.has(selectedGame._id)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.06] rounded-xl text-xs font-medium transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {enhancingIds.has(selectedGame._id) ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                    <span>AI SEO</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => deleteGame(selectedGame._id)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/[0.08] rounded-xl text-xs font-medium transition-all active:scale-95 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Game</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
