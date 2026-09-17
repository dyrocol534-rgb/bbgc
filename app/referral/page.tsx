import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { XP_CONFIG } from "@/lib/xp";
import ReferralClient from "./ReferralClient";
import { Users, Coins, Hourglass, Check, ChevronLeft, ShieldCheck, HeartHandshake } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
    <div className="min-h-screen pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5">

        {/* ── iOS Top Navigation Bar ── */}
        <div className="flex items-center justify-between">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.09] active:bg-white/[0.12] border border-white/[0.08] text-zinc-300 hover:text-white text-xs font-medium transition-all group touch-manipulation"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
            <span>Profile</span>
          </Link>

          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Referrals
          </span>
        </div>

        {/* ── Header ── */}
        <div className="space-y-0.5">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Refer &amp; Earn
          </h1>
          <p className="text-xs text-zinc-400">
            Invite friends to play on Bluebuff — you both unlock{" "}
            <span className="font-semibold text-amber-400">+{XP_CONFIG.REFERRAL_REWARD} XP</span> when they try {XP_CONFIG.GAMES_REQUIRED_FOR_REFERRAL} games.
          </p>
        </div>

        {/* ── Referral Link & Code Card ── */}
        <ReferralClient referralCode={referralCode} />

        {/* ── Responsive Stats Grid ── */}
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 px-1 mb-1.5">
            Referral Activity
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
            {/* Total Invited */}
            <div className="bg-[#141416] p-3.5 rounded-[18px] border border-white/[0.07] flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9.5px] font-semibold text-zinc-400 uppercase tracking-wider">Total Invited</span>
                <div className="w-6 h-6 rounded-[7px] bg-[#007AFF] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Users className="w-3 h-3" />
                </div>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-none">
                  {totalInvited}
                </p>
                <p className="text-[10.5px] text-zinc-500 mt-0.5">Friends joined</p>
              </div>
            </div>

            {/* Unlocked */}
            <div className="bg-[#141416] p-3.5 rounded-[18px] border border-white/[0.07] flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9.5px] font-semibold text-zinc-400 uppercase tracking-wider">Completed</span>
                <div className="w-6 h-6 rounded-[7px] bg-[#34C759] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Coins className="w-3 h-3" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-none">
                    {rewardsUnlocked}
                  </p>
                  {totalXpEarned > 0 && (
                    <span className="text-[9.5px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                      +{totalXpEarned} XP
                    </span>
                  )}
                </div>
                <p className="text-[10.5px] text-zinc-500 mt-0.5">Rewards granted</p>
              </div>
            </div>

            {/* Pending */}
            <div className="col-span-2 sm:col-span-1 bg-[#141416] p-3.5 rounded-[18px] border border-white/[0.07] flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9.5px] font-semibold text-zinc-400 uppercase tracking-wider">Pending</span>
                <div className="w-6 h-6 rounded-[7px] bg-[#FF9500] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Hourglass className="w-3 h-3" />
                </div>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-none">
                  {pendingInvites}
                </p>
                <p className="text-[10.5px] text-zinc-500 mt-0.5">Requires {XP_CONFIG.GAMES_REQUIRED_FOR_REFERRAL} games</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Friends List (iOS Inset Group) ── */}
        {referredUsers.length > 0 && (
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 px-1 mb-1.5 flex items-center justify-between">
              <span>Invited Friends</span>
              <span className="text-[10px] text-zinc-500 normal-case font-normal">
                {referredUsers.length} total
              </span>
            </div>

            <div className="bg-[#141416] rounded-[20px] border border-white/[0.07] divide-y divide-white/[0.05] overflow-hidden shadow-xs">
              {referredUsers.map((user) => {
                const gamesPlayed = user.gamesPlayedCount || 0;
                const isCompleted = user.referralRewardPaid;
                const progress = Math.min(100, Math.round((gamesPlayed / XP_CONFIG.GAMES_REQUIRED_FOR_REFERRAL) * 100));

                return (
                  <div
                    key={user._id.toString()}
                    className="flex items-center gap-2.5 p-3 sm:p-3.5 hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Avatar */}
                    {user.image ? (
                      <Image 
                        src={user.image} 
                        alt={user.name || "User"} 
                        width={32} 
                        height={32} 
                        className="w-8 h-8 rounded-full border border-white/[0.12] object-cover shrink-0 bg-zinc-800" 
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs">
                        {(user.name || "U").charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Name + progress */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-zinc-200 truncate">{user.name}</p>
                        <span className="text-[9.5px] text-zinc-400 shrink-0 font-medium">
                          {gamesPlayed}/{XP_CONFIG.GAMES_REQUIRED_FOR_REFERRAL} games
                        </span>
                      </div>
                      <div className="mt-1 bg-[#1f1f23] h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted ? "bg-[#34C759]" : "bg-white"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Status badge */}
                    {isCompleted ? (
                      <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <Check className="w-2.5 h-2.5" /> +{XP_CONFIG.REFERRAL_REWARD} XP
                      </span>
                    ) : (
                      <span className="shrink-0 inline-flex items-center gap-1 text-[9.5px] font-medium bg-white/[0.05] text-zinc-400 px-2 py-0.5 rounded-full border border-white/[0.06]">
                        <Hourglass className="w-2.5 h-2.5 text-amber-400" /> Pending
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── How it works (iOS Inset Group) ── */}
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 px-1 mb-1.5">
            How It Works
          </div>

          <div className="bg-[#141416] rounded-[20px] border border-white/[0.07] p-4 sm:p-5 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {[
                { 
                  step: "1", 
                  title: "Share Invite Link", 
                  desc: "Send your invite code or direct link to gaming friends.",
                  icon: "✉️"
                },
                { 
                  step: "2", 
                  title: "They Play Games", 
                  desc: `Your friend signs in and plays ${XP_CONFIG.GAMES_REQUIRED_FOR_REFERRAL} instant web games.`,
                  icon: "🎮"
                },
                { 
                  step: "3", 
                  title: "Instant +50 XP", 
                  desc: "Both players receive bonus XP automatically credited to their accounts.",
                  icon: "🪙"
                },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex sm:flex-col items-start gap-2.5 sm:gap-2">
                  <div className="w-6 h-6 rounded-[7px] bg-white/[0.08] border border-white/[0.08] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    {step}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">
                      {title}
                    </p>
                    <p className="text-[10.5px] text-zinc-400 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
