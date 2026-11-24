"use client";

import { useState, useMemo } from "react";
import {
  Activity,
  Search,
  Gamepad2,
  LogIn,
  UserPlus,
  Gift,
  Coins,
  Clock,
  Filter,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export interface IActivityLogItem {
  _id: string;
  type: string;
  category: string;
  title: string;
  description: string;
  userEmail: string;
  userName: string;
  meta?: any;
  createdAt: string;
}

function formatDate(dateValue: any): string {
  if (!dateValue) return "Recently";
  const d = new Date(dateValue);
  return isNaN(d.getTime()) ? "Recently" : d.toLocaleDateString();
}

function formatTime(dateValue: any): string {
  if (!dateValue) return "";
  const d = new Date(dateValue);
  return isNaN(d.getTime())
    ? ""
    : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AdminActivityClient({
  initialActivities,
}: {
  initialActivities: IActivityLogItem[];
}) {
  const [activities, setActivities] = useState<IActivityLogItem[]>(initialActivities);
  const [searchTerm, setSearchTerm] = useState("");
  const [activityFilter, setActivityFilter] = useState<string>("all");

  const counts = useMemo(() => {
    let signups = 0;
    let logins = 0;
    let playtime = 0;
    let redemptions = 0;
    let adjustments = 0;

    activities.forEach((act) => {
      if (act.type === "signup" || act.type === "user_signup") signups++;
      else if (act.type === "login") logins++;
      else if (act.type === "playtime_milestone") playtime++;
      else if (act.type === "reward_claim") redemptions++;
      else if (act.type === "xp_transaction") adjustments++;
    });

    return { total: activities.length, signups, logins, playtime, redemptions, adjustments };
  }, [activities]);

  const filteredActivities = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return activities.filter((act) => {
      const matchesSearch =
        !term ||
        (act.userName && act.userName.toLowerCase().includes(term)) ||
        (act.userEmail && act.userEmail.toLowerCase().includes(term)) ||
        (act.title && act.title.toLowerCase().includes(term)) ||
        (act.description && act.description.toLowerCase().includes(term));

      const matchesFilter =
        activityFilter === "all" ||
        act.type === activityFilter ||
        act.category === activityFilter;

      return matchesSearch && matchesFilter;
    });
  }, [activities, searchTerm, activityFilter]);

  return (
    <div className="space-y-4">
      {/* ── Top Header Strip ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-zinc-950 border border-zinc-900">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-semibold">
              <Activity className="w-3 h-3" />
              <span>Real-Time Audit</span>
            </span>
            <span className="text-zinc-500 text-xs">
              • {counts.total} events logged
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
            Platform Activity Log
          </h1>
          <p className="text-[11px] sm:text-xs text-zinc-400">
            Live feed of player registrations, authentication events, playtime milestones, and transactions.
          </p>
        </div>

        {/* Quick Stats Counter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="px-2.5 py-1 rounded-lg bg-black border border-zinc-900 text-[11px] font-mono">
            <span className="text-zinc-500">Signups: </span>
            <span className="text-emerald-400 font-bold">{counts.signups}</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-black border border-zinc-900 text-[11px] font-mono">
            <span className="text-zinc-500">Logins: </span>
            <span className="text-blue-400 font-bold">{counts.logins}</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-black border border-zinc-900 text-[11px] font-mono">
            <span className="text-zinc-500">Playtime: </span>
            <span className="text-purple-400 font-bold">{counts.playtime}</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-black border border-zinc-900 text-[11px] font-mono">
            <span className="text-zinc-500">Claims: </span>
            <span className="text-cyan-400 font-bold">{counts.redemptions}</span>
          </div>
        </div>
      </div>

      {/* ── Search Bar & Filter Buttons ── */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by player name, email, or activity description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Activity" },
            { id: "playtime_milestone", label: "🎮 Playtime (5m/10m+)" },
            { id: "login", label: "🔑 Logins" },
            { id: "signup", label: "🎉 Signups" },
            { id: "reward_claim", label: "🎁 Redemptions" },
            { id: "xp_transaction", label: "⚡ XP Adjustments" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActivityFilter(f.id)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors shrink-0 ${
                activityFilter === f.id
                  ? "bg-white text-black border-white shadow-sm"
                  : "bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Activity Feed List ── */}
      <div className="space-y-2">
        {filteredActivities.map((act) => {
          const isXp = act.type === "xp_transaction";
          const isClaim = act.type === "reward_claim";
          const isSignup = act.type === "signup" || act.type === "user_signup";
          const isLogin = act.type === "login";
          const isMilestone = act.type === "playtime_milestone";

          return (
            <div
              key={act._id}
              className="flex items-start justify-between gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-zinc-800 transition-colors"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                {/* Category Icon */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${
                    isMilestone
                      ? "bg-purple-500/10 border-purple-500/25 text-purple-400"
                      : isLogin
                      ? "bg-blue-500/10 border-blue-500/25 text-blue-400"
                      : isSignup
                      ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                      : isClaim
                      ? "bg-cyan-500/10 border-cyan-500/25 text-cyan-400"
                      : "bg-amber-500/10 border-amber-500/25 text-amber-400"
                  }`}
                >
                  {isMilestone ? (
                    <Gamepad2 className="w-4 h-4" />
                  ) : isLogin ? (
                    <LogIn className="w-4 h-4" />
                  ) : isSignup ? (
                    <UserPlus className="w-4 h-4" />
                  ) : isClaim ? (
                    <Gift className="w-4 h-4" />
                  ) : (
                    <Coins className="w-4 h-4" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-white truncate">
                      {act.title}
                    </h4>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 uppercase">
                      {String(act.category || act.type || "activity").replace(/_/g, " ")}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                    {act.description}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono mt-1">
                    <span>{act.userName || "Player"}</span>
                    <span>•</span>
                    <span>{act.userEmail}</span>
                    {act.meta?.adminEmail && (
                      <>
                        <span>•</span>
                        <span className="text-amber-400">Admin: {act.meta.adminEmail}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Timestamp */}
              <div className="text-right shrink-0">
                <span className="text-[10px] text-zinc-500 font-mono block">
                  {formatDate(act.createdAt)}
                </span>
                <span className="text-[10px] text-zinc-600 font-mono">
                  {formatTime(act.createdAt)}
                </span>
              </div>
            </div>
          );
        })}

        {filteredActivities.length === 0 && (
          <div className="p-12 text-center rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-500 text-xs">
            <Activity className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            No activities found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
