"use client";

import { useState, useEffect } from "react";
import { Bell, BellRing, Loader2 } from "lucide-react";
import { isPushSupported, getExistingSubscription, subscribeUserToPush, unsubscribeUserFromPush } from "@/lib/push-client";

export default function NotificationBell() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isPushSupported()) {
      setIsSupported(true);
      getExistingSubscription().then((sub) => {
        setIsSubscribed(!!sub);
      });
    }
  }, []);

  if (!isSupported) return null;

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
        className={`group relative flex items-center justify-center w-9 h-9 rounded-full transition-all shadow-sm shrink-0 ${
          isSubscribed
            ? "border border-emerald-500/50 bg-emerald-500/15 text-emerald-300 hover:border-emerald-400 hover:bg-emerald-500/25 shadow-[0_0_10px_rgba(0,230,118,0.2)]"
            : "border border-dashed border-zinc-700/80 hover:border-zinc-500 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white"
        }`}
        title={isSubscribed ? "Notifications Subscribed (Click to Mute)" : "Enable Notifications"}
        aria-label="Toggle Push Notifications"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
        ) : isSubscribed ? (
          <BellRing className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
        ) : (
          <Bell className="w-3.5 h-3.5 text-zinc-300 group-hover:text-white group-hover:rotate-12 transition-transform" />
        )}

        {/* Green status badge dot in top-right */}
        <span
          className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-[#0a0a0c] transition-all ${
            isSubscribed
              ? "bg-[#00e676] shadow-[0_0_8px_#00e676] scale-110"
              : "bg-[#00e676]/60 shadow-[0_0_4px_rgba(0,230,118,0.4)]"
          }`}
        />

        {/* Tooltip */}
        {(showTooltip || statusMessage) && (
          <div className="absolute -bottom-9 right-0 w-max z-50 pointer-events-none bg-zinc-900 border border-zinc-700 text-xs text-white px-2.5 py-1 rounded shadow-lg hidden sm:block whitespace-nowrap">
            {statusMessage || (isSubscribed ? "Notifications Subscribed ✅" : "Enable Notifications 🔔")}
          </div>
        )}
      </button>
    </div>
  );
}
