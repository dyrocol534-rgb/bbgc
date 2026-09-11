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
    <div className="space-y-4">
      {/* Compact Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            Broken Game Scanner
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Ping game URLs to detect broken links and 404s.
          </p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {lastScanned && !isScanning && (
            <span className="text-[11px] text-zinc-500 hidden md:inline">
              Last: {new Date(lastScanned).toLocaleDateString()} {new Date(lastScanned).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {isScanning ? (
            <button 
              onClick={stopScan}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Square className="w-3 h-3 fill-current" /> Stop Scan
            </button>
          ) : (
            <button 
              onClick={startScan}
              disabled={games.length === 0}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Play className="w-3 h-3 fill-current" /> {scannedCount > 0 ? "Restart Scan" : "Start Scan"}
            </button>
          )}
        </div>
      </div>

      {/* Progress & Stat Cards */}
      <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-xl p-4">
        {/* Progress Bar */}
        <div className="flex justify-between items-center text-xs mb-2">
          <span className="font-semibold text-zinc-400">Progress</span>
          <span className="font-semibold text-indigo-400">{scannedCount} / {games.length} Games ({Math.round(progressPercentage)}%)</span>
        </div>
        <div className="w-full bg-zinc-900 rounded-full h-2 mb-4 overflow-hidden border border-zinc-800">
          <div 
            className="bg-indigo-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-2.5 sm:p-3">
            <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Total Games</div>
            <div className="text-lg sm:text-xl font-bold text-white mt-0.5">{games.length}</div>
          </div>
          <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-lg p-2.5 sm:p-3">
            <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Healthy
            </div>
            <div className="text-lg sm:text-xl font-bold text-emerald-400 mt-0.5">{games.filter(g => g.status === "ok").length}</div>
          </div>
          <div className="bg-red-950/20 border border-red-800/30 rounded-lg p-2.5 sm:p-3">
            <div className="text-[10px] font-semibold text-red-400 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Broken
            </div>
            <div className="text-lg sm:text-xl font-bold text-red-400 mt-0.5">{brokenGames.length}</div>
          </div>
        </div>
      </div>

      {/* Broken Games List */}
      {brokenGames.length > 0 && (
        <div className="bg-[#0c0c0e] border border-red-900/40 rounded-xl overflow-hidden">
          <div className="bg-red-500/10 border-b border-red-900/40 px-3.5 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <h3 className="font-bold text-red-200 text-xs sm:text-sm">Broken Games Found ({brokenGames.length})</h3>
            </div>
          </div>
          
          {/* Mobile View (Cards) */}
          <div className="block sm:hidden divide-y divide-zinc-800/60">
            {brokenGames.map((game) => (
              <div key={game._id} className="p-3 space-y-2 hover:bg-zinc-900/40 transition-colors">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="font-semibold text-zinc-100 text-xs">{game.title}</div>
                    <div className="text-zinc-500 text-[10px]">/{game.slug}</div>
                  </div>
                  <span className="inline-flex shrink-0 items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                    {game.statusCode || 'Failed'}
                  </span>
                </div>
                
                <a href={game.playUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-xs break-all">
                  <ExternalLink className="w-3 h-3 shrink-0" /> {game.playUrl}
                </a>
                
                <div className="pt-1 flex justify-end">
                  <Link 
                    href={`/admin/games/${game._id}/edit`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white rounded-md transition-colors border border-zinc-700/60"
                  >
                    Edit Game <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View (Table) */}
          <div className="hidden sm:block overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 text-[10px] font-semibold text-zinc-400 bg-zinc-900/80 uppercase tracking-wider">
                  <th className="py-2.5 px-3.5">Game</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5">Play URL</th>
                  <th className="py-2.5 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-zinc-800/50">
                {brokenGames.map((game) => (
                  <tr key={game._id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-2.5 px-3.5 whitespace-nowrap">
                      <div className="font-medium text-white text-xs">{game.title}</div>
                      <div className="text-zinc-500 text-[10px]">/{game.slug}</div>
                    </td>
                    <td className="py-2.5 px-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                        {game.statusCode || 'Failed'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <a href={game.playUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 truncate max-w-[320px] text-xs">
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" /> {game.playUrl}
                      </a>
                    </td>
                    <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                      <Link 
                        href={`/admin/games/${game._id}/edit`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors border border-zinc-700/60"
                        title="Edit Game"
                      >
                        Edit <ArrowRight className="w-3 h-3" />
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
