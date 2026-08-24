"use client";

import { useState, useEffect } from "react";
import { WifiOff, RefreshCw, Gamepad2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function OfflinePage() {
  const [isChecking, setIsChecking] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      window.location.href = "/";
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
      }, 1000);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6 bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
        
        {/* Glowing Wifi Off Icon */}
        <div className="relative mx-auto w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-xl animate-pulse" />
          <WifiOff className="w-10 h-10 relative z-10 text-indigo-400" />
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            You&apos;re Offline
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            It looks like you lost your internet connection. Please check your Wi-Fi or mobile data to continue playing.
          </p>
        </div>

        {/* Auto-reconnect banner if restored */}
        {isOnline ? (
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-300 font-medium animate-pulse">
            Connection restored! Reconnecting now...
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleRetry}
            disabled={isChecking}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
            {isChecking ? "Checking Connection..." : "Retry Connection"}
          </button>

          <Link
            href="/"
            className="w-full py-3 px-4 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 hover:text-white font-medium text-sm transition-all flex items-center justify-center gap-2 border border-zinc-700/50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Footer tip */}
        <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-center gap-2 text-xs text-zinc-500">
          <Gamepad2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Your streaks and saved XP will sync when reconnected</span>
        </div>
      </div>
    </div>
  );
}
