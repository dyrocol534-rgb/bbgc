"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { 
  Loader2, Trash2, Eye, EyeOff, Star, Pencil, Search, 
  ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ShieldCheck, 
  ShieldAlert, Play, Sparkles, Tag, Gamepad2, SlidersHorizontal, 
  X, Filter 
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
    } catch (error) {
      console.error("Failed to update verification", error);
      alert("Error updating verification");
    }
  }

  async function toggleFeatured(id: string, currentFeatured: boolean) {
    try {
      await axios.patch(`/api/admin/games/${id}`, { featured: !currentFeatured });
      setGames(games.map(g => g._id === id ? { ...g, featured: !currentFeatured } : g));
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
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin mb-2" />
        <p className="text-xs text-zinc-400 font-medium">Loading Games Catalog...</p>
      </div>
    );
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowDown className="w-3 h-3 opacity-0 group-hover:opacity-30 transition-opacity" />;
    return sortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-orange-400" /> : <ArrowDown className="w-3 h-3 text-orange-400" />;
  };

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto">
      {/* Compact Frameless Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-6 h-6 rounded-[7px] bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
            <Gamepad2 className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Manage Games
          </h1>
          <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-300 border border-white/[0.08] font-mono">
            {totalGames}
          </span>
          {isFetching && !isLoading && <Loader2 className="w-3.5 h-3.5 text-orange-400 animate-spin ml-1" />}

          {/* AI SEO button right side of title */}
          <button
            onClick={batchEnhancePageGames}
            disabled={isBatchEnhancing || games.length === 0}
            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/25 rounded-full text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 active:scale-95 ml-1"
            title="Generate AI SEO descriptions for all games on this page"
          >
            {isBatchEnhancing ? <Loader2 className="w-3 h-3 animate-spin text-orange-400" /> : <Sparkles className="w-3 h-3 text-orange-400" />}
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
              className="w-full pl-8 pr-7 py-1.5 bg-[#101012] border border-white/[0.08] rounded-full text-xs text-zinc-200 placeholder-zinc-500 focus:border-orange-500/50 focus:outline-none transition-colors"
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
              className={clsx(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer active:scale-95 shrink-0",
                activeFilterCount > 0 || isFilterOpen
                  ? "bg-orange-500/15 text-orange-300 border-orange-500/35 shadow-xs"
                  : "bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border-white/[0.08]"
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-orange-400" />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9.5px] font-bold flex items-center justify-center font-mono">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Filter Dropdown Popover */}
            {isFilterOpen && (
              <div className="absolute left-0 sm:left-0 mt-2 w-72 p-3.5 bg-[#141417] border border-white/[0.12] rounded-[18px] shadow-2xl z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-orange-400" />
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
                      className="text-[10.5px] font-medium text-orange-400 hover:text-orange-300 transition-colors cursor-pointer"
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

        {/* Active Filter Chips (removable tags if active) */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {sourceFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] bg-orange-500/10 text-orange-300 border border-orange-500/25">
                Source: {sourceFilter === "aggregated" ? "Imported" : "Uploaded"}
                <button type="button" onClick={() => setSourceFilter("all")} className="hover:text-white cursor-pointer ml-0.5">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {verifiedFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] bg-orange-500/10 text-orange-300 border border-orange-500/25">
                Check: {verifiedFilter === "true" ? "Verified" : "Needs Check"}
                <button type="button" onClick={() => setVerifiedFilter("all")} className="hover:text-white cursor-pointer ml-0.5">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] bg-orange-500/10 text-orange-300 border border-orange-500/25">
                Status: {statusFilter === "published" ? "Live" : "Draft"}
                <button type="button" onClick={() => setStatusFilter("all")} className="hover:text-white cursor-pointer ml-0.5">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Clean Frameless Table */}
      <div className="border border-white/[0.08] rounded-[18px] overflow-hidden bg-white/[0.01] shadow-xs">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[960px]">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-zinc-400 text-[10px] uppercase font-semibold tracking-wider">
                <th className="py-2.5 px-3 font-semibold w-12">Icon</th>
                <th 
                  className="py-2.5 px-3 font-semibold cursor-pointer group hover:text-white transition-colors"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center gap-1">Title {renderSortIcon('title')}</div>
                </th>
                <th 
                  className="py-2.5 px-3 font-semibold text-center cursor-pointer group hover:text-white transition-colors"
                  onClick={() => handleSort('playCount')}
                >
                  <div className="flex items-center justify-center gap-1">Plays {renderSortIcon('playCount')}</div>
                </th>
                <th 
                  className="py-2.5 px-3 font-semibold text-center cursor-pointer group hover:text-white transition-colors"
                  onClick={() => handleSort('rating')}
                >
                  <div className="flex items-center justify-center gap-1">Rating {renderSortIcon('rating')}</div>
                </th>
                <th 
                  className="py-2.5 px-3 font-semibold text-center cursor-pointer group hover:text-white transition-colors w-14"
                  onClick={() => handleSort('featured')}
                >
                  <div className="flex items-center justify-center gap-1">Feat {renderSortIcon('featured')}</div>
                </th>
                <th className="py-2.5 px-3 font-semibold text-center w-28">Admin Check</th>
                <th className="py-2.5 px-3 font-semibold text-center w-24">Visibility</th>
                <th className="py-2.5 px-3 font-semibold text-right w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {games.map((game) => (
                <tr key={game._id} className={`transition-colors ${game.status === 'draft' ? 'bg-white/[0.01] opacity-70' : 'hover:bg-white/[0.02]'}`}>
                  <td className="py-2.5 px-3">
                    <Image 
                      src={game.thumbnailUrl} 
                      alt={game.title} 
                      width={36} 
                      height={36} 
                      className="w-9 h-9 rounded-[10px] object-cover bg-zinc-900 border border-white/[0.08] shadow-xs" 
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-zinc-200 flex items-center gap-1.5 text-xs leading-tight">
                      <span>{game.title}</span>
                      {game.source === "aggregated" && (
                        <span className="bg-orange-500/10 text-orange-400 text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-full shrink-0 border border-orange-500/20">
                          Import
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono mb-0.5 leading-tight">{game.slug}</div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="text-zinc-500">By <span className="text-zinc-300 font-medium">{game.developer || "Bluebuff"}</span></span>
                      {game.category && game.category.length > 0 && (
                        <>
                          <span className="text-zinc-600">•</span>
                          <span className="text-orange-400 font-medium">{game.category.slice(0, 2).join(", ")}{game.category.length > 2 ? '...' : ''}</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center text-zinc-300 text-xs font-mono font-medium">
                    {game.playCount.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-center text-xs">
                    <div className="flex items-center justify-center gap-1.5 font-mono text-[11px]">
                      <span className="text-emerald-400 font-medium">+{game.likes?.length || 0}</span>
                      <span className="text-zinc-600">/</span>
                      <span className="text-red-400 font-medium">-{game.dislikes?.length || 0}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button 
                      onClick={() => toggleFeatured(game._id, game.featured)}
                      className={`p-1.5 rounded-full transition-colors cursor-pointer active:scale-95 ${game.featured ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20' : 'text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300'}`}
                      title={game.featured ? "Remove from Featured" : "Feature on Homepage"}
                    >
                      <Star className={`w-3.5 h-3.5 ${game.featured ? 'fill-current' : ''}`} />
                    </button>
                  </td>
                  {/* Admin Verification Column */}
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => toggleVerified(game._id, game.verified)}
                      title={game.verified ? "Verified by Admin (Click to unverify)" : "Click to mark as Admin Verified"}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide transition-all border cursor-pointer active:scale-95 ${
                        game.verified
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                          : "bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20"
                      }`}
                    >
                      {game.verified ? (
                        <>
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>Verified</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-3 h-3 text-amber-400" />
                          <span>Check</span>
                        </>
                      )}
                    </button>
                  </td>
                  {/* Visibility Column */}
                  <td className="py-2.5 px-3 text-center">
                    <button 
                      onClick={() => toggleStatus(game._id, game.status)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide transition-colors border cursor-pointer active:scale-95 ${
                        game.status === 'published' 
                          ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20' 
                          : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] border-white/[0.08]'
                      }`}
                    >
                      {game.status === 'published' ? <><Eye className="w-3 h-3" /> Live</> : <><EyeOff className="w-3 h-3" /> Draft</>}
                    </button>
                  </td>
                  {/* Actions */}
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex justify-end items-center gap-1">
                      <button
                        onClick={() => categorizeGameWithAI(game._id)}
                        disabled={categorizingIds.has(game._id)}
                        className="p-1.5 text-zinc-400 hover:text-orange-400 hover:bg-white/[0.06] rounded-full transition-colors disabled:opacity-50 cursor-pointer"
                        title="✨ AI Auto-Categorize with Gemini"
                      >
                        {categorizingIds.has(game._id) ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-400" />
                        ) : (
                          <Tag className="w-3.5 h-3.5 text-orange-400/80" />
                        )}
                      </button>
                      <button
                        onClick={() => enhanceGameWithAI(game._id)}
                        disabled={enhancingIds.has(game._id)}
                        className="p-1.5 text-zinc-400 hover:text-orange-400 hover:bg-white/[0.06] rounded-full transition-colors disabled:opacity-50 cursor-pointer"
                        title="✨ Generate AI SEO description with Gemini"
                      >
                        {enhancingIds.has(game._id) ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-400" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <Link
                        href={`/games/${game.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-white/[0.06] rounded-full transition-colors"
                        title="Play in new tab"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </Link>
                      <Link 
                        href={`/admin/games/${game._id}/edit`}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-full transition-colors"
                        title="Edit Game"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                      <button 
                        onClick={() => deleteGame(game._id)}
                        className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-white/[0.06] rounded-full transition-colors cursor-pointer"
                        title="Delete Game"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {games.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500 text-xs">
                    No games found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
    </div>
  );
}
