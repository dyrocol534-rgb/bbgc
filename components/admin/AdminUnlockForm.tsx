"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { unlockAdmin } from "@/app/admin/actions";
import { Lock, Loader2, KeyRound } from "lucide-react";

export default function AdminUnlockForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await unlockAdmin(password);
      if (res.success) {
        router.refresh(); // This will trigger layout.tsx to re-read the cookie and render children
      } else {
        setError(res.error || "Failed to unlock");
        setPassword("");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="bg-surface border border-border-main rounded-2xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
          <Lock className="w-8 h-8 text-red-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-text-main mb-2">Admin Locked</h2>
        <p className="text-text-secondary text-sm mb-8">
          Please enter your secondary admin PIN to access the dashboard.
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <KeyRound className="h-5 w-5 text-zinc-500" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full bg-background border border-border-strong rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Enter admin password..."
              autoFocus
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm font-medium bg-red-500/10 py-2 rounded-lg border border-red-500/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Unlock Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
