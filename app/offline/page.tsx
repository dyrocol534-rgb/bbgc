"use client";

import { useState, useEffect } from "react";
import { WifiOff, RotateCcw, Gamepad2, Home, Flame, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  const [isChecking, setIsChecking] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [isBouncing, setIsBouncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setTimeout(() => {
        window.location.href = "/";
      }, 800);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setIsChecking(true);
    if (navigator.onLine) {
      window.location.reload();
    } else {
      setTimeout(() => {
        setIsChecking(false);
      }, 900);
    }
  };

  const handleFunTap = () => {
    setTapCount((prev) => prev + 1);
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 250);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/[0.04] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="relative max-w-sm w-full text-center bg-[#0e0e12]/90 border border-zinc-800/80 rounded-3xl p-7 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
        
        {/* Interactive Fun Gamepad / Radar Icon */}
        <div className="relative mx-auto flex justify-center">
          <button
            onClick={handleFunTap}
            title="Tap for good luck!"
            className={`group relative w-20 h-20 rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-900 border border-zinc-700/80 flex items-center justify-center transition-transform active:scale-90 shadow-xl cursor-pointer select-none ${
              isBouncing ? "scale-110" : "hover:scale-105"
            }`}
          >
            {/* Subtle radar ping ring */}
            <span className="absolute inset-0 rounded-2xl border border-white/20 animate-ping pointer-events-none opacity-40" />
            
            <div className="relative flex items-center justify-center">
              <WifiOff className="w-8 h-8 text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]" />
              <Gamepad2 className="w-4 h-4 text-zinc-400 absolute -bottom-1 -right-2 opacity-80" />
            </div>

            {/* Tap counter bubble */}
            {tapCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-black font-black text-[10px] px-2 py-0.5 rounded-full shadow-lg border border-white/20 animate-in zoom-in-50">
                +{tapCount} XP
              </span>
            )}
          </button>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            Game Paused ⏸️
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xs mx-auto">
            You’ve wandered into the offline realm. Check your Wi-Fi or mobile data to hop back in.
          </p>
        </div>

        {/* Status banner */}
        {isOnline ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl py-2.5 px-3.5 text-xs text-emerald-300 font-semibold flex items-center justify-center gap-2 animate-bounce">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Signal restored! Jumping back in...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 font-medium bg-zinc-900/80 border border-zinc-800 py-1.5 px-3 rounded-full w-fit mx-auto">
            <span className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse" />
            <span>Waiting for connection...</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <button
            onClick={handleRetry}
            disabled={isChecking}
            className="w-full py-3 px-5 rounded-xl bg-white hover:bg-zinc-200 active:scale-[0.98] text-black font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-white/10 disabled:opacity-60 cursor-pointer"
          >
            <RotateCcw className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
            {isChecking ? "Checking Signal..." : "Retry Connection"}
          </button>

          <Link
            href="/"
            className="w-full py-2.5 px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800/80 active:scale-[0.98] text-zinc-300 hover:text-white font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border border-zinc-800 hover:border-zinc-700"
          >
            <Home className="w-4 h-4 text-zinc-400" />
            Return to Home
          </Link>
        </div>

        {/* Gamified Footer Tip */}
        <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-center gap-2 text-[11px] text-zinc-400">
          <Flame className="w-3.5 h-3.5 text-white shrink-0" />
          <span>Your streak progress are safely preserved!</span>
        </div>
      </div>
    </div>
  );
}

