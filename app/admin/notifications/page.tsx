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
  RefreshCw,
  X,
  RotateCcw,
  Clock,
  Radio
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

const QUICK_ROUTES = [
  { label: "Home", path: "/" },
  { label: "Daily Rewards", path: "/rewards" },
  { label: "Referral", path: "/referral" },
  { label: "Leaderboard", path: "/leaderboard" },
  { label: "Settings", path: "/profile/settings" },
];

const QUICK_EMOJIS = ["🔥", "⚡", "🎁", "🏆", "🎮", "💎", "👑", "🚀", "⭐"];

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

  // Active view tab: "compose" | "subscribers"
  const [activeTab, setActiveTab] = useState<"compose" | "subscribers">("compose");

  // Form State
  const [title, setTitle] = useState("🔥 Daily Bonus Ready!");
  const [body, setBody] = useState("Log in now to claim your daily streak coins and level up your rank.");
  const [url, setUrl] = useState("/");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>("Daily Streak Bonus");

  // Preview Mode: "mobile" | "desktop"
  const [previewPlatform, setPreviewPlatform] = useState<"mobile" | "desktop">("mobile");

  // Confirmation Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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
    setSelectedTemplate(tmpl.name);
  };

  const handleResetForm = () => {
    setTitle("");
    setBody("");
    setUrl("/");
    setImageUrl("");
    setSelectedTemplate(null);
  };

  const addEmojiToTitle = (emoji: string) => {
    setTitle((prev) => (prev ? `${prev} ${emoji}` : emoji));
  };

  const handleSendTest = async () => {
    if (!title.trim() || !body.trim()) {
      setResultMessage({ type: "error", text: "Please fill in both Title and Body." });
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
          testSubscription: sub,
          subscription: sub,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResultMessage({
          type: "success",
          text: "Test push notification delivered to your browser!",
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

  const executeBroadcast = async () => {
    setShowConfirmModal(false);

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
    <div className="space-y-4 max-w-[1400px] mx-auto">
      {/* Compact Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
            <div className="w-6 h-6 rounded-[7px] bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <BellRing className="w-3.5 h-3.5" />
            </div>
            Push Notifications
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Broadcast instant web push alerts directly to players' lock screens & browsers.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* View Tab Switcher */}
          <div className="flex items-center p-0.5 bg-black/40 border border-white/[0.08] rounded-full text-xs">
            <button
              onClick={() => setActiveTab("compose")}
              className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                activeTab === "compose"
                  ? "bg-white/[0.12] text-white shadow-xs font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Composer
            </button>
            <button
              onClick={() => setActiveTab("subscribers")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                activeTab === "subscribers"
                  ? "bg-white/[0.12] text-white shadow-xs font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>Subscribers</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.08] text-zinc-300 font-mono">
                {stats?.total || 0}
              </span>
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchStats}
            disabled={loadingStats}
            title="Refresh statistics"
            className="flex items-center justify-center w-7 h-7 text-xs font-medium text-zinc-300 bg-white/[0.04] hover:bg-white/[0.08] rounded-full transition-all border border-white/[0.08] disabled:opacity-50 shrink-0 active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-zinc-400 ${loadingStats ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {activeTab === "compose" ? (
        <div className="space-y-4">
          {/* Quick Notification Templates as Compact Horizontal Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            <span className="text-[10.5px] font-semibold text-zinc-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-orange-400" />
              Presets:
            </span>
            {TEMPLATES.map((tmpl) => {
              const isSelected = selectedTemplate === tmpl.name;
              return (
                <button
                  key={tmpl.name}
                  onClick={() => applyTemplate(tmpl)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                    isSelected
                      ? "bg-orange-500/15 border-orange-500/35 text-orange-300 font-semibold shadow-xs"
                      : "bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.06] text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {tmpl.name}
                </button>
              );
            })}
            {selectedTemplate && (
              <button
                onClick={handleResetForm}
                className="text-[10.5px] text-zinc-500 hover:text-zinc-300 px-2 py-1 transition-colors cursor-pointer shrink-0 ml-auto"
              >
                Reset
              </button>
            )}
          </div>

          {/* Feedback Banner */}
          {resultMessage && (
            <div
              className={`p-3 rounded-[14px] flex items-start gap-2.5 text-xs border transition-all ${
                resultMessage.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                  : "bg-red-500/10 border-red-500/25 text-red-300"
              }`}
            >
              {resultMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              )}
              <div className="flex-1 leading-relaxed">{resultMessage.text}</div>
              <button 
                onClick={() => setResultMessage(null)}
                className="text-zinc-400 hover:text-white p-0.5 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Composer & Preview Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Form Column - Clean & Flat */}
            <div className="lg:col-span-7 space-y-3.5">
              <div className="space-y-3 text-xs">
                {/* Title & Emojis */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-zinc-300 flex items-center gap-1 text-xs">
                      Title
                    </label>
                    <div className="flex items-center gap-1">
                      {QUICK_EMOJIS.slice(0, 6).map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => addEmojiToTitle(emoji)}
                          className="w-5 h-5 flex items-center justify-center text-xs hover:scale-125 transition-transform cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setSelectedTemplate(null);
                    }}
                    placeholder="🔥 Don't lose your streak!"
                    className="w-full bg-[#101012] border border-white/[0.08] focus:border-orange-500/50 rounded-[12px] px-3.5 py-2 text-xs text-white placeholder-zinc-500 transition-all outline-none"
                  />
                </div>

                {/* Message Body */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-zinc-300 text-xs">
                      Message Body
                    </label>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {body.length} / 120
                    </span>
                  </div>
                  <textarea
                    value={body}
                    onChange={(e) => {
                      setBody(e.target.value);
                      setSelectedTemplate(null);
                    }}
                    rows={2}
                    placeholder="Write a catchy short hook to bring players back..."
                    className="w-full bg-[#101012] border border-white/[0.08] focus:border-orange-500/50 rounded-[12px] px-3.5 py-2 text-xs text-white placeholder-zinc-500 transition-all resize-none outline-none leading-relaxed"
                  />
                </div>

                {/* Target Route & Image URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-zinc-300 mb-1 text-xs">Target Route</label>
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="/ or /games/slug"
                      className="w-full bg-[#101012] border border-white/[0.08] focus:border-orange-500/50 rounded-[12px] px-3 py-1.5 text-xs text-white placeholder-zinc-500 transition-all outline-none"
                    />

                    {/* Quick Route Pills */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {QUICK_ROUTES.map((r) => (
                        <button
                          key={r.path}
                          type="button"
                          onClick={() => setUrl(r.path)}
                          className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                            url === r.path
                              ? "bg-orange-500/15 border-orange-500/30 text-orange-300 font-semibold"
                              : "bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-300 mb-1 text-xs">
                      Banner Image <span className="text-zinc-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[#101012] border border-white/[0.08] focus:border-orange-500/50 rounded-[12px] px-3 py-1.5 text-xs text-white placeholder-zinc-500 transition-all outline-none"
                    />
                    <p className="text-[10px] text-zinc-500 mt-1">16:9 banner image URL</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSendTest}
                  disabled={isSendingTest || isSending}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 text-xs font-semibold rounded-full border border-white/[0.08] transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
                >
                  {isSendingTest ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-400" />
                      <span>Sending Test...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                      <span>Test on Device</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!title.trim() || !body.trim()) {
                      setResultMessage({ type: "error", text: "Please fill in both Title and Body." });
                      return;
                    }
                    setShowConfirmModal(true);
                  }}
                  disabled={isSending || isSendingTest || stats?.total === 0}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-full transition-all disabled:opacity-50 shadow-xs active:scale-95 cursor-pointer"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Broadcasting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Broadcast ({stats?.total || 0})</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Preview Column */}
            <div className="lg:col-span-5 space-y-2.5">
              {/* Preview Header & Platform Switcher */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-orange-400" />
                  Live Preview
                </span>

                {/* Device Selector */}
                <div className="flex items-center p-0.5 bg-black/40 border border-white/[0.08] rounded-full text-[10px]">
                  <button
                    type="button"
                    onClick={() => setPreviewPlatform("mobile")}
                    className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium transition-all ${
                      previewPlatform === "mobile"
                        ? "bg-white/[0.12] text-white shadow-xs font-semibold"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>Mobile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewPlatform("desktop")}
                    className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium transition-all ${
                      previewPlatform === "desktop"
                        ? "bg-white/[0.12] text-white shadow-xs font-semibold"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Monitor className="w-3 h-3" />
                    <span>Desktop</span>
                  </button>
                </div>
              </div>

              {previewPlatform === "mobile" ? (
                /* Mobile Lockscreen Simulation */
                <div className="space-y-3">
                  <div className="text-center py-1">
                    <div className="text-2xl font-light text-zinc-200 tracking-tight font-sans">09:41</div>
                    <div className="text-[10px] text-zinc-500 font-medium">Tuesday, September 17</div>
                  </div>

                  {/* iOS Style Frosted Glass Notification Card */}
                  <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-[18px] p-3 space-y-2 shadow-2xl transition-all">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 pb-1 border-b border-white/[0.06]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-[4px] bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-[9px] text-white font-bold shrink-0">
                          B
                        </div>
                        <span className="font-semibold text-zinc-200 uppercase tracking-wide text-[9.5px]">Bluebuff</span>
                        <span>• now</span>
                      </div>
                      <span className="text-[9.5px] text-zinc-500">Lock Screen</span>
                    </div>

                    <div className="flex gap-2.5 items-start">
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-white leading-snug">
                          {title || "Notification Title"}
                        </h5>
                        <p className="text-[11.5px] text-zinc-300 mt-0.5 leading-relaxed line-clamp-3">
                          {body || "Message body preview appears here..."}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-[8px] bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0 p-1">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                      </div>
                    </div>

                    {imageUrl && (
                      <div className="w-full h-28 rounded-[12px] overflow-hidden bg-black/50 border border-white/[0.08]">
                        <img src={imageUrl} alt="Banner" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="pt-0.5 flex items-center justify-between text-[10px] text-orange-400 font-medium">
                      <span>Opens: {url || "/"}</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              ) : (
                /* Desktop Notification Simulation */
                <div className="space-y-3 pt-2">
                  <div className="bg-[#141417] border border-white/[0.08] rounded-[14px] p-3 space-y-2.5 shadow-xl transition-all">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 border-b border-white/[0.06] pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-[4px] bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-[9px] text-white font-bold">
                          B
                        </div>
                        <span className="font-semibold text-zinc-200">Bluebuff Games</span>
                        <span>• now</span>
                      </div>
                      <span className="text-[9px] text-zinc-500">Google Chrome / Windows</span>
                    </div>

                    <div className="flex gap-2.5 items-start">
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-white leading-tight truncate">
                          {title || "Notification Title"}
                        </h5>
                        <p className="text-[11.5px] text-zinc-300 mt-0.5 leading-relaxed line-clamp-2">
                          {body || "Message body goes here..."}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-[8px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 p-1">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                      </div>
                    </div>

                    {imageUrl && (
                      <div className="w-full h-24 rounded-[10px] overflow-hidden bg-black/40 border border-white/[0.08]">
                        <img src={imageUrl} alt="Banner" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="pt-1 flex items-center justify-between text-[10.5px] text-orange-400 font-medium">
                      <span>Opens: {url || "/"}</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Active Subscribers Directory Tab */
        <div className="p-4 sm:p-5 rounded-[20px] bg-white/[0.02] border border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-orange-400" />
              Subscribed Devices
            </h3>
            <span className="text-[10.5px] text-zinc-500 font-mono">
              {stats?.recent?.length || 0} active endpoints
            </span>
          </div>

          {stats?.recent && stats.recent.length > 0 ? (
            <div className="divide-y divide-white/[0.04]">
              {stats.recent.map((sub) => {
                const isMobile = sub.deviceType === "mobile";
                const isTablet = sub.deviceType === "tablet";
                return (
                  <div key={sub._id} className="py-2.5 px-1.5 flex items-center justify-between gap-3 hover:bg-white/[0.02] rounded-[12px] transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-[10px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                        {isMobile ? (
                          <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                        ) : isTablet ? (
                          <Tablet className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Monitor className="w-3.5 h-3.5 text-purple-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-zinc-200 capitalize">
                            {sub.deviceType || "Desktop"} Device
                          </span>
                          <span className="text-[9.5px] text-zinc-500 font-mono truncate">
                            {sub.endpoint ? sub.endpoint.split("/")[2] : "Gateway"}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-zinc-400 truncate max-w-sm mt-0.5 font-mono">
                          {sub.userAgent || "Web Browser"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10.5px] text-zinc-400 font-mono block">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-[9.5px] text-zinc-600 font-mono">
                        {new Date(sub.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-zinc-500 text-xs">
              <Users className="w-8 h-8 text-zinc-600 mx-auto mb-2 opacity-50" />
              <p>No push subscriptions registered yet.</p>
              <p className="text-[11px] text-zinc-600 mt-1">Users will appear here when they allow notifications in their browsers.</p>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#18181b] border border-white/10 rounded-[22px] p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Confirm Broadcast</h3>
                <p className="text-xs text-zinc-400">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-[14px] space-y-1.5 text-xs">
              <div className="text-zinc-400">
                Recipients: <span className="font-bold text-white font-mono">{stats?.total || 0} devices</span>
              </div>
              <div className="text-zinc-400 truncate">
                Title: <span className="font-medium text-zinc-200">"{title}"</span>
              </div>
              <div className="text-zinc-400">
                Route: <span className="font-mono text-orange-400">{url || "/"}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2 px-3 rounded-full text-xs font-semibold text-zinc-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeBroadcast}
                className="flex-1 py-2 px-3 rounded-full text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                Broadcast Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
