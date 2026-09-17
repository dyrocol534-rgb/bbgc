"use client";

import { useState, useMemo } from "react";
import clsx from "clsx";
import { 
  Search, ChevronLeft, ChevronRight, X, User, Flame, 
  Coins, Clock, Gamepad2, Calendar, Mail, Phone, 
  ShieldCheck, Share2, Sparkles, Activity, Globe, Heart
} from "lucide-react";
import Image from "next/image";

interface UsersTabsProps {
  users: any[];
  subscribers: any[];
  guests: any[];
}

const ITEMS_PER_PAGE = 25;

export default function UsersTabs({ users, subscribers, guests }: UsersTabsProps) {
  const [activeTab, setActiveTab] = useState<"users" | "guests" | "subscribers">("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEntity, setSelectedEntity] = useState<{ type: "user" | "guest" | "subscriber"; data: any } | null>(null);

  // Reset page when tab or search changes
  const handleTabChange = (tab: "users" | "guests" | "subscribers") => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchTerm("");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    const data = activeTab === "subscribers" ? subscribers : (activeTab === "guests" ? guests : users);
    if (!searchTerm) return data;
    
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter(item => {
      if (activeTab === "subscribers") {
        return item.email?.toLowerCase().includes(lowerSearch);
      } else if (activeTab === "guests") {
        return item.guestId?.toLowerCase().includes(lowerSearch);
      } else {
        return item.name?.toLowerCase().includes(lowerSearch) || 
               item.email?.toLowerCase().includes(lowerSearch) ||
               item.phone?.toLowerCase().includes(lowerSearch);
      }
    });
  }, [activeTab, subscribers, users, guests, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-3">
      {/* Top Bar: Tabs & Search Input */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex overflow-x-auto scrollbar-none w-full sm:w-auto bg-[#101012] p-1 rounded-full border border-white/[0.08]">
          <button
            onClick={() => handleTabChange("users")}
            className={clsx(
              "flex-1 sm:flex-none whitespace-nowrap px-3.5 py-1 text-[11px] font-medium transition-all rounded-full cursor-pointer",
              activeTab === "users" 
                ? "bg-white text-black font-bold shadow-xs" 
                : "text-zinc-400 hover:text-white"
            )}
          >
            Users ({users.length})
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
          <button
            onClick={() => handleTabChange("subscribers")}
            className={clsx(
              "flex-1 sm:flex-none whitespace-nowrap px-3.5 py-1 text-[11px] font-medium transition-all rounded-full cursor-pointer",
              activeTab === "subscribers" 
                ? "bg-white text-black font-bold shadow-xs" 
                : "text-zinc-400 hover:text-white"
            )}
          >
            Subscribers ({subscribers.length})
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={handleSearch}
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

      {/* Clean Interactive List / Rows (Frameless Apple aesthetic) */}
      <div className="divide-y divide-white/[0.04] pt-1">
        {paginatedData.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 text-xs">
            {searchTerm ? "No results found matching your query." : `No ${activeTab} registered yet.`}
          </div>
        ) : (
          paginatedData.map((item: any) => {
            const isUser = activeTab === "users";
            const isGuest = activeTab === "guests";
            const isSub = activeTab === "subscribers";

            return (
              <div
                key={item._id}
                onClick={() => setSelectedEntity({ type: isUser ? "user" : isGuest ? "guest" : "subscriber", data: item })}
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
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-orange-400 font-bold shrink-0 text-xs">
                        {item.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )
                  )}

                  {isGuest && (
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400 font-bold shrink-0 text-xs font-mono">
                      G
                    </div>
                  )}

                  {isSub && (
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-zinc-100 text-xs sm:text-sm truncate group-hover:text-orange-300 transition-colors leading-tight">
                        {isUser ? item.name : isGuest ? `Guest ${item.guestId?.slice(0, 10)}...` : item.email}
                      </p>
                      {isUser && item.profileCompleted && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Profile completed" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10.5px] text-zinc-500 mt-0.5 truncate">
                      {isUser && <span className="truncate text-zinc-400">{item.email}</span>}
                      {isGuest && <span className="font-mono text-zinc-400 truncate">ID: {item.guestId}</span>}
                      {isSub && (
                        <span className="text-zinc-400">Subscribed {new Date(item.subscribedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Quick Micro Stats & Chevron */}
                <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
                  {isUser && (
                    <div className="hidden sm:flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-amber-500/10 text-amber-300 border-amber-500/20 font-mono">
                        🪙 {item.xp || 0}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-orange-500/10 text-orange-300 border-orange-500/20 font-mono">
                        🔥 {item.currentStreak || 0}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-violet-500/10 text-violet-300 border-violet-500/20 font-mono">
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

                  {isSub && (
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border bg-teal-500/10 text-teal-300 border-teal-500/20 uppercase">
                      Newsletter
                    </span>
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
        <div className="flex items-center justify-between pt-3 px-1">
          <span className="text-[11px] text-zinc-500">
            Showing <span className="text-zinc-300 font-mono font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
            <span className="text-zinc-300 font-mono font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)}</span> of{" "}
            <span className="text-zinc-300 font-mono font-medium">{filteredData.length}</span> results
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center px-3 py-1 bg-black/40 border border-white/[0.08] rounded-full text-[11px] text-zinc-300 font-medium font-mono">
              {currentPage} / {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
                    <div className="w-12 h-12 rounded-[14px] bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold shrink-0 text-base shadow-md">
                      {selectedEntity.data.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )
                )}

                {selectedEntity.type === "guest" && (
                  <div className="w-12 h-12 rounded-[14px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300 font-bold shrink-0 text-lg font-mono shadow-md">
                    G
                  </div>
                )}

                {selectedEntity.type === "subscriber" && (
                  <div className="w-12 h-12 rounded-[14px] bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold shrink-0 text-lg shadow-md">
                    <Mail className="w-5 h-5" />
                  </div>
                )}

                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-semibold text-white tracking-tight truncate leading-tight">
                    {selectedEntity.type === "user" 
                      ? selectedEntity.data.name 
                      : selectedEntity.type === "guest" 
                        ? `Guest Session` 
                        : selectedEntity.data.email}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400 truncate">
                    <span className="text-orange-400 font-medium capitalize">
                      {selectedEntity.type === "user" ? "Registered Player" : selectedEntity.type === "guest" ? "Anonymous Guest" : "Email Subscriber"}
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

                    <div className="flex flex-col items-center justify-center py-2.5 px-2 rounded-[14px] border border-orange-500/20 bg-orange-500/[0.06]">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-orange-300">
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
                              <span key={slug} className="px-2 py-0.5 bg-orange-500/10 text-orange-300 border border-orange-500/20 rounded-full text-[10px] font-mono">
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

              {/* Subscriber Specific Details */}
              {selectedEntity.type === "subscriber" && (
                <div className="p-3.5 rounded-[16px] bg-white/[0.02] border border-white/[0.06] space-y-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-zinc-500 text-[10.5px] uppercase tracking-wider font-semibold">Subscriber Email</span>
                    <p className="text-white font-medium text-sm break-all">{selectedEntity.data.email}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/[0.04]">
                    <div className="space-y-1">
                      <span className="text-zinc-500 text-[10.5px] uppercase tracking-wider font-semibold">Subscription Date</span>
                      <p className="text-zinc-300 font-medium text-[11px]">
                        {selectedEntity.data.subscribedAt ? new Date(selectedEntity.data.subscribedAt).toLocaleString() : "Recently"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-zinc-500 text-[10.5px] uppercase tracking-wider font-semibold">Channel</span>
                      <p className="text-teal-400 font-semibold text-[11px] uppercase">Email Newsletter</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
