"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { 
  DownloadCloud, 
  CheckCircle, 
  Loader2, 
  ExternalLink, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  Search,
  X,
  Play,
  LayoutGrid,
  List,
  Gamepad2,
  Square,
  RefreshCw,
  SlidersHorizontal
} from "lucide-react";
import Image from "next/image";

interface GMGame {
  id: string;
  title: string;
  description: string;
  url: string;
  thumb: string;
  category: string;
}

const CATEGORIES = [
  { id: "All", label: "All Categories" },
  { id: "1", label: "Action" },
  { id: "2", label: "Arcade" },
  { id: "4", label: "Puzzle" },
  { id: "5", label: "Shooting" },
  { id: "7", label: "Racing" },
  { id: "8", label: "Multiplayer" },
  { id: "6", label: "Sports" },
  { id: "10", label: "Adventure" },
  { id: "9", label: "Girls" },
  { id: "11", label: "3D" },
  { id: "15", label: "Clicker" },
  { id: "14", label: "Casual" },
];

export default function ImportGamesPage() {
  const [games, setGames] = useState<GMGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("All");
  const [autoGenerateAI, setAutoGenerateAI] = useState(true);
  const [importingUrls, setImportingUrls] = useState<Set<string>>(new Set());
  const [importedUrls, setImportedUrls] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  // Search & View Mode
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // In-app game preview modal
  const [previewGame, setPreviewGame] = useState<GMGame | null>(null);

  // Batch import state
  const [isBatchImporting, setIsBatchImporting] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const cancelBatchRef = useRef(false);

  useEffect(() => {
    fetchGames();
  }, [page, category]);

  const fetchGames = async () => {
    try {
      setIsLoading(true);
      setError("");
      const { data } = await axios.get(`/api/admin/import?page=${page}&category=${encodeURIComponent(category)}`);
      
      const gamesArray = Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []);
      setGames(gamesArray);
      if (data.importedUrls) {
        setImportedUrls(new Set(data.importedUrls));
      } else {
        setImportedUrls(new Set());
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to fetch games");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async (game: GMGame) => {
    try {
      setImportingUrls(prev => new Set(prev).add(game.url));
      
      const randomSuffix = Math.random().toString(36).substring(2, 7);
      const slug = game.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + randomSuffix;
      
      let finalDescription = game.description || "A great free online browser game on Bluebuff Games.";
      
      if (autoGenerateAI) {
        try {
          const aiRes = await axios.post("/api/admin/ai/description", {
            title: game.title,
            category: [game.category?.toLowerCase() || "arcade"],
            currentDescription: game.description,
          });
          if (aiRes.data?.success && aiRes.data?.description) {
            finalDescription = aiRes.data.description;
          }
        } catch (aiErr) {
          console.warn("AI generation fallback to feed description:", aiErr);
        }
      }

      await axios.post('/api/games', {
        title: game.title,
        slug: slug,
        description: finalDescription,
        category: [game.category?.toLowerCase() || "arcade"],
        buildType: "iframe-external",
        source: "aggregated",
        playUrl: game.url,
        thumbnailUrl: game.thumb || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
        status: "published",
        developer: "Bluebuff Games",
        platforms: "Browser (desktop, mobile, tablet)"
      });

      setImportedUrls(prev => new Set(prev).add(game.url));
      return true;
    } catch (err: any) {
      console.error(err);
      return false;
    } finally {
      setImportingUrls(prev => {
        const next = new Set(prev);
        next.delete(game.url);
        return next;
      });
    }
  };

  // Filter games based on search query
  const filteredGames = useMemo(() => {
    if (!searchQuery.trim()) return games;
    const query = searchQuery.toLowerCase();
    return games.filter(g => 
      g.title.toLowerCase().includes(query) || 
      g.category?.toLowerCase().includes(query) ||
      g.description?.toLowerCase().includes(query)
    );
  }, [games, searchQuery]);

  // Count unimported games
  const unimportedCount = useMemo(() => {
    return filteredGames.filter(g => !importedUrls.has(g.url)).length;
  }, [filteredGames, importedUrls]);

  // Batch import all unimported games
  const handleBatchImport = async () => {
    const unimported = filteredGames.filter(g => !importedUrls.has(g.url));
    if (unimported.length === 0) return;

    setIsBatchImporting(true);
    cancelBatchRef.current = false;
    setBatchProgress({ current: 0, total: unimported.length });

    for (let i = 0; i < unimported.length; i++) {
      if (cancelBatchRef.current) break;
      setBatchProgress({ current: i + 1, total: unimported.length });
      await handleImport(unimported[i]);
    }

    setIsBatchImporting(false);
  };

  const handleCancelBatch = () => {
    cancelBatchRef.current = true;
    setIsBatchImporting(false);
  };

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
              <div className="w-6 h-6 rounded-[7px] bg-white/10 border border-white/15 flex items-center justify-center text-white shrink-0">
                <DownloadCloud className="w-3.5 h-3.5" />
              </div>
              Instant Game Importer
            </h1>

            {/* Quick KPI Count */}
            {!isLoading && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-400 font-mono">
                <span className="text-emerald-400 font-bold">{importedUrls.size}</span>/{games.length} imported
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Browse and bulk import HTML5 games from high-speed feeds with automated Gemini SEO descriptions.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Batch Import Button */}
          {isBatchImporting ? (
            <button
              type="button"
              onClick={handleCancelBatch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25 transition-all cursor-pointer active:scale-95"
            >
              <Square className="w-3.5 h-3.5 text-red-400 fill-red-400" />
              <span>Cancel ({batchProgress.current}/{batchProgress.total})</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleBatchImport}
              disabled={unimportedCount === 0 || isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white hover:bg-zinc-200 text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer active:scale-95"
              title="Import all unimported games on this page"
            >
              <DownloadCloud className="w-3.5 h-3.5" />
              <span>Import All New ({unimportedCount})</span>
            </button>
          )}

          {/* Auto AI SEO Pill */}
          <button
            type="button"
            onClick={() => setAutoGenerateAI(!autoGenerateAI)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer active:scale-95 ${
              autoGenerateAI
                ? "bg-white/15 text-white border-white/30 shadow-xs"
                : "bg-white/[0.04] text-zinc-400 border-white/[0.08] hover:text-white"
            }`}
            title="Automatically write high-ranking SEO descriptions using Gemini AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">Auto AI SEO</span>
            <span className="sm:hidden">AI SEO</span>
            <span className={`w-1.5 h-1.5 rounded-full ${autoGenerateAI ? "bg-white animate-pulse" : "bg-zinc-600"}`} />
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 bg-black/40 border border-white/[0.08] rounded-full text-xs">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white/[0.12] text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-white/[0.12] text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              title="Dense List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchGames}
            disabled={isLoading}
            className="p-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-400 hover:text-white rounded-full transition-all cursor-pointer active:scale-95 disabled:opacity-40"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-white" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2 bg-white/[0.01] border border-white/[0.08] rounded-[16px]">
        {/* Instant Search in Feed */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search feed games by title or keywords..."
            className="w-full bg-[#101012] border border-white/[0.08] focus:border-white/50 rounded-full pl-8 pr-8 py-1.5 text-xs text-white placeholder-zinc-500 outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Category Select Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select 
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="px-3.5 py-1.5 bg-[#101012] border border-white/[0.08] rounded-full text-xs font-medium text-zinc-200 focus:border-white/50 focus:outline-none transition-colors outline-none cursor-pointer pr-7"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
            <SlidersHorizontal className="w-3 h-3 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 bg-red-500/10 text-red-300 rounded-[12px] border border-red-500/20 text-xs">
          {error}
        </div>
      )}

      {/* Loading Skeleton / Spinner */}
      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-24 space-y-2">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
          <p className="text-xs text-zinc-400">Fetching game catalog feed...</p>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="py-20 text-center space-y-2">
          <Gamepad2 className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-semibold text-zinc-300">No games found</h3>
          <p className="text-xs text-zinc-500">
            {searchQuery ? "Try refining your search keyword" : "No games available in this category feed"}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3">
          {filteredGames.map((game, idx) => {
            const isImporting = importingUrls.has(game.url);
            const isImported = importedUrls.has(game.url);

            return (
              <div 
                key={`${game.id}-${idx}`} 
                className={`border rounded-[16px] overflow-hidden shadow-xs group transition-all flex flex-col ${
                  isImported
                    ? "bg-white/[0.01] border-white/[0.05] opacity-90"
                    : "bg-white/[0.02] border-white/[0.08] hover:border-white/[0.18]"
                }`}
              >
                {/* Thumbnail & Badges */}
                <div className="relative aspect-video w-full bg-black/50 overflow-hidden">
                  <Image
                    src={game.thumb}
                    alt={game.title}
                    width={220}
                    height={125}
                    sizes="220px"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  
                  {/* Category Pill */}
                  <div className="absolute top-1.5 right-1.5 bg-black/75 backdrop-blur-md text-zinc-300 border border-white/10 text-[8.5px] font-bold tracking-wider px-1.5 py-0.5 rounded-full uppercase truncate max-w-[80px]">
                    {game.category || "Game"}
                  </div>

                  {/* Imported Status Badge */}
                  {isImported && (
                    <div className="absolute top-1.5 left-1.5 bg-emerald-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-[8.5px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-2.5 h-2.5" />
                      <span>In Catalog</span>
                    </div>
                  )}

                  {/* Play Test Overlay Button */}
                  <button
                    type="button"
                    onClick={() => setPreviewGame(game)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-[11px] font-bold backdrop-blur-[2px] cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center shadow-md">
                      <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                    </div>
                  </button>
                </div>
                
                {/* Content */}
                <div className="p-2.5 flex flex-col flex-1">
                  <h3 className="font-bold text-white text-[11.5px] sm:text-xs line-clamp-1 group-hover:text-zinc-200 transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed flex-1 mt-0.5 mb-2 font-normal">
                    {game.description || "No description provided."}
                  </p>
                  
                  {/* Card Actions */}
                  <div className="flex items-center gap-1 pt-1 border-t border-white/[0.05]">
                    <button
                      type="button"
                      onClick={() => setPreviewGame(game)}
                      className="p-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-400 hover:text-white rounded-full transition-colors shrink-0 cursor-pointer"
                      title="Test play in popup"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                    </button>
                    <a 
                      href={game.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-400 hover:text-white rounded-full transition-colors shrink-0"
                      title="Open external frame"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleImport(game)}
                      disabled={isImporting || isImported}
                      className={`flex-1 py-1 px-2 rounded-full font-bold text-[10px] sm:text-[10.5px] flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer truncate ${
                        isImported 
                          ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 cursor-default'
                          : isImporting
                          ? 'bg-white/[0.06] text-white'
                          : 'bg-white hover:bg-zinc-200 text-black active:scale-95 disabled:opacity-50'
                      }`}
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin text-white shrink-0" />
                          <span className="truncate">Importing...</span>
                        </>
                      ) : isImported ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>Imported</span>
                        </>
                      ) : (
                        <>
                          <DownloadCloud className="w-3 h-3 shrink-0" />
                          <span>Import</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* DENSE LIST VIEW */
        <div className="border border-white/[0.08] rounded-[18px] overflow-hidden bg-white/[0.01] divide-y divide-white/[0.04]">
          {filteredGames.map((game, idx) => {
            const isImporting = importingUrls.has(game.url);
            const isImported = importedUrls.has(game.url);

            return (
              <div 
                key={`${game.id}-${idx}`} 
                className="p-2.5 sm:p-3 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative w-14 sm:w-16 h-10 sm:h-11 rounded-[10px] overflow-hidden bg-black/40 shrink-0 border border-white/[0.08]">
                    <Image
                      src={game.thumb}
                      alt={game.title}
                      width={64}
                      height={44}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
                        {game.title}
                      </h4>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.04] text-zinc-300 font-semibold border border-white/[0.06] uppercase shrink-0">
                        {game.category || "Game"}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 truncate max-w-xl mt-0.5">
                      {game.description || "No description provided."}
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPreviewGame(game)}
                    className="p-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-400 hover:text-white rounded-full transition-colors cursor-pointer"
                    title="Test play in popup"
                  >
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                  <a 
                    href={game.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-400 hover:text-white rounded-full transition-colors"
                    title="Open external frame"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleImport(game)}
                    disabled={isImporting || isImported}
                    className={`py-1.5 px-3 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                      isImported 
                        ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 cursor-default'
                        : isImporting
                        ? 'bg-white/[0.06] text-white'
                        : 'bg-white hover:bg-zinc-200 text-black active:scale-95 disabled:opacity-50'
                    }`}
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin text-white" />
                        <span>Importing...</span>
                      </>
                    ) : isImported ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span>Imported</span>
                      </>
                    ) : (
                      <>
                        <DownloadCloud className="w-3 h-3" />
                        <span>Import</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modern Compact Pagination Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
        <div className="text-xs text-zinc-400">
          Page <span className="font-semibold text-white font-mono">{page}</span> of catalog feed
          <span className="text-zinc-600 mx-2">•</span>
          <span className="text-zinc-500">{filteredGames.length} games on this page</span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 disabled:opacity-30 disabled:hover:bg-white/[0.04] rounded-full transition-all text-xs font-semibold cursor-pointer disabled:cursor-not-allowed active:scale-95"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          {/* Jump to page form */}
          <div className="flex items-center gap-1 px-2 py-1 bg-white/[0.02] border border-white/[0.06] rounded-full">
            <span className="text-[11px] text-zinc-500 font-mono">Jump:</span>
            <form onSubmit={(e) => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem("pageInput") as HTMLInputElement).value;
              const p = parseInt(input, 10);
              if (!isNaN(p) && p >= 1) {
                setPage(p);
              }
            }} className="flex items-center gap-1">
              <input 
                type="number" 
                name="pageInput"
                defaultValue={page}
                min="1"
                key={`page-input-${page}`}
                className="w-10 px-1 py-0.5 bg-[#101012] border border-white/[0.08] rounded text-center text-white focus:outline-none focus:border-white/50 text-xs font-mono font-bold"
                title="Press Enter to jump to page"
              />
              <button 
                type="submit" 
                className="px-2 py-0.5 bg-white hover:bg-zinc-200 text-black rounded-full text-[10.5px] font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                Go
              </button>
            </form>
          </div>

          <button 
            onClick={() => setPage(p => p + 1)}
            disabled={games.length === 0}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 disabled:opacity-30 disabled:hover:bg-white/[0.04] rounded-full transition-all text-xs font-semibold cursor-pointer disabled:cursor-not-allowed active:scale-95"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Play & Inspect Modal */}
      {previewGame && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setPreviewGame(null)}
        >
          <div 
            className="bg-[#141417] border border-white/[0.1] rounded-[24px] overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-3.5 sm:p-4 border-b border-white/[0.08] flex items-center justify-between gap-3 bg-[#18181c]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-[10px] overflow-hidden bg-black/40 border border-white/[0.08] shrink-0">
                  <Image
                    src={previewGame.thumb}
                    alt={previewGame.title}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate flex items-center gap-2">
                    {previewGame.title}
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/15 uppercase">
                      {previewGame.category || "Game"}
                    </span>
                  </h3>
                  <p className="text-[10.5px] text-zinc-400 truncate max-w-md">
                    {previewGame.description || "Live in-browser frame emulation"}
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewGame.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white transition-colors border border-white/[0.08]"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {importedUrls.has(previewGame.url) ? (
                  <div className="px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>In Catalog</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleImport(previewGame)}
                    disabled={importingUrls.has(previewGame.url)}
                    className="px-4 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {importingUrls.has(previewGame.url) ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Importing...</span>
                      </>
                    ) : (
                      <>
                        <DownloadCloud className="w-3.5 h-3.5" />
                        <span>Import Game</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setPreviewGame(null)}
                  className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white transition-colors cursor-pointer border border-white/[0.08]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Playable Game Frame */}
            <div className="relative w-full aspect-video bg-black flex-1 min-h-[360px] sm:min-h-[480px]">
              <iframe
                src={previewGame.url}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; payment"
                allowFullScreen
                title={previewGame.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
