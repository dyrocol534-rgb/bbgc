"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { isPushSupported, getExistingSubscription, subscribeUserToPush } from "@/lib/push-client";

export default function NotificationPrompt() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pathname === "/login" || pathname?.startsWith("/login")) {
      setIsVisible(false);
      return;
    }

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

  if (pathname === "/login" || pathname?.startsWith("/login")) return null;
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-3 sm:bottom-5 sm:right-5 z-40 w-auto max-w-[calc(100vw-1.5rem)] sm:max-w-[295px] bg-[#161619]/95 backdrop-blur-xl border border-white/[0.12] rounded-full py-1.5 px-2.5 sm:px-3 shadow-[0_10px_30px_rgba(0,0,0,0.7)] animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="flex items-center gap-2">
        {/* Brand App Logo (no outer card container) */}
        <div className="relative w-5.5 h-5.5 shrink-0 flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={22}
            height={22}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-0.5">
          <h4 className="text-[11px] sm:text-[11.5px] font-bold text-white tracking-tight leading-tight truncate">
            Daily Rewards &amp; Drops
          </h4>
          <p className="text-[9px] sm:text-[9.5px] text-zinc-400 leading-tight mt-0.5 truncate">
            Streak bonuses &amp; new games
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="px-2.5 py-1 bg-white hover:bg-zinc-200 active:scale-95 text-black text-[10.5px] font-bold rounded-full transition-all disabled:opacity-50 flex items-center gap-1 shadow-xs cursor-pointer"
          >
            {loading && <Loader2 className="w-3 h-3 animate-spin" />}
            <span>{loading ? "Enabling..." : "Turn On"}</span>
          </button>
          <button
            onClick={handleDismiss}
            className="w-5 h-5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.18] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Dismiss"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
