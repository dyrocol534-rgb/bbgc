"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Gamepad2, PlaySquare, Loader2, Activity, UserPlus, Mail, Ghost, TrendingUp, Zap, Rocket, RefreshCw, Smartphone, Star, MessageSquare } from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import clsx from 'clsx';

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
    topRatedGames: { slug: string; title: string; ratio: number; totalVotes: number }[];
    recentFeedback: { gameSlug: string; userEmail: string; message: string; status: string; date: string }[];
  };
  signupsTrend: { date: string; users: number; guests: number }[];
}

function StatCard({ icon: Icon, label, value, color, sub }: { icon: React.ElementType; label: string; value: string | number; color: string; sub?: string }) {
  return (
    <div className="bg-surface border border-zinc-800 p-3 rounded-xl flex items-center gap-3 hover:border-zinc-700 transition-colors shadow-sm relative overflow-hidden group">
      <div className={`p-2 rounded-lg ${color} shadow-inner z-10 transition-transform group-hover:scale-105`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1 z-10">
        <p className="text-xs font-medium text-text-muted">{label}</p>
        <p className="text-xl font-bold text-text-main leading-tight tracking-tight">{value}</p>
        {sub && <p className="text-[10px] leading-tight text-zinc-500 mt-0.5">{sub}</p>}
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
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d" | "lifetime">("7d");

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

  return (
    <div className="space-y-6 pb-10 max-w-[1400px] mx-auto animate-in fade-in duration-300">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Analytics Dashboard</h1>
            <p className="text-xs text-zinc-400">Time-series tracking & cache-enabled</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchStats(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-700 disabled:opacity-50"
            title="Force refresh data from database (bypasses 10m cache)"
          >
            <RefreshCw className={clsx("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
            Refresh
          </button>

          <div className="flex p-0.5 bg-zinc-950 border border-zinc-800 rounded-lg">
            {timeframes.map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={clsx(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                  timeframe === tf.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                )}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Engagement KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Zap}
          label={`Active Users (${timeframe})`}
          value={totalActive.toLocaleString()}
          sub={`${memberPct}% Members / ${guestPct}% Guests`}
          color="bg-indigo-500/20 text-indigo-400"
        />
        <StatCard
          icon={Gamepad2}
          label={`Avg Plays Per User (${timeframe})`}
          value={currentStats.avgPlaysPerActive}
          sub="Game clicks per active user"
          color="bg-emerald-500/20 text-emerald-400"
        />
        <StatCard
          icon={UserPlus}
          label="Weekly Retention Rate"
          value={`${stats.lifetime.retentionRate}%`}
          sub="% of old users active this week"
          color="bg-amber-500/20 text-amber-400"
        />
        <StatCard
          icon={Ghost}
          label={isLifetime ? "Total Guests" : `New Guests (${timeframe})`}
          value={currentStats.newGuests.toLocaleString()}
          color="bg-zinc-500/20 text-zinc-400"
        />
        <StatCard
          icon={PlaySquare}
          label={`Total Game Plays (${timeframe})`}
          value={currentStats.totalPlays.toLocaleString()}
          sub="Total clicks across all games"
          color="bg-blue-500/20 text-blue-400"
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
          label={isLifetime ? "Total Subscribers" : `New Subscribers (${timeframe})`}
          value={currentStats.newSubscribers.toLocaleString()}
          sub="Newsletter signups"
          color="bg-purple-500/20 text-purple-400"
        />
        <StatCard
          icon={Smartphone}
          label={isLifetime ? "Total PWA Installs" : `New Installs (${timeframe})`}
          value={currentStats.pwaInstalls?.toLocaleString() || "0"}
          sub="Added to homescreen"
          color="bg-indigo-500/20 text-indigo-400"
        />
        <StatCard
          icon={Gamepad2}
          label={isLifetime ? "Total Games" : `New Games (${timeframe})`}
          value={currentStats.totalGames.toLocaleString()}
          sub="Published games"
          color="bg-cyan-500/20 text-cyan-400"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-surface border border-zinc-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Acquisition Trend
            </h2>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorGuests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="users" name="Registered" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                <Area type="monotone" dataKey="guests" name="Guests" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorGuests)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Split Chart */}
        <div className="bg-surface border border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              Device Platform ({timeframes.find(t => t.id === timeframe)?.label})
            </h2>
            {deviceData.length === 0 ? (
              <div className="h-[180px] flex items-center justify-center text-xs text-zinc-500">
                No device data found
              </div>
            ) : (
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
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
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-surface border border-zinc-800 rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
            <PlaySquare className="w-4 h-4 text-indigo-400" />
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Top Rated Games (Lifetime) */}
        <div className="bg-surface border border-zinc-800 rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-yellow-500" />
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
        <div className="bg-surface border border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              Live Feedback Feed
            </h2>
            <Link href="/admin/feedback" className="text-xs text-indigo-400 hover:text-indigo-300">View All</Link>
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