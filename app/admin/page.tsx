"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Gamepad2, Loader2, Activity, UserPlus, Mail, Ghost, 
  TrendingUp, RefreshCw, Smartphone, Star, MessageSquare, 
  Users, MousePointerClick, Heart, PlayCircle, BellRing, 
  ArrowRight, Laptop, Tablet, Clock, Timer
} from "lucide-react";
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
  playtime?: string;
  memberPlaytime?: string;
  guestPlaytime?: string;
  retentionRate?: number;
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
    totalPlaytimeSeconds?: number;
    totalPlaytimeFormatted?: string;
    memberPlaytimeFormatted?: string;
    guestPlaytimeFormatted?: string;
    pwaDevices?: { Mobile: number; Desktop: number; Tablet: number };
    recentPwaInstalls?: { deviceType: string; installedAt: string }[];
    topRatedGames: { slug: string; title: string; ratio: number; totalVotes: number }[];
    recentFeedback: { gameSlug: string; userEmail: string; message: string; status: string; date: string }[];
  };
  signupsTrend: { date: string; users: number; guests: number }[];
}

function CompactStatCard({ 
  icon: Icon, 
  label, 
  value, 
  color, 
  sub 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string | number; 
  color: string; 
  sub?: string 
}) {
  return (
    <div className="bg-[#0d0d10] border border-zinc-800/60 p-2.5 sm:p-3 rounded-xl flex items-center gap-2.5 hover:border-zinc-700/60 transition-colors relative overflow-hidden group">
      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${color} flex items-center justify-center shrink-0 border border-white/5`}>
        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider truncate">{label}</p>
        <p className="text-sm sm:text-base font-bold text-white leading-tight font-mono truncate">{value}</p>
        {sub && <p className="text-[9px] text-zinc-500 truncate mt-0.5">{sub}</p>}
      </div>
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
        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mb-2" />
        <p className="text-xs text-zinc-400 font-medium">Loading Analytics...</p>
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
    <div className="space-y-3 pb-8 max-w-[1400px] mx-auto">
      
      {/* Compact Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-[#0d0d10] p-2 sm:p-2.5 rounded-xl border border-zinc-800/60 w-full">
        <div className="flex items-center gap-2 min-w-0 px-1">
          <div className="w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-xs sm:text-sm font-semibold text-white leading-tight">Analytics</h1>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => fetchStats(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-300 bg-zinc-900/80 hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-800 disabled:opacity-50 shrink-0"
            title="Refresh Data"
          >
            <RefreshCw className={clsx("w-3 h-3 text-zinc-400", isRefreshing && "animate-spin")} />
            <span className="hidden xs:inline">Refresh</span>
          </button>

          <div className="flex p-0.5 bg-zinc-900/80 border border-zinc-800 rounded-lg shrink-0">
            {timeframes.map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={clsx(
                  "px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap",
                  timeframe === tf.id
                    ? "bg-indigo-600 text-white font-semibold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                )}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (Includes Total Playtime) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5">
        <CompactStatCard
          icon={Users}
          label={`Active (${timeframe})`}
          value={totalActive.toLocaleString()}
          sub={`${memberPct}% Mem / ${guestPct}% Guest`}
          color="bg-indigo-500/20 text-indigo-400"
        />
        <CompactStatCard
          icon={PlayCircle}
          label={`Plays (${timeframe})`}
          value={currentStats.totalPlays.toLocaleString()}
          sub="Game clicks"
          color="bg-blue-500/20 text-blue-400"
        />
        <CompactStatCard
          icon={Clock}
          label={isLifetime ? "Total Playtime" : `Playtime (${timeframe})`}
          value={currentStats.playtime || stats.lifetime.totalPlaytimeFormatted || "0m"}
          sub={`${currentStats.memberPlaytime || '0m'} Mem / ${currentStats.guestPlaytime || '0m'} Guest`}
          color="bg-violet-500/20 text-violet-400"
        />
        <CompactStatCard
          icon={Smartphone}
          label={isLifetime ? "PWA Installs" : `PWA (${timeframe})`}
          value={currentStats.pwaInstalls?.toLocaleString() || "0"}
          sub="Homescreen adds"
          color="bg-sky-500/20 text-sky-400"
        />
        <CompactStatCard
          icon={BellRing}
          label={isLifetime ? "Push Subs" : `Push (${timeframe})`}
          value={currentStats.pushSubscribers?.toLocaleString() || stats.lifetime.pushSubscribers?.toLocaleString() || "0"}
          sub="Web Push"
          color="bg-emerald-500/20 text-emerald-400"
        />
        <CompactStatCard
          icon={MousePointerClick}
          label={`Plays/User (${timeframe})`}
          value={currentStats.avgPlaysPerActive}
          sub="Per visitor"
          color="bg-teal-500/20 text-teal-400"
        />
        <CompactStatCard
          icon={Heart}
          label={isLifetime ? "Retention" : `Retention (${timeframe})`}
          value={`${currentStats.retentionRate ?? stats.lifetime.retentionRate ?? 0}%`}
          sub="Returning players"
          color="bg-amber-500/20 text-amber-400"
        />
        <CompactStatCard
          icon={UserPlus}
          label={isLifetime ? "Total Users" : `Users (${timeframe})`}
          value={currentStats.newUsers.toLocaleString()}
          sub="Registered accounts"
          color="bg-pink-500/20 text-pink-400"
        />
      </div>

      {/* PWA & Notification Ecosystem Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
        {/* PWA Device Breakdown */}
        <div className="bg-[#0d0d10] border border-zinc-800/60 rounded-xl p-3 sm:p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                PWA by Device
              </h2>
              <span className="text-[9px] text-sky-400 font-bold bg-sky-500/10 px-1.5 py-0.5 rounded">
                {stats.lifetime.pwaInstalls} Installs
              </span>
            </div>

            <div className="space-y-2 mt-1">
              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-zinc-300 font-medium flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-blue-400" /> Mobile
                  </span>
                  <span className="text-zinc-400 font-mono text-[10px]">{pwaDevices.Mobile} ({Math.round((pwaDevices.Mobile / totalPwaAll) * 100)}%)</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(pwaDevices.Mobile / totalPwaAll) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-zinc-300 font-medium flex items-center gap-1">
                    <Laptop className="w-3 h-3 text-purple-400" /> Desktop
                  </span>
                  <span className="text-zinc-400 font-mono text-[10px]">{pwaDevices.Desktop} ({Math.round((pwaDevices.Desktop / totalPwaAll) * 100)}%)</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(pwaDevices.Desktop / totalPwaAll) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-zinc-300 font-medium flex items-center gap-1">
                    <Tablet className="w-3 h-3 text-emerald-400" /> Tablet
                  </span>
                  <span className="text-zinc-400 font-mono text-[10px]">{pwaDevices.Tablet} ({Math.round((pwaDevices.Tablet / totalPwaAll) * 100)}%)</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(pwaDevices.Tablet / totalPwaAll) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px]">
            <span className="text-zinc-400">Push Notifications</span>
            <Link href="/admin/notifications" className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1">
              Broadcast <ArrowRight className="w-2.5 h-2.5" />
            </Link>
          </div>
        </div>

        {/* Recent PWA Install Activity */}
        <div className="md:col-span-2 bg-[#0d0d10] border border-zinc-800/60 rounded-xl p-3 sm:p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                Recent PWA Installations
              </h2>
              <span className="text-[9px] text-zinc-500">Live Logs</span>
            </div>

            {(!stats.lifetime.recentPwaInstalls || stats.lifetime.recentPwaInstalls.length === 0) ? (
              <div className="p-4 bg-zinc-900/30 rounded-lg border border-zinc-800 border-dashed text-center">
                <p className="text-[11px] text-zinc-500">No install logs yet. Logs appear as players add the PWA.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {stats.lifetime.recentPwaInstalls.slice(0, 4).map((inst, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-zinc-900/40 border border-zinc-800/80 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-sky-500/10 text-sky-400 rounded">
                        {inst.deviceType === 'Mobile' ? <Smartphone className="w-3.5 h-3.5" /> : inst.deviceType === 'Tablet' ? <Tablet className="w-3.5 h-3.5" /> : <Laptop className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-xs font-semibold text-zinc-200">{inst.deviceType}</span>
                    </div>
                    <span className="text-[9px] text-zinc-400 font-mono">{inst.installedAt}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
        {/* Trend Chart */}
        <div className="md:col-span-2 bg-[#0d0d10] border border-zinc-800/60 rounded-xl p-3 sm:p-3.5">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              Acquisition Trend
            </h2>
          </div>
          <div className="h-[160px] sm:h-[180px] w-full">
            <AcquisitionChart data={chartData} />
          </div>
        </div>

        {/* Device Split Chart */}
        <div className="bg-[#0d0d10] border border-zinc-800/60 rounded-xl p-3 sm:p-3.5 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold text-white flex items-center gap-1.5 mb-2">
              <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
              Players by Platform
            </h2>
            {deviceData.length === 0 ? (
              <div className="h-[140px] flex items-center justify-center text-xs text-zinc-500">
                No device data
              </div>
            ) : (
              <div className="h-[140px] sm:h-[160px] w-full">
                <DeviceChart data={deviceData} />
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              {deviceData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1 text-[10px] text-zinc-400">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  {d.name} ({Math.round((d.value / (currentStats.totalPlays || 1)) * 100) || 0}%)
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Games Section */}
      <div className="bg-[#0d0d10] border border-zinc-800/60 rounded-xl p-3 sm:p-3.5">
        <h2 className="text-xs font-bold text-white flex items-center gap-1.5 mb-2.5">
          <PlayCircle className="w-3.5 h-3.5 text-indigo-400" />
          Top Games ({timeframes.find(t => t.id === timeframe)?.label})
        </h2>
        {currentStats.topGames.length === 0 ? (
          <div className="p-3 bg-zinc-900/30 rounded-lg border border-zinc-800 border-dashed text-center">
            <p className="text-[11px] text-zinc-500">No play events recorded.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {currentStats.topGames.slice(0, 6).map((game, i) => (
              <div key={game.slug} className="flex items-center justify-between p-2 bg-zinc-900/30 hover:bg-zinc-800/50 rounded-lg transition-colors border border-transparent hover:border-zinc-700">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-zinc-500 text-[11px] font-bold w-3">{i + 1}.</span>
                  <p className="text-zinc-200 text-xs font-medium truncate">{game.title}</p>
                </div>
                <div className="text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded text-[10px] shrink-0 font-mono">
                  {game.playCount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Community Pulse */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
        {/* Top Rated Games (Lifetime) */}
        <div className="bg-[#0d0d10] border border-zinc-800/60 rounded-xl p-3 sm:p-3.5">
          <h2 className="text-xs font-bold text-white flex items-center gap-1.5 mb-2.5">
            <Star className="w-3.5 h-3.5 text-yellow-500" />
            Highest Rated Games
          </h2>
          {stats.lifetime.topRatedGames.length === 0 ? (
            <div className="p-3 bg-zinc-900/30 rounded-lg border border-zinc-800 border-dashed text-center">
              <p className="text-[11px] text-zinc-500">No rated games yet.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {stats.lifetime.topRatedGames.slice(0, 4).map((game, i) => (
                <div key={game.slug} className="flex items-center justify-between p-2 bg-zinc-900/30 rounded-lg">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-zinc-500 text-[11px] font-bold w-3">{i + 1}.</span>
                    <p className="text-zinc-200 text-xs font-medium truncate">{game.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-yellow-500 font-bold bg-yellow-500/10 px-1.5 py-0.5 rounded text-[10px] shrink-0 flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-yellow-500" />
                      {game.ratio}%
                    </div>
                    <span className="text-zinc-500 text-[9px]">{game.totalVotes} votes</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Feedback Feed */}
        <div className="bg-[#0d0d10] border border-zinc-800/60 rounded-xl p-3 sm:p-3.5 flex flex-col">
          <div className="flex justify-between items-center mb-2.5">
            <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              Live Feedback Feed
            </h2>
            <Link href="/admin/feedback" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300">View All</Link>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[220px] space-y-2 pr-1 custom-scrollbar">
            {stats.lifetime.recentFeedback.length === 0 ? (
              <div className="p-3 bg-zinc-900/30 rounded-lg border border-zinc-800 border-dashed text-center">
                <p className="text-[11px] text-zinc-500">No feedback submitted yet.</p>
              </div>
            ) : (
              stats.lifetime.recentFeedback.slice(0, 3).map((fb, i) => (
                <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-2">
                  <div className="flex justify-between items-start mb-0.5">
                    <p className="text-[11px] font-bold text-zinc-300 truncate max-w-[150px]">{fb.userEmail}</p>
                    <span className="text-[9px] text-zinc-500">{fb.date}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-1 mb-1">{fb.message}</p>
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-indigo-400 font-medium bg-indigo-500/10 px-1.5 py-0.5 rounded">Game: {fb.gameSlug}</span>
                    <span className={clsx("font-medium px-1.5 py-0.5 rounded", fb.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400')}>
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