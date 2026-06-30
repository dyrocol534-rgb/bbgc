"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

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
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4">
      <div className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(239,68,68,0.15)] border border-red-500/20">
        <AlertTriangle className="w-12 h-12 text-red-500" />
      </div>
      <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">Something went wrong!</h1>
      <p className="text-zinc-400 max-w-md mx-auto text-lg mb-8 leading-relaxed">
        An unexpected error occurred. Don't worry, our team has been notified. Let's try that again.
      </p>
      <button
        onClick={() => reset()}
        className="px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg hover:shadow-indigo-500/25 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-background"
      >
        Try again
      </button>
    </div>
  );
}
