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
  ExternalLink,
  Coins,
  Loader2,
} from "lucide-react";

interface IRewardItem {
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

export default function AdminRewardsClient({
  initialRewards,
}: {
  initialRewards: IRewardItem[];
}) {
  const [rewards, setRewards] = useState<IRewardItem[]>(initialRewards);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<IRewardItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form inputs
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
    // Optimistic update
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
      // Revert on error
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
        // Edit existing
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
        // Create new
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

  return (
    <div className="space-y-4">
      {/* Top action header - compact */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-zinc-950 border border-zinc-900">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold">
              <Gift className="w-3 h-3" />
              <span>Rewards Control</span>
            </span>
            <span className="text-zinc-500 text-xs">• {rewards.length} Items</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
            Manage Game Rewards &amp; Stock
          </h1>
          <p className="text-[11px] sm:text-xs text-zinc-400">
            Configure redeemable game top-ups, upload game logos, and toggle stock availability.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors shrink-0 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Reward</span>
        </button>
      </div>

      {/* Rewards Grid - Compact Cards */}
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

        {rewards.length === 0 && (
          <div className="col-span-full p-12 text-center rounded-xl bg-zinc-950 border border-zinc-900">
            <Gift className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-white">No Rewards Configured</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Add your first game voucher or pass to display in the Rewards Store.
            </p>
            <button
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500 text-black font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Reward</span>
            </button>
          </div>
        )}
      </div>

      {/* ── CREATE / EDIT MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-5 border-b border-zinc-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-emerald-400" />
                <h2 className="text-base font-bold text-white">
                  {editingReward ? "Edit Reward" : "Add New Reward"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Title & Game */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Reward Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 60 BGMI UC"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Game Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Battlegrounds Mobile India"
                    value={formData.game}
                    onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* XP & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
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
                    className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Badge Tag (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hot Demand, Best Value"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Game Logo / Icon URL & File Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-300">
                  Game Logo / Icon Image
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      placeholder="Paste image URL (https://...)"
                      value={formData.iconUrl}
                      onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    <LinkIcon className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                  </div>

                  <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 cursor-pointer transition-colors shrink-0">
                    <Upload className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{isUploading ? "Uploading..." : "Upload File"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>

                {/* Logo Preview */}
                {formData.iconUrl && (
                  <div className="flex items-center gap-3 p-2 bg-zinc-900/60 rounded-lg border border-zinc-800/80">
                    <div className="relative w-10 h-10 rounded-md overflow-hidden bg-black shrink-0 border border-zinc-700">
                      <Image
                        src={formData.iconUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[11px] text-zinc-300 font-mono truncate">
                        {formData.iconUrl}
                      </p>
                      <span className="text-[10px] text-emerald-400">✓ Logo connected</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Description / Delivery Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Instant voucher delivered directly via Character ID."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Status Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-zinc-900/50 rounded-lg border border-zinc-900">
                {/* Stock Status */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
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
                    className="w-full px-2 py-1.5 bg-black border border-zinc-800 rounded-md text-xs text-white"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>

                {/* Coming Soon */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
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
                    className="w-full px-2 py-1.5 bg-black border border-zinc-800 rounded-md text-xs text-white"
                  >
                    <option value="yes">Yes (Coming Soon)</option>
                    <option value="no">No (Ready to Claim)</option>
                  </select>
                </div>

                {/* Visibility */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
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
                    className="w-full px-2 py-1.5 bg-black border border-zinc-800 rounded-md text-xs text-white"
                  >
                    <option value="yes">Published</option>
                    <option value="no">Draft / Hidden</option>
                  </select>
                </div>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Display Order Priority
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, sortOrder: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
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
