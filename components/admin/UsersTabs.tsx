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

const ITEMS_PER_PAGE = 10;

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
    <div className="space-y-4">
      {/* Header: Search on top on mobile, side-by-side on desktop */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main pb-2 sm:pb-0">
        <div className="flex overflow-x-auto custom-scrollbar pb-2 sm:pb-0 w-full sm:w-auto">
          <button
            onClick={() => handleTabChange("users")}
            className={clsx(
              "flex-1 sm:flex-none whitespace-nowrap px-4 sm:px-6 py-2 sm:py-3 text-sm font-medium transition-colors border-b-2 text-center",
              activeTab === "users" 
                ? "border-primary text-primary" 
                : "border-transparent text-zinc-400 hover:text-white"
            )}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => handleTabChange("guests")}
            className={clsx(
              "flex-1 sm:flex-none whitespace-nowrap px-4 sm:px-6 py-2 sm:py-3 text-sm font-medium transition-colors border-b-2 text-center",
              activeTab === "guests" 
                ? "border-primary text-primary" 
                : "border-transparent text-zinc-400 hover:text-white"
            )}
          >
            Guests ({guests.length})
          </button>
          <button
            onClick={() => handleTabChange("subscribers")}
            className={clsx(
              "flex-1 sm:flex-none whitespace-nowrap px-4 sm:px-6 py-2 sm:py-3 text-sm font-medium transition-colors border-b-2 text-center",
              activeTab === "subscribers" 
                ? "border-primary text-primary" 
                : "border-transparent text-zinc-400 hover:text-white"
            )}
          >
            Subscribers ({subscribers.length})
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-auto sm:mb-0 sm:mr-2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-zinc-500" />
          </div>
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={handleSearch}
            className="w-full sm:w-56 bg-background border border-border-main rounded-lg pl-9 pr-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>
      </div>

      <div className="bg-surface border border-border-main rounded-xl overflow-hidden animate-in fade-in duration-300 shadow-xl">
        
        {/* Mobile View (Cards) */}
        <div className="block sm:hidden divide-y divide-border-main">
          {paginatedData.length === 0 ? (
            <div className="p-6 text-center text-zinc-500 text-sm">
              {searchTerm ? "No results found." : `No ${activeTab} found.`}
            </div>
          ) : (
            paginatedData.map((item: any) => (
              <div key={item._id} className="p-3 space-y-2 hover:bg-background/50 transition-colors">
                {activeTab === "users" && (
                  <div className="flex items-center gap-2">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0 text-sm">
                        {item.name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-white font-medium text-sm truncate">{item.name}</div>
                      <div className="text-[11px] text-zinc-400 truncate">Joined: {new Date(item.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}
                {activeTab === "guests" && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold shrink-0 text-sm">
                      G
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-medium text-sm truncate">{item.guestId?.slice(0, 12)}...</div>
                      <div className="text-[11px] text-zinc-400 truncate">First Visit: {new Date(item.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}
                
                <div className={clsx("flex flex-col gap-1", (activeTab === "users" || activeTab === "guests") && "pl-10")}>
                  {activeTab === "users" && <div className="text-xs text-zinc-300 break-all">{item.email}</div>}
                  {activeTab === "users" && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 whitespace-nowrap">🪙 {item.xp || 0} XP</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 whitespace-nowrap">🔥 {item.currentStreak || 0}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 whitespace-nowrap">⏱️ {Math.floor((item.playtimeSeconds || 0)/60)}m</span>
                      {item.phone && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 whitespace-nowrap">📱 {item.phone}</span>}
                    </div>
                  )}
                  {activeTab === "guests" && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 whitespace-nowrap">⏱️ {Math.floor((item.playtimeSeconds || 0)/60)}m play</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 whitespace-nowrap">🎮 {item.gamesPlayedCount || 0} plays</span>
                    </div>
                  )}
                  {activeTab === "subscribers" && (
                    <>
                      <div className="text-xs text-zinc-300 break-all">{item.email}</div>
                      <div className="text-[11px] text-zinc-400">
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
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-zinc-900/50 border-b border-zinc-800 text-zinc-400 text-[11px] uppercase tracking-wider">
                {activeTab === "users" && <th className="px-3 py-2 font-medium w-4/12">User</th>}
                {activeTab === "guests" && <th className="px-3 py-2 font-medium w-2/12">Guest ID</th>}
                {activeTab === "subscribers" && <th className="px-3 py-2 font-medium w-3/12">Email Address</th>}
                <th className="px-3 py-2 font-medium w-2/12">{activeTab === "subscribers" ? "Subscribed Date" : (activeTab === "guests" ? "First Visit" : "Joined Date")}</th>
                {(activeTab === "users" || activeTab === "guests") && <th className="px-3 py-2 font-medium w-3/12">Stats</th>}
                {(activeTab === "users" || activeTab === "guests") && <th className="px-3 py-2 font-medium w-2/12">Last Active</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-xs">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === "subscribers" ? 2 : 4} className="p-8 text-center text-zinc-500 text-sm">
                    {searchTerm ? "No results found matching your search." : `No ${activeTab} found.`}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item: any) => (
                  <tr key={item._id} className="hover:bg-zinc-800/30 transition-colors">
                    {activeTab === "users" && (
                      <td className="px-3 py-2 text-zinc-200 font-medium">
                        <div className="flex items-start gap-2">
                          {item.image ? (
                            <Image src={item.image} alt={item.name} width={24} height={24} className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0 text-[10px] mt-0.5">
                              {item.name?.charAt(0) || '?'}
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="truncate max-w-[150px] lg:max-w-[200px]" title={item.name}>{item.name}</span>
                            <span className="text-[10px] text-zinc-400 font-normal truncate max-w-[150px] lg:max-w-[200px]" title={item.email}>{item.email}</span>
                            {item.phone && <span className="text-[10px] text-green-400 font-normal truncate max-w-[150px] lg:max-w-[200px]" title={item.phone}>📱 {item.phone}</span>}
                          </div>
                        </div>
                      </td>
                    )}
                    {activeTab === "guests" && (
                      <td className="px-3 py-2 text-zinc-200 font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-zinc-700/50 flex items-center justify-center text-zinc-400 font-bold shrink-0 text-[9px]">
                            G
                          </div>
                          <span className="truncate max-w-[120px]" title={item.guestId}>{item.guestId?.slice(0, 16)}...</span>
                        </div>
                      </td>
                    )}
                    {activeTab === "subscribers" && (
                      <td className="px-3 py-2 text-zinc-200 truncate max-w-[150px] lg:max-w-[200px]" title={item.email}>
                        {item.email}
                      </td>
                    )}
                    <td className="px-3 py-2 text-zinc-400 whitespace-nowrap">
                      {new Date(activeTab === "subscribers" ? item.subscribedAt : item.createdAt).toLocaleDateString() + ' ' + new Date(activeTab === "subscribers" ? item.subscribedAt : item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    {(activeTab === "users" || activeTab === "guests") && (
                      <td className="px-3 py-1.5">
                        <div className="flex flex-wrap gap-1 max-w-[240px]">
                          {activeTab === "users" && (
                            <>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex-shrink-0">🪙 {item.xp || 0} XP</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 flex-shrink-0">🔥 {item.currentStreak || 0}</span>
                            </>
                          )}
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex-shrink-0">⏱️ {Math.floor((item.playtimeSeconds || 0)/60)}m</span>
                          {activeTab === "guests" && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex-shrink-0">🎮 {item.gamesPlayedCount || 0} plays</span>
                          )}
                        </div>
                      </td>
                    )}
                    {(activeTab === "users" || activeTab === "guests") && (
                      <td className="px-3 py-2 text-zinc-400 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span>{item.lastActiveAt ? new Date(item.lastActiveAt).toLocaleDateString() + ' ' + new Date(item.lastActiveAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Never'}</span>
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
          <div className="flex items-center justify-between border-t border-border-main px-4 py-2 bg-background/50">
            <span className="text-xs text-zinc-400 hidden sm:inline">
              Showing <span className="font-medium text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium text-white">{Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)}</span> of <span className="font-medium text-white">{filteredData.length}</span> results
            </span>
            <span className="text-xs text-zinc-400 sm:hidden">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-surface disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-zinc-300 font-medium px-1.5 hidden sm:inline">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-surface disabled:opacity-50 disabled:pointer-events-none transition-colors"
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
