"use client";

import { useState, useMemo } from "react";
import {
  Mail,
  Search,
  Copy,
  Check,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  TrendingUp,
  Users,
  Clock,
  Sparkles,
  Filter,
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

function formatDate(dateValue: any): string {
  if (!dateValue) return "Recently";
  const d = new Date(dateValue);
  return isNaN(d.getTime())
    ? "Recently"
    : d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
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

export default function SubscribersView({ subscribers }: SubscribersViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState<"all" | "24h" | "7d" | "30d">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Time calculations for KPI cards
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  const count24h = useMemo(() => {
    return subscribers.filter((s) => new Date(s.subscribedAt).getTime() >= oneDayAgo).length;
  }, [subscribers, oneDayAgo]);

  const count7d = useMemo(() => {
    return subscribers.filter((s) => new Date(s.subscribedAt).getTime() >= sevenDaysAgo).length;
  }, [subscribers, sevenDaysAgo]);

  const count30d = useMemo(() => {
    return subscribers.filter((s) => new Date(s.subscribedAt).getTime() >= thirtyDaysAgo).length;
  }, [subscribers, thirtyDaysAgo]);

  const filtered = useMemo(() => {
    let list = subscribers;

    // Apply time filter
    if (timeFilter === "24h") {
      list = list.filter((s) => new Date(s.subscribedAt).getTime() >= oneDayAgo);
    } else if (timeFilter === "7d") {
      list = list.filter((s) => new Date(s.subscribedAt).getTime() >= sevenDaysAgo);
    } else if (timeFilter === "30d") {
      list = list.filter((s) => new Date(s.subscribedAt).getTime() >= thirtyDaysAgo);
    }

    // Apply search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter((s) => s.email.toLowerCase().includes(q));
    }

    return list;
  }, [subscribers, searchTerm, timeFilter, oneDayAgo, sevenDaysAgo, thirtyDaysAgo]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCopyAll = () => {
    const emailsToCopy = filtered.map((s) => s.email).join(", ");
    navigator.clipboard.writeText(emailsToCopy);
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
      ...filtered.map((s) => [s.email, new Date(s.subscribedAt).toISOString()]),
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
    <div className="space-y-4 max-w-full">
      {/* ── 1. Header & Actions Strip ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-zinc-950 border border-zinc-900">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-semibold">
              <Mail className="w-3 h-3" />
              <span>Audience Growth</span>
            </span>
            <span className="text-zinc-500 text-xs">
              • {subscribers.length} total subscribers
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
            Newsletter Subscribers
          </h1>
          <p className="text-[11px] sm:text-xs text-zinc-400">
            Manage your email list, export CSV reports, and copy addresses for campaigns.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyAll}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer active:scale-95 shadow-xs"
            title="Copy filtered emails to clipboard"
          >
            {copiedAll ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied ({filtered.length})</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copy Emails ({filtered.length})</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-all cursor-pointer active:scale-95 shadow-sm"
            title="Download CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-black" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── 2. KPI Stat Cards (Responsive: Clean layout without awkward text wrapping) ── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Total Subscribers */}
        <div
          onClick={() => {
            setTimeFilter("all");
            setCurrentPage(1);
          }}
          className={`p-3 sm:p-4 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
            timeFilter === "all"
              ? "bg-teal-500/10 border-teal-500/40 shadow-sm"
              : "bg-zinc-950/80 hover:bg-zinc-900/60 border-zinc-900"
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider truncate">
              Total Audience
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
              <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-lg sm:text-2xl font-black text-white font-mono leading-tight">
              {subscribers.length.toLocaleString()}
            </span>
            <span className="text-[10px] text-teal-400 font-medium hidden sm:inline">All time</span>
          </div>
        </div>

        {/* New 24 Hours */}
        <div
          onClick={() => {
            setTimeFilter("24h");
            setCurrentPage(1);
          }}
          className={`p-3 sm:p-4 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
            timeFilter === "24h"
              ? "bg-emerald-500/10 border-emerald-500/40 shadow-sm"
              : "bg-zinc-950/80 hover:bg-zinc-900/60 border-zinc-900"
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider truncate">
              Past 24 Hours
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-lg sm:text-2xl font-black text-emerald-400 font-mono leading-tight">
              +{count24h.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-500/80 font-medium hidden sm:inline">Recent</span>
          </div>
        </div>

        {/* New 7 Days */}
        <div
          onClick={() => {
            setTimeFilter("7d");
            setCurrentPage(1);
          }}
          className={`p-3 sm:p-4 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
            timeFilter === "7d"
              ? "bg-cyan-500/10 border-cyan-500/40 shadow-sm"
              : "bg-zinc-950/80 hover:bg-zinc-900/60 border-zinc-900"
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider truncate">
              Past 7 Days
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-300 shrink-0">
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-lg sm:text-2xl font-black text-cyan-300 font-mono leading-tight">
              +{count7d.toLocaleString()}
            </span>
            <span className="text-[10px] text-cyan-400/80 font-medium hidden sm:inline">This week</span>
          </div>
        </div>
      </div>

      {/* ── 3. Search Bar & Time Period Filters ── */}
      <div className="bg-zinc-950/90 border border-zinc-900 rounded-xl p-2.5 sm:p-3 space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by email address or domain..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 bg-black border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Showing Count */}
          <div className="flex items-center justify-between sm:justify-end gap-2 text-[11px] font-mono text-zinc-400 px-1 shrink-0">
            <span>
              Showing <b className="text-white">{filtered.length}</b> of {subscribers.length}
            </span>
          </div>
        </div>

        {/* Time Period Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {[
            { id: "all", label: "All Subscribers", count: subscribers.length },
            { id: "24h", label: "Past 24 Hours", count: count24h },
            { id: "7d", label: "Past 7 Days", count: count7d },
            { id: "30d", label: "Past 30 Days", count: count30d },
          ].map((tab) => {
            const isSelected = timeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setTimeFilter(tab.id as any);
                  setCurrentPage(1);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-white text-black shadow-sm font-bold"
                    : "bg-black/60 hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800/80"
                }`}
              >
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

      {/* ── 4. Subscribers Cards Grid (Desktop 2-3 Columns & Mobile Optimized) ── */}
      {paginated.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-500 text-xs">
          <Mail className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-zinc-400 font-semibold mb-1">
            {searchTerm ? "No matching subscribers" : "No subscribers in this period"}
          </p>
          <p className="text-zinc-500 text-[11px]">
            {searchTerm
              ? "Try typing a different email or clear your search."
              : "Try switching to 'All Subscribers' to view the full list."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
          {paginated.map((sub) => {
            const isCopied = copiedId === sub._id;
            const domain = sub.email.includes("@") ? sub.email.split("@")[1] : "";

            return (
              <div
                key={sub._id}
                className="group p-3 sm:p-3.5 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-zinc-800 transition-all hover:shadow-md flex flex-col justify-between gap-2.5"
              >
                {/* Top Row: Icon + Email + Copy Button */}
                <div className="flex items-center justify-between gap-2.5 min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Icon */}
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Mail className="w-4 h-4" />
                    </div>

                    {/* Email */}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white text-xs sm:text-sm truncate group-hover:text-teal-300 transition-colors">
                        {sub.email}
                      </p>
                      {domain && (
                        <span className="text-[10px] text-zinc-500 font-mono">
                          @{domain}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={() => handleCopySingle(sub.email, sub._id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer shrink-0 active:scale-95 shadow-xs"
                    title="Copy this email"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-zinc-400 group-hover:text-zinc-200" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Bottom Row: Exact Date & Time + Relative Time Badge */}
                <div className="pt-2 border-t border-zinc-900/80 flex items-center justify-between gap-2 text-[10px] font-mono text-zinc-500">
                  <div className="flex items-center gap-1.5 truncate">
                    <Clock className="w-3 h-3 text-zinc-600 shrink-0" />
                    <span className="truncate">{formatDate(sub.subscribedAt)} • {formatTime(sub.subscribedAt)}</span>
                  </div>

                  <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 shrink-0">
                    {getRelativeTime(sub.subscribedAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 5. Pagination Bar ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 px-1 border-t border-zinc-900">
          <span className="text-[11px] text-zinc-500 font-mono">
            Showing <b className="text-zinc-300">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</b> -{" "}
            <b className="text-zinc-300">{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</b> of{" "}
            <b className="text-zinc-300">{filtered.length}</b>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="px-2.5 py-1 bg-black border border-zinc-800 rounded-lg text-[11px] text-zinc-300 font-mono font-bold">
              {currentPage} / {totalPages}
            </div>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
