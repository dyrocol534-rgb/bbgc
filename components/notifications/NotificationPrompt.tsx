"use client";

import { useState, useEffect } from "react";
import { BellRing, X, Loader2 } from "lucide-react";
import { isPushSupported, getExistingSubscription, subscribeUserToPush } from "@/lib/push-client";

export default function NotificationPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isPushSupported()) return;

    // Check if user dismissed prompt recently
    const dismissedAt = localStorage.getItem("push_prompt_dismissed");
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) return; // Don't ask again for 7 days
    }

    // Check if already subscribed
    getExistingSubscription().then((sub) => {
      if (!sub && Notification.permission !== "denied") {
        // Show after 8 seconds of engagement
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 8000);
        return () => clearTimeout(timer);
      }
    });
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);
    const res = await subscribeUserToPush();
    setLoading(false);
    setIsVisible(false);
    if (!res.success) {
      localStorage.setItem("push_prompt_dismissed", Date.now().toString());
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("push_prompt_dismissed", Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-16 sm:top-18 right-3 sm:right-5 z-50 w-[calc(100vw-1.5rem)] max-w-[300px] bg-zinc-900/95 backdrop-blur-xl border border-orange-500/25 rounded-xl p-2.5 sm:p-3 shadow-2xl shadow-black/80 ring-1 ring-white/5 animate-in fade-in slide-in-from-top-3 duration-300">
      <div className="flex items-start gap-2.5">
        {/* Compact Icon */}
        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-orange-500/30 border border-orange-500/40 text-orange-400 shrink-0 shadow-inner">
          <BellRing className="w-3.5 h-3.5 text-orange-400" />
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h4 className="text-xs font-semibold text-white truncate">
              Daily Rewards & Drops
            </h4>
            <button
              onClick={handleDismiss}
              className="text-zinc-400 hover:text-zinc-200 p-0.5 rounded hover:bg-zinc-800/60 transition-colors shrink-0 -mr-0.5"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
            Get streak bonuses, XP boosts & new games.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 mt-2">
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 active:scale-[0.98] text-white text-[11px] font-medium py-1 px-2.5 rounded-md transition-all shadow-sm shadow-orange-600/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  <span>Enabling...</span>
                </>
              ) : (
                "Turn On"
              )}
            </button>
            <button
              onClick={handleDismiss}
              className="px-2 py-1 text-[11px] font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 rounded-md transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
