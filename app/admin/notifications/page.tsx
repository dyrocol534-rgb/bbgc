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
  ShieldCheck
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

  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    setTitle(template.title);
    setBody(template.body);
    setUrl(template.url);
  };

  const handleSendTest = async () => {
    try {
      setIsSendingTest(true);
      setResultMessage(null);

      // Make sure admin's browser is subscribed
      let sub = await getExistingSubscription();
      if (!sub) {
        const subRes = await subscribeUserToPush();
        if (!subRes.success || !subRes.subscription) {
          throw new Error(subRes.error || "Please allow notifications in this browser to receive the test push.");
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
          testSubscription: sub.toJSON(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResultMessage({ type: "success", text: "✅ Test notification sent directly to your device!" });
      } else {
        throw new Error(data.error || "Failed to send test push");
      }
    } catch (err: any) {
      setResultMessage({ type: "error", text: err.message || "Failed to send test notification" });
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
          text: `🎉 ${data.message} (${data.successCount} delivered, ${data.failureCount} failed, ${data.removedDead} expired removed).`,
        });
        fetchStats(); // Refresh count
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <BellRing className="w-7 h-7 text-indigo-400" />
            Push Notifications Manager
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Send instant web and PWA push notifications to all subscribed desktop and mobile players.
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={loadingStats}
          className="self-start sm:self-auto px-3.5 py-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 rounded-lg border border-zinc-700/60 transition-colors"
        >
          {loadingStats ? "Refreshing..." : "Refresh Stats"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#12111a] border border-[#282142] p-5 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-indigo-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Subscribers</span>
            <Users className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {loadingStats ? "..." : stats?.total.toLocaleString() || 0}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Active browser & PWA endpoints</p>
        </div>

        <div className="bg-[#12111a] border border-[#282142] p-5 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-indigo-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Mobile Devices</span>
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {loadingStats ? "..." : stats?.devices.mobile.toLocaleString() || 0}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Android & PWA installations</p>
        </div>

        <div className="bg-[#12111a] border border-[#282142] p-5 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-purple-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Desktop</span>
            <Monitor className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {loadingStats ? "..." : stats?.devices.desktop.toLocaleString() || 0}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Chrome, Edge, Firefox, Mac</p>
        </div>

        <div className="bg-[#12111a] border border-[#282142] p-5 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Tablets</span>
            <Tablet className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {loadingStats ? "..." : stats?.devices.tablet.toLocaleString() || 0}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">iPads & Android tablets</p>
        </div>
      </div>

      {/* Templates Row */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Quick Notification Presets
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TEMPLATES.map((tmpl) => {
            const Icon = tmpl.icon;
            return (
              <button
                key={tmpl.name}
                onClick={() => applyTemplate(tmpl)}
                className="flex items-start gap-3 p-3.5 bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-indigo-500/50 rounded-xl text-left transition-all group"
              >
                <div className="p-2 rounded-lg bg-indigo-600/10 text-indigo-400 group-hover:bg-indigo-600/20 transition-colors shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-zinc-200 group-hover:text-white block">
                    {tmpl.name}
                  </span>
                  <span className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                    {tmpl.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Composer & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 space-y-5 bg-zinc-900/50 border border-zinc-800/80 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-indigo-400" />
            Compose Notification
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Notification Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 🔥 Don't lose your streak!"
                className="w-full bg-black/40 border border-zinc-700/70 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Message Body <span className="text-red-400">*</span>
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                placeholder="e.g. Your daily rewards and bonuses are ready to claim..."
                className="w-full bg-black/40 border border-zinc-700/70 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Click Target URL / Route
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="e.g. /rewards or /games/subway-surfers"
                className="w-full bg-black/40 border border-zinc-700/70 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 transition-colors"
              />
              <p className="text-[11px] text-zinc-500 mt-1">Users will be navigated here when they click the notification.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Optional Banner Image URL
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... (image thumbnail banner)"
                className="w-full bg-black/40 border border-zinc-700/70 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 transition-colors"
              />
            </div>
          </div>

          {/* Feedback message banner */}
          {resultMessage && (
            <div
              className={`p-4 rounded-xl flex items-start gap-3 text-sm border ${
                resultMessage.type === "success"
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                  : "bg-red-950/40 border-red-500/40 text-red-300"
              }`}
            >
              {resultMessage.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
              )}
              <div className="flex-1">{resultMessage.text}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-zinc-800">
            <button
              onClick={handleSendTest}
              disabled={isSendingTest || isSending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-semibold rounded-xl border border-zinc-700 transition-colors disabled:opacity-50"
            >
              {isSendingTest ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  Sending Test...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  Send Test to My Device
                </>
              )}
            </button>

            <button
              onClick={handleBroadcast}
              disabled={isSending || isSendingTest || stats?.total === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Broadcasting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Broadcast to All ({stats?.total || 0})
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800/80 p-6 rounded-2xl">
            <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-indigo-400" />
              Live Push Preview
            </h4>

            {/* Simulated Native OS Notification */}
            <div className="bg-[#18181b] border border-zinc-700/80 rounded-2xl p-4 shadow-2xl space-y-3">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-indigo-600 flex items-center justify-center text-[10px] text-white font-bold">
                    B
                  </div>
                  <span className="font-semibold text-zinc-300">Bluebuff Games</span>
                  <span>• now</span>
                </div>
                <span className="text-[10px] text-zinc-500">Google Chrome / PWA</span>
              </div>

              <div className="flex gap-3 items-start">
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-bold text-white leading-tight">
                    {title || "Notification Title"}
                  </h5>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed line-clamp-3">
                    {body || "Your notification body message goes here..."}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 p-1.5">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
              </div>

              {imageUrl && (
                <div className="w-full h-32 rounded-lg overflow-hidden bg-black/40 border border-zinc-800">
                  <img src={imageUrl} alt="Banner" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="pt-2 flex items-center justify-between text-[11px] text-indigo-400 font-medium">
                <span>Opens: {url || "/"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-4 p-3.5 bg-indigo-950/20 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 leading-relaxed">
              💡 <strong>Tip:</strong> Click <em>"Send Test to My Device"</em> to see how the native notification looks and sounds directly on your operating system.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
