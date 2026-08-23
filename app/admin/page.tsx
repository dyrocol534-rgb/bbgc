"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Gamepad2, Loader2, Activity, UserPlus, Mail, Ghost, TrendingUp, RefreshCw, Smartphone, Star, MessageSquare, Users, MousePointerClick, Heart, PlayCircle, BellRing, Bell, ArrowRight, Laptop, Tablet } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import clsx from 'clsx';

const AcquisitionChart = dynamic(() => import("@/components/admin/AcquisitionChart"), { ssr: false });
const DeviceChart = dynamic(() => import("@/components/admin/DeviceChart"), { ssr: false });

interface DeviceSplit {
  mobile: number;
  desktop: number;
  tablet: number;
  unknown: number;
}

interface TimeframeStats {
  newUsers: number;
  newGuests: number;
  activeUsers: number;
  activeGuests: number;
  newSubscribers: number;
  pwaInstalls: number;
  pushSubscribers?: number;
  totalGames: number;
  totalPlays: number;
  topGames: { slug: string; title: string; playCount: number }[];
  topGuestGames: { slug: string; title: string; count: number }[];
  deviceSplit: DeviceSplit;
  avgPlaysPerActive: string | number;
}

interface Stats {
  "24h": TimeframeStats;
  "7d": TimeframeStats;
  "30d": TimeframeStats;
  lifetime: TimeframeStats & {
    retentionRate: number;
    pwaDevices?: { Mobile: number; Desktop: number; Tablet: number };
    recentPwaInstalls?: { deviceType: string; installedAt: string }[];
    topRatedGames: { slug: string; title: string; ratio: number; totalVotes: number }[];
    recentFeedback: { gameSlug: string; userEmail: string; message: string; status: string; date: string }[];
  };
  signupsTrend: { date: string; users: number; guests: number }[];
}

function StatCard({ icon: Icon, label, value, color, sub }: { icon: React.ElementType; label: string; value: string | number; color: string; sub?: string }) {
  return (
    <div className="bg-[#0c0c0e] border border-[#1f1f22] p-3.5 rounded-xl flex items-center gap-3 hover:border-[#333339] transition-all shadow-lg shadow-black/40 relative overflow-hidden group">
      <div className={`p-2.5 rounded-lg ${color} shadow-inner z-10 transition-transform group-hover:scale-110 border border-white/5`}>
        <Icon className="w-4 h-4 drop-shadow-md" />
      </div>
      <div className="min-w-0 flex-1 z-10">
        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-lg font-bold text-white leading-tight tracking-tight">{value}</p>
        {sub && <p className="text-[9px] leading-tight text-zinc-400 mt-0.5 font-medium">{sub}</p>}
      </div>
      <div className={clsx("absolute -bottom-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity", color.split(" ")[0])} />
    </div>
  );
}

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#71717a'];

export default function AdminAnalytics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d" | "lifetime">("24h");

  const fetchStats = async (force = false) => {
    try {
      if (force) setIsRefreshing(true);
      const { data } = await axios.get(`/api/admin/stats${force ? '?refresh=true' : ''}`);
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading && !stats) {
    return (
      <div className="flex flex-col justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
        <p className="text-sm text-zinc-400 font-medium animate-pulse">Loading Analytics Engine...</p>
      </div>
    );
  }

  if (!stats) return null;

  const isLifetime = timeframe === "lifetime";
  const currentStats = stats[timeframe];
  
  const totalActive = currentStats.activeUsers + currentStats.activeGuests;
  const guestPct = totalActive > 0 ? Math.round((currentStats.activeGuests / totalActive) * 100) : 0;
  const memberPct = 100 - guestPct;

  let chartData = stats.signupsTrend;
  if (timeframe === "24h" || timeframe === "7d") chartData = stats.signupsTrend.slice(-7);

  const deviceData = [
    { name: 'Mobile', value: currentStats.deviceSplit.mobile },
    { name: 'Desktop', value: currentStats.deviceSplit.desktop },
    { name: 'Tablet', value: currentStats.deviceSplit.tablet },
    { name: 'Unknown', value: currentStats.deviceSplit.unknown },
  ].filter(d => d.value > 0);

  const timeframes: { id: "24h" | "7d" | "30d" | "lifetime", label: string }[] = [
    { id: "24h", label: "24h" },
    { id: "7d", label: "7d" },
    { id: "30d", label: "30d" },
    { id: "lifetime", label: "All Time" },
  ];

  const pwaDevices = stats.lifetime.pwaDevices || { Mobile: 0, Desktop: 0, Tablet: 0 };
  const totalPwaAll = (pwaDevices.Mobile + pwaDevices.Desktop + pwaDevices.Tablet) || 1;

  return (
    <div className="space-y-6 pb-10 max-w-[1400px] mx-auto animate-in fade-in duration-300">
      
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-[#0c0c0e] p-4 rounded-xl border border-[#1f1f22] w-full shadow-lg shadow-black/40">
        <div className="flex items-center gap-3 min-w-0 w-full xl:w-auto">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg shrink-0">
            <Activity className="w-5 h-5 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold text-white leading-tight truncate">Analytics Dashboard</h1>
            <p className="text-[10px] text-zinc-400 truncate mt-0.5 font-medium">Real-time games, user & PWA metrics</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto mt-2 xl:mt-0">
          <button
            onClick={() => fetchStats(true)}
            disabled={isRefreshing}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-zinc-300 bg-[#121214] hover:bg-[#1a1a1f] rounded-xl transition-colors border border-[#1f1f22] hover:border-[#333339] disabled:opacity-50 shrink-0 w-full sm:w-auto shadow-md"
            title="Force refresh data from database"
          >
            <RefreshCw className={clsx("w-4 h-4 text-zinc-400", isRefreshing && "animate-spin")} />
            <span>Refresh Data</span>
          </button>

          <div className="flex p-1 bg-[#121214] border border-[#1f1f22] rounded-xl shrink-0 w-full sm:w-auto shadow-inner">
            {timeframes.map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={clsx(
                  "px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex-1 text-center",
                  timeframe === tf.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-[#1a1a1f]"
                )}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Users}
          label={`Active Users (${timeframe})`}
          value={totalActive.toLocaleString()}
          sub={`${memberPct}% Members / ${guestPct}% Guests`}
          color="bg-indigo-500/20 text-indigo-400"
        />
        <StatCard
          icon={PlayCircle}
          label={`Total Plays (${timeframe})`}
          value={currentStats.totalPlays.toLocaleString()}
          sub="Game clicks"
          color="bg-blue-500/20 text-blue-400"
        />
        <StatCard
          icon={Smartphone}
          label={isLifetime ? "Total PWA Installs" : `PWA Installs (${timeframe})`}
          value={currentStats.pwaInstalls?.toLocaleString() || "0"}
          sub="Saved to homescreen"
          color="bg-sky-500/20 text-sky-400"
        />
        <StatCard
          icon={BellRing}
          label={isLifetime ? "Push Subscribers" : `New Push Subs (${timeframe})`}
          value={currentStats.pushSubscribers?.toLocaleString() || stats.lifetime.pushSubscribers?.toLocaleString() || "0"}
          sub="Web Push notifications"
          color="bg-emerald-500/20 text-emerald-400"
        />
        <StatCard
          icon={MousePointerClick}
          label={`Avg Plays/User (${timeframe})`}
          value={currentStats.avgPlaysPerActive}
          sub="Per active visitor"
          color="bg-teal-500/20 text-teal-400"
        />
        <StatCard
          icon={Heart}
          label="Weekly Retention"
          value={`${stats.lifetime.retentionRate}%`}
          sub="Returning players"
          color="bg-amber-500/20 text-amber-400"
        />
        <StatCard
          icon={UserPlus}
          label={isLifetime ? "Total Users" : `New Users (${timeframe})`}
          value={currentStats.newUsers.toLocaleString()}
          sub="Registered accounts"
          color="bg-pink-500/20 text-pink-400"
        />
        <StatCard
          icon={Mail}
          label={isLifetime ? "Total Newsletters" : `New Subs (${timeframe})`}
          value={currentStats.newSubscribers.toLocaleString()}
          sub="Email list"
          color="bg-purple-500/20 text-purple-400"
        />
      </div>

      {/* PWA & Notification Ecosystem Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* PWA Device Breakdown */}
        <div className="bg-[#0c0c0e] border border-[#1f1f22] rounded-xl p-4 shadow-lg shadow-black/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-sky-400" />
                PWA Installs by Device
              </h2>
              <span className="text-[10px] text-sky-400 font-bold bg-sky-500/10 px-2 py-0.5 rounded">
                {stats.lifetime.pwaInstalls} Total
              </span>
            </div>

            <div className="space-y-2.5 mt-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-blue-400" /> Mobile
                  </span>
                  <span className="text-zinc-400 font-bold">{pwaDevices.Mobile} ({Math.round((pwaDevices.Mobile / totalPwaAll) * 100)}%)</span>
                </div>
                <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(pwaDevices.Mobile / totalPwaAll) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5 text-purple-400" /> Desktop
                  </span>
                  <span className="text-zinc-400 font-bold">{pwaDevices.Desktop} ({Math.round((pwaDevices.Desktop / totalPwaAll) * 100)}%)</span>
                </div>
                <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(pwaDevices.Desktop / totalPwaAll) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                    <Tablet className="w-3.5 h-3.5 text-emerald-400" /> Tablet
                  </span>
                  <span className="text-zinc-400 font-bold">{pwaDevices.Tablet} ({Math.round((pwaDevices.Tablet / totalPwaAll) * 100)}%)</span>
                </div>
                <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(pwaDevices.Tablet / totalPwaAll) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">Web Push Subscribers</span>
            <Link href="/admin/notifications" className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1">
              Send Broadcast <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Recent PWA Install Activity */}
        <div className="lg:col-span-2 bg-[#0c0c0e] border border-[#1f1f22] rounded-xl p-4 shadow-lg shadow-black/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-indigo-400" />
                Recent PWA Installations
              </h2>
              <span className="text-[10px] text-zinc-500">Live Device Logs</span>
            </div>

            {(!stats.lifetime.recentPwaInstalls || stats.lifetime.recentPwaInstalls.length === 0) ? (
              <div className="p-6 bg-zinc-900/30 rounded-lg border border-zinc-800 border-dashed text-center">
                <p className="text-xs text-zinc-500">No install logs yet. Installs will appear here as users add the PWA.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {stats.lifetime.recentPwaInstalls.map((inst, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-zinc-900/40 border border-zinc-800/80 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-md">
                        {inst.deviceType === 'Mobile' ? <Smartphone className="w-3.5 h-3.5" /> : inst.deviceType === 'Tablet' ? <Tablet className="w-3.5 h-3.5" /> : <Laptop className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-xs font-semibold text-zinc-200">{inst.deviceType} App</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">{inst.installedAt}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-[#0c0c0e] border border-[#1f1f22] rounded-xl p-4 shadow-lg shadow-black/40 relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.5)]" />
              Acquisition Trend
            </h2>
          </div>
          <div className="h-[200px] w-full">
            <AcquisitionChart data={chartData} />
          </div>
        </div>

        {/* Device Split Chart */}
        <div className="bg-[#0c0c0e] border border-[#1f1f22] rounded-xl p-4 shadow-lg shadow-black/40 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold text-white flex items-center gap-2 mb-3">
              <Smartphone className="w-4 h-4 text-indigo-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.5)]" />
              Game Players by Platform
            </h2>
            {deviceData.length === 0 ? (
              <div className="h-[180px] flex items-center justify-center text-xs text-zinc-500">
                No device data found
              </div>
            ) : (
              <div className="h-[180px] w-full">
                <DeviceChart data={deviceData} />
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {deviceData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  {d.name} ({Math.round((d.value / currentStats.totalPlays) * 100) || 0}%)
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Games Section */}
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-[#0c0c0e] border border-[#1f1f22] rounded-xl p-4 shadow-lg shadow-black/40">
          <h2 className="text-xs font-bold text-white flex items-center gap-2 mb-3">
            <PlayCircle className="w-4 h-4 text-indigo-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.5)]" />
            Top Games ({timeframes.find(t => t.id === timeframe)?.label})
          </h2>
          {currentStats.topGames.length === 0 ? (
            <div className="p-4 bg-zinc-900/30 rounded-lg border border-zinc-800 border-dashed text-center">
              <p className="text-xs text-zinc-500">No play events recorded.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {currentStats.topGames.map((game, i) => (
                <div key={game.slug} className="flex items-center justify-between p-2 bg-zinc-900/30 hover:bg-zinc-800/50 rounded-lg transition-colors border border-transparent hover:border-zinc-700">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-zinc-500 text-xs font-bold w-4">{i + 1}.</span>
                    <p className="text-zinc-200 text-sm font-medium truncate">{game.title}</p>
                  </div>
                  <div className="text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-0.5 rounded text-xs shrink-0">
                    {game.playCount.toLocaleString()} plays
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Community Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Top Rated Games (Lifetime) */}
        <div className="bg-[#0c0c0e] border border-[#1f1f22] rounded-xl p-4 shadow-lg shadow-black/40">
          <h2 className="text-xs font-bold text-white flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-yellow-500 drop-shadow-[0_0_6px_rgba(234,179,8,0.5)]" />
            Highest Rated Games (Lifetime)
          </h2>
          {stats.lifetime.topRatedGames.length === 0 ? (
            <div className="p-4 bg-zinc-900/30 rounded-lg border border-zinc-800 border-dashed text-center">
              <p className="text-xs text-zinc-500">No games have been rated yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.lifetime.topRatedGames.map((game, i) => (
                <div key={game.slug} className="flex items-center justify-between p-2 bg-zinc-900/30 hover:bg-zinc-800/50 rounded-lg transition-colors border border-transparent hover:border-zinc-700">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-zinc-500 text-xs font-bold w-4">{i + 1}.</span>
                    <p className="text-zinc-200 text-sm font-medium truncate">{game.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-yellow-500 font-bold bg-yellow-500/10 px-2 py-0.5 rounded text-xs shrink-0 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-500" />
                      {game.ratio}%
                    </div>
                    <span className="text-zinc-500 text-[10px] w-12 text-right">{game.totalVotes} votes</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Feedback Feed */}
        <div className="bg-[#0c0c0e] border border-[#1f1f22] rounded-xl p-4 shadow-lg shadow-black/40 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
              Live Feedback Feed
            </h2>
            <Link href="/admin/feedback" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300">View All</Link>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[300px] space-y-3 pr-2 custom-scrollbar">
            {stats.lifetime.recentFeedback.length === 0 ? (
              <div className="p-4 bg-zinc-900/30 rounded-lg border border-zinc-800 border-dashed text-center">
                <p className="text-xs text-zinc-500">No feedback submitted yet.</p>
              </div>
            ) : (
              stats.lifetime.recentFeedback.map((fb, i) => (
                <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-bold text-zinc-300 truncate max-w-[200px]">{fb.userEmail}</p>
                    <span className="text-[10px] text-zinc-500">{fb.date}</span>
                  </div>
                  <p className="text-xs text-zinc-400 mb-2 line-clamp-2">{fb.message}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-medium text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">Game: {fb.gameSlug}</span>
                    <span className={clsx("text-[10px] font-medium px-2 py-0.5 rounded", fb.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400')}>
                      {fb.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}