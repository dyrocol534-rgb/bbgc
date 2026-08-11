import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { XP_CONFIG } from "@/lib/xp";
import ReferralClient from "./ReferralClient";
import { Users, Coins, Hourglass, Check } from "lucide-react";
import Image from "next/image";

export default async function ReferralPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/");

  await dbConnect();
  const currentUser = await User.findById((session.user as any).id).lean();
  if (!currentUser) redirect("/");

  const referralCode = currentUser.referralCode || "NONE";
  const referredUsers = await User.find({ referredBy: currentUser._id }).lean();

  const totalInvited = referredUsers.length;
  const rewardsUnlocked = referredUsers.filter(u => u.referralRewardPaid).length;
  const pendingInvites = totalInvited - rewardsUnlocked;
  const totalXpEarned = rewardsUnlocked * XP_CONFIG.REFERRAL_REWARD;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Refer &amp; Earn</h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Invite friends — you <span className="font-bold text-amber-400">both</span> earn{" "}
          <span className="font-bold text-amber-400">+{XP_CONFIG.REFERRAL_REWARD} XP</span> when they play {XP_CONFIG.GAMES_REQUIRED_FOR_REFERRAL} games.
        </p>
      </div>

      {/* Referral Link Card */}
      <ReferralClient referralCode={referralCode} />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-3.5 group hover:border-indigo-500/40 transition-colors">
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-indigo-500/15 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
          <div className="relative">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-2">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-0.5">Invited</p>
            <p className="text-2xl font-black text-white leading-none">{totalInvited}</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5 group hover:border-amber-500/40 transition-colors">
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-amber-500/15 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
          <div className="relative">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-2">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-0.5">Unlocked</p>
            <p className="text-2xl font-black text-white leading-none">{rewardsUnlocked}</p>
            {totalXpEarned > 0 && (
              <p className="text-[10px] text-amber-400 font-semibold mt-1">+{totalXpEarned} XP</p>
            )}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-orange-500/20 bg-orange-500/5 p-3.5 group hover:border-orange-500/40 transition-colors">
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-orange-500/15 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
          <div className="relative">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center mb-2">
              <Hourglass className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-0.5">Pending</p>
            <p className="text-2xl font-black text-white leading-none">{pendingInvites}</p>
            <p className="text-[10px] text-zinc-600 mt-1">needs {XP_CONFIG.GAMES_REQUIRED_FOR_REFERRAL} games</p>
          </div>
        </div>
      </div>

      {/* Friends List */}
      {referredUsers.length > 0 && (
        <div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2.5">Invited Friends</p>
          <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 overflow-hidden">
            {referredUsers.map((user, i) => {
              const gamesPlayed = user.gamesPlayedCount || 0;
              const isCompleted = user.referralRewardPaid;
              const progress = Math.min(100, Math.round((gamesPlayed / XP_CONFIG.GAMES_REQUIRED_FOR_REFERRAL) * 100));
              return (
                <div
                  key={user._id.toString()}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors ${i !== 0 ? "border-t border-zinc-800/50" : ""}`}
                >
                  {/* Avatar */}
                  {user.image ? (
                    <Image src={user.image} alt={user.name} width={32} height={32} className="w-8 h-8 rounded-full border border-zinc-700/60 object-cover shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-400 shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Name + progress */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{user.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-zinc-800 h-1 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isCompleted ? "bg-amber-400" : "bg-indigo-500"}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-500 shrink-0">{gamesPlayed}/{XP_CONFIG.GAMES_REQUIRED_FOR_REFERRAL}</span>
                    </div>
                  </div>

                  {/* Status badge */}
                  {isCompleted ? (
                    <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500/15 text-amber-400 px-2 py-1 rounded-full border border-amber-500/25">
                      <Check className="w-2.5 h-2.5" /> +{XP_CONFIG.REFERRAL_REWARD} XP
                    </span>
                  ) : (
                    <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-medium bg-zinc-800/60 text-zinc-500 px-2 py-1 rounded-full border border-zinc-700/50">
                      <Hourglass className="w-2.5 h-2.5" /> Pending
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-4">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">How it works</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { step: "1", color: "indigo", title: "Share Link", desc: "Send your unique link — your code auto-applies on sign in." },
            { step: "2", color: "indigo", title: "They Play", desc: `Friend plays ${XP_CONFIG.GAMES_REQUIRED_FOR_REFERRAL} games to confirm they're active.` },
            { step: "3", color: "amber", title: "Both Earn!", desc: `You both instantly get +${XP_CONFIG.REFERRAL_REWARD} XP.` },
          ].map(({ step, color, title, desc }) => (
            <div key={step} className="flex flex-col gap-2">
              <div className={`w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center ${color === "amber" ? "bg-amber-500/20 text-amber-400" : "bg-indigo-500/20 text-indigo-400"}`}>
                {step}
              </div>
              <p className={`text-xs font-bold ${color === "amber" ? "text-amber-300" : "text-zinc-200"}`}>{title}</p>
              <p className="text-[11px] text-zinc-500 leading-snug">{desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
