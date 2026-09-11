"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { DownloadCloud, CheckCircle, Loader2, ExternalLink, Sparkles } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 bg-[#0c0c0e] p-4 rounded-xl border border-[#1f1f22] shadow-lg shadow-black/40">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <DownloadCloud className="w-5 h-5 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            Instant Game Importer
          </h2>
          <p className="text-[10px] text-zinc-400 truncate mt-0.5 font-medium">
            Browse and import thousands of free HTML5 games instantly.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <label className="flex items-center gap-2 cursor-pointer bg-[#121214] px-3 py-2 rounded-lg border border-[#1f1f22] text-xs font-semibold text-zinc-300 hover:border-indigo-500/40 transition-colors select-none">
            <input 
              type="checkbox" 
              checked={autoGenerateAI} 
              onChange={e => setAutoGenerateAI(e.target.checked)} 
              className="rounded bg-zinc-900 border-zinc-700 text-indigo-600 focus:ring-0 w-3.5 h-3.5"
            />
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px]">Auto AI SEO</span>
          </label>

          <select 
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-[#121214] border border-[#1f1f22] rounded-lg text-xs font-medium text-zinc-200 focus:border-[#333339] focus:outline-none transition-colors outline-none cursor-pointer shadow-inner min-w-[150px] flex-1 sm:flex-initial"
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

      {error && (
        <div className="p-4 bg-red-900/50 text-red-200 rounded-lg border border-red-500/20">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {games.map((game, idx) => {
              const isImporting = importingUrls.has(game.url);
              const isImported = importedUrls.has(game.url);

              return (
                <div key={`${game.id}-${idx}`} className="bg-[#0c0c0e] border border-[#1f1f22] rounded-xl overflow-hidden shadow-lg shadow-black/40 group hover:border-[#333339] transition-colors flex flex-col">
                  <div className="relative h-28 w-full bg-[#121214]">
                    <Image
                      src={game.thumb}
                      alt={game.title}
                      width={200}
                      height={200}
                      sizes="200px"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded backdrop-blur-md uppercase">
                      {game.category || "Game"}
                    </div>
                  </div>
                  
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="font-bold text-white text-sm line-clamp-1 mb-1">{game.title}</h3>
                    <p className="text-[10px] text-zinc-400 line-clamp-2 mb-3 flex-1 leading-tight font-medium">
                      {game.description}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <a 
                        href={game.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1.5 bg-[#121214] hover:bg-[#1a1a1f] border border-[#1f1f22] text-zinc-400 hover:text-white rounded-lg transition-colors shadow-sm"
                        title="Preview Game"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleImport(game)}
                        disabled={isImporting || isImported}
                        className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                          isImported 
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-default drop-shadow-[0_0_6px_rgba(52,211,153,0.3)]'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 drop-shadow-[0_0_6px_rgba(99,102,241,0.3)]'
                        }`}
                      >
                        {isImporting ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> ...</>
                        ) : isImported ? (
                          <><CheckCircle className="w-3.5 h-3.5" /> Imported</>
                        ) : (
                          <><DownloadCloud className="w-3.5 h-3.5" /> Import</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center items-center gap-2 sm:gap-4 mt-6 pt-6 border-t border-[#1f1f22]">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-[#121214] hover:bg-[#1a1a1f] border border-[#1f1f22] text-zinc-300 rounded-lg disabled:opacity-50 transition-colors shadow-sm text-xs font-bold"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-2 bg-[#121214] px-3 py-1.5 rounded-lg border border-[#1f1f22] shadow-inner">
              <span className="text-zinc-500 font-bold text-[11px] uppercase tracking-wider hidden sm:inline">Page</span>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const target = parseInt(formData.get("pageInput") as string);
                if (!isNaN(target) && target > 0) {
                  setPage(target);
                }
              }} className="flex items-center gap-2">
                <input 
                  type="number" 
                  name="pageInput"
                  defaultValue={page}
                  min="1"
                  key={`page-input-${page}`}
                  className="w-14 px-2 py-1 bg-[#0c0c0e] border border-[#1f1f22] rounded text-center text-zinc-200 focus:outline-none focus:border-[#333339] text-xs font-bold"
                  title="Press Enter to jump to page"
                />
                <button type="submit" className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold transition-colors drop-shadow-md">
                  Go
                </button>
              </form>
            </div>

            <button 
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 bg-[#121214] hover:bg-[#1a1a1f] border border-[#1f1f22] text-zinc-300 rounded-lg disabled:opacity-50 transition-colors shadow-sm text-xs font-bold"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
