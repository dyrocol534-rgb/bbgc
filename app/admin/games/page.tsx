"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { 
  Loader2, Trash2, Eye, EyeOff, Star, Pencil, Search, 
  ChevronLeft, ChevronRight, ShieldCheck, 
  ShieldAlert, Play, Sparkles, Tag, Gamepad2, SlidersHorizontal, 
  X, Filter, ThumbsUp, ThumbsDown, Calendar, User, ExternalLink 
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";

interface GameData {
  _id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  featured: boolean;
  verified?: boolean;
  playCount: number;
  thumbnailUrl: string;
  likes?: string[];
  dislikes?: string[];
  createdAt: string;
  source: string;
  developer?: string;
  category?: string[];
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
      <div className="flex flex-col justify-center items-center py-24">
        <Loader2 className="w-6 h-6 text-white animate-spin mb-2" />
        <p className="text-xs text-zinc-400 font-medium">Loading Games Catalog...</p>
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
      
      {/* Clean iOS List View (Outside: Limited Details) */}
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
              className={`py-2.5 px-2 sm:px-3 flex items-center justify-between gap-3 hover:bg-white/[0.03] rounded-[14px] transition-colors cursor-pointer group ${
                game.status === 'draft' ? 'opacity-65' : ''
              }`}
            >
              {/* Left: Thumbnail & Title Info */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-[12px] overflow-hidden bg-zinc-900 border border-white/[0.08] shrink-0">
                  <Image 
                    src={game.thumbnailUrl} 
                    alt={game.title} 
                    width={44} 
                    height={44} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                  />
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-zinc-100 text-xs sm:text-sm truncate group-hover:text-white transition-colors leading-tight">
                      {game.title}
                    </h3>
                    {game.featured && (
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                    )}
                    {game.source === "aggregated" && (
                      <span className="bg-white/10 text-white text-[8.5px] uppercase font-bold px-1.5 py-0.2 rounded-full shrink-0 border border-white/15">
                        Import
                      </span>
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

              {/* Right: Limited quick stats & Chevron */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {/* Play Count */}
                <span className="hidden md:inline-block font-mono text-[11px] text-zinc-400 font-medium w-20 text-right">
                  {game.playCount.toLocaleString()} plays
                </span>

                {/* Status Pill - fixed width for perfect vertical alignment */}
                <div className="w-14 flex justify-center">
                  <span className={`w-full py-0.5 text-center rounded-full text-[10px] font-semibold tracking-wide border uppercase ${
                    game.status === 'published'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-white/[0.04] text-zinc-400 border-white/[0.08]'
                  }`}>
                    {game.status === 'published' ? 'Live' : 'Draft'}
                  </span>
                </div>

                {/* Open details chevron */}
                <div className="w-4 flex items-center justify-center">
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
              {/* Quick Interactive Toggles Row */}
              <div className="grid grid-cols-3 gap-2">
                {/* Visibility Toggle */}
                <button
                  type="button"
                  onClick={() => toggleStatus(selectedGame._id, selectedGame.status)}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-[14px] border transition-all cursor-pointer active:scale-95 ${
                    selectedGame.status === 'published'
                      ? 'bg-emerald-500/[0.08] border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/[0.12]'
                      : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide">
                    {selectedGame.status === 'published' ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-zinc-500" />}
                    <span>{selectedGame.status === 'published' ? 'Live' : 'Draft'}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-0.5">Visibility</span>
                </button>

                {/* Admin Verification Toggle */}
                <button
                  type="button"
                  onClick={() => toggleVerified(selectedGame._id, selectedGame.verified)}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-[14px] border transition-all cursor-pointer active:scale-95 ${
                    selectedGame.verified
                      ? 'bg-emerald-500/[0.08] border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/[0.12]'
                      : 'bg-amber-500/[0.08] border-amber-500/25 text-amber-400 hover:bg-amber-500/[0.12]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide">
                    {selectedGame.verified ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> : <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{selectedGame.verified ? 'Verified' : 'Check'}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-0.5">Quality</span>
                </button>

                {/* Featured Toggle */}
                <button
                  type="button"
                  onClick={() => toggleFeatured(selectedGame._id, selectedGame.featured)}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-[14px] border transition-all cursor-pointer active:scale-95 ${
                    selectedGame.featured
                      ? 'bg-amber-500/[0.08] border-amber-500/25 text-amber-400 hover:bg-amber-500/[0.12]'
                      : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide">
                    <Star className={`w-3.5 h-3.5 ${selectedGame.featured ? 'fill-amber-400 text-amber-400' : 'text-zinc-500'}`} />
                    <span>{selectedGame.featured ? 'Featured' : 'Standard'}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-0.5">Feature</span>
                </button>
              </div>

              {/* Stats & Metadata Section */}
              <div className="p-3.5 rounded-[16px] bg-white/[0.02] border border-white/[0.06] space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-zinc-500 text-[10.5px] uppercase tracking-wider font-semibold">Total Plays</span>
                    <p className="text-white font-mono font-bold text-base">
                      {selectedGame.playCount.toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-zinc-500 text-[10.5px] uppercase tracking-wider font-semibold">Rating</span>
                    <div className="flex items-center gap-2 font-mono text-xs pt-0.5">
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" /> {selectedGame.likes?.length || 0}
                      </span>
                      <span className="text-zinc-600">/</span>
                      <span className="text-rose-400 font-medium flex items-center gap-1">
                        <ThumbsDown className="w-3 h-3" /> {selectedGame.dislikes?.length || 0}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-zinc-500 text-[10.5px] uppercase tracking-wider font-semibold">Added</span>
                    <p className="text-zinc-300 font-medium text-[11px]">
                      {selectedGame.createdAt ? new Date(selectedGame.createdAt).toLocaleDateString() : "Recently"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-zinc-500 text-[10.5px] uppercase tracking-wider font-semibold">Route</span>
                    <p className="text-zinc-400 font-mono text-[10.5px] truncate">
                      /games/{selectedGame.slug}
                    </p>
                  </div>
                </div>

                {/* Categories */}
                <div className="pt-2 border-t border-white/[0.04]">
                  <span className="text-zinc-500 text-[10.5px] uppercase tracking-wider font-semibold block mb-1.5">Categories</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedGame.category && selectedGame.category.length > 0 ? (
                      selectedGame.category.map((c) => (
                        <span 
                          key={c}
                          className="px-2 py-0.5 bg-white/[0.08] text-zinc-200 border border-white/10 rounded-full text-[10px] font-medium uppercase"
                        >
                          {c}
                        </span>
                      ))
                    ) : (
                      <span className="text-zinc-500 text-xs">None</span>
                    )}
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
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] rounded-full text-xs font-semibold transition-all active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Play Game</span>
                    <ExternalLink className="w-3 h-3 text-zinc-500" />
                  </Link>

                  <Link
                    href={`/admin/games/${selectedGame._id}/edit`}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] rounded-full text-xs font-semibold transition-all active:scale-95"
                  >
                    <Pencil className="w-3.5 h-3.5 text-white" />
                    <span>Edit Details</span>
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => categorizeGameWithAI(selectedGame._id)}
                    disabled={categorizingIds.has(selectedGame._id)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.1] rounded-full text-xs font-medium transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {categorizingIds.has(selectedGame._id) ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    ) : (
                      <Tag className="w-3.5 h-3.5 text-white" />
                    )}
                    <span>AI Categorize</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => enhanceGameWithAI(selectedGame._id)}
                    disabled={enhancingIds.has(selectedGame._id)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.1] rounded-full text-xs font-medium transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {enhancingIds.has(selectedGame._id) ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    )}
                    <span>AI SEO</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => deleteGame(selectedGame._id)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-500/[0.06] hover:bg-rose-500/[0.12] text-rose-400 border border-rose-500/15 rounded-full text-xs font-medium transition-all active:scale-95 cursor-pointer mt-1"
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
