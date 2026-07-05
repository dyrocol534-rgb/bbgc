"use client";

import { useState, useMemo } from "react";
import clsx from "clsx";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface UsersTabsProps {
  users: any[];
  subscribers: any[];
}

const ITEMS_PER_PAGE = 10;

export default function UsersTabs({ users, subscribers }: UsersTabsProps) {
  const [activeTab, setActiveTab] = useState<"subscribers" | "users">("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when tab or search changes
  const handleTabChange = (tab: "subscribers" | "users") => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchTerm("");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    const data = activeTab === "subscribers" ? subscribers : users;
    if (!searchTerm) return data;
    
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter(item => {
      if (activeTab === "subscribers") {
        return item.email?.toLowerCase().includes(lowerSearch);
      } else {
        return item.name?.toLowerCase().includes(lowerSearch) || 
               item.email?.toLowerCase().includes(lowerSearch);
      }
    });
  }, [activeTab, subscribers, users, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      {/* Header: Search on top on mobile, side-by-side on desktop */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main pb-2 sm:pb-0">
        <div className="flex overflow-x-auto custom-scrollbar pb-2 sm:pb-0 w-full sm:w-auto">
          <button
            onClick={() => handleTabChange("users")}
            className={clsx(
              "flex-1 sm:flex-none whitespace-nowrap px-4 sm:px-6 py-3 text-sm font-medium transition-colors border-b-2 text-center",
              activeTab === "users" 
                ? "border-primary text-primary" 
                : "border-transparent text-zinc-400 hover:text-white"
            )}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => handleTabChange("subscribers")}
            className={clsx(
              "flex-1 sm:flex-none whitespace-nowrap px-4 sm:px-6 py-3 text-sm font-medium transition-colors border-b-2 text-center",
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
            className="w-full sm:w-64 bg-background border border-border-main rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>
      </div>

      <div className="bg-surface border border-border-main rounded-xl overflow-hidden animate-in fade-in duration-300 shadow-xl">
        
        {/* Mobile View (Cards) */}
        <div className="block sm:hidden divide-y divide-border-main">
          {paginatedData.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              {searchTerm ? "No results found." : `No ${activeTab} found.`}
            </div>
          ) : (
            paginatedData.map((item: any) => (
              <div key={item._id} className="p-4 space-y-3 hover:bg-background/50 transition-colors">
                {activeTab === "users" && (
                  <div className="flex items-center gap-3">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                        {item.name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div>
                      <div className="text-white font-medium">{item.name}</div>
                      <div className="text-xs text-zinc-400">Joined: {new Date(item.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}
                
                <div className={clsx("flex flex-col gap-1", activeTab === "users" && "pl-13")}>
                  <div className="text-sm text-zinc-300 break-all">{item.email}</div>
                  {activeTab === "users" && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">🪙 {item.xp || 0} XP</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">🔥 {item.currentStreak || 0} Streak</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">⏱️ {Math.floor((item.playtimeSeconds || 0)/60)}m play</span>
                      {item.phone && <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">📱 {item.phone}</span>}
                      {item.referralCode && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">Ref: {item.referralCode}</span>}
                    </div>
                  )}
                  {activeTab === "subscribers" && (
                    <div className="text-xs text-zinc-400">
                      Subscribed: {new Date(item.subscribedAt).toLocaleDateString()}
                    </div>
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
              <tr className="bg-zinc-900/50 border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wider">
                {activeTab === "users" && <th className="px-3 py-2 font-medium w-1/4">Name</th>}
                <th className="px-3 py-2 font-medium w-1/3">Email Address</th>
                <th className="px-3 py-2 font-medium">{activeTab === "users" ? "Joined Date" : "Subscribed Date"}</th>
                {activeTab === "users" && <th className="px-3 py-2 font-medium">Gamification</th>}
                {activeTab === "users" && <th className="px-3 py-2 font-medium">Last Login</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-sm">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === "users" ? 3 : 2} className="p-12 text-center text-zinc-500">
                    {searchTerm ? "No results found matching your search." : `No ${activeTab} found.`}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item: any) => (
                  <tr key={item._id} className="hover:bg-zinc-800/30 transition-colors">
                    {activeTab === "users" && (
                      <td className="px-3 py-2 text-zinc-200 font-medium text-xs">
                        <div className="flex items-center gap-2">
                          {item.image ? (
                            <Image src={item.image} alt={item.name} width={24} height={24} className="w-6 h-6 rounded-full object-cover" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0 text-[10px]">
                              {item.name?.charAt(0) || '?'}
                            </div>
                          )}
                          <span className="truncate">{item.name}</span>
                        </div>
                      </td>
                    )}
                    <td className={clsx("px-3 py-2 text-xs", activeTab === "subscribers" ? "text-zinc-200" : "text-zinc-400")}>
                      {item.email}
                    </td>
                    <td className="px-3 py-2 text-zinc-400 whitespace-nowrap text-xs">
                      {new Date(activeTab === "users" ? item.createdAt : item.subscribedAt).toLocaleDateString()}
                    </td>
                    {activeTab === "users" && (
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">🪙 {item.xp || 0} XP</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">🔥 {item.currentStreak || 0}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">⏱️ {Math.floor((item.playtimeSeconds || 0)/60)}m</span>
                          {item.phone && <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">📱 {item.phone}</span>}
                          {item.referralCode && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">Ref: {item.referralCode}</span>}
                        </div>
                      </td>
                    )}
                    {activeTab === "users" && (
                      <td className="px-3 py-2 text-zinc-400 whitespace-nowrap text-xs">
                        {item.lastActiveAt ? new Date(item.lastActiveAt).toLocaleString() : 'Never'}
                        <span className="ml-2 text-[9px] text-zinc-600">(IP not logged)</span>
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
          <div className="flex items-center justify-between border-t border-border-main px-4 py-3 bg-background/50">
            <span className="text-sm text-zinc-400 hidden sm:inline">
              Showing <span className="font-medium text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium text-white">{Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)}</span> of <span className="font-medium text-white">{filteredData.length}</span> results
            </span>
            <span className="text-sm text-zinc-400 sm:hidden">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-surface disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-zinc-300 font-medium px-2 hidden sm:inline">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-surface disabled:opacity-50 disabled:pointer-events-none transition-colors"
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
