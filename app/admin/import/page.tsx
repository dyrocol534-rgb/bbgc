"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { DownloadCloud, CheckCircle, Loader2, ExternalLink, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface GMGame {
  id: string;
  title: string;
  description: string;
  url: string;
  thumb: string;
  category: string;
}

export default function ImportGamesPage() {
  const [games, setGames] = useState<GMGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("All");
  const [autoGenerateAI, setAutoGenerateAI] = useState(true);
  const [importingUrls, setImportingUrls] = useState<Set<string>>(new Set());
  const [importedUrls, setImportedUrls] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

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
    } catch (err: any) {
      console.error(err);
      alert(`Failed to import ${game.title}: ${err.response?.data?.error || err.message}`);
    } finally {
      setImportingUrls(prev => {
        const next = new Set(prev);
        next.delete(game.url);
        return next;
      });
    }
  };

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto">
      {/* Compact Frameless Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
            <div className="w-6 h-6 rounded-[7px] bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <DownloadCloud className="w-3.5 h-3.5" />
            </div>
            Instant Game Importer
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Browse and import thousands of free HTML5 games with automated AI SEO descriptions.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Auto AI SEO Toggle Pill */}
          <button
            type="button"
            onClick={() => setAutoGenerateAI(!autoGenerateAI)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer active:scale-95 ${
              autoGenerateAI
                ? "bg-orange-500/15 text-orange-300 border-orange-500/30 shadow-xs"
                : "bg-white/[0.04] text-zinc-400 border-white/[0.08] hover:text-white"
            }`}
            title="Automatically write high-ranking SEO descriptions using Gemini AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Auto AI SEO</span>
            <span className={`w-1.5 h-1.5 rounded-full ${autoGenerateAI ? "bg-orange-400 animate-pulse" : "bg-zinc-600"}`} />
          </button>

          {/* Category Select Pill */}
          <div className="relative flex-1 sm:flex-initial">
            <select 
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-auto px-3.5 py-1.5 bg-[#101012] border border-white/[0.08] rounded-full text-xs font-medium text-zinc-200 focus:border-orange-500/50 focus:outline-none transition-colors outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="1">Action</option>
              <option value="2">Arcade</option>
              <option value="4">Puzzle</option>
              <option value="5">Shooting</option>
              <option value="7">Racing</option>
              <option value="8">Multiplayer</option>
              <option value="6">Sports</option>
              <option value="10">Adventure</option>
              <option value="9">Girls</option>
              <option value="11">3D</option>
              <option value="15">Clicker</option>
              <option value="14">Casual</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 text-red-300 rounded-[12px] border border-red-500/20 text-xs">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-24">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin mb-2" />
          <p className="text-xs text-zinc-400">Fetching game catalog feed...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {games.map((game, idx) => {
              const isImporting = importingUrls.has(game.url);
              const isImported = importedUrls.has(game.url);

              return (
                <div 
                  key={`${game.id}-${idx}`} 
                  className="border border-white/[0.08] bg-white/[0.01] hover:border-white/[0.15] rounded-[16px] overflow-hidden shadow-xs group transition-all flex flex-col"
                >
                  <div className="relative aspect-video w-full bg-black/40 overflow-hidden">
                    <Image
                      src={game.thumb}
                      alt={game.title}
                      width={220}
                      height={125}
                      sizes="220px"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-orange-300 border border-white/10 text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase">
                      {game.category || "Game"}
                    </div>
                  </div>
                  
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="font-bold text-white text-xs line-clamp-1 group-hover:text-orange-300 transition-colors">
                      {game.title}
                    </h3>
                    <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed flex-1 mt-0.5 mb-2.5 font-normal">
                      {game.description}
                    </p>
                    
                    <div className="flex items-center gap-1.5 pt-1 border-t border-white/[0.05]">
                      <a 
                        href={game.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-400 hover:text-white rounded-full transition-colors shrink-0"
                        title="Preview external game"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => handleImport(game)}
                        disabled={isImporting || isImported}
                        className={`flex-1 py-1.5 px-3 rounded-full font-bold text-[10.5px] flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                          isImported 
                            ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 cursor-default'
                            : isImporting
                            ? 'bg-white/[0.06] text-orange-400'
                            : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white active:scale-95 disabled:opacity-50'
                        }`}
                      >
                        {isImporting ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin text-orange-400" />
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
                </div>
              );
            })}
          </div>

          {/* Clean Pagination Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-white/[0.08]">
            <span className="text-xs text-zinc-400">
              Showing page <strong className="text-white font-mono">{page}</strong> of game feed
            </span>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 rounded-full disabled:opacity-40 transition-all text-xs font-semibold cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              
              <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-full border border-white/[0.08]">
                <span className="text-zinc-500 text-[10px] uppercase font-semibold">Page</span>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const target = parseInt(formData.get("pageInput") as string);
                  if (!isNaN(target) && target > 0) {
                    setPage(target);
                  }
                }} className="flex items-center gap-1">
                  <input 
                    type="number" 
                    name="pageInput"
                    defaultValue={page}
                    min="1"
                    key={`page-input-${page}`}
                    className="w-10 px-1 py-0.5 bg-[#101012] border border-white/[0.08] rounded text-center text-white focus:outline-none focus:border-orange-500/50 text-xs font-mono font-bold"
                    title="Press Enter to jump to page"
                  />
                  <button 
                    type="submit" 
                    className="px-2 py-0.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full text-[10.5px] font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    Go
                  </button>
                </form>
              </div>

              <button 
                onClick={() => setPage(p => p + 1)}
                className="flex items-center gap-1 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 rounded-full transition-all text-xs font-semibold cursor-pointer active:scale-95"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
