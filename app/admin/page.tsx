"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Gamepad2, Loader2, Activity, UserPlus, Mail, Ghost, 
  TrendingUp, RefreshCw, Smartphone, Star, MessageSquare, 
  Users, MousePointerClick, Heart, PlayCircle, BellRing, 
  ArrowRight, Laptop, Tablet, Clock, Timer,
  BarChart2
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import clsx from 'clsx';
import { Skeleton } from "@/components/ui/Skeleton";
import { MetricsSkeleton } from "@/components/ui/ShimmerLoader";

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
  gameSaves?: number;
  pushSubscribers?: number;
  playtime?: string;
  memberPlaytime?: string;
  guestPlaytime?: string;
  retentionRate?: number;
  totalGames: number;
  totalPlays: number;
  topGames: { slug: string; title: string; playCount: number }[];
  topGuestGames: { slug: string; title: string; count: number }[];
  topSavedGames?: { slug: string; title: string; count: number }[];
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
    recentGameSaves?: { gameSlug: string; gameTitle: string; deviceType: string; installedAt: string }[];
    topRatedGames: { slug: string; title: string; ratio: number; totalVotes: number }[];
    recentFeedback: { gameSlug: string; userEmail: string; message: string; status: string; date: string }[];
  };
  signupsTrend: { date: string; users: number; guests: number }[];
}

function MetricCell({ 
  icon: Icon, 
  label, 
  value, 
  iconColor, 
  sub,
  badge,
  className
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string | number; 
  iconColor: string; 
  sub?: string;
  badge?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx(
      "p-3.5 sm:p-4 flex flex-col justify-between transition-all group relative min-w-0 bg-black/60 hover:bg-white/[0.03]",
      className
    )}>
      <div className="flex items-center justify-between mb-2 min-w-0 gap-1.5">
        <span className="text-[11px] font-medium text-zinc-400 truncate">
          {label}
        </span>
        <div className={clsx(
          "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105",
          iconColor
        )}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xl sm:text-2xl font-bold text-white tracking-tight font-mono">
            {value}
          </span>
          {badge}
        </div>
        {sub && (
          <div className="text-[10px] text-zinc-500 font-medium truncate" title={sub}>
            {sub}
          </div>
        )}
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
  const [chartMode, setChartMode] = useState<"bar" | "area">("bar");

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
      <div className="space-y-4 py-2">
        <div className="flex justify-between items-center pb-2">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>
        <MetricsSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
          <div className="lg:col-span-2 h-[220px] rounded-2xl skeleton-shimmer border border-white/5" />
          <div className="h-[220px] rounded-2xl skeleton-shimmer border border-white/5" />
        </div>
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
    { id: "7d", label: "7D" },
    { id: "30d", label: "30D" },
    { id: "lifetime", label: "All Time" },
  ];

  const pwaConversionRate = totalActive > 0 && currentStats.pwaInstalls
    ? ((currentStats.pwaInstalls / totalActive) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-3.5 pb-6 max-w-[1400px] mx-auto">
      
      {/* Frameless Compact Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Platform Analytics
          </h1>
          <p className="text-[11px] text-zinc-400">
            Real-time player engagement, retention, and catalog performance.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Apple Segmented Control */}
          <div className="flex p-0.5 bg-black/40 border border-white/[0.08] rounded-full shrink-0">
            {timeframes.map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={clsx(
                  "px-2.5 py-0.8 text-[11px] font-medium rounded-full transition-all whitespace-nowrap cursor-pointer",
                  timeframe === tf.id
                    ? "bg-white/[0.12] text-white font-semibold shadow-xs"
                    : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchStats(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-zinc-300 bg-white/[0.04] hover:bg-white/[0.08] rounded-full transition-all border border-white/[0.08] disabled:opacity-50 shrink-0 cursor-pointer active:scale-95"
            title="Refresh Data"
          >
            <RefreshCw className={clsx("w-3 h-3 text-zinc-400", isRefreshing && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Consolidated High-Impact Metrics Strip */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.06] p-[1px] gap-[1px] grid grid-cols-2 lg:grid-cols-5 overflow-hidden">
        {/* Card 1: Active Players & Retention */}
        <MetricCell
          icon={Users}
          label="Active Players"
          value={totalActive.toLocaleString()}
          badge={
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono flex items-center gap-0.5 shrink-0">
              <Heart className="w-2.5 h-2.5 fill-emerald-400/20" />
              {currentStats.retentionRate ?? stats.lifetime.retentionRate ?? 0}% ret
            </span>
          }
          sub={`${memberPct}% Mem • ${guestPct}% Guest`}
          iconColor="bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
        />

        {/* Card 2: Game Plays & Playtime */}
        <MetricCell
          icon={PlayCircle}
          label={isLifetime ? "Plays & Total Time" : "Plays & Playtime"}
          value={currentStats.totalPlays.toLocaleString()}
          badge={
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-mono flex items-center gap-0.5 shrink-0">
              <Clock className="w-2.5 h-2.5" />
              {currentStats.playtime || stats.lifetime.totalPlaytimeFormatted || "0m"}
            </span>
          }
          sub={`${currentStats.avgPlaysPerActive} plays/visitor • ${currentStats.memberPlaytime || '0m'} mem`}
          iconColor="bg-violet-500/10 text-violet-400 border-violet-500/20"
        />

        {/* Card 3: New Registrations */}
        <MetricCell
          icon={UserPlus}
          label="New Accounts"
          value={currentStats.newUsers.toLocaleString()}
          badge={
            timeframe !== "lifetime" && currentStats.newUsers > 0 ? (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 font-mono shrink-0">
                +{currentStats.newUsers}
              </span>
            ) : undefined
          }
          sub={isLifetime ? "Lifetime registrations" : "New registered players"}
          iconColor="bg-pink-500/10 text-pink-400 border-pink-500/20"
        />

        {/* Card 4: App & Push Reach */}
        <MetricCell
          icon={Smartphone}
          label="App & Push Reach"
          value={`${currentStats.pwaInstalls?.toLocaleString() || "0"} Installs`}
          badge={
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 font-mono flex items-center gap-0.5 shrink-0">
              <BellRing className="w-2.5 h-2.5" />
              {currentStats.pushSubscribers?.toLocaleString() || stats.lifetime.pushSubscribers?.toLocaleString() || "0"} push
            </span>
          }
          sub={`${currentStats.gameSaves || 0} saves • ${pwaConversionRate}% conv`}
          iconColor="bg-sky-500/10 text-sky-400 border-sky-500/20"
        />

        {/* Card 5: Live Games */}
        <MetricCell
          icon={Gamepad2}
          label="Live Games"
          value={stats.lifetime.totalGames.toLocaleString()}
          sub="Published titles"
          iconColor="bg-amber-500/10 text-amber-400 border-amber-500/20"
          className="col-span-2 lg:col-span-1"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        {/* Trend Chart (Bars & Area) */}
        <div className="lg:col-span-2 p-3.5 sm:p-4 rounded-[16px] bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-white" />
                  Player Acquisition Trend
                </h2>
                {/* Bar / Area Toggle */}
                <div className="flex items-center p-0.5 bg-black/50 border border-white/[0.08] rounded-full">
                  <button
                    onClick={() => setChartMode("bar")}
                    className={clsx(
                      "flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full transition-all cursor-pointer",
                      chartMode === "bar"
                        ? "bg-white/[0.14] text-white shadow-xs font-semibold"
                        : "text-zinc-400 hover:text-zinc-200"
                    )}
                    title="Stacked Daily Bar Chart"
                  >
                    <BarChart2 className="w-3 h-3" />
                    <span>Bars</span>
                  </button>
                  <button
                    onClick={() => setChartMode("area")}
                    className={clsx(
                      "flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full transition-all cursor-pointer",
                      chartMode === "area"
                        ? "bg-white/[0.14] text-white shadow-xs font-semibold"
                        : "text-zinc-400 hover:text-zinc-200"
                    )}
                    title="Smooth Area Curves"
                  >
                    <TrendingUp className="w-3 h-3" />
                    <span>Area</span>
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5">Daily registered accounts vs guest visitors</p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-[10.5px] font-medium self-start sm:self-auto">
              <span className="flex items-center gap-1 text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Users
              </span>
              <span className="flex items-center gap-1 text-amber-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Guests
              </span>
            </div>
          </div>

          <div className="h-[160px] sm:h-[185px] w-full">
            <AcquisitionChart data={chartData} mode={chartMode} />
          </div>
        </div>

        {/* Device Split Chart */}
        <div className="p-3.5 sm:p-4 rounded-[16px] bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-white" />
                Device Mix
              </h2>
              <span className="text-[9.5px] text-zinc-500 font-mono">Platform Split</span>
            </div>

            {/* Platform Horizontal Progress Bar */}
            {deviceData.length > 0 && (
              <div className="w-full h-2 rounded-full bg-white/[0.04] overflow-hidden flex my-2 border border-white/[0.06]">
                {deviceData.map((d, i) => {
                  const pct = Math.round((d.value / (currentStats.totalPlays || 1)) * 100) || 0;
                  return (
                    <div 
                      key={d.name} 
                      style={{ width: `${pct}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} 
                      className="h-full transition-all" 
                      title={`${d.name}: ${pct}% (${d.value} plays)`}
                    />
                  );
                })}
              </div>
            )}

            {deviceData.length === 0 ? (
              <div className="h-[120px] flex items-center justify-center text-xs text-zinc-500">
                No device data
              </div>
            ) : (
              <div className="h-[120px] w-full">
                <DeviceChart data={deviceData} />
              </div>
            )}

            {/* Responsive Device Cards / Pills */}
            <div className="grid grid-cols-2 gap-1.5 mt-2 pt-2 border-t border-white/[0.04]">
              {deviceData.map((d, i) => {
                const pct = Math.round((d.value / (currentStats.totalPlays || 1)) * 100) || 0;
                const DeviceIcon = d.name.toLowerCase().includes('desktop') 
                  ? Laptop 
                  : d.name.toLowerCase().includes('tablet') 
                    ? Tablet 
                    : Smartphone;

                return (
                  <div key={d.name} className="flex items-center justify-between p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[10px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <DeviceIcon className="w-3 h-3 text-zinc-400 shrink-0" />
                      <span className="text-zinc-300 font-medium truncate">{d.name}</span>
                    </div>
                    <span className="font-mono text-zinc-400 font-semibold shrink-0 ml-1">
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Most Played Titles */}
      <div className="p-3.5 sm:p-4 rounded-[16px] bg-white/[0.02] border border-white/[0.06]">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <PlayCircle className="w-3.5 h-3.5 text-white" />
            Most Played Titles ({timeframes.find(t => t.id === timeframe)?.label})
          </h2>
          <Link href="/admin/games" className="text-[10.5px] font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
            Catalog <ArrowRight className="w-2.5 h-2.5" />
          </Link>
        </div>

        {currentStats.topGames.length === 0 ? (
          <div className="p-6 bg-white/[0.01] rounded-[12px] border border-white/[0.04] border-dashed text-center">
            <p className="text-xs text-zinc-500">No play events recorded for this timeframe.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {currentStats.topGames.slice(0, 6).map((game, i) => (
              <div key={game.slug} className="flex items-center justify-between p-2 bg-white/[0.02] hover:bg-white/[0.04] rounded-[12px] transition-colors border border-white/[0.03]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-zinc-500 text-[11px] font-mono font-bold w-3.5">{i + 1}.</span>
                  <p className="text-zinc-200 text-xs font-semibold truncate">{game.title}</p>
                </div>
                <div className="text-white font-semibold bg-white/10 px-2 py-0.2 rounded-full text-[10px] shrink-0 font-mono border border-white/15">
                  {game.playCount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>



      {/* Community Pulse: Highest Rated & Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
        {/* Top Rated Games (Lifetime) */}
        <div className="p-3.5 sm:p-4 rounded-[16px] bg-white/[0.02] border border-white/[0.06]">
          <h2 className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            Highest Rated Games
          </h2>
          {stats.lifetime.topRatedGames.length === 0 ? (
            <div className="p-6 bg-white/[0.01] rounded-[12px] border border-white/[0.04] border-dashed text-center">
              <p className="text-xs text-zinc-500">No game reviews yet.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {stats.lifetime.topRatedGames.slice(0, 4).map((game, i) => (
                <div key={game.slug} className="flex items-center justify-between p-2 bg-white/[0.02] rounded-[12px] border border-white/[0.03]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-zinc-500 text-[11px] font-mono font-bold w-3.5">{i + 1}.</span>
                    <p className="text-zinc-200 text-xs font-semibold truncate">{game.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.2 rounded-full text-[10px] shrink-0 flex items-center gap-1 border border-amber-500/20 font-mono">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {game.ratio}%
                    </div>
                    <span className="text-zinc-500 text-[10px] font-mono">{game.totalVotes} votes</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Feedback Feed */}
        <div className="p-3.5 sm:p-4 rounded-[16px] bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2.5">
            <h2 className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              Recent Player Feedback
            </h2>
            <Link href="/admin/feedback" className="text-[10.5px] font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
              View All <ArrowRight className="w-2.5 h-2.5" />
            </Link>
          </div>
          
          <div className="space-y-1.5">
            {stats.lifetime.recentFeedback.length === 0 ? (
              <div className="p-6 bg-white/[0.01] rounded-[12px] border border-white/[0.04] border-dashed text-center">
                <p className="text-xs text-zinc-500">No feedback submitted yet.</p>
              </div>
            ) : (
              stats.lifetime.recentFeedback.slice(0, 3).map((fb, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/[0.04] rounded-[12px] p-2">
                  <div className="flex justify-between items-start mb-0.5">
                    <p className="text-xs font-semibold text-zinc-200 truncate max-w-[170px]">{fb.userEmail}</p>
                    <span className="text-[9.5px] text-zinc-500 font-mono">{fb.date}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-1 mb-1.5">{fb.message}</p>
                  <div className="flex justify-between items-center text-[9.5px]">
                    <span className="text-zinc-300 font-medium bg-white/[0.06] px-1.5 py-0.2 rounded-full border border-white/10">Game: {fb.gameSlug}</span>
                    <span className={clsx("font-medium px-1.5 py-0.2 rounded-full border capitalize", fb.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20')}>
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