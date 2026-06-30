"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Users, Gamepad2, PlaySquare, Loader2, Activity, UserPlus, Mail, Ghost, TrendingUp, Eye, Gamepad } from "lucide-react";
import Link from "next/link";

interface TopGuestGame {
  slug: string;
  title: string;
  count: number;
}

interface Stats {
  totalUsers: number;
  totalGames: number;
  totalPlays: number;
  activeUsers24h: number;
  newUsers7d: number;
  totalSubscribers: number;
  totalGuestSessions: number;
  activeGuests24h: number;
  activeGuests7d: number;
  newGuests7d: number;
  activeLoggedInUsers24h: number;
  topGuestGames: TopGuestGame[];
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  sub?: string;
}) {
  return (
    <div className="bg-surface border border-zinc-800 p-6 rounded-xl flex items-center gap-4 hover:border-zinc-700 transition-colors shadow-lg">
      <div className={`p-4 rounded-xl ${color}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-sm font-medium text-text-muted">{label}</p>
        <p className="text-3xl font-bold text-text-main">{value}</p>
        {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminAnalytics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data } = await axios.get("/api/admin/stats");
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const totalActive = (stats?.activeLoggedInUsers24h || 0) + (stats?.activeGuests24h || 0);
  const guestPct = totalActive > 0 ? Math.round(((stats?.activeGuests24h || 0) / totalActive) * 100) : 0;
  const memberPct = 100 - guestPct;

  return (
    <div className="space-y-10">

      {/* ── Platform Overview ─────────────────────────────── */}
      <section>
        <h2 className="text-2xl font-bold text-text-main mb-6">Platform Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard icon={Activity}   label="Active Users (24h)"    value={stats?.activeUsers24h || 0}    color="bg-emerald-500/10 text-emerald-400" sub="Guests + Members combined" />
          <StatCard icon={UserPlus}   label="New Members (7 Days)"  value={stats?.newUsers7d || 0}         color="bg-blue-500/10 text-blue-400" />
          <StatCard icon={Mail}       label="Total Subscribers"     value={stats?.totalSubscribers || 0}   color="bg-pink-500/10 text-pink-400" />
          <StatCard icon={Users}      label="Total Members"         value={stats?.totalUsers || 0}         color="bg-indigo-500/10 text-indigo-400" />
          <StatCard icon={Gamepad2}   label="Published Games"       value={stats?.totalGames || 0}         color="bg-green-500/10 text-green-400" />
          <StatCard icon={PlaySquare} label="Total Lifetime Plays"  value={stats?.totalPlays?.toLocaleString() || 0}  color="bg-orange-500/10 text-orange-400" />
        </div>
      </section>

      {/* ── Guest Insights ────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Ghost className="w-6 h-6 text-violet-400" />
          <h2 className="text-2xl font-bold text-text-main">Guest Insights</h2>
          <span className="text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full font-medium">Anonymous Visitors</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard icon={Ghost}      label="Total Guest Sessions"  value={stats?.totalGuestSessions || 0} color="bg-violet-500/10 text-violet-400" sub="Unique browsers ever" />
          <StatCard icon={Eye}        label="Guests Active (24h)"   value={stats?.activeGuests24h || 0}    color="bg-fuchsia-500/10 text-fuchsia-400" sub="Played in last 24 hours" />
          <StatCard icon={TrendingUp} label="Guests Active (7d)"    value={stats?.activeGuests7d || 0}     color="bg-purple-500/10 text-purple-400" sub="Played in last 7 days" />
          <StatCard icon={UserPlus}   label="New Guests (7 Days)"   value={stats?.newGuests7d || 0}        color="bg-rose-500/10 text-rose-400" sub="First visit this week" />
        </div>

        {/* Guest vs Member ratio bar */}
        <div className="bg-surface border border-zinc-800 rounded-xl p-6 mb-6">
          <p className="text-sm font-semibold text-text-muted mb-3">Active Users Breakdown (24h)</p>
          <div className="flex rounded-full overflow-hidden h-4 bg-zinc-800 mb-3">
            <div
              className="bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all duration-700"
              style={{ width: `${guestPct}%` }}
            />
            <div
              className="bg-gradient-to-r from-indigo-500 to-blue-400 transition-all duration-700"
              style={{ width: `${memberPct}%` }}
            />
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-violet-500 inline-block" />
              <span className="text-zinc-300">Guests — <strong>{stats?.activeGuests24h || 0}</strong> ({guestPct}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
              <span className="text-zinc-300">Members — <strong>{stats?.activeLoggedInUsers24h || 0}</strong> ({memberPct}%)</span>
            </div>
          </div>
        </div>

        {/* Top games played by guests */}
        <div className="bg-surface border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Gamepad className="w-5 h-5 text-violet-400" />
            <p className="text-sm font-semibold text-white">Top Games Played by Guests</p>
          </div>
          {stats?.topGuestGames && stats.topGuestGames.length > 0 ? (
            <div className="space-y-3">
              {stats.topGuestGames.map((game, i) => {
                const max = stats.topGuestGames[0]?.count || 1;
                const pct = Math.round((game.count / max) * 100);
                return (
                  <div key={game.slug}>
                    <div className="flex items-center justify-between mb-1">
                      <Link
                        href={`/games/${game.slug}`}
                        target="_blank"
                        className="text-sm text-zinc-200 hover:text-violet-400 transition-colors font-medium truncate max-w-[70%]"
                      >
                        {i + 1}. {game.title}
                      </Link>
                      <span className="text-xs text-zinc-500 shrink-0 ml-2">{game.count} guest{game.count !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 text-center py-4">No guest play data yet. Once guests start playing games, their top picks will appear here.</p>
          )}
        </div>
      </section>

    </div>
  );
}