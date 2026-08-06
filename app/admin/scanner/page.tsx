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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 bg-[#0c0c0e] p-4 rounded-xl border border-[#1f1f22] shadow-lg shadow-black/40">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            Broken Game Scanner
          </h2>
          <p className="text-[10px] text-zinc-400 truncate mt-0.5 font-medium">Automatically ping game URLs to find broken links (404s) so you can fix or unpublish them.</p>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          {isScanning ? (
            <button 
              onClick={stopScan}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-xs transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
            >
              <Square className="w-3.5 h-3.5 fill-current" /> Stop Scan
            </button>
          ) : (
            <button 
              onClick={startScan}
              disabled={games.length === 0}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold text-xs transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> {scannedCount > 0 ? "Restart Scan" : "Start Scan"}
            </button>
          )}
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-[#0c0c0e] border border-[#1f1f22] rounded-xl p-6 shadow-lg shadow-black/40">
        <div className="flex justify-between items-end mb-3">
          <div>
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Scanning progress</div>
            {lastScanned && !isScanning && (
              <div className="text-[10px] text-zinc-500 font-medium">
                Last scanned: {new Date(lastScanned).toLocaleString()}
              </div>
            )}
          </div>
          <span className="text-xs font-bold text-indigo-400">{scannedCount} / {games.length} Games</span>
        </div>
        <div className="w-full bg-[#121214] border border-[#1f1f22] rounded-full h-3 mb-6 shadow-inner overflow-hidden">
          <div 
            className="bg-indigo-500 h-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#121214] border border-[#1f1f22] rounded-lg p-4 shadow-sm">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Games Found</div>
            <div className="text-2xl font-bold text-white">{games.length}</div>
          </div>
          <div className="bg-[#121214] border border-emerald-900/30 rounded-lg p-4 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
            <div className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-wider mb-1 flex items-center gap-1 relative z-10">
              <CheckCircle2 className="w-3 h-3" /> Healthy
            </div>
            <div className="text-2xl font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)] relative z-10">{games.filter(g => g.status === "ok").length}</div>
          </div>
          <div className="bg-[#121214] border border-red-900/30 rounded-lg p-4 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
            <div className="text-[10px] font-bold text-red-500/70 uppercase tracking-wider mb-1 flex items-center gap-1 relative z-10">
              <AlertTriangle className="w-3 h-3" /> Broken
            </div>
            <div className="text-2xl font-bold text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.3)] relative z-10">{brokenGames.length}</div>
          </div>
        </div>
      </div>

      {/* Broken Games List */}
      {brokenGames.length > 0 && (
        <div className="bg-[#0c0c0e] border border-red-900/50 rounded-xl overflow-hidden shadow-lg shadow-red-900/20 animate-in fade-in duration-300 mt-6">
          <div className="bg-red-500/10 border-b border-red-900/50 p-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]" />
            <h3 className="font-bold text-red-100 text-sm">Action Required: Broken Games Found</h3>
          </div>
          
          {/* Mobile View (Cards) */}
          <div className="block sm:hidden divide-y divide-[#1f1f22]">
            {brokenGames.map((game) => (
              <div key={game._id} className="p-4 space-y-3 hover:bg-[#121214] transition-colors">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="font-bold text-zinc-200 text-xs">{game.title}</div>
                    <div className="text-zinc-500 text-[10px]">/{game.slug}</div>
                  </div>
                  <span className="inline-flex shrink-0 items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider">
                    {game.statusCode || 'Timeout/Failed'}
                  </span>
                </div>
                
                <a href={game.playUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 text-xs font-medium break-all">
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" /> {game.playUrl}
                </a>
                
                <div className="pt-2 flex justify-end">
                  <Link 
                    href={`/admin/games/${game._id}/edit`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-[#121214] hover:bg-[#1a1a1f] text-zinc-300 hover:text-white rounded-lg transition-colors border border-[#1f1f22] shadow-sm"
                  >
                    Edit Game <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View (Table) */}
          <div className="hidden sm:block overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1f1f22] text-[10px] font-bold text-zinc-500 bg-[#121214] uppercase tracking-widest">
                  <th className="p-3">Game</th>
                  <th className="p-3">Status Code</th>
                  <th className="p-3">URL</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-[#1f1f22]">
                {brokenGames.map((game) => (
                  <tr key={game._id} className="hover:bg-[#121214] transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-zinc-200 text-xs">{game.title}</div>
                      <div className="text-zinc-500 text-[10px] mt-0.5">/{game.slug}</div>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider">
                        {game.statusCode || 'Timeout/Failed'}
                      </span>
                    </td>
                    <td className="p-3">
                      <a href={game.playUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 truncate max-w-[300px] text-xs font-medium">
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" /> {game.playUrl}
                      </a>
                    </td>
                    <td className="p-3 text-right">
                      <Link 
                        href={`/admin/games/${game._id}/edit`}
                        className="inline-flex items-center justify-center p-2 text-zinc-400 hover:text-white hover:bg-[#1a1a1f] rounded-lg transition-colors border border-transparent hover:border-[#333339] shadow-sm"
                        title="Edit Game"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
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
