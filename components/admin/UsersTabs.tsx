"use client";

import { useState, useMemo } from "react";
import clsx from "clsx";
import { 
  Search, ChevronLeft, ChevronRight, X, User, Flame, 
  Coins, Clock, Gamepad2, Calendar, Mail, Phone, 
  ShieldCheck, Share2, Sparkles, Activity, Globe, Heart,
  Users, UserCheck, Ghost, TrendingUp, Check
} from "lucide-react";
import Image from "next/image";

interface UsersTabsProps {
  users: any[];
  guests: any[];
  subscribers?: any[];
}

const ITEMS_PER_PAGE = 25;

function formatLastOnline(dateVal?: string | Date): string {
  if (!dateVal) return "Recently";
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return "Recently";

  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isOnlineNow(dateVal?: string | Date): boolean {
  if (!dateVal) return false;
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return false;
  return Date.now() - date.getTime() < 30 * 60 * 1000; // Active within last 30 minutes
}

export default function UsersTabs({ users, guests }: UsersTabsProps) {
  const [activeTab, setActiveTab] = useState<"all" | "users" | "guests">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEntity, setSelectedEntity] = useState<{ type: "user" | "guest"; data: any } | null>(null);

  // Time benchmarks for presentation cards
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  // Registered User Stats
  const usersActive24h = useMemo(() => {
    return users.filter((u) => new Date(u.lastActiveAt || u.createdAt).getTime() >= oneDayAgo).length;
  }, [users, oneDayAgo]);

  const usersOnlineNow = useMemo(() => {
    return users.filter((u) => isOnlineNow(u.lastActiveAt)).length;
  }, [users]);

  const totalUserXp = useMemo(() => {
    return users.reduce((sum, u) => sum + (u.lifetimeXp || u.xp || 0), 0);
  }, [users]);

  const totalUserPlaytimeMins = useMemo(() => {
    return Math.floor(users.reduce((sum, u) => sum + (u.playtimeSeconds || 0), 0) / 60);
  }, [users]);

  // Guest Stats
  const guestsActive24h = useMemo(() => {
    return guests.filter((g) => new Date(g.lastActiveAt || g.updatedAt || g.createdAt).getTime() >= oneDayAgo).length;
  }, [guests, oneDayAgo]);

  const guestsOnlineNow = useMemo(() => {
    return guests.filter((g) => isOnlineNow(g.lastActiveAt || g.updatedAt)).length;
  }, [guests]);

  const totalGuestPlays = useMemo(() => {
    return guests.reduce((sum, g) => sum + (g.gamesPlayedCount || 0), 0);
  }, [guests]);

  const totalGuestPlaytimeMins = useMemo(() => {
    return Math.floor(guests.reduce((sum, g) => sum + (g.playtimeSeconds || 0), 0) / 60);
  }, [guests]);

  // Unified list calculation
  const allList = useMemo(() => {
    const taggedUsers = users.map((u) => ({
      ...u,
      _entityType: "user" as const,
      _sortTime: new Date(u.lastActiveAt || u.createdAt).getTime(),
    }));
    const taggedGuests = guests.map((g) => ({
      ...g,
      _entityType: "guest" as const,
      _sortTime: new Date(g.lastActiveAt || g.updatedAt || g.createdAt).getTime(),
    }));

    return [...taggedUsers, ...taggedGuests].sort((a, b) => b._sortTime - a._sortTime);
  }, [users, guests]);

  const filteredData = useMemo(() => {
    let source: any[] = [];
    if (activeTab === "all") {
      source = allList;
    } else if (activeTab === "users") {
      source = users.map((u) => ({ ...u, _entityType: "user" as const }));
    } else {
      source = guests.map((g) => ({ ...g, _entityType: "guest" as const }));
    }

    if (!searchTerm.trim()) return source;
    const lower = searchTerm.toLowerCase().trim();

    return source.filter((item) => {
      if (item._entityType === "user") {
        return (
          item.name?.toLowerCase().includes(lower) ||
          item.email?.toLowerCase().includes(lower) ||
          item.phone?.toLowerCase().includes(lower)
        );
      } else {
        return item.guestId?.toLowerCase().includes(lower);
      }
    });
  }, [activeTab, allList, users, guests, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleTabChange = (tab: "all" | "users" | "guests") => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchTerm("");
  };

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between gap-3 pb-1 border-b border-white/[0.06]">
        <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Users className="w-5 h-5 text-zinc-300" />
          <span>Players &amp; Guests</span>
        </h1>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-zinc-400">
            Total: <strong className="text-white">{(users.length + guests.length).toLocaleString()}</strong>
          </span>
        </div>
      </div>

      {/* Compact Presentation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {/* Card 1: Registered / Login Users */}
        <div className="py-2.5 px-3 sm:px-3.5 rounded-[14px] bg-[#101013] border border-white/[0.08] shadow-xs">
          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/[0.04]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-[8px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-white">Registered Players</span>
            </div>
            {usersOnlineNow > 0 ? (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {usersOnlineNow} online
              </span>
            ) : (
              <span className="text-[10px] text-zinc-500 font-mono">{usersActive24h} active today</span>
            )}
          </div>

          <div className="grid grid-cols-4 gap-1 pt-1.5 text-center">
            <div>
              <span className="text-[9.5px] uppercase font-medium text-zinc-500 tracking-wider">Total</span>
              <p className="text-sm sm:text-base font-bold text-white font-mono mt-0.5">{users.length.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-[9.5px] uppercase font-medium text-zinc-500 tracking-wider">Active 24h</span>
              <p className="text-sm sm:text-base font-bold text-amber-300 font-mono mt-0.5">+{usersActive24h}</p>
            </div>
            <div>
              <span className="text-[9.5px] uppercase font-medium text-zinc-500 tracking-wider">Total XP</span>
              <p className="text-sm sm:text-base font-bold text-white font-mono mt-0.5">{totalUserXp.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-[9.5px] uppercase font-medium text-zinc-500 tracking-wider">Playtime</span>
              <p className="text-sm sm:text-base font-bold text-violet-300 font-mono mt-0.5">{totalUserPlaytimeMins}m</p>
            </div>
          </div>
        </div>

        {/* Card 2: Guest Users */}
        <div className="py-2.5 px-3 sm:px-3.5 rounded-[14px] bg-[#101013] border border-white/[0.08] shadow-xs">
          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/[0.04]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-[8px] bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Ghost className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-white">Guest Visitors</span>
            </div>
            {guestsOnlineNow > 0 ? (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {guestsOnlineNow} online
              </span>
            ) : (
              <span className="text-[10px] text-zinc-500 font-mono">{guestsActive24h} active today</span>
            )}
          </div>

          <div className="grid grid-cols-4 gap-1 pt-1.5 text-center">
            <div>
              <span className="text-[9.5px] uppercase font-medium text-zinc-500 tracking-wider">Sessions</span>
              <p className="text-sm sm:text-base font-bold text-white font-mono mt-0.5">{guests.length.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-[9.5px] uppercase font-medium text-zinc-500 tracking-wider">Active 24h</span>
              <p className="text-sm sm:text-base font-bold text-sky-400 font-mono mt-0.5">+{guestsActive24h}</p>
            </div>
            <div>
              <span className="text-[9.5px] uppercase font-medium text-zinc-500 tracking-wider">Plays</span>
              <p className="text-sm sm:text-base font-bold text-white font-mono mt-0.5">{totalGuestPlays.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-[9.5px] uppercase font-medium text-zinc-500 tracking-wider">Playtime</span>
              <p className="text-sm sm:text-base font-bold text-violet-300 font-mono mt-0.5">{totalGuestPlaytimeMins}m</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        <div className="flex overflow-x-auto scrollbar-none w-full sm:w-auto bg-[#101012] p-1 rounded-full border border-white/[0.08]">
          <button
            onClick={() => handleTabChange("all")}
            className={clsx(
              "flex-1 sm:flex-none whitespace-nowrap px-3.5 py-1 text-[11px] font-medium transition-all rounded-full cursor-pointer",
              activeTab === "all" 
                ? "bg-white text-black font-bold shadow-xs" 
                : "text-zinc-400 hover:text-white"
            )}
          >
            All Activity ({allList.length})
          </button>
          <button
            onClick={() => handleTabChange("users")}
            className={clsx(
              "flex-1 sm:flex-none whitespace-nowrap px-3.5 py-1 text-[11px] font-medium transition-all rounded-full cursor-pointer",
              activeTab === "users" 
                ? "bg-white text-black font-bold shadow-xs" 
                : "text-zinc-400 hover:text-white"
            )}
          >
            Registered Users ({users.length})
          </button>
          <button
            onClick={() => handleTabChange("guests")}
            className={clsx(
              "flex-1 sm:flex-none whitespace-nowrap px-3.5 py-1 text-[11px] font-medium transition-all rounded-full cursor-pointer",
              activeTab === "guests" 
                ? "bg-white text-black font-bold shadow-xs" 
                : "text-zinc-400 hover:text-white"
            )}
          >
            Guests ({guests.length})
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <input
            type="text"
            placeholder={activeTab === "all" ? "Search players or guests..." : `Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-64 bg-[#101012] border border-white/[0.08] rounded-full pl-9 pr-8 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/[0.2] transition-colors"
          />
          {searchTerm && (
            <button 
              type="button" 
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive List (Unified or Tabbed) */}
      <div className="divide-y divide-white/[0.04]">
        {paginatedData.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 text-xs">
            {searchTerm ? "No results found matching your search." : "No player activity recorded yet."}
          </div>
        ) : (
          paginatedData.map((item: any) => {
            const isUser = item._entityType === "user";
            const isGuest = item._entityType === "guest";

            return (
              <div
                key={item._id}
                onClick={() => setSelectedEntity({ type: isUser ? "user" : "guest", data: item })}
                className="py-2.5 px-2 sm:px-3 flex items-center justify-between gap-3 hover:bg-white/[0.03] rounded-[14px] transition-colors cursor-pointer group"
              >
                {/* Left: Avatar & Identity */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {isUser && (
                    item.image ? (
                      <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] overflow-hidden bg-zinc-900 border border-white/[0.08] shrink-0">
                        <Image src={item.image} alt={item.name} width={40} height={40} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] bg-white/[0.08] border border-white/10 flex items-center justify-center text-white font-bold shrink-0 text-xs">
                        {item.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )
                  )}

                  {isGuest && (
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                      <Gamepad2 className="w-4 h-4" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-zinc-100 text-xs sm:text-sm truncate group-hover:text-white transition-colors leading-tight">
                        {isUser ? item.name : `Guest ${item.guestId?.slice(0, 10)}...`}
                      </p>
                      {isUser && (
                        <span className="px-1.5 py-0.2 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[9.5px] font-medium shrink-0">
                          Player
                        </span>
                      )}
                      {isGuest && (
                        <span className="px-1.5 py-0.2 rounded-md bg-white/[0.05] text-zinc-400 border border-white/[0.08] text-[9.5px] font-medium shrink-0">
                          Guest
                        </span>
                      )}
                      {isUser && item.profileCompleted && (
                        <span 
                          className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0" 
                          title="Profile completed"
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[10.5px] text-zinc-500 mt-0.5 truncate">
                      {isUser && (
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="truncate text-zinc-400">{item.email}</span>
                          <span className="text-zinc-600 shrink-0">•</span>
                          <span className="shrink-0 flex items-center gap-1">
                            <span
                              className={clsx(
                                "w-1.5 h-1.5 rounded-full shrink-0",
                                isOnlineNow(item.lastActiveAt)
                                  ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse"
                                  : "bg-zinc-600"
                              )}
                            />
                            <span className={isOnlineNow(item.lastActiveAt) ? "text-emerald-400 font-medium" : "text-zinc-400"}>
                              {isOnlineNow(item.lastActiveAt) ? `Online (${formatLastOnline(item.lastActiveAt)})` : `Last online: ${formatLastOnline(item.lastActiveAt)}`}
                            </span>
                          </span>
                        </div>
                      )}

                      {isGuest && (
                        <span className="truncate flex items-center gap-1.5">
                          <span
                            className={clsx(
                              "w-1.5 h-1.5 rounded-full shrink-0",
                              isOnlineNow(item.lastActiveAt || item.updatedAt)
                                ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse"
                                : "bg-zinc-600"
                            )}
                          />
                          <span className={isOnlineNow(item.lastActiveAt || item.updatedAt) ? "text-emerald-400 font-medium" : "text-zinc-400"}>
                            {isOnlineNow(item.lastActiveAt || item.updatedAt)
                              ? `Online (${formatLastOnline(item.lastActiveAt || item.updatedAt)})`
                              : `Last online: ${formatLastOnline(item.lastActiveAt || item.updatedAt)}`}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Quick Micro Stats & Chevron */}
                <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
                  {isUser && (
                    <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px]">
                      <span className="px-2 py-0.5 rounded-full border bg-amber-500/10 text-amber-300 border-amber-500/20">
                        🪙 {item.xp || 0}
                      </span>
                      <span className="px-2 py-0.5 rounded-full border bg-white/[0.06] text-white border-white/10">
                        🔥 {item.currentStreak || 0}
                      </span>
                      <span className="px-2 py-0.5 rounded-full border bg-violet-500/10 text-violet-300 border-violet-500/20">
                        ⏱️ {Math.floor((item.playtimeSeconds || 0) / 60)}m
                      </span>
                    </div>
                  )}

                  {isGuest && (
                    <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px]">
                      <span className="px-2 py-0.5 rounded-full border bg-violet-500/10 text-violet-300 border-violet-500/20">
                        ⏱️ {Math.floor((item.playtimeSeconds || 0) / 60)}m
                      </span>
                      <span className="px-2 py-0.5 rounded-full border bg-sky-500/10 text-sky-300 border-sky-500/20">
                        🎮 {item.gamesPlayedCount || 0} plays
                      </span>
                    </div>
                  )}

                  <div className="w-4 flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 px-1 border-t border-white/[0.04]">
          <span className="text-[11px] text-zinc-500">
            Showing <span className="text-zinc-300 font-mono font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
            <span className="text-zinc-300 font-mono font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)}</span> of{" "}
            <span className="text-zinc-300 font-mono font-medium">{filteredData.length}</span> results
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center px-3 py-1 bg-black/40 border border-white/[0.08] rounded-full text-[11px] text-zinc-300 font-medium font-mono">
              {currentPage} / {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Sheet Modal */}
      {selectedEntity && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedEntity(null);
          }}
        >
          <div className="bg-[#121214] border-t sm:border border-white/[0.1] rounded-t-[28px] sm:rounded-[24px] max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl shadow-black/80 overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
            {/* Sheet Top Bar */}
            <div className="p-4 sm:p-5 pb-4 border-b border-white/[0.06] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                {selectedEntity.type === "user" && (
                  selectedEntity.data.image ? (
                    <div className="relative w-12 h-12 rounded-[14px] overflow-hidden bg-zinc-900 border border-white/10 shrink-0 shadow-md">
                      <Image src={selectedEntity.data.image} alt={selectedEntity.data.name} width={48} height={48} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-[14px] bg-white/[0.08] border border-white/10 flex items-center justify-center text-white font-bold shrink-0 text-base shadow-md">
                      {selectedEntity.data.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )
                )}

                {selectedEntity.type === "guest" && (
                  <div className="w-12 h-12 rounded-[14px] bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0 shadow-md">
                    <Gamepad2 className="w-6 h-6" />
                  </div>
                )}

                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-semibold text-white tracking-tight truncate leading-tight">
                    {selectedEntity.type === "user" 
                      ? selectedEntity.data.name 
                      : "Guest Session"}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400 truncate">
                    <span className="text-zinc-300 font-medium capitalize">
                      {selectedEntity.type === "user" ? "Registered Player" : "Anonymous Guest"}
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="font-mono text-zinc-500 text-[10.5px]">
                      {selectedEntity.data.createdAt ? new Date(selectedEntity.data.createdAt).toLocaleDateString() : "Active"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEntity(null)}
                className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sheet Body (Scrollable) */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 custom-scrollbar">
              {/* User Specific Performance Grid */}
              {selectedEntity.type === "user" && (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center justify-center py-2.5 px-2 rounded-[14px] border border-amber-500/20 bg-amber-500/[0.06]">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300">
                        <Coins className="w-3.5 h-3.5" />
                        <span>{selectedEntity.data.xp || 0}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 mt-0.5">Current XP</span>
                    </div>

                    <div className="flex flex-col items-center justify-center py-2.5 px-2 rounded-[14px] border border-white/10 bg-white/[0.04]">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-white">
                        <Flame className="w-3.5 h-3.5" />
                        <span>{selectedEntity.data.currentStreak || 0} days</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 mt-0.5">Play Streak</span>
                    </div>

                    <div className="flex flex-col items-center justify-center py-2.5 px-2 rounded-[14px] border border-violet-500/20 bg-violet-500/[0.06]">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-violet-300">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{Math.floor((selectedEntity.data.playtimeSeconds || 0) / 60)}m</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 mt-0.5">Total Playtime</span>
                    </div>
                  </div>

                  {/* Account & Engagement Details */}
                  <div className="p-3.5 rounded-[16px] bg-white/[0.02] border border-white/[0.06] space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-zinc-500 text-[10.5px] uppercase tracking-wider font-semibold">Email</span>
                        <p className="text-zinc-200 font-mono text-[11px] break-all">{selectedEntity.data.email}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-zinc-500 text-[10.5px] uppercase tracking-wider font-semibold">Phone</span>
                        <p className="text-zinc-200 font-mono text-[11px]">{selectedEntity.data.phone || "Not provided"}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-zinc-500 text-[10.5px] uppercase tracking-wider font-semibold">Lifetime XP</span>
                        <p className="text-white font-mono font-bold text-sm">{(selectedEntity.data.lifetimeXp || selectedEntity.data.xp || 0).toLocaleString()}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-zinc-500 text-[10.5px] uppercase tracking-wider font-semibold">Games Played</span>
                        <p className="text-white font-mono font-bold text-sm">{(selectedEntity.data.gamesPlayedCount || 0).toLocaleString()}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-zinc-500 text-[10.5px] uppercase tracking-wider font-semibold">Joined Date</span>
                        <p className="text-zinc-300 font-medium text-[11px]">
                          {selectedEntity.data.createdAt ? new Date(selectedEntity.data.createdAt).toLocaleDateString() : "Recently"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-zinc-500 text-[10.5px] uppercase tracking-wider font-semibold">Last Active</span>
                        <p className="text-zinc-300 font-medium text-[11px]">
                          {selectedEntity.data.lastActiveAt ? new Date(selectedEntity.data.lastActiveAt).toLocaleString() : "Recently"}
                        </p>
                      </div>
                    </div>

                    {selectedEntity.data.bio && (
                      <div className="pt-2 border-t border-white/[0.04]">
                        <span className="text-zinc-500 text-[10.5px] uppercase tracking-wider font-semibold block mb-1">Player Bio</span>
                        <p className="text-zinc-300 text-[11.5px] italic bg-black/20 p-2 rounded-[10px] border border-white/[0.04]">
                          &ldquo;{selectedEntity.data.bio}&rdquo;
                        </p>
                      </div>
                    )}

                    {selectedEntity.data.favorites && selectedEntity.data.favorites.length > 0 && (
                      <div className="pt-2 border-t border-white/[0.04]">
                        <span className="text-zinc-500 text-[10.5px] uppercase tracking-wider font-semibold block mb-1.5">Favorite Games</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedEntity.data.favorites.map((fav: string) => (
                            <span key={fav} className="px-2 py-0.5 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-full text-[10px] font-mono">
                              ❤️ {fav}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Guest Session Specific Details */}
              {selectedEntity.type === "guest" && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col items-center justify-center py-3 px-2 rounded-[14px] border border-violet-500/20 bg-violet-500/[0.06]">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-violet-300 font-mono">
                        <Clock className="w-4 h-4" />
                        <span>{Math.floor((selectedEntity.data.playtimeSeconds || 0) / 60)} mins</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 mt-0.5">Guest Playtime</span>
                    </div>

                    <div className="flex flex-col items-center justify-center py-3 px-2 rounded-[14px] border border-sky-500/20 bg-sky-500/[0.06]">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-sky-300 font-mono">
                        <Gamepad2 className="w-4 h-4" />
                        <span>{selectedEntity.data.gamesPlayedCount || 0} plays</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 mt-0.5">Games Played</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-[16px] bg-white/[0.02] border border-white/[0.06] space-y-3 text-xs">
                    <div className="grid grid-cols-1 gap-2.5">
                      <div className="space-y-1">
                        <span className="text-zinc-500 text-[10.5px] uppercase tracking-wider font-semibold">Guest Session ID</span>
                        <p className="text-zinc-200 font-mono text-[11px] break-all bg-black/30 p-2 rounded-[10px] border border-white/[0.04]">
                          {selectedEntity.data.guestId}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <span className="text-zinc-500 text-[10.5px] uppercase tracking-wider font-semibold">First Visit</span>
                          <p className="text-zinc-300 font-medium text-[11px]">
                            {selectedEntity.data.createdAt ? new Date(selectedEntity.data.createdAt).toLocaleDateString() : "Recently"}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-zinc-500 text-[10.5px] uppercase tracking-wider font-semibold">Last Active</span>
                          <p className="text-zinc-300 font-medium text-[11px]">
                            {selectedEntity.data.lastActiveAt ? new Date(selectedEntity.data.lastActiveAt).toLocaleString() : "Recently"}
                          </p>
                        </div>
                      </div>

                      {selectedEntity.data.lastIp && (
                        <div className="space-y-1 pt-1">
                          <span className="text-zinc-500 text-[10.5px] uppercase tracking-wider font-semibold">Last IP Address</span>
                          <p className="text-zinc-400 font-mono text-[11px]">{selectedEntity.data.lastIp}</p>
                        </div>
                      )}

                      {selectedEntity.data.recentlyPlayed && selectedEntity.data.recentlyPlayed.length > 0 && (
                        <div className="pt-2 border-t border-white/[0.04]">
                          <span className="text-zinc-500 text-[10.5px] uppercase tracking-wider font-semibold block mb-1.5">Recently Played</span>
                          <div className="flex flex-wrap gap-1">
                            {selectedEntity.data.recentlyPlayed.map((slug: string) => (
                              <span key={slug} className="px-2 py-0.5 bg-white/[0.06] text-zinc-300 border border-white/10 rounded-full text-[10px] font-mono">
                                🎮 {slug}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
