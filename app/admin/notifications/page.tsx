"use client";

import { useState, useEffect } from "react";
import { 
  BellRing, 
  Send, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  Flame, 
  Gamepad2, 
  Trophy,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { getExistingSubscription, subscribeUserToPush } from "@/lib/push-client";

interface PushStats {
  total: number;
  devices: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  recent: Array<{
    _id: string;
    endpoint: string;
    deviceType: string;
    userAgent: string;
    createdAt: string;
  }>;
}

const TEMPLATES = [
  {
    name: "Daily Streak Bonus",
    icon: Flame,
    title: "🔥 Don't lose your daily streak!",
    body: "Your daily bonus coins and XP are waiting! Play a quick game to keep your streak alive.",
    url: "/rewards",
  },
  {
    name: "New Game Release",
    icon: Gamepad2,
    title: "🚀 New Game Dropped on Bluebuff!",
    body: "A brand new trending game is ready to play instantly with no downloads required.",
    url: "/",
  },
  {
    name: "Weekend XP Boost",
    icon: Sparkles,
    title: "⚡ Double XP Event is LIVE!",
    body: "Earn 2x coins and level up your player profile twice as fast all weekend long.",
    url: "/",
  },
  {
    name: "Leaderboard Challenge",
    icon: Trophy,
    title: "🏆 Can you take the #1 Spot?",
    body: "The global leaderboards have updated. Jump in and claim your bragging rights!",
    url: "/leaderboard",
  },
];

export default function AdminPushNotificationsPage() {
  const [stats, setStats] = useState<PushStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Form State
  const [title, setTitle] = useState("🔥 Daily Bonus Ready!");
  const [body, setBody] = useState("Log in now to claim your daily streak coins and level up your rank.");
  const [url, setUrl] = useState("/");
  const [imageUrl, setImageUrl] = useState("");

  // Sending state
  const [isSending, setIsSending] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoadingStats(true);
      const res = await fetch("/api/admin/notifications/stats");
      const data = await res.json();
      if (!data.error) {
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch stats", err);
    } finally {
      setLoadingStats(false);
    }
  }

  const applyTemplate = (tmpl: typeof TEMPLATES[0]) => {
    setTitle(tmpl.title);
    setBody(tmpl.body);
    setUrl(tmpl.url);
  };

  const handleSendTest = async () => {
    if (!title.trim() || !body.trim()) {
      alert("Please fill in both Title and Body.");
      return;
    }

    try {
      setIsSendingTest(true);
      setResultMessage(null);

      // Ensure local user is subscribed
      let sub = await getExistingSubscription();
      if (!sub) {
        const subRes = await subscribeUserToPush();
        if (!subRes.success || !subRes.subscription) {
          throw new Error(subRes.error || "Please allow notifications in your browser first.");
        }
        sub = subRes.subscription;
      }

      const res = await fetch("/api/admin/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          url,
          image: imageUrl || undefined,
          target: "test",
          subscription: sub,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResultMessage({
          type: "success",
          text: "✅ Test push notification delivered to your browser!",
        });
      } else {
        throw new Error(data.error || "Failed to deliver test notification");
      }
    } catch (err: any) {
      setResultMessage({ type: "error", text: err.message || "Failed to send test" });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleBroadcast = async () => {
    if (!title.trim() || !body.trim()) {
      alert("Please fill in both Title and Body.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to broadcast this notification to all ${stats?.total || 0} subscribed devices?`
    );
    if (!confirmed) return;

    try {
      setIsSending(true);
      setResultMessage(null);

      const res = await fetch("/api/admin/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          url,
          image: imageUrl || undefined,
          target: "all",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResultMessage({
          type: "success",
          text: `🎉 ${data.message} (${data.successCount} delivered, ${data.failureCount} failed).`,
        });
        fetchStats();
      } else {
        throw new Error(data.error || "Failed to broadcast notification");
      }
    } catch (err: any) {
      setResultMessage({ type: "error", text: err.message || "Failed to send broadcast" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <BellRing className="w-4 h-4 text-indigo-400" />
            Push Notifications
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Broadcast web push notifications to your active players.
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={loadingStats}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-800 disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-zinc-400 ${loadingStats ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-[#0c0c0e] border border-zinc-800/80 p-2.5 sm:p-3 rounded-xl flex items-center gap-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block truncate">Total Subs</span>
            <div className="text-sm sm:text-base font-bold text-white font-mono leading-tight">
              {loadingStats ? "..." : stats?.total.toLocaleString() || 0}
            </div>
          </div>
        </div>

        <div className="bg-[#0c0c0e] border border-zinc-800/80 p-2.5 sm:p-3 rounded-xl flex items-center gap-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block truncate">Mobile</span>
            <div className="text-sm sm:text-base font-bold text-white font-mono leading-tight">
              {loadingStats ? "..." : stats?.devices.mobile.toLocaleString() || 0}
            </div>
          </div>
        </div>

        <div className="bg-[#0c0c0e] border border-zinc-800/80 p-2.5 sm:p-3 rounded-xl flex items-center gap-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block truncate">Desktop</span>
            <div className="text-sm sm:text-base font-bold text-white font-mono leading-tight">
              {loadingStats ? "..." : stats?.devices.desktop.toLocaleString() || 0}
            </div>
          </div>
        </div>

        <div className="bg-[#0c0c0e] border border-zinc-800/80 p-2.5 sm:p-3 rounded-xl flex items-center gap-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Tablet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block truncate">Tablet</span>
            <div className="text-sm sm:text-base font-bold text-white font-mono leading-tight">
              {loadingStats ? "..." : stats?.devices.tablet.toLocaleString() || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Notification Presets */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          Quick Presets
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TEMPLATES.map((tmpl) => {
            const Icon = tmpl.icon;
            return (
              <button
                key={tmpl.name}
                onClick={() => applyTemplate(tmpl)}
                className="flex items-center gap-2 p-2 bg-[#0c0c0e] hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 rounded-lg text-left transition-colors group"
              >
                <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400 shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-medium text-zinc-300 group-hover:text-white block truncate">
                    {tmpl.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Composer & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 space-y-3 bg-[#0c0c0e] border border-zinc-800/80 p-3.5 sm:p-4 rounded-xl">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-indigo-400" />
            Compose Message
          </h3>

          <div className="space-y-2.5 text-xs">
            <div>
              <label className="block font-medium text-zinc-400 mb-1">
                Notification Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="🔥 Don't lose your streak!"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 transition-colors outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-400 mb-1">
                Message Body <span className="text-red-400">*</span>
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={2}
                placeholder="Your notification message..."
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 transition-colors resize-none outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block font-medium text-zinc-400 mb-1">Target Route</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="/ or /games/slug"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 transition-colors outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-400 mb-1">Banner Image URL (Optional)</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 transition-colors outline-none"
                />
              </div>
            </div>
          </div>

          {/* Feedback banner */}
          {resultMessage && (
            <div
              className={`p-2.5 rounded-lg flex items-start gap-2 text-xs border ${
                resultMessage.type === "success"
                  ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
                  : "bg-red-950/30 border-red-500/30 text-red-300"
              }`}
            >
              {resultMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              )}
              <div className="flex-1">{resultMessage.text}</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-zinc-800/80">
            <button
              onClick={handleSendTest}
              disabled={isSendingTest || isSending}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700/60 transition-colors disabled:opacity-50"
            >
              {isSendingTest ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span>Sending Test...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Test on My Device</span>
                </>
              )}
            </button>

            <button
              onClick={handleBroadcast}
              disabled={isSending || isSendingTest || stats?.total === 0}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Broadcasting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast to All ({stats?.total || 0})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 bg-[#0c0c0e] border border-zinc-800/80 p-3.5 sm:p-4 rounded-xl space-y-3">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5 text-indigo-400" />
            Live Preview
          </h4>

          {/* Simulated OS Notification */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-zinc-400 border-b border-zinc-800 pb-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-indigo-600 flex items-center justify-center text-[9px] text-white font-bold">
                  B
                </div>
                <span className="font-semibold text-zinc-300">Bluebuff Games</span>
                <span>• now</span>
              </div>
              <span className="text-[9px] text-zinc-500">Chrome / PWA</span>
            </div>

            <div className="flex gap-2.5 items-start">
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-bold text-white leading-tight truncate">
                  {title || "Notification Title"}
                </h5>
                <p className="text-[11px] text-zinc-300 mt-0.5 leading-relaxed line-clamp-2">
                  {body || "Message body goes here..."}
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center shrink-0 p-1">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
            </div>

            {imageUrl && (
              <div className="w-full h-24 rounded-lg overflow-hidden bg-black/40 border border-zinc-800">
                <img src={imageUrl} alt="Banner" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="pt-1 flex items-center justify-between text-[10px] text-indigo-400 font-medium">
              <span>Opens: {url || "/"}</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
