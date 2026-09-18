"use client";

import { useState, useMemo } from "react";
import { 
  Mail, Search, Copy, Check, Download, 
  ChevronLeft, ChevronRight, X, Calendar, 
  TrendingUp, Users, Clock 
} from "lucide-react";

interface SubscriberItem {
  _id: string;
  email: string;
  subscribedAt: string;
}

interface SubscribersViewProps {
  subscribers: SubscriberItem[];
}

const ITEMS_PER_PAGE = 30;

export default function SubscribersView({ subscribers }: SubscribersViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Time calculations for KPI cards
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  const count24h = useMemo(() => {
    return subscribers.filter((s) => new Date(s.subscribedAt).getTime() >= oneDayAgo).length;
  }, [subscribers, oneDayAgo]);

  const count7d = useMemo(() => {
    return subscribers.filter((s) => new Date(s.subscribedAt).getTime() >= sevenDaysAgo).length;
  }, [subscribers, sevenDaysAgo]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return subscribers;
    const q = searchTerm.toLowerCase().trim();
    return subscribers.filter((s) => s.email.toLowerCase().includes(q));
  }, [subscribers, searchTerm]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCopyAll = () => {
    const emails = subscribers.map((s) => s.email).join(", ");
    navigator.clipboard.writeText(emails);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopySingle = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleExportCSV = () => {
    const rows = [
      ["Email", "Subscribed At"],
      ...subscribers.map((s) => [s.email, new Date(s.subscribedAt).toISOString()]),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3.5">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-white/[0.06]">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Mail className="w-5 h-5 text-teal-400" />
            <span>Newsletter Subscribers</span>
          </h1>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Manage your email subscriber list, copy addresses, and export data.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-medium text-zinc-200 hover:text-white transition-all cursor-pointer active:scale-95"
            title="Copy all emails to clipboard"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
            <span>{copiedAll ? "Copied All!" : "Copy Emails"}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-black font-semibold text-xs transition-all hover:bg-zinc-200 cursor-pointer active:scale-95 shadow-xs"
            title="Download CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Compact Consolidated KPI Strip */}
      <div className="grid grid-cols-3 bg-white/[0.02] border border-white/[0.08] rounded-2xl divide-x divide-white/[0.06] overflow-hidden shadow-xs">
        <div className="p-2.5 sm:px-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Total Subscribers</span>
            <p className="text-lg sm:text-xl font-bold text-white font-mono leading-tight mt-0.5">
              {subscribers.length.toLocaleString()}
            </p>
          </div>
          <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
            <Users className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="p-2.5 sm:px-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">New Past 24h</span>
            <p className="text-lg sm:text-xl font-bold text-emerald-400 font-mono leading-tight mt-0.5">
              +{count24h.toLocaleString()}
            </p>
          </div>
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="p-2.5 sm:px-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">New Past 7d</span>
            <p className="text-lg sm:text-xl font-bold text-teal-300 font-mono leading-tight mt-0.5">
              +{count7d.toLocaleString()}
            </p>
          </div>
          <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-300 shrink-0">
            <Calendar className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Toolbar: Search Input + Results Count */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <input
            type="text"
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#101012] border border-white/[0.08] rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/[0.2] transition-colors"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-500 hover:text-white cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <span className="text-[11px] text-zinc-500 font-mono font-medium shrink-0">
          {filtered.length} {filtered.length === 1 ? "subscriber" : "subscribers"}
        </span>
      </div>

      {/* 2-Column High-Density Subscribers Grid */}
      {paginated.length === 0 ? (
        <div className="py-16 text-center text-zinc-500 text-xs bg-white/[0.01] rounded-2xl border border-white/[0.04]">
          {searchTerm ? "No subscribers match your search." : "No newsletter subscribers yet."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {paginated.map((sub) => {
            const isCopied = copiedId === sub._id;

            return (
              <div
                key={sub._id}
                className="p-2.5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.12] rounded-xl flex items-center justify-between gap-2.5 transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0 group-hover:scale-105 transition-transform">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-200 text-xs truncate group-hover:text-white transition-colors">
                      {sub.email}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-0.5 truncate flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-zinc-500 shrink-0" />
                      <span>{new Date(sub.subscribedAt).toLocaleString()}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopySingle(sub.email, sub._id)}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] text-[10.5px] font-medium text-zinc-400 hover:text-white transition-all cursor-pointer shrink-0 flex items-center gap-1 active:scale-95"
                  title="Copy this email"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 px-1 border-t border-white/[0.04]">
          <span className="text-[11px] text-zinc-500">
            Showing <span className="text-zinc-300 font-mono font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
            <span className="text-zinc-300 font-mono font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</span> of{" "}
            <span className="text-zinc-300 font-mono font-medium">{filtered.length}</span> results
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
    </div>
  );
}
