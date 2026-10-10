"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Gift,
  Coins,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Hash,
  Phone,
  FileText,
  User,
  History,
  Sparkles,
  ChevronRight,
  Info,
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
}

interface IClaimItem {
  _id: string;
  rewardId: string;
  rewardTitle: string;
  game: string;
  requiredXp: number;
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

interface CooldownMap {
  [rewardId: string]: {
    availableAt: string;
    daysLeft: number;
  };
}

export default function RewardsStoreClient({
  rewards,
  initialClaims,
  initialCooldowns,
  userXp,
  isAuthenticated,
}: {
  rewards: IRewardItem[];
  initialClaims: IClaimItem[];
  initialCooldowns: CooldownMap;
  userXp: number;
  isAuthenticated: boolean;
}) {
  const [currentXp, setCurrentXp] = useState(userXp);
  const [claims, setClaims] = useState<IClaimItem[]>(initialClaims);
  const [cooldowns, setCooldowns] = useState<CooldownMap>(initialCooldowns);

  // Modal claim state
  const [selectedReward, setSelectedReward] = useState<IRewardItem | null>(null);
  const [playerId, setPlayerId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [userNote, setUserNote] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successClaim, setSuccessClaim] = useState<IClaimItem | null>(null);

  const openClaimModal = (reward: IRewardItem) => {
    setSelectedReward(reward);
    setPlayerId("");
    setZoneId("");
    setContactInfo("");
    setUserNote("");
    setSubmitError("");
    setSuccessClaim(null);
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReward) return;

    if (!playerId.trim()) {
      setSubmitError("Please provide your Player Character/User ID.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/rewards/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rewardId: selectedReward._id,
          playerId: playerId.trim(),
          zoneId: zoneId.trim(),
          contactInfo: contactInfo.trim(),
          userNote: userNote.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit claim request");
      }

      // Update XP & add new claim
      setCurrentXp(data.remainingXp);
      setClaims((prev) => [data.claim, ...prev]);

      // Set cooldown for this item (7 days)
      const availableAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      setCooldowns((prev) => ({
        ...prev,
        [selectedReward._id]: {
          availableAt,
          daysLeft: 7,
        },
      }));

      setSuccessClaim(data.claim);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to process claim");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── USER XP STATUS STRIP ── */}
      {isAuthenticated && (
        <div className="rounded-xl bg-zinc-950 border border-zinc-900 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">
                Your Redeemable Balance
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                  {currentXp} XP
                </span>
                <span className="text-xs text-zinc-400 font-medium">Available</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/rewards-dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
            >
              <span>XP Earning History</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
            </Link>
          </div>
        </div>
      )}

      {/* ── FEATURED REWARDS SHOWCASE ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Available Game Redemptions
          </h2>
          <span className="text-[11px] text-zinc-500 font-mono">
            Limit: 1 redemption per item every 7 days
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {rewards.map((item) => {
            const isOutOfStock = item.stockStatus === "out_of_stock";
            const isComingSoon = item.isComingSoon;
            const cooldown = cooldowns[item._id];
            const hasEnoughXp = currentXp >= item.requiredXp;

            return (
              <div
                key={item._id}
                className="relative overflow-hidden rounded-xl bg-zinc-950 border border-zinc-900 p-4 flex flex-col justify-between gap-3.5 hover:border-zinc-800 transition-colors"
              >
                <div>
                  {/* Header: Game Icon + Title + XP */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center shrink-0">
                        {item.iconUrl ? (
                          <Image
                            src={item.iconUrl}
                            alt={item.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <Gift className="w-6 h-6 text-zinc-500" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-sm sm:text-base font-black text-white tracking-tight truncate">
                            {item.title}
                          </h3>
                        </div>
                        <p className="text-xs text-zinc-400 font-medium truncate mt-0.5">
                          {item.game}
                        </p>
                        {item.badge && (
                          <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-500/20 bg-amber-500/10 text-amber-400">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black border border-zinc-800 text-amber-400 font-mono font-bold text-xs">
                        <Coins className="w-3.5 h-3.5" />
                        <span>{item.requiredXp} XP</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p className="mt-3 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Footer Status & Claim CTA */}
                <div className="pt-3 border-t border-zinc-900 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Stock badge */}
                    {isOutOfStock ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 font-semibold text-[10px]">
                        <XCircle className="w-3 h-3" />
                        <span>Out of Stock</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium text-[10px]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>In Stock</span>
                      </span>
                    )}

                    {/* Delivery SLA Note */}
                    <span className="text-[10px] text-zinc-500 hidden sm:inline">
                      Fulfilled in 30-60m
                    </span>
                  </div>

                  {/* Action Button */}
                  {isComingSoon ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 font-semibold text-xs cursor-not-allowed select-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <span>Coming Soon</span>
                    </span>
                  ) : isOutOfStock ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-900 text-zinc-500 font-medium text-xs cursor-not-allowed select-none">
                      Sold Out
                    </span>
                  ) : cooldown ? (
                    <span
                      title={`Cooldown active: You can redeem this again in ${cooldown.daysLeft} day(s).`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 font-medium text-xs cursor-not-allowed select-none"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Wait {cooldown.daysLeft}d</span>
                    </span>
                  ) : !isAuthenticated ? (
                    <Link
                      href="/api/auth/signin"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs border border-zinc-800 transition-colors"
                    >
                      <span>Sign In to Claim</span>
                    </Link>
                  ) : !hasEnoughXp ? (
                    <button
                      disabled
                      title={`You need ${item.requiredXp} XP (current: ${currentXp} XP)`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 font-medium text-xs cursor-not-allowed"
                    >
                      <span>Need {item.requiredXp - currentXp} more XP</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => openClaimModal(item)}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors shadow-sm"
                    >
                      <span>Redeem Voucher</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── USER'S REDEMPTION ORDERS & HISTORY ── */}
      {isAuthenticated && claims.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-zinc-400" />
              <span>Your Redemption History</span>
            </h2>
            <span className="text-[11px] text-zinc-500 font-mono">
              {claims.length} {claims.length === 1 ? "Order" : "Orders"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {claims.map((claim) => {
              const statusStyles = {
                pending: {
                  badge: "bg-amber-500/10 border-amber-500/25 text-amber-400",
                  text: "Pending Admin Approval",
                  time: "Estimated: 30 to 60 mins",
                },
                processing: {
                  badge: "bg-blue-500/10 border-blue-500/25 text-blue-400",
                  text: "Processing Delivery",
                  time: "In progress now",
                },
                completed: {
                  badge: "bg-emerald-500/10 border-emerald-500/25 text-emerald-400",
                  text: "Fulfilled & Credited",
                  time: "Completed",
                },
                rejected: {
                  badge: "bg-red-500/10 border-red-500/25 text-red-400",
                  text: "Rejected",
                  time: "Cancelled",
                },
              }[claim.status];

              return (
                <div
                  key={claim._id}
                  className="rounded-xl bg-zinc-950 border border-zinc-900 p-3.5 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-white truncate">
                          {claim.rewardTitle}
                        </h4>
                        <p className="text-[11px] text-zinc-400 truncate">{claim.game}</p>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider shrink-0 ${statusStyles.badge}`}
                      >
                        {claim.status}
                      </span>
                    </div>

                    {/* UID detail box */}
                    <div className="p-2 rounded-lg bg-black border border-zinc-900 space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Player UID:</span>
                        <span className="font-mono text-emerald-400 font-bold select-all">
                          {claim.playerId}
                        </span>
                      </div>
                      {claim.zoneId && (
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Zone ID:</span>
                          <span className="font-mono text-cyan-400 select-all">
                            {claim.zoneId}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-zinc-500">XP Redeemed:</span>
                        <span className="font-mono text-amber-400 font-bold">
                          {claim.requiredXp} XP
                        </span>
                      </div>
                    </div>

                    {/* Voucher Code if Completed */}
                    {claim.voucherCode && (
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] space-y-0.5">
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                          Voucher / Transaction Code:
                        </span>
                        <p className="font-mono font-bold text-white select-all">
                          {claim.voucherCode}
                        </p>
                      </div>
                    )}

                    {/* Admin Message if any */}
                    {claim.adminNotes && (
                      <p className="text-[11px] text-zinc-400 italic bg-zinc-900/60 p-1.5 rounded border border-zinc-800">
                        Note: {claim.adminNotes}
                      </p>
                    )}
                  </div>

                  {/* Delivery SLA Footnote */}
                  <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px] text-zinc-500">
                    <span className="font-mono">
                      {new Date(claim.claimedAt).toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-zinc-400">
                      {statusStyles.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── REDEMPTION CLAIM MODAL ── */}
      {selectedReward && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Claim {selectedReward.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReward(null)}
                className="text-zinc-500 hover:text-zinc-300 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {successClaim ? (
              /* Success View */
              <div className="p-5 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">Redemption Submitted!</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
                    Your request has been submitted to admin for manual fulfillment.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs text-left space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Delivery SLA:</span>
                    <span className="text-amber-400 font-bold">30 mins – 1 hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Item:</span>
                    <span className="text-white">{successClaim.rewardTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Player UID:</span>
                    <span className="text-emerald-400 font-bold">{successClaim.playerId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Remaining XP:</span>
                    <span className="text-amber-400 font-bold">{currentXp} XP</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 text-left flex items-start gap-2">
                  <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <span>
                    7-day cooldown applied: You can redeem this specific item again after 7 days.
                  </span>
                </div>

                <button
                  onClick={() => setSelectedReward(null)}
                  className="w-full py-2 rounded-lg bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Claim Input Form */
              <form onSubmit={handleClaimSubmit} className="p-4 space-y-3.5 text-xs">
                {submitError && (
                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Reward Quick summary */}
                <div className="p-2.5 rounded-lg bg-black border border-zinc-900 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-xs">{selectedReward.title}</h4>
                    <p className="text-[11px] text-zinc-400">{selectedReward.game}</p>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-amber-400 font-mono font-bold text-xs">
                    <Coins className="w-3 h-3" />
                    <span>-{selectedReward.requiredXp} XP</span>
                  </div>
                </div>

                {/* SLA Notice */}
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                  <span>Manual fulfillment takes <strong>30 minutes to 1 hour</strong>.</span>
                </div>

                {/* Player ID Field (Required) */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    In-Game Character ID / Player UID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5182938472 or Character UID"
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value)}
                    className="w-full px-2.5 py-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-zinc-500 mt-0.5 block">
                    Double check your Character UID to avoid failed deliveries.
                  </span>
                </div>

                {/* Zone ID (MLBB or regional games) */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Zone ID (Required for MLBB / Optional for others)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2194 (For MLBB)"
                    value={zoneId}
                    onChange={(e) => setZoneId(e.target.value)}
                    className="w-full px-2.5 py-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Contact Info (WhatsApp / Phone) */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Contact Phone / WhatsApp (Optional for verification)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 9876543210"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    className="w-full px-2.5 py-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Additional Note */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Order Note (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Any specific note for admin..."
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* 7-day cooldown confirmation */}
                <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400">
                  ⚠️ Note: After claiming, this specific item will enter a <strong>7-day cooldown</strong> before you can redeem it again.
                </div>

                {/* Submit Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-900">
                  <button
                    type="button"
                    onClick={() => setSelectedReward(null)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Confirm &amp; Spend {selectedReward.requiredXp} XP</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
