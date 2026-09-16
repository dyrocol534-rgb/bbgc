import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { XP_CONFIG } from "@/lib/xp";
import ReferralClient from "./ReferralClient";
import { Users, Coins, Hourglass, Check, ChevronLeft, ArrowUpRight, ShieldCheck, HeartHandshake } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=in.bluebuff.games";

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
    <div className="min-h-screen pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-7">

        {/* ── iOS Top Navigation Bar ── */}
        <div className="flex items-center justify-between">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.09] active:bg-white/[0.12] border border-white/[0.08] text-zinc-300 hover:text-white text-xs font-medium transition-all group touch-manipulation"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
            <span>Profile</span>
          </Link>

          <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            Referrals
          </span>
        </div>

        {/* ── Large Header ── */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Refer &amp; Earn
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Invite friends to play on Bluebuff — you both unlock{" "}
            <span className="font-bold text-amber-400">+{XP_CONFIG.REFERRAL_REWARD} XP</span> when they try {XP_CONFIG.GAMES_REQUIRED_FOR_REFERRAL} games.
          </p>
        </div>

        {/* ── Referral Link & Code Card ── */}
        <ReferralClient referralCode={referralCode} />

        {/* ── Responsive Stats Grid ── */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-3.5 mb-2">
            Referral Activity
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {/* Total Invited */}
            <div className="bg-[#141416] p-4 rounded-[20px] border border-white/[0.07] flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Total Invited</span>
                <div className="w-7 h-7 rounded-[8px] bg-[#007AFF] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Users className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-none">
                  {totalInvited}
                </p>
                <p className="text-[11px] text-zinc-500 mt-1">Friends joined</p>
              </div>
            </div>

            {/* Unlocked */}
            <div className="bg-[#141416] p-4 rounded-[20px] border border-white/[0.07] flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Completed</span>
                <div className="w-7 h-7 rounded-[8px] bg-[#34C759] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Coins className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-none">
                    {rewardsUnlocked}
                  </p>
                  {totalXpEarned > 0 && (
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      +{totalXpEarned} XP
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">Rewards granted</p>
              </div>
            </div>

            {/* Pending */}
            <div className="col-span-2 sm:col-span-1 bg-[#141416] p-4 rounded-[20px] border border-white/[0.07] flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Pending</span>
                <div className="w-7 h-7 rounded-[8px] bg-[#FF9500] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Hourglass className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-none">
                  {pendingInvites}
                </p>
                <p className="text-[11px] text-zinc-500 mt-1">Requires {XP_CONFIG.GAMES_REQUIRED_FOR_REFERRAL} games</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Friends List (iOS Inset Group) ── */}
        {referredUsers.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-3.5 mb-2 flex items-center justify-between">
              <span>Invited Friends</span>
              <span className="text-[11px] text-zinc-500 normal-case font-normal">
                {referredUsers.length} total
              </span>
            </div>

            <div className="bg-[#141416] rounded-[22px] border border-white/[0.07] divide-y divide-white/[0.05] overflow-hidden shadow-sm">
              {referredUsers.map((user) => {
                const gamesPlayed = user.gamesPlayedCount || 0;
                const isCompleted = user.referralRewardPaid;
                const progress = Math.min(100, Math.round((gamesPlayed / XP_CONFIG.GAMES_REQUIRED_FOR_REFERRAL) * 100));

                return (
                  <div
                    key={user._id.toString()}
                    className="flex items-center gap-3 p-3.5 sm:p-4 hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Avatar */}
                    {user.image ? (
                      <Image 
                        src={user.image} 
                        alt={user.name || "User"} 
                        width={36} 
                        height={36} 
                        className="w-9 h-9 rounded-full border border-white/[0.12] object-cover shrink-0 bg-zinc-800" 
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm">
                        {(user.name || "U").charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Name + progress */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs sm:text-sm font-semibold text-zinc-200 truncate">{user.name}</p>
                        <span className="text-[10px] text-zinc-400 shrink-0 font-medium">
                          {gamesPlayed}/{XP_CONFIG.GAMES_REQUIRED_FOR_REFERRAL} games
                        </span>
                      </div>
                      <div className="mt-1.5 bg-[#1f1f23] h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted ? "bg-[#34C759]" : "bg-gradient-to-r from-amber-500 to-orange-500"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Status badge */}
                    {isCompleted ? (
                      <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        <Check className="w-3 h-3" /> +{XP_CONFIG.REFERRAL_REWARD} XP
                      </span>
                    ) : (
                      <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-medium bg-white/[0.05] text-zinc-400 px-2.5 py-1 rounded-full border border-white/[0.06]">
                        <Hourglass className="w-3 h-3 text-amber-400" /> Pending
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
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-3.5 mb-2">
            How It Works
          </div>

          <div className="bg-[#141416] rounded-[22px] border border-white/[0.07] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
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
              ].map(({ step, title, desc, icon }) => (
                <div key={step} className="flex sm:flex-col items-start gap-3 sm:gap-2">
                  <div className="w-7 h-7 rounded-[8px] bg-white/[0.08] border border-white/[0.08] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {step}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-white flex items-center gap-1.5">
                      <span>{title}</span>
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom: Play Store Companion Card ── */}
        <div className="pt-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-3.5 mb-2 flex items-center justify-between">
            <span>Android App</span>
            <span className="text-sky-400 flex items-center gap-1 normal-case font-normal text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              Free on Google Play
            </span>
          </div>

          <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#161619] via-[#131316] to-[#0d0d0f] border border-white/[0.08] p-5 sm:p-6 shadow-xl group">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-sky-500/20 transition-all duration-700" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-12 h-12 rounded-[14px] bg-[#1a1a20] border border-white/[0.12] flex items-center justify-center shrink-0 shadow-lg shadow-black/40 group-hover:border-sky-500/40 transition-colors">
                  <svg className="w-6 h-6" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#32BBFF" d="M396.121 229.173 34.445 19.532C25.061 14.118 14.968 13.418 6.458 17.696L261.929 256 396.121 229.173z" />
                    <path fill="#32BBFF" d="m6.458 494.304 255.471-238.303L6.458 17.696C2.592 19.636 0 24.169 0 30.47v451.06c0 6.301 2.592 10.834 6.458 12.774z" />
                    <path fill="#FFD700" d="M419.978 274.638 396.121 261.17 261.929 256l134.192 26.827 23.857 13.469c11.27-6.408 11.27-15.25 0-21.658z" />
                    <path fill="#F3BC00" d="m396.121 282.827-361.676 209.64c9.084 5.203 19.018 4.66 27.547-.407L419.978 274.638 396.121 282.827z" />
                    <path fill="#00F076" d="M261.929 256 6.458 17.696c-1.054.516-2.058 1.142-2.993 1.89L261.929 256z" />
                    <path fill="#00DA65" d="M261.929 256 3.465 492.414c.934.748 1.939 1.374 2.993 1.89L261.929 256z" />
                    <path fill="#FF3A44" d="M419.978 237.362 61.992 19.26C53.463 14.192 43.529 13.65 34.445 19.532L261.929 256 419.978 237.362z" />
                    <path fill="#C31162" d="M261.929 256 34.445 492.468c9.084 5.882 19.018 5.34 27.547.272l358.986-218.103L261.929 256z" />
                  </svg>
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-bold text-white tracking-tight">
                      Bluebuff Games
                    </span>
                    <span className="text-[11px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                      ★ 4.8
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400 mt-0.5">
                    Official Android App • Fullscreen &amp; Offline Play
                  </span>
                  
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] font-medium text-zinc-300 bg-white/[0.05] border border-white/[0.06] px-2 py-0.5 rounded-md">
                      Instant Play
                    </span>
                    <span className="text-[10px] font-medium text-zinc-300 bg-white/[0.05] border border-white/[0.06] px-2 py-0.5 rounded-md">
                      No Lag
                    </span>
                    <span className="text-[10px] font-medium text-zinc-300 bg-white/[0.05] border border-white/[0.06] px-2 py-0.5 rounded-md">
                      Cloud Synced
                    </span>
                  </div>
                </div>
              </div>

              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-zinc-100 active:bg-zinc-200 text-black text-xs sm:text-sm font-semibold shadow-lg shadow-white/10 active:scale-[0.98] transition-all cursor-pointer shrink-0"
              >
                <span>Get on Google Play</span>
                <ArrowUpRight className="w-4 h-4 text-black" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
