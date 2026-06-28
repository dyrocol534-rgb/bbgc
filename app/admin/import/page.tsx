"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { DownloadCloud, CheckCircle, Loader2, ExternalLink } from "lucide-react";

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
  const [importingUrls, setImportingUrls] = useState<Set<string>>(new Set());
  const [importedUrls, setImportedUrls] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGames();
  }, [page]);

  const fetchGames = async () => {
    try {
      setIsLoading(true);
      setError("");
      const { data } = await axios.get(`/api/admin/import?page=${page}`);
      
      const gamesArray = Array.isArray(data) ? data : (data.items || []);
      setGames(gamesArray);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to fetch games from GameMonetize");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async (game: GMGame) => {
    try {
      setImportingUrls(prev => new Set(prev).add(game.url));
      
      const slug = game.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      await axios.post('/api/games', {
        title: game.title,
        slug: slug,
        description: game.description || "A great HTML5 game.",
        category: [game.category?.toLowerCase() || "arcade"],
        buildType: "iframe-external",
        source: "aggregated",
        playUrl: game.url,
        thumbnailUrl: game.thumb || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
        status: "published",
        developer: "GameMonetize",
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <DownloadCloud className="w-6 h-6 text-indigo-500" />
            Instant Game Importer
          </h2>
          <p className="text-text-secondary mt-1">
            Browse and import thousands of free HTML5 games from GameMonetize instantly.
          </p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {games.map((game, idx) => {
              const isImporting = importingUrls.has(game.url);
              const isImported = importedUrls.has(game.url);

              return (
                <div key={`${game.id}-${idx}`} className="bg-surface border border-border-main rounded-xl overflow-hidden shadow-lg group hover:border-primary-light transition-colors flex flex-col">
                  <div className="relative aspect-video w-full bg-surface-hover">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={game.thumb}
                      alt={game.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-md">
                      {game.category || "Game"}
                    </div>
                  </div>
                  
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-text-main text-lg line-clamp-1 mb-1">{game.title}</h3>
                    <p className="text-sm text-text-secondary line-clamp-2 mb-4 flex-1">
                      {game.description}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <a 
                        href={game.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2.5 bg-surface-hover hover:bg-surface-active text-text-muted rounded-lg transition-colors"
                        title="Preview Game"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleImport(game)}
                        disabled={isImporting || isImported}
                        className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                          isImported 
                            ? 'bg-green-500/20 text-green-400 cursor-default'
                            : 'bg-primary hover:bg-primary-hover text-text-main disabled:opacity-50'
                        }`}
                      >
                        {isImporting ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Importing...</>
                        ) : isImported ? (
                          <><CheckCircle className="w-4 h-4" /> Imported</>
                        ) : (
                          <><DownloadCloud className="w-4 h-4" /> Import</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-border-main">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-surface-hover hover:bg-surface-active text-text-main rounded-lg disabled:opacity-50 transition-colors"
            >
              Previous Page
            </button>
            <span className="text-text-muted font-medium">Page {page}</span>
            <button 
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 bg-surface-hover hover:bg-surface-active text-text-main rounded-lg transition-colors"
            >
              Next Page
            </button>
          </div>
        </>
      )}
    </div>
  );
}
