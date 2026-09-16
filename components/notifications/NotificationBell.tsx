"use client";

import { useState, useEffect } from "react";
import { Bell, BellRing, Loader2 } from "lucide-react";
import { isPushSupported, getExistingSubscription, subscribeUserToPush, unsubscribeUserFromPush } from "@/lib/push-client";

export default function NotificationBell() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isPushSupported()) return;
    getExistingSubscription().then((sub) => {
      setIsSubscribed(!!sub);
    });
  }, []);

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);
    setStatusMessage(null);

    if (isSubscribed) {
      const res = await unsubscribeUserFromPush();
      if (res.success) {
        setIsSubscribed(false);
        setStatusMessage("Notifications Muted 🔕");
      } else {
        setStatusMessage(res.error || "Failed to mute");
      }
    } else {
      const res = await subscribeUserToPush();
      if (res.success) {
        setIsSubscribed(true);
        setStatusMessage("Notifications Active! 🔔");
      } else {
        setStatusMessage(res.error || "Permission denied");
      }
    }

    setLoading(false);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={loading}
        className={`group relative flex items-center justify-center w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full transition-all shrink-0 ${
          isSubscribed
            ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
            : "border border-white/[0.08] bg-white/[0.05] hover:bg-white/[0.1] hover:border-white/[0.15] text-zinc-400 hover:text-white"
        }`}
        title={isSubscribed ? "Notifications Enabled" : "Enable Notifications"}
        aria-label={isSubscribed ? "Mute Notifications" : "Allow Notifications"}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
        ) : isSubscribed ? (
          <div className="relative flex items-center justify-center">
            <BellRing className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-2 ring-[#0d0d10]" />
          </div>
        ) : (
          <Bell className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
        )}

        {/* iOS Frosted Tooltip */}
        {(showTooltip || statusMessage) && (
          <div className="absolute top-11 right-0 w-max z-50 pointer-events-none bg-[#1c1c1e]/95 backdrop-blur-xl border border-white/[0.12] text-[11px] font-medium text-zinc-200 px-3 py-1.5 rounded-xl shadow-2xl hidden sm:block whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
            {statusMessage || (isSubscribed ? "Notifications Active 🔔" : "Enable Notifications 🔔")}
          </div>
        )}
      </button>
    </div>
  );
}
