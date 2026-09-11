"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Loader2 } from "lucide-react";
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
    <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-40 w-auto max-w-[calc(100vw-1.5rem)] sm:max-w-[320px] bg-[#121214]/95 backdrop-blur-md border border-zinc-800/80 rounded-xl p-2 px-2.5 shadow-xl shadow-black/80 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-2.5">
        {/* Brand Logo */}
        <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 shadow-sm shadow-orange-500/20">
          <Image
            src="/logo.png"
            alt="Logo"
            width={28}
            height={28}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <h4 className="text-xs font-bold text-white tracking-tight leading-tight truncate">
            Daily Rewards & Drops
          </h4>
          <p className="text-[10px] text-zinc-400 leading-tight mt-0.5 truncate">
            Streak bonuses & new games
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-[11px] font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1 shadow-sm shadow-orange-500/20"
          >
            {loading && <Loader2 className="w-3 h-3 animate-spin" />}
            <span>{loading ? "Enabling..." : "Turn On"}</span>
          </button>
          <button
            onClick={handleDismiss}
            className="text-zinc-400 hover:text-white p-0.5 rounded transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
