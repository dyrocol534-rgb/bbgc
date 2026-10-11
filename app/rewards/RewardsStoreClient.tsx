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
  History,
  ChevronRight,
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
    <div className="space-y-3.5">
      {/* ── Compact iOS Balance Widget (Full Width) ── */}
      {isAuthenticated && (
        <div className="rounded-xl bg-zinc-950 border border-zinc-900 px-3.5 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Coins className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-amber-400 font-mono tracking-tight">
                {currentXp}
              </span>
              <span className="text-[11px] text-zinc-400 font-medium">XP Available</span>
            </div>
          </div>

          <Link
            href="/rewards-dashboard"
            className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
          >
            <span>History</span>
            <ChevronRight className="w-3 h-3 text-zinc-500" />
          </Link>
        </div>
      )}

      {/* ── Section Header ── */}
      <div className="flex items-center justify-between px-0.5">
        <h2 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
          Available Redemptions
        </h2>
        <span className="text-[10px] text-zinc-500 font-mono">
          1 Claim / 7 Days
        </span>
      </div>

      {/* ── Full Width Responsive Grid (Compact iOS Cards) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-3">
        {rewards.map((item) => {
          const isOutOfStock = item.stockStatus === "out_of_stock";
          const isComingSoon = item.isComingSoon;
          const cooldown = cooldowns[item._id];
          const hasEnoughXp = currentXp >= item.requiredXp;

          return (
            <div
              key={item._id}
              className="rounded-xl bg-zinc-950 border border-zinc-900 hover:border-zinc-800 p-3 flex flex-col justify-between gap-2.5 transition-all"
            >
              <div>
                {/* Header: Game Icon + Title + Cost */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center shrink-0">
                      {item.iconUrl ? (
                        <Image
                          src={item.iconUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <Gift className="w-5 h-5 text-zinc-500" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                          {item.title}
                        </h3>
                        {item.badge && (
                          <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 font-medium truncate mt-0.5">
                        {item.game}
                      </p>
                    </div>
                  </div>

                  {/* Cost Capsule */}
                  <div className="shrink-0 text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black border border-zinc-800 text-amber-400 font-mono font-bold text-xs">
                      <Coins className="w-3 h-3" />
                      <span>{item.requiredXp} XP</span>
                    </span>
                  </div>
                </div>

                {/* Description */}
                {item.description && (
                  <p className="mt-1.5 text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Action Bar (Clean Minimal iOS Bar) */}
              <div className="pt-2 border-t border-zinc-900 flex items-center justify-between gap-2">
                {/* Stock indicator */}
                <div className="flex items-center gap-1 text-[11px]">
                  {isOutOfStock ? (
                    <span className="text-red-400 flex items-center gap-1 font-medium text-[10px]">
                      <XCircle className="w-3 h-3" /> Out of Stock
                    </span>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1 font-medium text-[10px]">
                      <CheckCircle2 className="w-3 h-3" /> In Stock
                    </span>
                  )}
                  <span className="text-zinc-600 text-[10px]">•</span>
                  <span className="text-zinc-500 text-[10px]">30-60m</span>
                </div>

                {/* CTA Action */}
                <div>
                  {isComingSoon ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 text-[11px] font-semibold select-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <span>Coming Soon</span>
                    </span>
                  ) : isOutOfStock ? (
                    <span className="px-2.5 py-1 rounded-md bg-zinc-900/60 border border-zinc-900 text-zinc-500 text-[11px] font-medium select-none">
                      Sold Out
                    </span>
                  ) : cooldown ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-amber-400 text-[11px] font-medium">
                      <Clock className="w-3 h-3" />
                      <span>Wait {cooldown.daysLeft}d</span>
                    </span>
                  ) : !isAuthenticated ? (
                    <Link
                      href="/login"
                      className="inline-flex items-center px-3 py-1 rounded-md bg-white hover:bg-zinc-200 active:scale-95 text-black font-bold text-xs transition-all"
                    >
                      Sign In
                    </Link>
                  ) : !hasEnoughXp ? (
                    <button
                      disabled
                      className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-500 text-[11px] font-medium cursor-not-allowed"
                    >
                      Need {item.requiredXp - currentXp} XP
                    </button>
                  ) : (
                    <button
                      onClick={() => openClaimModal(item)}
                      className="px-3 py-1 rounded-md bg-amber-400 hover:bg-amber-300 active:scale-95 text-black font-bold text-xs transition-all shadow-sm"
                    >
                      Redeem
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── USER'S ORDERS / HISTORY ── */}
      {isAuthenticated && claims.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3 h-3 text-zinc-400" />
              <span>Your Orders</span>
            </h2>
            <span className="text-[10px] text-zinc-500 font-mono">
              {claims.length} {claims.length === 1 ? "Item" : "Items"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
            {claims.map((claim) => {
              const statusStyles = {
                pending: {
                  badge: "bg-amber-500/10 border-amber-500/20 text-amber-400",
                  text: "Pending",
                  time: "In Queue (30-60m)",
                },
                processing: {
                  badge: "bg-blue-500/10 border-blue-500/20 text-blue-400",
                  text: "Processing",
                  time: "Crediting now",
                },
                completed: {
                  badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                  text: "Fulfilled",
                  time: "Completed",
                },
                rejected: {
                  badge: "bg-red-500/10 border-red-500/20 text-red-400",
                  text: "Rejected",
                  time: "Cancelled",
                },
              }[claim.status];

              return (
                <div
                  key={claim._id}
                  className="rounded-xl bg-zinc-950 border border-zinc-900 p-2.5 flex flex-col gap-1.5 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-white truncate">
                        {claim.rewardTitle}
                      </h4>
                      <p className="text-[10px] text-zinc-400 truncate">{claim.game}</p>
                    </div>

                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold border uppercase tracking-wider shrink-0 ${statusStyles.badge}`}
                    >
                      {statusStyles.text}
                    </span>
                  </div>

                  {/* Player UID & XP row */}
                  <div className="px-2 py-1 rounded-md bg-black border border-zinc-900 flex items-center justify-between text-[10px]">
                    <span className="text-zinc-400">UID: <strong className="text-emerald-400 font-mono select-all">{claim.playerId}</strong></span>
                    <span className="text-amber-400 font-mono font-bold">-{claim.requiredXp} XP</span>
                  </div>

                  {/* Voucher code if completed */}
                  {claim.voucherCode && (
                    <div className="px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] flex justify-between items-center">
                      <span className="text-emerald-400 font-semibold">Voucher:</span>
                      <span className="font-mono font-bold text-white select-all">{claim.voucherCode}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[9px] text-zinc-500 pt-0.5">
                    <span>{new Date(claim.claimedAt).toLocaleDateString()}</span>
                    <span>{statusStyles.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── iOS MODAL SHEET ── */}
      {selectedReward && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-t-2xl sm:rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-3.5 border-b border-zinc-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs sm:text-sm font-bold text-white">
                  Claim {selectedReward.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReward(null)}
                className="text-zinc-400 hover:text-white text-xs font-bold p-1"
              >
                ✕
              </button>
            </div>

            {successClaim ? (
              /* Success View */
              <div className="p-4 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-white">Redemption Submitted!</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
                    Your voucher request is placed. Fulfillments take 30 to 60 minutes.
                  </p>
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
              <form onSubmit={handleClaimSubmit} className="p-4 space-y-3 text-xs">
                {submitError && (
                  <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2 text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* In-Game Character UID */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Player Character / User ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5182938472 or Character UID"
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Zone ID */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Zone ID (For MLBB / Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2194"
                    value={zoneId}
                    onChange={(e) => setZoneId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Contact WhatsApp (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Footer Submit */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-900">
                  <button
                    type="button"
                    onClick={() => setSelectedReward(null)}
                    className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition-all disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Confirm (-{selectedReward.requiredXp} XP)</span>
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
