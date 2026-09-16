"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Loader2, CheckCircle2, Circle, MessageSquareWarning, Search, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

interface FeedbackData {
  _id: string;
  gameSlug: string;
  userEmail: string;
  message: string;
  status: "pending" | "resolved";
  createdAt: string;
}

const ITEMS_PER_PAGE = 25;

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  async function fetchFeedbacks() {
    try {
      const { data } = await axios.get('/api/admin/feedback');
      setFeedbacks(data);
    } catch (error) {
      console.error("Failed to fetch feedbacks", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === "pending" ? "resolved" : "pending";
    try {
      await axios.patch(`/api/admin/feedback/${id}`, { status: newStatus });
      setFeedbacks(feedbacks.map(f => f._id === id ? { ...f, status: newStatus } : f));
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Error updating status");
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return feedbacks;
    
    const lowerSearch = searchTerm.toLowerCase();
    return feedbacks.filter(item => 
      item.userEmail?.toLowerCase().includes(lowerSearch) ||
      item.gameSlug?.toLowerCase().includes(lowerSearch) ||
      item.message?.toLowerCase().includes(lowerSearch)
    );
  }, [feedbacks, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3.5 max-w-[1400px] mx-auto">
      {/* Compact Header & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[7px] bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
            <MessageSquareWarning className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            User Feedback
          </h1>
          <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
            {feedbacks.length}
          </span>
        </div>

        {/* Compact Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full bg-[#101012] border border-white/[0.08] rounded-full pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/[0.2] transition-colors"
          />
        </div>
      </div>

      {/* Main Table / Cards Container */}
      <div className="border border-white/[0.08] rounded-[18px] overflow-hidden">
        
        {/* Mobile View (Compact Cards) */}
        <div className="block sm:hidden divide-y divide-white/[0.05]">
          {paginatedData.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs font-medium">
              {searchTerm ? "No results found matching your search." : "No feedback received yet."}
            </div>
          ) : (
            paginatedData.map((item) => (
              <div
                key={item._id}
                className={clsx(
                  "p-3 space-y-1.5 transition-colors",
                  item.status === 'resolved' ? 'opacity-60 bg-white/[0.01]' : 'hover:bg-white/[0.02]'
                )}
              >
                <div className="flex justify-between items-center gap-2">
                  <span className="font-semibold text-white text-xs truncate max-w-[180px]">
                    {item.userEmail || "Anonymous"}
                  </span>
                  <button 
                    onClick={() => toggleStatus(item._id, item.status)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all border cursor-pointer ${
                      item.status === 'resolved' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                    }`}
                  >
                    {item.status === 'resolved' ? (
                      <><CheckCircle2 className="w-3 h-3" /> Resolved</>
                    ) : (
                      <><Circle className="w-3 h-3" /> Pending</>
                    )}
                  </button>
                </div>
                {item.gameSlug && (
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
                    {item.gameSlug}
                  </span>
                )}
                <p className="text-xs text-zinc-300 leading-snug whitespace-pre-wrap">{item.message}</p>
                <div className="text-[9.5px] text-zinc-500 font-mono">
                  {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View (Compact Table) */}
        <div className="hidden sm:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[550px]">
            <thead>
              <tr className="bg-[#101012] border-b border-white/[0.06] text-zinc-500 text-[9.5px] font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3.5">User</th>
                <th className="py-2.5 px-3.5">Game</th>
                <th className="py-2.5 px-3.5 w-1/2">Message</th>
                <th className="py-2.5 px-3.5 text-center">Date</th>
                <th className="py-2.5 px-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] text-xs">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-zinc-500 font-medium text-xs">
                    {searchTerm ? "No results found matching your search." : "No feedback received yet."}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr
                    key={item._id}
                    className={clsx(
                      "transition-colors hover:bg-white/[0.02]",
                      item.status === 'resolved' ? 'opacity-60' : ''
                    )}
                  >
                    <td className="py-2 px-3.5 text-white font-medium text-xs whitespace-nowrap">
                      {item.userEmail || "Anonymous"}
                    </td>
                    <td className="py-2 px-3.5 whitespace-nowrap">
                      {item.gameSlug ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
                          {item.gameSlug}
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-[10px]">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3.5">
                      <p className="text-zinc-300 font-normal text-xs whitespace-pre-wrap leading-snug">{item.message}</p>
                    </td>
                    <td className="py-2 px-3.5 text-center text-zinc-400 whitespace-nowrap text-[10px] font-mono">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3.5 text-right whitespace-nowrap">
                      <button 
                        onClick={() => toggleStatus(item._id, item.status)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all border cursor-pointer active:scale-95 ${
                          item.status === 'resolved' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                            : 'bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20'
                        }`}
                      >
                        {item.status === 'resolved' ? (
                          <><CheckCircle2 className="w-3 h-3" /> Resolved</>
                        ) : (
                          <><Circle className="w-3 h-3" /> Pending</>
                        )}
                      </button>
                    </td>
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
              Showing <span className="text-zinc-300 font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-zinc-300 font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)}</span> of <span className="text-zinc-300 font-medium">{filteredData.length}</span>
            </span>
            <span className="text-[11px] text-zinc-500 sm:hidden">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                aria-label="Previous page"
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
                aria-label="Next page"
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
