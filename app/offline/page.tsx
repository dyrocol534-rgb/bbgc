"use client";

import { useState, useEffect } from "react";
import { WifiOff, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  const [isChecking, setIsChecking] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setTimeout(() => {
        window.location.href = "/";
      }, 600);
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
      }, 800);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm text-center bg-[#121215] border border-white/10 rounded-2xl p-6 sm:p-7 shadow-xl">
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-zinc-300">
          <WifiOff className="w-5 h-5" />
        </div>

        <h1 className="text-xl font-bold text-white tracking-tight">
          You're Offline
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed">
          Please check your internet connection and try again.
        </p>

        {isOnline && (
          <div className="mt-4 py-2 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium">
            Signal restored! Reconnecting...
          </div>
        )}

        <div className="mt-6 space-y-2.5">
          <button
            onClick={handleRetry}
            disabled={isChecking}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-200 active:scale-[0.99] text-black font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
            <span>{isChecking ? "Connecting..." : "Try Again"}</span>
          </button>

          <Link
            href="/"
            className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 active:scale-[0.99] text-zinc-300 hover:text-white font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border border-white/5"
          >
            <Home className="w-4 h-4 text-zinc-400" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
