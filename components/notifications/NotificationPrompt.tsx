"use client";

import { useState, useEffect } from "react";
import { Bell, X, Sparkles } from "lucide-react";
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
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-[calc(100vw-2rem)] sm:w-96 bg-zinc-900/95 backdrop-blur-md border border-indigo-500/30 rounded-2xl p-4 shadow-2xl shadow-black/80 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shrink-0 shadow-lg shadow-indigo-500/30">
          <Bell className="w-5 h-5 animate-pulse" />
          <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute -top-1 -right-1" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            Never Miss Daily Rewards!
          </h4>
          <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
            Get reminders for daily streak bonuses, XP boosts, and trending game drops.
          </p>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50"
            >
              {loading ? "Enabling..." : "Enable Notifications"}
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-zinc-500 hover:text-zinc-300 p-1 -mt-1 -mr-1 rounded-lg"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
