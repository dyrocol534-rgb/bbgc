"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Coins,
  Search,
  Plus,
  Minus,
  Sliders,
  History,
  User,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Flame,
  Clock,
  ShieldAlert,
  Activity,
  Gift,
  UserPlus,
  Zap,
  Filter,
  Gamepad2,
  LogIn,
} from "lucide-react";

interface IUserXp {
  _id: string;
  name: string;
  email: string;
  image?: string;
  xp: number;
  lifetimeXp: number;
  currentStreak?: number;
  lastActiveAt?: string;
  createdAt: string;
}

interface ITransaction {
  _id: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  type: string;
  description: string;
  balanceAfter: number;
  adminEmail?: string;
  referenceId?: string;
  createdAt: string;
}

interface IActivityLog {
  _id: string;
  type: string;
  category: string;
  title: string;
  description: string;
  userEmail: string;
  userName: string;
  meta: any;
  createdAt: string;
}

export default function AdminXpClient({
  initialUsers,
  initialTransactions,
  initialActivities,
}: {
  initialUsers: IUserXp[];
  initialTransactions: ITransaction[];
  initialActivities: IActivityLog[];
}) {
  const [activeTab, setActiveTab] = useState<"balances" | "transactions" | "activity">("balances");
  const [users, setUsers] = useState<IUserXp[]>(initialUsers);
  const [transactions, setTransactions] = useState<ITransaction[]>(initialTransactions);
  const [activities, setActivities] = useState<IActivityLog[]>(initialActivities);
  const [searchTerm, setSearchTerm] = useState("");
  const [activityFilter, setActivityFilter] = useState<string>("all");

  // Adjustment Modal State
  const [selectedUser, setSelectedUser] = useState<IUserXp | null>(null);
  const [actionType, setActionType] = useState<"add" | "remove" | "set">("add");
  const [amountInput, setAmountInput] = useState<string>("50");
  const [reasonInput, setReasonInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term))
    );
  });

  // Filtered Transactions
  const filteredTransactions = transactions.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      (t.userName && t.userName.toLowerCase().includes(term)) ||
      (t.userEmail && t.userEmail.toLowerCase().includes(term)) ||
      (t.description && t.description.toLowerCase().includes(term))
    );
  });

  // Filtered Activities
  const filteredActivities = activities.filter((act) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      (act.userName && act.userName.toLowerCase().includes(term)) ||
      (act.userEmail && act.userEmail.toLowerCase().includes(term)) ||
      (act.title && act.title.toLowerCase().includes(term)) ||
      (act.description && act.description.toLowerCase().includes(term));

    const matchesFilter =
      activityFilter === "all" ||
      act.type === activityFilter ||
      act.category === activityFilter;

    return matchesSearch && matchesFilter;
  });

  // Open modal
  const openAdjustmentModal = (user: IUserXp, defaultAction: "add" | "remove" | "set" = "add") => {
    setSelectedUser(user);
    setActionType(defaultAction);
    setAmountInput("50");
    setReasonInput("");
    setModalError("");
  };

  // Submit XP adjustment
  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const amount = Number(amountInput);
    if (isNaN(amount) || amount < 0) {
      setModalError("Please enter a valid non-negative number.");
      return;
    }

    setIsSubmitting(true);
    setModalError("");

    try {
      const res = await fetch("/api/admin/xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser._id,
          action: actionType,
          amount,
          reason: reasonInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to adjust XP");

      // Update user in local list
      setUsers((prev) =>
        prev.map((u) =>
          u._id === selectedUser._id
            ? { ...u, xp: data.user.xp, lifetimeXp: data.user.lifetimeXp }
            : u
        )
      );

      // Prepend new transaction
      if (data.transaction) {
        setTransactions((prev) => [data.transaction, ...prev]);

        // Prepend to activity log
        setActivities((prev) => [
          {
            _id: `tx-${data.transaction._id}`,
            type: "xp_transaction",
            category: "admin_adjustment",
            title: `Admin XP Adjustment • ${data.transaction.userName}`,
            description: data.transaction.description,
            userEmail: data.transaction.userEmail,
            userName: data.transaction.userName,
            meta: {
              amount: data.transaction.amount,
              balanceAfter: data.transaction.balanceAfter,
              adminEmail: data.transaction.adminEmail,
            },
            createdAt: data.transaction.createdAt,
          },
          ...prev,
        ]);
      }

      setSelectedUser(null);
    } catch (err: any) {
      setModalError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalXpInCirculation = users.reduce((acc, u) => acc + (u.xp || 0), 0);

  return (
    <div className="space-y-4">
      {/* ── Top Header Strip ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-zinc-950 border border-zinc-900">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold">
              <Coins className="w-3 h-3" />
              <span>Economy Control</span>
            </span>
            <span className="text-zinc-500 text-xs">
              • {totalXpInCirculation.toLocaleString()} XP in circulation
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
            XP Ledger &amp; Activity Log
          </h1>
          <p className="text-[11px] sm:text-xs text-zinc-400">
            Audit player balances, view real-time platform activities, and manually adjust XP.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 rounded-lg bg-black border border-zinc-900 overflow-x-auto">
            <button
              onClick={() => setActiveTab("balances")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                activeTab === "balances"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Balances ({users.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                activeTab === "transactions"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>XP Ledger ({transactions.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                activeTab === "activity"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Activity Log ({activities.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Search Bar & Activity Filter ── */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by player name, email, or activity description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
        </div>

        {activeTab === "activity" && (
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "All Activity" },
              { id: "playtime_milestone", label: "🎮 Playtime (5m/10m+)" },
              { id: "login", label: "🔑 Logins" },
              { id: "signup", label: "🎉 Signups" },
              { id: "reward_claim", label: "🎁 Redemptions" },
              { id: "xp_transaction", label: "⚡ XP Adjustments" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActivityFilter(f.id)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors shrink-0 ${
                  activityFilter === f.id
                    ? "bg-white text-black border-white shadow-sm"
                    : "bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── TAB 1: USER XP BALANCES ── */}
      {activeTab === "balances" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="rounded-xl bg-zinc-950 border border-zinc-900 p-3.5 flex flex-col justify-between gap-3 hover:border-zinc-800 transition-colors"
            >
              <div>
                {/* User avatar & name */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center shrink-0">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <User className="w-4 h-4 text-zinc-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-xs sm:text-sm text-white truncate">
                        {user.name || "Anonymous Player"}
                      </h3>
                      <p className="text-[11px] text-zinc-500 truncate font-mono">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Current Balance */}
                  <div className="text-right shrink-0">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black border border-zinc-800 text-amber-400 font-mono font-bold text-xs">
                      <Coins className="w-3 h-3" />
                      <span>{user.xp || 0} XP</span>
                    </div>
                  </div>
                </div>

                {/* Substats */}
                <div className="mt-3 grid grid-cols-2 gap-2 p-2 rounded-lg bg-black/60 border border-zinc-900 text-[10px] text-zinc-400 font-mono">
                  <div>
                    <span className="text-zinc-600 block">Lifetime XP</span>
                    <span className="text-zinc-300 font-bold">{user.lifetimeXp || 0} XP</span>
                  </div>
                  <div>
                    <span className="text-zinc-600 block">Streak</span>
                    <span className="text-orange-400 font-bold flex items-center gap-1">
                      <Flame className="w-2.5 h-2.5" />
                      {user.currentStreak || 0} days
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2.5 border-t border-zinc-900 flex items-center justify-between gap-2">
                <span className="text-[10px] text-zinc-600 font-mono">
                  {user.lastActiveAt
                    ? `Active ${new Date(user.lastActiveAt).toLocaleDateString()}`
                    : "Joined recently"}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openAdjustmentModal(user, "add")}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold transition-colors"
                    title="Add XP"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                  <button
                    onClick={() => openAdjustmentModal(user, "remove")}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[11px] font-semibold transition-colors"
                    title="Deduct XP"
                  >
                    <Minus className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                  <button
                    onClick={() => openAdjustmentModal(user, "set")}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-[11px] font-semibold transition-colors"
                    title="Set Exact XP"
                  >
                    <Sliders className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="col-span-full p-10 text-center rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-500 text-xs">
              No players found matching your search.
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: XP TRANSACTION LEDGER ── */}
      {activeTab === "transactions" && (
        <div className="rounded-xl bg-zinc-950 border border-zinc-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black border-b border-zinc-900 text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Player</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Balance After</th>
                  <th className="py-2.5 px-3">Description / Admin</th>
                  <th className="py-2.5 px-3 text-right">Date &amp; Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {filteredTransactions.map((tx) => {
                  const isPositive = tx.amount > 0;
                  return (
                    <tr key={tx._id} className="hover:bg-zinc-900/40 transition-colors">
                      {/* Player */}
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-white">{tx.userName}</div>
                        <div className="text-[10px] text-zinc-500 font-mono truncate max-w-[150px]">
                          {tx.userEmail}
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-2.5 px-3">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300 uppercase">
                          {tx.type.replace("_", " ")}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-0.5 font-mono font-bold ${
                            isPositive ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {isPositive ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownLeft className="w-3 h-3" />
                          )}
                          <span>
                            {isPositive ? `+${tx.amount}` : `${tx.amount}`} XP
                          </span>
                        </span>
                      </td>

                      {/* Balance After */}
                      <td className="py-2.5 px-3 font-mono text-amber-400 font-bold">
                        {tx.balanceAfter} XP
                      </td>

                      {/* Description & Admin */}
                      <td className="py-2.5 px-3">
                        <p className="text-zinc-300 max-w-xs truncate">{tx.description}</p>
                        {tx.adminEmail && (
                          <span className="text-[10px] text-zinc-500 font-mono block">
                            By: {tx.adminEmail}
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-2.5 px-3 text-right font-mono text-zinc-500 text-[11px]">
                        {new Date(tx.createdAt).toLocaleDateString()}{" "}
                        {new Date(tx.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  );
                })}

                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-zinc-500 text-xs">
                      No XP ledger records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: UNIFIED ACTIVITY LOG ── */}
      {activeTab === "activity" && (
        <div className="space-y-2">
          {filteredActivities.map((act) => {
            const isXp = act.type === "xp_transaction";
            const isClaim = act.type === "reward_claim";
            const isSignup = act.type === "signup" || act.type === "user_signup";
            const isLogin = act.type === "login";
            const isMilestone = act.type === "playtime_milestone";

            return (
              <div
                key={act._id}
                className="flex items-start justify-between gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-zinc-800 transition-colors"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  {/* Category icon */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${
                      isMilestone
                        ? "bg-purple-500/10 border-purple-500/25 text-purple-400"
                        : isLogin
                        ? "bg-blue-500/10 border-blue-500/25 text-blue-400"
                        : isSignup
                        ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                        : isClaim
                        ? "bg-cyan-500/10 border-cyan-500/25 text-cyan-400"
                        : "bg-amber-500/10 border-amber-500/25 text-amber-400"
                    }`}
                  >
                    {isMilestone ? (
                      <Gamepad2 className="w-4 h-4" />
                    ) : isLogin ? (
                      <LogIn className="w-4 h-4" />
                    ) : isSignup ? (
                      <UserPlus className="w-4 h-4" />
                    ) : isClaim ? (
                      <Gift className="w-4 h-4" />
                    ) : (
                      <Coins className="w-4 h-4" />
                    )}
                  </div>

                  {/* Body */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-white truncate">
                        {act.title}
                      </h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 uppercase">
                        {act.category.replace("_", " ")}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                      {act.description}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono mt-1">
                      <span>{act.userName}</span>
                      <span>•</span>
                      <span>{act.userEmail}</span>
                      {act.meta?.adminEmail && (
                        <>
                          <span>•</span>
                          <span className="text-amber-400">Admin: {act.meta.adminEmail}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-zinc-500 font-mono block">
                    {new Date(act.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-[10px] text-zinc-600 font-mono">
                    {new Date(act.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredActivities.length === 0 && (
            <div className="p-12 text-center rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-500 text-xs">
              <Activity className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              No activities found matching your criteria.
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: MANUAL XP ADJUSTMENT ── */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-zinc-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white">
                  Adjust XP: {selectedUser.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-zinc-500 hover:text-zinc-300 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdjustmentSubmit} className="p-4 space-y-3.5 text-xs">
              {modalError && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* User overview */}
              <div className="p-2.5 rounded-lg bg-black border border-zinc-900 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Player:</span>
                  <span className="text-white font-medium">{selectedUser.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Email:</span>
                  <span className="text-zinc-400 font-mono">{selectedUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Current Balance:</span>
                  <span className="text-amber-400 font-mono font-bold">
                    {selectedUser.xp || 0} XP
                  </span>
                </div>
              </div>

              {/* Action type tabs */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Adjustment Action
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setActionType("add")}
                    className={`py-1.5 rounded-lg font-bold text-xs border transition-colors flex items-center justify-center gap-1 ${
                      actionType === "add"
                        ? "bg-emerald-500 text-black border-emerald-400"
                        : "bg-black border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add XP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType("remove")}
                    className={`py-1.5 rounded-lg font-bold text-xs border transition-colors flex items-center justify-center gap-1 ${
                      actionType === "remove"
                        ? "bg-red-500 text-white border-red-400"
                        : "bg-black border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Minus className="w-3 h-3" />
                    <span>Deduct XP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType("set")}
                    className={`py-1.5 rounded-lg font-bold text-xs border transition-colors flex items-center justify-center gap-1 ${
                      actionType === "set"
                        ? "bg-amber-500 text-black border-amber-400"
                        : "bg-black border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Set Exact</span>
                  </button>
                </div>
              </div>

              {/* Amount input */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  {actionType === "set" ? "New Exact XP Balance" : "Amount of XP"}
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full px-2.5 py-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-mono font-bold"
                />
              </div>

              {/* Reason / Admin note */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Reason for Adjustment (Logged to ledger)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tournament reward bonus, manual correction, event gift"
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>Confirm Adjustment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
