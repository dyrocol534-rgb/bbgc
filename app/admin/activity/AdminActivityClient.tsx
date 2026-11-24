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
  X,
  Sparkles,
  ShieldCheck,
  TrendingUp,
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
  return isNaN(d.getTime()) ? "Recently" : d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function formatTime(dateValue: any): string {
  if (!dateValue) return "";
  const d = new Date(dateValue);
  return isNaN(d.getTime())
    ? ""
    : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getRelativeTime(dateValue: any): string {
  if (!dateValue) return "Recently";
  const date = new Date(dateValue);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (isNaN(diffInSeconds) || diffInSeconds < 0) return "Recently";
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(dateValue);
}

export default function AdminActivityClient({
  initialActivities,
}: {
  initialActivities: IActivityLogItem[];
}) {
  const [activities] = useState<IActivityLogItem[]>(initialActivities);
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

  const filterTabs = [
    { id: "all", label: "All Activity", count: counts.total, icon: Activity },
    { id: "signup", label: "Signups", count: counts.signups, icon: UserPlus },
    { id: "login", label: "Logins", count: counts.logins, icon: LogIn },
    { id: "playtime_milestone", label: "Playtime", count: counts.playtime, icon: Gamepad2 },
    { id: "reward_claim", label: "Redemptions", count: counts.redemptions, icon: Gift },
    { id: "xp_transaction", label: "XP Ledger", count: counts.adjustments, icon: Coins },
  ];

  return (
    <div className="space-y-4 max-w-full">
      {/* ── 1. KPI Metric Stat Cards (Better Desktop & Mobile utilization) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Signups */}
        <div
          onClick={() => setActivityFilter("signup")}
          className={`p-3 sm:p-4 rounded-xl border transition-all cursor-pointer select-none ${
            activityFilter === "signup"
              ? "bg-emerald-500/10 border-emerald-500/40 shadow-sm"
              : "bg-zinc-950/80 hover:bg-zinc-900/60 border-zinc-900"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-zinc-400">New Signups</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <UserPlus className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-white font-mono">{counts.signups}</span>
            <span className="text-[10px] text-emerald-400 font-medium">Registrations</span>
          </div>
        </div>

        {/* Logins */}
        <div
          onClick={() => setActivityFilter("login")}
          className={`p-3 sm:p-4 rounded-xl border transition-all cursor-pointer select-none ${
            activityFilter === "login"
              ? "bg-blue-500/10 border-blue-500/40 shadow-sm"
              : "bg-zinc-950/80 hover:bg-zinc-900/60 border-zinc-900"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-zinc-400">Player Logins</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <LogIn className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-white font-mono">{counts.logins}</span>
            <span className="text-[10px] text-blue-400 font-medium">Sessions</span>
          </div>
        </div>

        {/* Playtime Milestones */}
        <div
          onClick={() => setActivityFilter("playtime_milestone")}
          className={`p-3 sm:p-4 rounded-xl border transition-all cursor-pointer select-none ${
            activityFilter === "playtime_milestone"
              ? "bg-purple-500/10 border-purple-500/40 shadow-sm"
              : "bg-zinc-950/80 hover:bg-zinc-900/60 border-zinc-900"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-zinc-400">Play Milestones</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Gamepad2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-white font-mono">{counts.playtime}</span>
            <span className="text-[10px] text-purple-400 font-medium">5m / 10m+ active</span>
          </div>
        </div>

        {/* Redemptions & XP */}
        <div
          onClick={() => setActivityFilter(counts.redemptions > 0 ? "reward_claim" : "xp_transaction")}
          className={`p-3 sm:p-4 rounded-xl border transition-all cursor-pointer select-none ${
            activityFilter === "reward_claim" || activityFilter === "xp_transaction"
              ? "bg-amber-500/10 border-amber-500/40 shadow-sm"
              : "bg-zinc-950/80 hover:bg-zinc-900/60 border-zinc-900"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-zinc-400">Store & XP</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Gift className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-white font-mono">
              {counts.redemptions + counts.adjustments}
            </span>
            <span className="text-[10px] text-amber-400 font-medium">Claims & Ledger</span>
          </div>
        </div>
      </div>

      {/* ── 2. Unified Search & Horizontal Filter Bar ── */}
      <div className="bg-zinc-950/90 border border-zinc-900 rounded-xl p-2.5 sm:p-3 space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by player name, email, action, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-black border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-white transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Showing count indicator */}
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-zinc-400 px-2 shrink-0">
            <span>Showing <b className="text-white">{filteredActivities.length}</b> of {activities.length}</span>
          </div>
        </div>

        {/* Filter Pills with Count Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activityFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivityFilter(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-white text-black shadow-sm"
                    : "bg-black/60 hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800/80"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-black" : "text-zinc-500"}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? "bg-black/10 text-black font-bold" : "bg-zinc-900 text-zinc-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. High-Density Activity Feed (Desktop 2-Col Grid or Responsive Full Cards) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-3">
        {filteredActivities.map((act) => {
          const isXp = act.type === "xp_transaction";
          const isClaim = act.type === "reward_claim";
          const isSignup = act.type === "signup" || act.type === "user_signup";
          const isLogin = act.type === "login";
          const isMilestone = act.type === "playtime_milestone";

          const categoryColor = isMilestone
            ? "purple"
            : isLogin
            ? "blue"
            : isSignup
            ? "emerald"
            : isClaim
            ? "cyan"
            : "amber";

          return (
            <div
              key={act._id}
              className="group p-3 sm:p-3.5 rounded-xl bg-zinc-950 border border-zinc-900/90 hover:border-zinc-800 transition-all hover:shadow-lg flex flex-col justify-between gap-2.5 relative overflow-hidden"
            >
              {/* Top Accent line indicator based on event category */}
              <div
                className={`absolute top-0 left-0 right-0 h-[2px] opacity-40 group-hover:opacity-100 transition-opacity ${
                  isMilestone
                    ? "bg-purple-500"
                    : isLogin
                    ? "bg-blue-500"
                    : isSignup
                    ? "bg-emerald-500"
                    : isClaim
                    ? "bg-cyan-500"
                    : "bg-amber-500"
                }`}
              />

              {/* Event Header & Action Details */}
              <div className="flex items-start gap-2.5 min-w-0">
                {/* Event Category Icon */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 shadow-inner ${
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

                {/* Event Title & Category Pill */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                        {act.title}
                      </h3>
                      <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 uppercase font-semibold">
                        {String(act.category || act.type || "activity").replace(/_/g, " ")}
                      </span>
                    </div>

                    {/* Relative Time badge on top-right */}
                    <span className="text-[10px] text-zinc-500 font-mono shrink-0 whitespace-nowrap">
                      {getRelativeTime(act.createdAt)}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] sm:text-xs text-zinc-300 mt-1 leading-snug line-clamp-2">
                    {act.description}
                  </p>
                </div>
              </div>

              {/* Bottom Metadata & Identity Strip (Clean Responsive Flexbox) */}
              <div className="pt-2 border-t border-zinc-900/80 flex items-center justify-between gap-2 text-[10px] sm:text-[11px] font-mono flex-wrap">
                {/* User Identity info (prevents awkward mobile text wrapping) */}
                <div className="flex items-center gap-1.5 min-w-0 flex-1 text-zinc-400 truncate">
                  <span className="font-semibold text-zinc-200 truncate max-w-[130px] sm:max-w-[180px]">
                    {act.userName || "Player"}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-500 truncate max-w-[160px] sm:max-w-[220px]">
                    {act.userEmail}
                  </span>
                </div>

                {/* Exact Timestamp */}
                <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] shrink-0">
                  <Clock className="w-3 h-3 text-zinc-600" />
                  <span>{formatDate(act.createdAt)}</span>
                  <span>{formatTime(act.createdAt)}</span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredActivities.length === 0 && (
          <div className="col-span-full p-12 text-center rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-500 text-xs">
            <Activity className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-zinc-400 font-semibold mb-1">No activities found</p>
            <p className="text-zinc-500 text-[11px]">
              Try adjusting your search query or selecting a different activity filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
