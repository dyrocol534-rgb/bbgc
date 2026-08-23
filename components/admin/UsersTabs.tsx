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
    <div className="space-y-4">
      {/* Header: Search on top on mobile, side-by-side on desktop */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 bg-[#0c0c0e] p-4 rounded-xl border border-[#1f1f22] shadow-lg shadow-black/40 mb-6">
        <div className="flex overflow-x-auto custom-scrollbar w-full sm:w-auto bg-[#121214] p-1 rounded-lg border border-[#1f1f22]">
          <button
            onClick={() => handleTabChange("users")}
            className={clsx(
              "flex-1 sm:flex-none whitespace-nowrap px-4 sm:px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-md",
              activeTab === "users" 
                ? "bg-indigo-600 text-white shadow-md" 
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => handleTabChange("guests")}
            className={clsx(
              "flex-1 sm:flex-none whitespace-nowrap px-4 sm:px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-md",
              activeTab === "guests" 
                ? "bg-indigo-600 text-white shadow-md" 
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Guests ({guests.length})
          </button>
          <button
            onClick={() => handleTabChange("subscribers")}
            className={clsx(
              "flex-1 sm:flex-none whitespace-nowrap px-4 sm:px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-md",
              activeTab === "subscribers" 
                ? "bg-indigo-600 text-white shadow-md" 
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Subscribers ({subscribers.length})
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-zinc-500" />
          </div>
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={handleSearch}
            className="w-full sm:w-64 bg-[#121214] border border-[#1f1f22] rounded-lg pl-10 pr-4 py-2.5 text-sm font-medium text-white focus:outline-none focus:border-[#333339] focus:ring-1 focus:ring-[#333339] transition-colors shadow-inner"
          />
        </div>
      </div>

      <div className="bg-[#0c0c0e] border border-[#1f1f22] rounded-xl overflow-hidden animate-in fade-in duration-300 shadow-lg shadow-black/40">
        
        {/* Mobile View (Cards) */}
        <div className="block sm:hidden divide-y divide-[#1f1f22]">
          {paginatedData.length === 0 ? (
            <div className="p-6 text-center text-zinc-500 text-sm font-bold">
              {searchTerm ? "No results found." : `No ${activeTab} found.`}
            </div>
          ) : (
            paginatedData.map((item: any) => (
              <div key={item._id} className="p-4 space-y-2 hover:bg-[#121214] transition-colors">
                {activeTab === "users" && (
                  <div className="flex items-center gap-3">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} width={36} height={36} className="w-9 h-9 rounded-full object-cover shadow-sm border border-[#333339]" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0 text-sm shadow-[0_0_10px_rgba(99,102,241,0.2)] border border-indigo-500/30">
                        {item.name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-zinc-200 font-bold text-sm truncate">{item.name}</div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Joined: {new Date(item.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}
                {activeTab === "guests" && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1f1f22] flex items-center justify-center text-zinc-400 font-bold shrink-0 text-sm shadow-sm">
                      G
                    </div>
                    <div className="min-w-0">
                      <div className="text-zinc-200 font-bold text-sm truncate">{item.guestId?.slice(0, 12)}...</div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">First Visit: {new Date(item.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}
                
                <div className={clsx("flex flex-col gap-1.5", (activeTab === "users" || activeTab === "guests") && "pl-12")}>
                  {activeTab === "users" && <div className="text-xs font-medium text-zinc-400 break-all">{item.email}</div>}
                  {activeTab === "users" && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-amber-500/10 text-amber-400 border-amber-500/20 whitespace-nowrap shadow-sm">🪙 {item.xp || 0} XP</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-orange-500/10 text-orange-400 border-orange-500/20 whitespace-nowrap shadow-sm">🔥 {item.currentStreak || 0}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-indigo-500/10 text-indigo-400 border-indigo-500/20 whitespace-nowrap shadow-sm">⏱️ {Math.floor((item.playtimeSeconds || 0)/60)}m</span>
                      {item.phone && <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-green-500/10 text-green-400 border-green-500/20 whitespace-nowrap shadow-sm">📱 {item.phone}</span>}
                    </div>
                  )}
                  {activeTab === "guests" && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-indigo-500/10 text-indigo-400 border-indigo-500/20 whitespace-nowrap shadow-sm">⏱️ {Math.floor((item.playtimeSeconds || 0)/60)}m play</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-cyan-500/10 text-cyan-400 border-cyan-500/20 whitespace-nowrap shadow-sm">🎮 {item.gamesPlayedCount || 0} plays</span>
                    </div>
                  )}
                  {activeTab === "subscribers" && (
                    <>
                      <div className="text-xs font-bold text-zinc-200 break-all">{item.email}</div>
                      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
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
              <tr className="bg-[#121214] border-b border-[#1f1f22] text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                {activeTab === "users" && <th className="px-4 py-3 w-4/12">User</th>}
                {activeTab === "guests" && <th className="px-4 py-3 w-2/12">Guest ID</th>}
                {activeTab === "subscribers" && <th className="px-4 py-3 w-3/12">Email Address</th>}
                <th className="px-4 py-3 w-2/12">{activeTab === "subscribers" ? "Subscribed Date" : (activeTab === "guests" ? "First Visit" : "Joined Date")}</th>
                {(activeTab === "users" || activeTab === "guests") && <th className="px-4 py-3 w-3/12">Stats</th>}
                {(activeTab === "users" || activeTab === "guests") && <th className="px-4 py-3 w-2/12">Last Active</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f22] text-sm">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === "subscribers" ? 2 : 4} className="p-12 text-center text-zinc-500 font-bold text-sm">
                    {searchTerm ? "No results found matching your search." : `No ${activeTab} found.`}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item: any) => (
                  <tr key={item._id} className="hover:bg-[#121214] transition-colors">
                    {activeTab === "users" && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <Image src={item.image} alt={item.name} width={28} height={28} className="w-7 h-7 rounded-full object-cover shrink-0 shadow-sm border border-[#333339]" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0 text-[10px] shadow-[0_0_8px_rgba(99,102,241,0.2)] border border-indigo-500/30">
                              {item.name?.charAt(0) || '?'}
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-xs text-zinc-200 truncate max-w-[150px] lg:max-w-[200px]" title={item.name}>{item.name}</span>
                            <span className="text-[10px] font-medium text-zinc-500 truncate max-w-[150px] lg:max-w-[200px]" title={item.email}>{item.email}</span>
                            {item.phone && <span className="text-[10px] font-bold text-green-400/80 truncate max-w-[150px] lg:max-w-[200px]" title={item.phone}>📱 {item.phone}</span>}
                          </div>
                        </div>
                      </td>
                    )}
                    {activeTab === "guests" && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#1f1f22] flex items-center justify-center text-zinc-400 font-bold shrink-0 text-[10px] shadow-sm">
                            G
                          </div>
                          <span className="font-bold text-xs text-zinc-200 truncate max-w-[120px]" title={item.guestId}>{item.guestId?.slice(0, 16)}...</span>
                        </div>
                      </td>
                    )}
                    {activeTab === "subscribers" && (
                      <td className="px-4 py-3 text-zinc-200 font-bold text-xs truncate max-w-[150px] lg:max-w-[200px]" title={item.email}>
                        {item.email}
                      </td>
                    )}
                    <td className="px-4 py-3 text-zinc-400 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                      {new Date(activeTab === "subscribers" ? item.subscribedAt : item.createdAt).toLocaleDateString() + ' ' + new Date(activeTab === "subscribers" ? item.subscribedAt : item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    {(activeTab === "users" || activeTab === "guests") && (
                      <td className="px-4 py-2">
                        <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                          {activeTab === "users" && (
                            <>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-amber-500/10 text-amber-400 border-amber-500/20 flex-shrink-0 shadow-sm">🪙 {item.xp || 0} XP</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-orange-500/10 text-orange-400 border-orange-500/20 flex-shrink-0 shadow-sm">🔥 {item.currentStreak || 0}</span>
                            </>
                          )}
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-indigo-500/10 text-indigo-400 border-indigo-500/20 flex-shrink-0 shadow-sm">⏱️ {Math.floor((item.playtimeSeconds || 0)/60)}m</span>
                          {activeTab === "guests" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-cyan-500/10 text-cyan-400 border-cyan-500/20 flex-shrink-0 shadow-sm">🎮 {item.gamesPlayedCount || 0} plays</span>
                          )}
                        </div>
                      </td>
                    )}
                    {(activeTab === "users" || activeTab === "guests") && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{item.lastActiveAt ? new Date(item.lastActiveAt).toLocaleDateString() + ' ' + new Date(item.lastActiveAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Never'}</span>
                          <span className="text-[9px] font-medium text-zinc-600">{item.lastIp ? item.lastIp : '(IP not logged)'}</span>
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
          <div className="flex items-center justify-between border-t border-[#1f1f22] px-4 py-3 bg-[#121214]">
            <span className="text-xs font-bold text-zinc-500 hidden sm:inline uppercase tracking-wider">
              Showing <span className="text-zinc-300">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-zinc-300">{Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)}</span> of <span className="text-zinc-300">{filteredData.length}</span> results
            </span>
            <span className="text-xs font-bold text-zinc-500 sm:hidden uppercase tracking-wider">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-[#1a1a1f] disabled:opacity-50 disabled:pointer-events-none transition-colors border border-transparent hover:border-[#333339] shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs text-zinc-400 font-bold px-2 hidden sm:inline">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-[#1a1a1f] disabled:opacity-50 disabled:pointer-events-none transition-colors border border-transparent hover:border-[#333339] shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
