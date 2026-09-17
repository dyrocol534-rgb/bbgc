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
    <div className="space-y-4 max-w-[1400px] mx-auto">
      {/* Compact Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
            <div className="w-6 h-6 rounded-[7px] bg-white/[0.08] border border-white/10 flex items-center justify-center text-white shrink-0">
              <Activity className="w-3.5 h-3.5" />
            </div>
            Broken Game Scanner
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Ping game URLs to detect broken links, iframe blockers, and 404s.
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
              className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white px-4 py-1.5 rounded-full font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            >
              <Square className="w-3 h-3 fill-current" /> Stop Scan
            </button>
          ) : (
            <button 
              onClick={startScan}
              disabled={games.length === 0}
              className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-black px-4 py-1.5 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md shadow-white/10 active:scale-95"
            >
              <Play className="w-3 h-3 fill-current" /> {scannedCount > 0 ? "Restart Scan" : "Start Scan"}
            </button>
          )}
        </div>
      </div>

      {/* Progress & Stat Cards (Single Inset Card) */}
      <div className="border border-white/[0.08] rounded-[18px] p-3.5 sm:p-4 space-y-3 shadow-xs">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-semibold text-zinc-400 text-[11px] uppercase tracking-wider">Scan Progress</span>
            <span className="font-bold text-white font-mono text-xs">{scannedCount} / {games.length} ({Math.round(progressPercentage)}%)</span>
          </div>
          <div className="w-full bg-[#101012] rounded-full h-2 overflow-hidden border border-white/[0.08]">
            <div 
              className="bg-white h-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-1">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-[14px] p-2.5 sm:p-3">
            <div className="text-[9.5px] font-semibold text-zinc-400 uppercase tracking-wider">Total Games</div>
            <div className="text-lg sm:text-xl font-bold text-white font-mono mt-0.5">{games.length}</div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[14px] p-2.5 sm:p-3">
            <div className="text-[9.5px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Healthy
            </div>
            <div className="text-lg sm:text-xl font-bold text-emerald-400 font-mono mt-0.5">{games.filter(g => g.status === "ok").length}</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-[14px] p-2.5 sm:p-3">
            <div className="text-[9.5px] font-semibold text-red-400 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Broken
            </div>
            <div className="text-lg sm:text-xl font-bold text-red-400 font-mono mt-0.5">{brokenGames.length}</div>
          </div>
        </div>
      </div>

      {/* Broken Games List */}
      {brokenGames.length > 0 && (
        <div className="border border-red-500/20 rounded-[18px] overflow-hidden shadow-xs">
          <div className="bg-red-500/10 border-b border-red-500/20 px-3.5 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <h3 className="font-bold text-red-200 text-xs sm:text-sm">Broken Games Found ({brokenGames.length})</h3>
            </div>
          </div>
          
          {/* Mobile View (Cards) */}
          <div className="block sm:hidden divide-y divide-white/[0.05]">
            {brokenGames.map((game) => (
              <div key={game._id} className="p-3 space-y-1.5 hover:bg-white/[0.02] transition-colors">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="font-semibold text-zinc-100 text-xs">{game.title}</div>
                    <div className="text-zinc-500 text-[10px]">/{game.slug}</div>
                  </div>
                  <span className="inline-flex shrink-0 items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 font-mono">
                    {game.statusCode || 'Failed'}
                  </span>
                </div>
                
                <a href={game.playUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-white flex items-center gap-1 text-[11px] break-all">
                  <ExternalLink className="w-3 h-3 shrink-0" /> {game.playUrl}
                </a>
                
                <div className="pt-1 flex justify-end">
                  <Link 
                    href={`/admin/games/${game._id}/edit`}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 hover:text-white rounded-full transition-all border border-white/[0.08]"
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
                <tr className="border-b border-white/[0.06] text-[9.5px] font-bold text-zinc-500 bg-[#101012] uppercase tracking-wider">
                  <th className="py-2.5 px-3.5">Game</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5">Play URL</th>
                  <th className="py-2.5 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-white/[0.05]">
                {brokenGames.map((game) => (
                  <tr key={game._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2 px-3.5 whitespace-nowrap">
                      <div className="font-semibold text-white text-xs">{game.title}</div>
                      <div className="text-zinc-500 text-[10px]">/{game.slug}</div>
                    </td>
                    <td className="py-2 px-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 font-mono">
                        {game.statusCode || 'Failed'}
                      </span>
                    </td>
                    <td className="py-2 px-3.5">
                      <a href={game.playUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-white flex items-center gap-1.5 truncate max-w-[320px] text-xs">
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" /> {game.playUrl}
                      </a>
                    </td>
                    <td className="py-2 px-3.5 text-right whitespace-nowrap">
                      <Link 
                        href={`/admin/games/${game._id}/edit`}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-zinc-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] rounded-full transition-all border border-white/[0.08]"
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
