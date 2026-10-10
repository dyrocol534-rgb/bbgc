"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Gift,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Link as LinkIcon,
  Upload,
  AlertCircle,
  Coins,
  Loader2,
  Package,
  Layers,
  Check,
  RotateCcw,
  User,
  Hash,
  MessageSquare,
  Key,
} from "lucide-react";

export interface IRewardItem {
  _id: string;
  title: string;
  game: string;
  requiredXp: number;
  iconUrl?: string;
  description?: string;
  stockStatus: "in_stock" | "out_of_stock";
  isComingSoon: boolean;
  badge?: string;
  active: boolean;
  sortOrder: number;
}

export interface IClaimItem {
  _id: string;
  userId: string;
  userEmail: string;
  userName: string;
  rewardId: string;
  rewardTitle: string;
  game: string;
  requiredXp: number;
  iconUrl?: string;
  playerId: string;
  zoneId?: string;
  contactInfo?: string;
  userNote?: string;
  status: "pending" | "processing" | "completed" | "rejected";
  adminNotes?: string;
  voucherCode?: string;
  claimedAt: string;
  fulfilledAt?: string;
}

export default function AdminRewardsClient({
  initialRewards,
  initialClaims,
}: {
  initialRewards: IRewardItem[];
  initialClaims: IClaimItem[];
}) {
  const [activeTab, setActiveTab] = useState<"catalog" | "orders">("orders");
  const [rewards, setRewards] = useState<IRewardItem[]>(initialRewards);
  const [claims, setClaims] = useState<IClaimItem[]>(initialClaims);

  // Filter for claims
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal states for Catalog
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<IRewardItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Modal states for Order Fulfillment
  const [selectedClaim, setSelectedClaim] = useState<IClaimItem | null>(null);
  const [fulfillmentStatus, setFulfillmentStatus] = useState<
    "pending" | "processing" | "completed" | "rejected"
  >("completed");
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [adminNotesInput, setAdminNotesInput] = useState("");
  const [refundUserXp, setRefundUserXp] = useState(false);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);

  // Form inputs for reward items
  const [formData, setFormData] = useState({
    title: "",
    game: "",
    requiredXp: 50,
    iconUrl: "",
    description: "",
    stockStatus: "in_stock" as "in_stock" | "out_of_stock",
    isComingSoon: false,
    badge: "",
    active: true,
    sortOrder: 0,
  });

  const openCreateModal = () => {
    setEditingReward(null);
    setFormData({
      title: "",
      game: "",
      requiredXp: 50,
      iconUrl: "",
      description: "",
      stockStatus: "in_stock",
      isComingSoon: false,
      badge: "",
      active: true,
      sortOrder: rewards.length + 1,
    });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: IRewardItem) => {
    setEditingReward(item);
    setFormData({
      title: item.title,
      game: item.game,
      requiredXp: item.requiredXp,
      iconUrl: item.iconUrl || "",
      description: item.description || "",
      stockStatus: item.stockStatus,
      isComingSoon: item.isComingSoon,
      badge: item.badge || "",
      active: item.active,
      sortOrder: item.sortOrder || 0,
    });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  // Quick toggle stock status
  const handleToggleStock = async (item: IRewardItem) => {
    const nextStatus = item.stockStatus === "in_stock" ? "out_of_stock" : "in_stock";
    setRewards((prev) =>
      prev.map((r) => (r._id === item._id ? { ...r, stockStatus: nextStatus } : r))
    );

    try {
      const res = await fetch(`/api/admin/rewards/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockStatus: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed to update stock status");
    } catch {
      setRewards((prev) =>
        prev.map((r) => (r._id === item._id ? { ...r, stockStatus: item.stockStatus } : r))
      );
    }
  };

  // Quick toggle coming soon
  const handleToggleComingSoon = async (item: IRewardItem) => {
    const nextVal = !item.isComingSoon;
    setRewards((prev) =>
      prev.map((r) => (r._id === item._id ? { ...r, isComingSoon: nextVal } : r))
    );

    try {
      const res = await fetch(`/api/admin/rewards/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isComingSoon: nextVal }),
      });
      if (!res.ok) throw new Error("Failed to update status");
    } catch {
      setRewards((prev) =>
        prev.map((r) => (r._id === item._id ? { ...r, isComingSoon: item.isComingSoon } : r))
      );
    }
  };

  // Quick toggle active
  const handleToggleActive = async (item: IRewardItem) => {
    const nextVal = !item.active;
    setRewards((prev) =>
      prev.map((r) => (r._id === item._id ? { ...r, active: nextVal } : r))
    );

    try {
      const res = await fetch(`/api/admin/rewards/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: nextVal }),
      });
      if (!res.ok) throw new Error("Failed to toggle active state");
    } catch {
      setRewards((prev) =>
        prev.map((r) => (r._id === item._id ? { ...r, active: item.active } : r))
      );
    }
  };

  // Delete reward
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reward?")) return;

    const original = rewards;
    setRewards((prev) => prev.filter((r) => r._id !== id));

    try {
      const res = await fetch(`/api/admin/rewards/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete reward");
    } catch {
      setRewards(original);
      alert("Error deleting reward");
    }
  };

  // Image upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg("");

    try {
      const sanitizedName = `reward-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const presignRes = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: sanitizedName,
          contentType: file.type,
        }),
      });

      if (!presignRes.ok) throw new Error("Failed to get upload signature");
      const { url, publicUrl } = await presignRes.json();

      const uploadRes = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Failed to upload image to storage");

      setFormData((prev) => ({ ...prev, iconUrl: publicUrl }));
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  // Submit modal form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.game) {
      setErrorMsg("Title and Game Name are required.");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");

    try {
      if (editingReward) {
        const res = await fetch(`/api/admin/rewards/${editingReward._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update reward");

        setRewards((prev) =>
          prev.map((r) => (r._id === editingReward._id ? data.reward : r))
        );
      } else {
        const res = await fetch("/api/admin/rewards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create reward");

        setRewards((prev) => [...prev, data.reward]);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  // Open fulfillment modal
  const openFulfillmentModal = (claim: IClaimItem) => {
    setSelectedClaim(claim);
    setFulfillmentStatus(claim.status);
    setVoucherCodeInput(claim.voucherCode || "");
    setAdminNotesInput(claim.adminNotes || "");
    setRefundUserXp(false);
  };

  // Save order fulfillment
  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;

    setIsUpdatingOrder(true);
    try {
      const res = await fetch("/api/admin/rewards/claims", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimId: selectedClaim._id,
          status: fulfillmentStatus,
          voucherCode: voucherCodeInput.trim(),
          adminNotes: adminNotesInput.trim(),
          refundUser: refundUserXp,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update order");

      setClaims((prev) =>
        prev.map((c) => (c._id === selectedClaim._id ? data.claim : c))
      );
      setSelectedClaim(null);
    } catch (err: any) {
      alert(err.message || "Error updating order");
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  // Filtered claims
  const filteredClaims = claims.filter((c) => {
    if (statusFilter === "all") return true;
    return c.status === statusFilter;
  });

  const pendingCount = claims.filter((c) => c.status === "pending").length;

  return (
    <div className="space-y-4">
      {/* Top action header - compact with tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-zinc-950 border border-zinc-900">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold">
              <Gift className="w-3 h-3" />
              <span>Rewards Control</span>
            </span>
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-bold animate-pulse">
                {pendingCount} Pending Orders
              </span>
            )}
          </div>
          <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
            Game Rewards &amp; Order Fulfillment
          </h1>
          <p className="text-[11px] sm:text-xs text-zinc-400">
            Fulfill player redemptions (BGMI UC / MLBB Passes) and manage items in stock.
          </p>
        </div>

        {/* Tab Switcher & Quick Add */}
        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 rounded-lg bg-black border border-zinc-900">
            <button
              onClick={() => setActiveTab("orders")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                activeTab === "orders"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Orders ({claims.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("catalog")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                activeTab === "catalog"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Catalog ({rewards.length})</span>
            </button>
          </div>

          {activeTab === "catalog" && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors shrink-0 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Reward</span>
            </button>
          )}
        </div>
      </div>

      {/* ── TAB 1: ORDER FULFILLMENT QUEUE ── */}
      {activeTab === "orders" && (
        <div className="space-y-3">
          {/* Status Filter Bar */}
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: "all", label: "All Orders", count: claims.length },
                {
                  id: "pending",
                  label: "Pending",
                  count: claims.filter((c) => c.status === "pending").length,
                },
                {
                  id: "processing",
                  label: "Processing",
                  count: claims.filter((c) => c.status === "processing").length,
                },
                {
                  id: "completed",
                  label: "Completed",
                  count: claims.filter((c) => c.status === "completed").length,
                },
                {
                  id: "rejected",
                  label: "Rejected",
                  count: claims.filter((c) => c.status === "rejected").length,
                },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setStatusFilter(filter.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors border ${
                    statusFilter === filter.id
                      ? "bg-white text-black border-white"
                      : "bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white"
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline">
              Delivery SLA: 30m - 1hr
            </span>
          </div>

          {/* Orders List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredClaims.map((claim) => {
              const statusColors = {
                pending: "bg-amber-500/10 border-amber-500/25 text-amber-400",
                processing: "bg-blue-500/10 border-blue-500/25 text-blue-400",
                completed: "bg-emerald-500/10 border-emerald-500/25 text-emerald-400",
                rejected: "bg-red-500/10 border-red-500/25 text-red-400",
              }[claim.status];

              return (
                <div
                  key={claim._id}
                  className="rounded-xl bg-zinc-950 border border-zinc-900 p-3 flex flex-col justify-between gap-3 hover:border-zinc-800 transition-colors"
                >
                  <div className="space-y-2.5">
                    {/* Header: Item & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-xs sm:text-sm text-white truncate">
                            {claim.rewardTitle}
                          </h3>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-medium truncate">
                          {claim.game}
                        </p>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider shrink-0 ${statusColors}`}
                      >
                        {claim.status}
                      </span>
                    </div>

                    {/* Player Info Box */}
                    <div className="p-2 rounded-lg bg-black border border-zinc-900 space-y-1 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500 flex items-center gap-1">
                          <User className="w-3 h-3" /> Player:
                        </span>
                        <span className="text-zinc-300 font-medium truncate max-w-[150px]">
                          {claim.userName} ({claim.userEmail})
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500 flex items-center gap-1">
                          <Hash className="w-3 h-3" /> Player UID:
                        </span>
                        <span className="text-emerald-400 font-mono font-bold select-all">
                          {claim.playerId}
                        </span>
                      </div>

                      {claim.zoneId && (
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Zone ID:</span>
                          <span className="text-cyan-400 font-mono font-semibold select-all">
                            {claim.zoneId}
                          </span>
                        </div>
                      )}

                      {claim.contactInfo && (
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Contact:</span>
                          <span className="text-zinc-300 font-mono truncate max-w-[150px]">
                            {claim.contactInfo}
                          </span>
                        </div>
                      )}

                      {claim.userNote && (
                        <div className="pt-1 border-t border-zinc-900 text-zinc-400 italic text-[10px]">
                          &ldquo;{claim.userNote}&rdquo;
                        </div>
                      )}
                    </div>

                    {/* Voucher or Admin Notes */}
                    {claim.voucherCode && (
                      <div className="p-1.5 rounded-md bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-[11px]">
                        <span className="text-zinc-400 flex items-center gap-1">
                          <Key className="w-3 h-3 text-amber-400" /> Voucher:
                        </span>
                        <span className="font-mono font-bold text-white select-all">
                          {claim.voucherCode}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Footer & Action */}
                  <div className="pt-2 border-t border-zinc-900 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(claim.claimedAt).toLocaleDateString()} at{" "}
                      {new Date(claim.claimedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>

                    <button
                      onClick={() => openFulfillmentModal(claim)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-white font-semibold transition-colors"
                    >
                      <Edit2 className="w-3 h-3 text-zinc-400" />
                      <span>Fulfill / Status</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredClaims.length === 0 && (
              <div className="col-span-full p-10 text-center rounded-xl bg-zinc-950 border border-zinc-900">
                <Package className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-white">No Orders Found</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Redemption requests submitted by players will appear here for manual UID fulfillment.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: CATALOG MANAGEMENT ── */}
      {activeTab === "catalog" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {rewards.map((reward) => (
            <div
              key={reward._id}
              className={`flex flex-col justify-between rounded-xl bg-zinc-950 border transition-all p-3 relative ${
                reward.active ? "border-zinc-900 hover:border-zinc-800" : "border-zinc-900/60 opacity-60"
              }`}
            >
              <div>
                {/* Header: Game Icon + Title + XP */}
                <div className="flex items-start gap-2.5 justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center shrink-0">
                      {reward.iconUrl ? (
                        <Image
                          src={reward.iconUrl}
                          alt={reward.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <Gift className="w-5 h-5 text-zinc-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-xs sm:text-sm text-white truncate leading-snug">
                        {reward.title}
                      </h3>
                      <p className="text-[11px] text-zinc-400 font-medium truncate leading-tight">
                        {reward.game}
                      </p>
                      {reward.badge && (
                        <span className="inline-block mt-0.5 text-[9px] font-semibold px-1 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-amber-400">
                          {reward.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black border border-zinc-800 text-amber-400 font-mono font-bold text-xs shrink-0">
                    <Coins className="w-3 h-3" />
                    <span>{reward.requiredXp} XP</span>
                  </div>
                </div>

                {/* Description */}
                {reward.description && (
                  <p className="mt-2 text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {reward.description}
                  </p>
                )}

                {/* Status Badges & Quick Toggles */}
                <div className="mt-3 pt-2.5 border-t border-zinc-900 flex items-center gap-1.5 flex-wrap">
                  {/* Stock Status Button */}
                  <button
                    onClick={() => handleToggleStock(reward)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-colors ${
                      reward.stockStatus === "in_stock"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                        : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                    }`}
                    title="Click to toggle stock status"
                  >
                    {reward.stockStatus === "in_stock" ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>In Stock</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        <span>Out of Stock</span>
                      </>
                    )}
                  </button>

                  {/* Coming Soon Button */}
                  <button
                    onClick={() => handleToggleComingSoon(reward)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-colors ${
                      reward.isComingSoon
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                        : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                    }`}
                    title="Click to toggle coming soon status"
                  >
                    <Clock className="w-3 h-3" />
                    <span>{reward.isComingSoon ? "Coming Soon" : "Live Store"}</span>
                  </button>

                  {/* Active Toggle */}
                  <button
                    onClick={() => handleToggleActive(reward)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ml-auto transition-colors ${
                      reward.active
                        ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white"
                        : "bg-zinc-900/50 border-zinc-900 text-zinc-600"
                    }`}
                  >
                    <span>{reward.active ? "Published" : "Hidden"}</span>
                  </button>
                </div>
              </div>

              {/* Actions: Edit & Delete */}
              <div className="mt-2.5 pt-2 border-t border-zinc-900 flex items-center justify-between gap-2">
                <span className="text-[10px] text-zinc-500 font-mono">
                  Sort #{reward.sortOrder}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(reward)}
                    className="p-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                    title="Edit details"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(reward._id)}
                    className="p-1 rounded-md bg-zinc-900 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-500/30 transition-colors"
                    title="Delete reward"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── FULFILL ORDER MODAL ── */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-zinc-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white">
                  Fulfill Order: {selectedClaim.rewardTitle}
                </h2>
              </div>
              <button
                onClick={() => setSelectedClaim(null)}
                className="text-zinc-500 hover:text-zinc-300 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOrder} className="p-4 space-y-3.5 text-xs">
              {/* Order quick overview */}
              <div className="p-2.5 rounded-lg bg-black border border-zinc-900 space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Player ID / Character UID:</span>
                  <span className="font-mono text-emerald-400 font-bold select-all">
                    {selectedClaim.playerId}
                  </span>
                </div>
                {selectedClaim.zoneId && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Zone ID:</span>
                    <span className="font-mono text-cyan-400 select-all">
                      {selectedClaim.zoneId}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-zinc-500">User Email:</span>
                  <span className="text-zinc-300">{selectedClaim.userEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">XP Deducted:</span>
                  <span className="text-amber-400 font-mono font-bold">
                    {selectedClaim.requiredXp} XP
                  </span>
                </div>
              </div>

              {/* Status Select */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Order Status
                </label>
                <select
                  value={fulfillmentStatus}
                  onChange={(e) =>
                    setFulfillmentStatus(e.target.value as any)
                  }
                  className="w-full px-2.5 py-1.5 bg-black border border-zinc-800 rounded-lg text-xs text-white"
                >
                  <option value="pending">Pending (Waiting in queue)</option>
                  <option value="processing">Processing (Being credited now)</option>
                  <option value="completed">Completed (Successfully Fulfilled)</option>
                  <option value="rejected">Rejected (Failed / Invalid UID)</option>
                </select>
              </div>

              {/* Voucher Code / Transaction ID */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Voucher Code / Transaction Ref (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. BGMI-UC-938210 or Txn Ref"
                  value={voucherCodeInput}
                  onChange={(e) => setVoucherCodeInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Admin Note */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Admin Note for Player (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Credited via Codashop/UniPin to character UID."
                  value={adminNotesInput}
                  onChange={(e) => setAdminNotesInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Refund XP checkbox if rejected */}
              {fulfillmentStatus === "rejected" && (
                <label className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={refundUserXp}
                    onChange={(e) => setRefundUserXp(e.target.checked)}
                    className="rounded border-zinc-700 text-red-500 focus:ring-0"
                  />
                  <span className="text-[11px]">
                    Refund {selectedClaim.requiredXp} XP back to user&apos;s account balance
                  </span>
                </label>
              )}

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setSelectedClaim(null)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingOrder}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs disabled:opacity-50"
                >
                  {isUpdatingOrder && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>Save Order Status</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE / EDIT REWARD MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-3.5 sm:p-4 border-b border-zinc-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">
                  {editingReward ? "Edit Reward Item" : "Add New Reward"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3 max-h-[80vh] overflow-y-auto text-xs">
              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Title & Game */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Reward Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 60 BGMI UC"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Game Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Battlegrounds Mobile India"
                    value={formData.game}
                    onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* XP & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Required XP *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.requiredXp}
                    onChange={(e) =>
                      setFormData({ ...formData, requiredXp: Number(e.target.value) })
                    }
                    className="w-full px-2.5 py-1.5 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Badge Tag (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hot Demand, Best Value"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Game Logo / Icon URL & File Upload */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-zinc-300">
                  Game Logo / Icon Image
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      placeholder="Paste image URL (https://...)"
                      value={formData.iconUrl}
                      onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                      className="w-full pl-7 pr-2.5 py-1.5 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    <LinkIcon className="w-3 h-3 text-zinc-500 absolute left-2.5 top-2" />
                  </div>

                  <label className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 cursor-pointer transition-colors shrink-0">
                    <Upload className="w-3 h-3 text-zinc-400" />
                    <span>{isUploading ? "..." : "Upload"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>

                {formData.iconUrl && (
                  <div className="flex items-center gap-2 p-1.5 bg-zinc-900/60 rounded-md border border-zinc-800/80">
                    <div className="relative w-8 h-8 rounded overflow-hidden bg-black shrink-0 border border-zinc-700">
                      <Image
                        src={formData.iconUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono truncate">
                      {formData.iconUrl}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Description / Delivery Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Instant voucher delivered directly via Character ID."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Status Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 bg-zinc-900/50 rounded-lg border border-zinc-900">
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 mb-0.5">
                    Stock Availability
                  </label>
                  <select
                    value={formData.stockStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stockStatus: e.target.value as "in_stock" | "out_of_stock",
                      })
                    }
                    className="w-full px-2 py-1 bg-black border border-zinc-800 rounded text-xs text-white"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 mb-0.5">
                    Coming Soon Badge
                  </label>
                  <select
                    value={formData.isComingSoon ? "yes" : "no"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isComingSoon: e.target.value === "yes",
                      })
                    }
                    className="w-full px-2 py-1 bg-black border border-zinc-800 rounded text-xs text-white"
                  >
                    <option value="no">No (Ready to Claim)</option>
                    <option value="yes">Yes (Coming Soon)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 mb-0.5">
                    Store Visibility
                  </label>
                  <select
                    value={formData.active ? "yes" : "no"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        active: e.target.value === "yes",
                      })
                    }
                    className="w-full px-2 py-1 bg-black border border-zinc-800 rounded text-xs text-white"
                  >
                    <option value="yes">Published</option>
                    <option value="no">Draft / Hidden</option>
                  </select>
                </div>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Display Order Priority
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, sortOrder: Number(e.target.value) })
                  }
                  className="w-full px-2.5 py-1.5 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>{editingReward ? "Save Changes" : "Create Reward"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
