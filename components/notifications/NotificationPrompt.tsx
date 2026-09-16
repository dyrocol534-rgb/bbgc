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
    <div className="fixed bottom-4 right-3 sm:bottom-5 sm:right-5 z-40 w-auto max-w-[calc(100vw-1.5rem)] sm:max-w-[310px] bg-[#161619]/95 backdrop-blur-xl border border-white/[0.12] rounded-2xl p-2 sm:p-2.5 shadow-[0_12px_36px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="flex items-center gap-2.5">
        {/* Brand App Icon Squircle */}
        <div className="relative w-7.5 h-7.5 rounded-[9px] bg-[#222226] border border-white/[0.08] overflow-hidden shrink-0 p-1 flex items-center justify-center shadow-xs">
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
            Daily Rewards &amp; Drops
          </h4>
          <p className="text-[10px] text-zinc-400 leading-tight mt-0.5 truncate">
            Streak bonuses &amp; new games
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="px-2.5 py-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white text-[11px] font-semibold rounded-full transition-all disabled:opacity-50 flex items-center gap-1 shadow-xs shadow-orange-500/20 cursor-pointer"
          >
            {loading && <Loader2 className="w-3 h-3 animate-spin" />}
            <span>{loading ? "Enabling..." : "Turn On"}</span>
          </button>
          <button
            onClick={handleDismiss}
            className="w-5 h-5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
