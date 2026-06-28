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

const ITEMS_PER_PAGE = 10;

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
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main pb-2 sm:pb-0">
        <div className="flex pb-2 sm:pb-0">
          <h2 className="px-1 py-3 text-lg font-bold text-zinc-100 flex items-center gap-2">
            <MessageSquareWarning className="w-5 h-5 text-indigo-400" />
            User Feedback ({feedbacks.length})
          </h2>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-auto sm:mb-0 sm:mr-2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-zinc-500" />
          </div>
          <input
            type="text"
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full sm:w-64 bg-background border border-border-main rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>
      </div>
      
      <div className="bg-surface border border-border-main rounded-xl overflow-hidden shadow-xl animate-in fade-in duration-300">
        
        {/* Mobile View (Cards) */}
        <div className="block sm:hidden divide-y divide-border-main">
          {paginatedData.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              {searchTerm ? "No results found matching your search." : "No feedback received yet."}
            </div>
          ) : (
            paginatedData.map((item) => (
              <div key={item._id} className={clsx("p-4 space-y-3 transition-colors", item.status === 'resolved' ? 'opacity-60 bg-background/30' : 'hover:bg-background/50')}>
                <div className="flex justify-between items-start gap-2">
                  <div className="font-medium text-white truncate max-w-[200px]">{item.userEmail}</div>
                  <button 
                    onClick={() => toggleStatus(item._id, item.status)}
                    className={`inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      item.status === 'resolved' 
                        ? 'bg-green-500/10 text-green-400' 
                        : 'bg-orange-500/10 text-orange-400'
                    }`}
                  >
                    {item.status === 'resolved' ? <><CheckCircle2 className="w-3.5 h-3.5" /> Resolved</> : <><Circle className="w-3.5 h-3.5" /> Pending</>}
                  </button>
                </div>
                <div className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-zinc-800 text-zinc-300 font-mono">
                  {item.gameSlug}
                </div>
                <p className="text-sm text-zinc-300 whitespace-pre-wrap">{item.message}</p>
                <div className="text-xs text-zinc-500 pt-1">
                  {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-background border-b border-border-main text-zinc-400 text-sm">
                <th className="py-4 px-6 font-medium">User</th>
                <th className="py-4 px-6 font-medium">Game</th>
                <th className="py-4 px-6 font-medium w-1/2">Message</th>
                <th className="py-4 px-6 font-medium text-center">Date</th>
                <th className="py-4 px-6 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main text-sm">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500">
                    {searchTerm ? "No results found matching your search." : "No feedback received yet."}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr key={item._id} className={clsx("transition-colors hover:bg-background/50", item.status === 'resolved' ? 'opacity-60' : '')}>
                    <td className="py-4 px-6 text-white font-medium">
                      {item.userEmail}
                    </td>
                    <td className="py-4 px-6">
                      <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 text-xs font-mono">
                        {item.gameSlug}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-zinc-300 whitespace-pre-wrap">{item.message}</p>
                    </td>
                    <td className="py-4 px-6 text-center text-zinc-400 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => toggleStatus(item._id, item.status)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          item.status === 'resolved' 
                            ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' 
                            : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'
                        }`}
                      >
                        {item.status === 'resolved' ? <><CheckCircle2 className="w-4 h-4" /> Resolved</> : <><Circle className="w-4 h-4" /> Pending</>}
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
