"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Activity, Play, Square, AlertTriangle, CheckCircle2, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";

interface GameData {
  _id: string;
  title: string;
  slug: string;
  playUrl: string;
}

interface ScanResult extends GameData {
  status: "pending" | "scanning" | "ok" | "broken";
  statusCode?: number;
}

export default function ScannerPage() {
  const [games, setGames] = useState<ScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scanIndex, setScanIndex] = useState(0);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  useEffect(() => {
    fetchGames();
    const stored = localStorage.getItem('lastScannedAt');
    if (stored) setLastScanned(stored);
  }, []);

  async function fetchGames() {
    try {
      setIsLoading(true);
      const { data } = await axios.get<GameData[]>('/api/admin/scanner/urls');
      setGames(data.map(g => ({ ...g, status: "pending" })));
    } catch (error) {
      console.error("Failed to fetch games for scanner:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const startScan = async () => {
    if (games.length === 0) return;
    
    // Reset statuses
    setGames(prev => prev.map(g => ({ ...g, status: "pending", statusCode: undefined })));
    setIsScanning(true);
    setScanIndex(0);
  };

  const stopScan = () => {
    setIsScanning(false);
  };

  // Perform the scan sequentially (or in batches)
  useEffect(() => {
    if (!isScanning) return;
    if (scanIndex >= games.length && games.length > 0) {
      setIsScanning(false);
      const now = new Date().toISOString();
      localStorage.setItem('lastScannedAt', now);
      setLastScanned(now);
      return;
    }

    const scanNext = async () => {
      const game = games[scanIndex];
      
      // Mark as scanning
      setGames(prev => {
        const copy = [...prev];
        copy[scanIndex] = { ...copy[scanIndex], status: "scanning" };
        return copy;
      });

      try {
        const { data } = await axios.post('/api/admin/scanner/check', { url: game.playUrl });
        
        setGames(prev => {
          const copy = [...prev];
          copy[scanIndex] = { 
            ...copy[scanIndex], 
            status: data.ok ? "ok" : "broken",
            statusCode: data.status
          };
          return copy;
        });
      } catch (error) {
        setGames(prev => {
          const copy = [...prev];
          copy[scanIndex] = { 
            ...copy[scanIndex], 
            status: "broken",
            statusCode: 0
          };
          return copy;
        });
      }

      // Move to next
      setScanIndex(prev => prev + 1);
    };

    scanNext();
  }, [isScanning, scanIndex, games.length]);

  const scannedCount = games.filter(g => g.status === "ok" || g.status === "broken").length;
  const brokenGames = games.filter(g => g.status === "broken");
  const progressPercentage = games.length > 0 ? (scannedCount / games.length) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Activity className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-500" />
            Broken Game Scanner
          </h2>
          <p className="text-text-secondary mt-1">Automatically ping game URLs to find broken links (404s) so you can fix or unpublish them.</p>
        </div>
        
        <div className="flex gap-3">
          {isScanning ? (
            <button 
              onClick={stopScan}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <Square className="w-4 h-4 fill-current" /> Stop Scan
            </button>
          ) : (
            <button 
              onClick={startScan}
              disabled={games.length === 0}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" /> {scannedCount > 0 ? "Restart Scan" : "Start Scan"}
            </button>
          )}
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-surface border border-zinc-800 rounded-xl p-6">
        <div className="flex justify-between items-end mb-3">
          <div>
            <div className="text-sm font-medium text-zinc-300 mb-1">Scanning progress</div>
            {lastScanned && !isScanning && (
              <div className="text-xs text-zinc-500">
                Last scanned: {new Date(lastScanned).toLocaleString()}
              </div>
            )}
          </div>
          <span className="text-sm font-medium text-indigo-400">{scannedCount} / {games.length} Games</span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-3 mb-6 overflow-hidden">
          <div 
            className="bg-indigo-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4">
            <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Games Found</div>
            <div className="text-2xl font-bold text-white">{games.length}</div>
          </div>
          <div className="bg-zinc-800/50 border border-green-900/30 rounded-lg p-4">
            <div className="text-xs text-green-500/70 uppercase tracking-wider mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Healthy
            </div>
            <div className="text-2xl font-bold text-green-400">{games.filter(g => g.status === "ok").length}</div>
          </div>
          <div className="bg-zinc-800/50 border border-red-900/30 rounded-lg p-4">
            <div className="text-xs text-red-500/70 uppercase tracking-wider mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Broken
            </div>
            <div className="text-2xl font-bold text-red-400">{brokenGames.length}</div>
          </div>
        </div>
      </div>

      {/* Broken Games List */}
      {brokenGames.length > 0 && (
        <div className="bg-surface border border-red-900/50 rounded-xl overflow-hidden shadow-lg shadow-red-900/10 animate-in fade-in duration-300 mt-6">
          <div className="bg-red-500/10 border-b border-red-900/50 p-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="font-bold text-red-100">Action Required: Broken Games Found</h3>
          </div>
          
          {/* Mobile View (Cards) */}
          <div className="block sm:hidden divide-y divide-red-900/30">
            {brokenGames.map((game) => (
              <div key={game._id} className="p-4 space-y-3 hover:bg-red-500/5 transition-colors">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="font-medium text-red-100">{game.title}</div>
                    <div className="text-zinc-500 text-xs">/{game.slug}</div>
                  </div>
                  <span className="inline-flex shrink-0 items-center px-2 py-1 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                    {game.statusCode || 'Timeout/Failed'}
                  </span>
                </div>
                
                <a href={game.playUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 text-sm break-all">
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" /> {game.playUrl}
                </a>
                
                <div className="pt-2 flex justify-end">
                  <Link 
                    href={`/admin/games/${game._id}/edit`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors border border-zinc-700"
                  >
                    Edit Game <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View (Table) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-sm text-text-muted bg-zinc-900/30">
                  <th className="p-4 font-medium">Game</th>
                  <th className="p-4 font-medium">Status Code</th>
                  <th className="p-4 font-medium">URL</th>
                  <th className="p-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-zinc-800/50">
                {brokenGames.map((game) => (
                  <tr key={game._id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-zinc-200">{game.title}</div>
                      <div className="text-zinc-500 text-xs mt-0.5">/{game.slug}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                        {game.statusCode || 'Timeout/Failed'}
                      </span>
                    </td>
                    <td className="p-4">
                      <a href={game.playUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 truncate max-w-[300px]">
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" /> {game.playUrl}
                      </a>
                    </td>
                    <td className="p-4 text-right">
                      <Link 
                        href={`/admin/games/${game._id}/edit`}
                        className="inline-flex items-center justify-center p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors border border-transparent hover:border-zinc-600"
                        title="Edit Game"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
