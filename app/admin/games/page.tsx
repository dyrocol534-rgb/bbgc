"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Trash2, Eye, EyeOff, Star, Pencil, Search, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ShieldCheck, ShieldAlert, Play, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
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
    return sortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-indigo-400" /> : <ArrowDown className="w-3 h-3 text-indigo-400" />;
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3 bg-[#0c0c0e] p-3 rounded-xl border border-[#1f1f22] shadow-lg shadow-black/40">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          Manage Games ({totalGames}) 
          {isFetching && !isLoading && <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />}
        </h2>
        
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full xl:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-52">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search games..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#121214] border border-[#1f1f22] rounded-lg text-xs text-zinc-200 focus:border-indigo-500 focus:bg-[#1a1a1f] focus:outline-none transition-all shadow-inner"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {/* Source Filter */}
            <select 
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="flex-1 sm:flex-none px-2 py-1.5 bg-[#121214] border border-[#1f1f22] rounded-lg text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none transition-colors outline-none cursor-pointer shadow-inner"
            >
              <option value="all">All Sources</option>
              <option value="aggregated">Imported</option>
              <option value="own">Uploaded</option>
            </select>

            {/* Verification Filter */}
            <select 
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              className="flex-1 sm:flex-none px-2 py-1.5 bg-[#121214] border border-[#1f1f22] rounded-lg text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none transition-colors outline-none cursor-pointer shadow-inner"
            >
              <option value="all">All Verification</option>
              <option value="true">Verified Only</option>
              <option value="false">Unverified Only</option>
            </select>

            {/* Status Filter */}
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 sm:flex-none px-2 py-1.5 bg-[#121214] border border-[#1f1f22] rounded-lg text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none transition-colors outline-none cursor-pointer shadow-inner"
            >
              <option value="all">All Status</option>
              <option value="published">Live Only</option>
              <option value="draft">Drafts Only</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto bg-[#0c0c0e] border border-[#1f1f22] rounded-xl shadow-lg shadow-black/40 custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[960px]">
          <thead>
            <tr className="border-b border-[#1f1f22] bg-[#121214] text-zinc-500 text-[10px] uppercase tracking-widest">
              <th className="py-2.5 px-3 font-bold w-12">Icon</th>
              <th 
                className="py-2.5 px-3 font-bold cursor-pointer group hover:text-zinc-300 transition-colors"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center gap-1">Title {renderSortIcon('title')}</div>
              </th>
              <th 
                className="py-2.5 px-3 font-bold text-center cursor-pointer group hover:text-zinc-300 transition-colors"
                onClick={() => handleSort('playCount')}
              >
                <div className="flex items-center justify-center gap-1">Plays {renderSortIcon('playCount')}</div>
              </th>
              <th 
                className="py-2.5 px-3 font-bold text-center cursor-pointer group hover:text-zinc-300 transition-colors"
                onClick={() => handleSort('rating')}
              >
                <div className="flex items-center justify-center gap-1">Rating {renderSortIcon('rating')}</div>
              </th>
              <th 
                className="py-2.5 px-3 font-bold text-center cursor-pointer group hover:text-zinc-300 transition-colors w-14"
                onClick={() => handleSort('featured')}
              >
                <div className="flex items-center justify-center gap-1">Feat {renderSortIcon('featured')}</div>
              </th>
              <th className="py-2.5 px-3 font-bold text-center w-28">Admin Check</th>
              <th className="py-2.5 px-3 font-bold text-center w-24">Visibility</th>
              <th className="py-2.5 px-3 font-bold text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr key={game._id} className={`border-b border-[#1f1f22] transition-colors ${game.status === 'draft' ? 'bg-[#08080a] opacity-70' : 'hover:bg-[#121214]'}`}>
                <td className="py-2 px-3">
                  <Image src={game.thumbnailUrl} alt={game.title} width={36} height={36} className="w-9 h-9 rounded-lg object-cover bg-zinc-900 border border-[#1f1f22] shadow-sm" />
                </td>
                <td className="py-2 px-3">
                  <div className="font-semibold text-zinc-200 flex items-center gap-2 text-sm leading-tight">
                    <span>{game.title}</span>
                    {game.source === "aggregated" && (
                      <span className="bg-indigo-500/10 text-indigo-400 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0 border border-indigo-500/20">
                        Import
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono mb-0.5 leading-tight">{game.slug}</div>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="text-zinc-600">By <span className="text-zinc-400 font-medium">{game.developer || "Unknown"}</span></span>
                    {game.category && game.category.length > 0 && (
                      <>
                        <span className="text-zinc-700">•</span>
                        <span className="text-indigo-400/80 font-medium">{game.category.slice(0, 2).join(", ")}{game.category.length > 2 ? '...' : ''}</span>
                      </>
                    )}
                  </div>
                </td>
                <td className="py-2 px-3 text-center text-zinc-300 text-xs font-medium">
                  {game.playCount.toLocaleString()}
                </td>
                <td className="py-2 px-3 text-center text-xs">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-emerald-400 font-medium">+{game.likes?.length || 0}</span>
                    <span className="text-zinc-700">/</span>
                    <span className="text-red-400 font-medium">-{game.dislikes?.length || 0}</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-center">
                  <button 
                    onClick={() => toggleFeatured(game._id, game.featured)}
                    className={`p-1.5 rounded-md transition-colors ${game.featured ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20' : 'text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300'}`}
                    title={game.featured ? "Remove from Featured" : "Feature on Homepage"}
                  >
                    <Star className={`w-3.5 h-3.5 ${game.featured ? 'fill-current' : ''}`} />
                  </button>
                </td>
                {/* Admin Verification Column */}
                <td className="py-2 px-3 text-center">
                  <button
                    onClick={() => toggleVerified(game._id, game.verified)}
                    title={game.verified ? "Verified by Admin (Click to unverify)" : "Click to mark as Admin Verified"}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide transition-all border ${
                      game.verified
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.15)]"
                        : "bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20"
                    }`}
                  >
                    {game.verified ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Verified</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        <span>Needs Check</span>
                      </>
                    )}
                  </button>
                </td>
                {/* Visibility Column */}
                <td className="py-2 px-3 text-center">
                  <button 
                    onClick={() => toggleStatus(game._id, game.status)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-colors border ${
                      game.status === 'published' 
                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20' 
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border-zinc-700'
                    }`}
                  >
                    {game.status === 'published' ? <><Eye className="w-3 h-3" /> Live</> : <><EyeOff className="w-3 h-3" /> Draft</>}
                  </button>
                </td>
                {/* Actions */}
                <td className="py-2 px-3 text-right">
                  <div className="flex justify-end items-center gap-1">
                    <Link
                      href={`/games/${game.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-colors"
                      title="Test / Play Game in new tab"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </Link>
                    <Link 
                      href={`/admin/games/${game._id}/edit`}
                      className="p-1.5 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors"
                      title="Edit Game"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                    <button 
                      onClick={() => deleteGame(game._id)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">
            Showing <span className="text-zinc-300">{(page - 1) * 50 + 1}</span> to <span className="text-zinc-300">{Math.min(page * 50, totalGames)}</span> of <span className="text-zinc-300">{totalGames}</span> results
          </p>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isFetching}
              className="p-1.5 rounded-lg bg-[#121214] border border-[#1f1f22] text-zinc-400 hover:text-white hover:bg-[#1a1a1f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center px-3 bg-[#121214] border border-[#1f1f22] rounded-lg text-[11px] text-zinc-300 font-bold shadow-inner">
              Page {page} of {totalPages}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isFetching}
              className="p-1.5 rounded-lg bg-[#121214] border border-[#1f1f22] text-zinc-400 hover:text-white hover:bg-[#1a1a1f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
