"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if available
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col items-center text-center p-6 sm:p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-sm">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5 text-red-400 shadow-lg shadow-red-500/5">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
          Something went wrong
        </h1>
        
        <p className="text-zinc-400 text-sm sm:text-base max-w-xs mb-7 leading-relaxed">
          An unexpected error occurred. Please try again or return home.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover active:scale-95 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            <RotateCcw className="w-4 h-4" />
            Try again
          </button>
          
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 active:scale-95 text-zinc-300 hover:text-white font-medium text-sm transition-all flex items-center justify-center gap-2 border border-zinc-700/50"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

