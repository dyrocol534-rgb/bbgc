"use client";

import { useState, useMemo } from "react";
import clsx from "clsx";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface UsersTabsProps {
  users: any[];
  subscribers: any[];
  guests: any[];
}

const ITEMS_PER_PAGE = 25;

export default function UsersTabs({ users, subscribers, guests }: UsersTabsProps) {
  const [activeTab, setActiveTab] = useState<"subscribers" | "users" | "guests">("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when tab or search changes
  const handleTabChange = (tab: "subscribers" | "users" | "guests") => {
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
               item.email?.toLowerCase().includes(lowerSearch);
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
      {/* Header: Search and Tabs directly on page without extra outer card */}
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
            className="w-full sm:w-64 bg-[#101012] border border-white/[0.08] rounded-full pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/[0.2] transition-colors"
          />
        </div>
      </div>

      <div className="border border-white/[0.08] rounded-[18px] overflow-hidden">
        
        {/* Mobile View (Cards) */}
        <div className="block sm:hidden divide-y divide-white/[0.05]">
          {paginatedData.length === 0 ? (
            <div className="p-6 text-center text-zinc-500 text-xs font-medium">
              {searchTerm ? "No results found." : `No ${activeTab} found.`}
            </div>
          ) : (
            paginatedData.map((item: any) => (
              <div key={item._id} className="p-3 space-y-1.5 hover:bg-white/[0.02] transition-colors">
                {activeTab === "users" && (
                  <div className="flex items-center gap-2.5">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} width={30} height={30} className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/[0.1]" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-orange-500/15 flex items-center justify-center text-orange-400 font-bold shrink-0 text-xs border border-orange-500/30">
                        {item.name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-zinc-200 font-semibold text-xs truncate">{item.name}</div>
                      <div className="text-[9.5px] text-zinc-500">Joined: {new Date(item.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}
                {activeTab === "guests" && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-zinc-400 font-bold shrink-0 text-xs">
                      G
                    </div>
                    <div className="min-w-0">
                      <div className="text-zinc-200 font-semibold text-xs truncate">{item.guestId?.slice(0, 12)}...</div>
                      <div className="text-[9.5px] text-zinc-500">First Visit: {new Date(item.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}
                
                <div className={clsx("flex flex-col gap-1", (activeTab === "users" || activeTab === "guests") && "pl-9")}>
                  {activeTab === "users" && <div className="text-[11px] font-medium text-zinc-400 break-all">{item.email}</div>}
                  {activeTab === "users" && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border bg-amber-500/10 text-amber-400 border-amber-500/20 whitespace-nowrap">🪙 {item.xp || 0} XP</span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border bg-orange-500/10 text-orange-400 border-orange-500/20 whitespace-nowrap">🔥 {item.currentStreak || 0}</span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border bg-violet-500/10 text-violet-400 border-violet-500/20 whitespace-nowrap">⏱️ {Math.floor((item.playtimeSeconds || 0)/60)}m</span>
                      {item.phone && <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 whitespace-nowrap">📱 {item.phone}</span>}
                    </div>
                  )}
                  {activeTab === "guests" && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border bg-violet-500/10 text-violet-400 border-violet-500/20 whitespace-nowrap">⏱️ {Math.floor((item.playtimeSeconds || 0)/60)}m play</span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border bg-sky-500/10 text-sky-400 border-sky-500/20 whitespace-nowrap">🎮 {item.gamesPlayedCount || 0} plays</span>
                    </div>
                  )}
                  {activeTab === "subscribers" && (
                    <>
                      <div className="text-xs font-semibold text-zinc-200 break-all">{item.email}</div>
                      <div className="text-[9.5px] text-zinc-500">
                        Subscribed: {new Date(item.subscribedAt).toLocaleDateString()}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden sm:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#101012] border-b border-white/[0.06] text-zinc-500 text-[9.5px] font-bold uppercase tracking-wider">
                {activeTab === "users" && <th className="px-3.5 py-2.5 w-4/12">User</th>}
                {activeTab === "guests" && <th className="px-3.5 py-2.5 w-2/12">Guest ID</th>}
                {activeTab === "subscribers" && <th className="px-3.5 py-2.5 w-3/12">Email Address</th>}
                <th className="px-3.5 py-2.5 w-2/12">{activeTab === "subscribers" ? "Subscribed Date" : (activeTab === "guests" ? "First Visit" : "Joined Date")}</th>
                {(activeTab === "users" || activeTab === "guests") && <th className="px-3.5 py-2.5 w-3/12">Stats</th>}
                {(activeTab === "users" || activeTab === "guests") && <th className="px-3.5 py-2.5 w-2/12">Last Active</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] text-xs">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === "subscribers" ? 2 : 4} className="p-8 text-center text-zinc-500 text-xs">
                    {searchTerm ? "No results found matching your search." : `No ${activeTab} found.`}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item: any) => (
                  <tr key={item._id} className="hover:bg-white/[0.02] transition-colors">
                    {activeTab === "users" && (
                      <td className="px-3.5 py-2">
                        <div className="flex items-center gap-2.5">
                          {item.image ? (
                            <Image src={item.image} alt={item.name} width={26} height={26} className="w-6.5 h-6.5 rounded-full object-cover shrink-0 border border-white/[0.1]" />
                          ) : (
                            <div className="w-6.5 h-6.5 rounded-full bg-orange-500/15 flex items-center justify-center text-orange-400 font-bold shrink-0 text-[10px] border border-orange-500/30">
                              {item.name?.charAt(0) || '?'}
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-xs text-zinc-200 truncate max-w-[150px] lg:max-w-[200px]" title={item.name}>{item.name}</span>
                            <span className="text-[10px] text-zinc-500 truncate max-w-[150px] lg:max-w-[200px]" title={item.email}>{item.email}</span>
                            {item.phone && <span className="text-[9.5px] font-medium text-emerald-400/80 truncate max-w-[150px] lg:max-w-[200px]" title={item.phone}>📱 {item.phone}</span>}
                          </div>
                        </div>
                      </td>
                    )}
                    {activeTab === "guests" && (
                      <td className="px-3.5 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-zinc-400 font-bold shrink-0 text-[10px]">
                            G
                          </div>
                          <span className="font-semibold text-xs text-zinc-200 truncate max-w-[120px]" title={item.guestId}>{item.guestId?.slice(0, 16)}...</span>
                        </div>
                      </td>
                    )}
                    {activeTab === "subscribers" && (
                      <td className="px-3.5 py-2 text-zinc-200 font-semibold text-xs truncate max-w-[150px] lg:max-w-[200px]" title={item.email}>
                        {item.email}
                      </td>
                    )}
                    <td className="px-3.5 py-2 text-zinc-400 text-[10px] font-mono whitespace-nowrap">
                      {new Date(activeTab === "subscribers" ? item.subscribedAt : item.createdAt).toLocaleDateString() + ' ' + new Date(activeTab === "subscribers" ? item.subscribedAt : item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    {(activeTab === "users" || activeTab === "guests") && (
                      <td className="px-3.5 py-1.5">
                        <div className="flex flex-wrap gap-1 max-w-[240px]">
                          {activeTab === "users" && (
                            <>
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border bg-amber-500/10 text-amber-400 border-amber-500/20 flex-shrink-0">🪙 {item.xp || 0} XP</span>
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border bg-orange-500/10 text-orange-400 border-orange-500/20 flex-shrink-0">🔥 {item.currentStreak || 0}</span>
                            </>
                          )}
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border bg-violet-500/10 text-violet-400 border-violet-500/20 flex-shrink-0">⏱️ {Math.floor((item.playtimeSeconds || 0)/60)}m</span>
                          {activeTab === "guests" && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border bg-sky-500/10 text-sky-400 border-sky-500/20 flex-shrink-0">🎮 {item.gamesPlayedCount || 0} plays</span>
                          )}
                        </div>
                      </td>
                    )}
                    {(activeTab === "users" || activeTab === "guests") && (
                      <td className="px-3.5 py-2 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-zinc-400 font-mono">{item.lastActiveAt ? new Date(item.lastActiveAt).toLocaleDateString() + ' ' + new Date(item.lastActiveAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Never'}</span>
                          <span className="text-[9px] text-zinc-600">{item.lastIp ? item.lastIp : '(IP not logged)'}</span>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/[0.06] px-3.5 py-2 bg-[#101012]">
            <span className="text-[11px] text-zinc-500 hidden sm:inline">
              Showing <span className="text-zinc-300 font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-zinc-300 font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)}</span> of <span className="text-zinc-300 font-medium">{filteredData.length}</span> results
            </span>
            <span className="text-[11px] text-zinc-500 sm:hidden">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-zinc-300 font-medium px-1.5 hidden sm:inline">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
