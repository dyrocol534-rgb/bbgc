"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Trash2, Eye, EyeOff, Star, Pencil, Search, Filter, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";

interface GameData {
  _id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  featured: boolean;
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
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGames, setTotalGames] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, sourceFilter, sortField, sortOrder]);

  useEffect(() => {
    fetchGames();
  }, [page, debouncedSearch, statusFilter, sourceFilter, sortField, sortOrder]);

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
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          Manage Games ({totalGames}) 
          {isFetching && !isLoading && <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />}
        </h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search games..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>
          <select 
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-2 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none transition-colors outline-none cursor-pointer"
          >
            <option value="all">All Sources</option>
            <option value="aggregated">Imported</option>
            <option value="own">Uploaded</option>
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none transition-colors outline-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto bg-surface border border-zinc-800 rounded-xl shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/30 text-zinc-400 text-[11px] uppercase tracking-wider">
              <th className="py-2 px-3 font-semibold w-12">Icon</th>
              <th 
                className="py-2 px-3 font-semibold cursor-pointer group hover:text-zinc-200"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center gap-1">Title {renderSortIcon('title')}</div>
              </th>
              <th 
                className="py-2 px-3 font-semibold text-center cursor-pointer group hover:text-zinc-200"
                onClick={() => handleSort('playCount')}
              >
                <div className="flex items-center justify-center gap-1">Plays {renderSortIcon('playCount')}</div>
              </th>
              <th 
                className="py-2 px-3 font-semibold text-center cursor-pointer group hover:text-zinc-200"
                onClick={() => handleSort('rating')}
              >
                <div className="flex items-center justify-center gap-1">Rating {renderSortIcon('rating')}</div>
              </th>
              <th 
                className="py-2 px-3 font-semibold text-center cursor-pointer group hover:text-zinc-200 w-16"
                onClick={() => handleSort('featured')}
              >
                <div className="flex items-center justify-center gap-1">Feat {renderSortIcon('featured')}</div>
              </th>
              <th className="py-2 px-3 font-semibold text-center">Visibility</th>
              <th className="py-2 px-3 font-semibold text-right w-20">Actions</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr key={game._id} className={`border-b border-zinc-800/50 transition-colors ${game.status === 'draft' ? 'bg-zinc-950/50 opacity-60' : 'hover:bg-zinc-800/30'}`}>
                <td className="py-1.5 px-3">
                  <img src={game.thumbnailUrl} alt={game.title} className="w-8 h-8 rounded-md object-cover bg-zinc-900 border border-zinc-800" />
                </td>
                <td className="py-1.5 px-3">
                  <div className="font-semibold text-zinc-200 flex items-center gap-2 text-sm leading-tight">
                    {game.title}
                    {game.source === "aggregated" && (
                      <span className="bg-indigo-500/10 text-indigo-400 text-[9px] uppercase font-bold px-1 py-0.5 rounded shrink-0 border border-indigo-500/20">
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
                <td className="py-1.5 px-3 text-center text-zinc-300 text-xs font-medium">
                  {game.playCount.toLocaleString()}
                </td>
                <td className="py-1.5 px-3 text-center text-xs">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-emerald-400 font-medium">+{game.likes?.length || 0}</span>
                    <span className="text-zinc-700">/</span>
                    <span className="text-red-400 font-medium">-{game.dislikes?.length || 0}</span>
                  </div>
                </td>
                <td className="py-1.5 px-3 text-center">
                  <button 
                    onClick={() => toggleFeatured(game._id, game.featured)}
                    className={`p-1.5 rounded-md transition-colors ${game.featured ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20' : 'text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300'}`}
                    title={game.featured ? "Remove from Featured" : "Feature on Homepage"}
                  >
                    <Star className={`w-3.5 h-3.5 ${game.featured ? 'fill-current' : ''}`} />
                  </button>
                </td>
                <td className="py-1.5 px-3 text-center">
                  <button 
                    onClick={() => toggleStatus(game._id, game.status)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide transition-colors ${
                      game.status === 'published' 
                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20' 
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700'
                    }`}
                  >
                    {game.status === 'published' ? <><Eye className="w-3 h-3" /> Live</> : <><EyeOff className="w-3 h-3" /> Draft</>}
                  </button>
                </td>
                <td className="py-1.5 px-3 text-right">
                  <div className="flex justify-end gap-1">
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
                <td colSpan={7} className="py-12 text-center text-text-muted">
                  No games found. Time to upload some!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 px-4">
          <p className="text-sm text-text-muted">
            Showing {(page - 1) * 50 + 1} to {Math.min(page * 50, totalGames)} of {totalGames} results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isFetching}
              className="p-2 rounded-lg bg-surface border border-border-main text-text-main hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center px-4 bg-surface border border-border-main rounded-lg text-sm text-text-main font-medium">
              Page {page} of {totalPages}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isFetching}
              className="p-2 rounded-lg bg-surface border border-border-main text-text-main hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
