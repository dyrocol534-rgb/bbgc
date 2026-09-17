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
        className={`group relative flex items-center justify-center w-[34px] h-[34px] sm:w-[36px] sm:h-[36px] rounded-full backdrop-blur-xl transition-all duration-150 shrink-0 active:scale-90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_2px_8px_rgba(0,0,0,0.3)] ${
          isSubscribed
            ? "border border-white/30 bg-white/[0.12] text-white hover:bg-white/[0.18]"
            : "border border-white/[0.1] bg-white/[0.06] hover:bg-white/[0.12] hover:border-white/[0.25] text-white"
        }`}
        title={isSubscribed ? "Notifications Enabled" : "Enable Notifications"}
        aria-label={isSubscribed ? "Mute Notifications" : "Allow Notifications"}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 text-white animate-spin" />
        ) : isSubscribed ? (
          <div className="relative flex items-center justify-center">
            <BellRing className="w-4 h-4 text-white group-hover:scale-110 transition-transform stroke-[2.2]" />
            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-2 ring-[#0d0d10]" />
          </div>
        ) : (
          <Bell className="w-4 h-4 text-white group-hover:text-zinc-200 transition-transform duration-200 group-hover:rotate-6 stroke-[2.2]" />
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
