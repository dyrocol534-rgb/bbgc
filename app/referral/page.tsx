import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { XP_CONFIG } from "@/lib/xp";
import ReferralClient from "./ReferralClient";
import { Users, Coins, Hourglass, Check, ChevronLeft, ChevronRight, ShieldCheck, HeartHandshake } from "lucide-react";
import InfoTooltip from "@/components/ui/InfoTooltip";
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

  // Conversion rate and additional metrics
  const conversionRate = totalInvited > 0 ? Math.round((rewardsUnlocked / totalInvited) * 100) : 0;
  const potentialXp = pendingInvites * XP_CONFIG.REFERRAL_REWARD;

  return (
    <div className="min-h-screen bg-black pb-12">
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 py-3 sm:py-4 space-y-4">

        {/* ── Top Navigation Bar ── */}
        <div className="flex items-center justify-between">
          <Link
            href="/profile"
            className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium border border-zinc-800 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
            <span>Profile</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/rewards"
              className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 text-amber-400 hover:text-amber-300 text-xs font-medium transition-colors"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Rewards</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-400/70 group-hover:text-amber-300 transition-transform" />
            </Link>

            <Link
              href="/leaderboard"
              className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium border border-zinc-800 transition-colors"
            >
              <span>Leaderboard</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-transform" />
            </Link>
          </div>
        </div>

        {/* ── Header with InfoTooltip ── */}
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
              Referral Program
            </h1>
            <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
              +{XP_CONFIG.REFERRAL_REWARD} XP Each
            </span>
            <InfoTooltip
              size="xs"
              title="Referral Program"
              content={`Invite friends to play on Bluebuff — both of you earn ${XP_CONFIG.REFERRAL_REWARD} bonus XP as soon as they try ${XP_CONFIG.GAMES_REQUIRED_FOR_REFERRAL} games.`}
            />
          </div>
        </div>

        {/* ── Combined 2-Row Stats Card (No Scroll) ── */}
        <div className="rounded-xl bg-zinc-950 border border-zinc-900 divide-y divide-zinc-900 overflow-hidden">
          {/* Row 1: Friends activity (Invited, Joined, Playing) */}
          <div className="grid grid-cols-3 divide-x divide-zinc-900">
            {/* 1. Invited */}
            <div className="p-2 sm:p-2.5 flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#007AFF]/10 flex items-center justify-center shrink-0">
                <Users className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#007AFF]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-medium text-zinc-500 leading-none truncate">Invited</span>
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight truncate font-mono mt-0.5">
                  {totalInvited}
                </span>
              </div>
            </div>

            {/* 2. Joined */}
            <div className="p-2 sm:p-2.5 flex items-center justify-between gap-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Check className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-400" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-medium text-zinc-500 leading-none truncate">Joined</span>
                  <span className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight truncate font-mono mt-0.5">
                    {rewardsUnlocked}
                  </span>
                </div>
              </div>
              <InfoTooltip
                size="xs"
                title="Completed Invites"
                content={`Friends who joined with your referral code and played at least ${XP_CONFIG.GAMES_REQUIRED_FOR_REFERRAL} games. Both of you received +${XP_CONFIG.REFERRAL_REWARD} XP.`}
              />
            </div>

            {/* 3. Playing */}
            <div className="p-2 sm:p-2.5 flex items-center justify-between gap-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                  <Hourglass className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-orange-400" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-medium text-zinc-500 leading-none truncate">Playing</span>
                  <span className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight truncate font-mono mt-0.5">
                    {pendingInvites}
                  </span>
                </div>
              </div>
              <InfoTooltip
                size="xs"
                title="In Progress Invites"
                content={`Friends who signed up with your link but haven't finished playing ${XP_CONFIG.GAMES_REQUIRED_FOR_REFERRAL} games yet.`}
              />
            </div>
          </div>

          {/* Row 2: Rewards & Success (Earned XP, Pending XP, Success Rate) */}
          <div className="grid grid-cols-3 divide-x divide-zinc-900">
            {/* 4. Earned XP */}
            <div className="p-2 sm:p-2.5 flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <Coins className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-amber-400" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-medium text-zinc-500 leading-none truncate">Earned</span>
                <span className="text-xs sm:text-sm font-bold text-amber-400 tracking-tight leading-tight truncate font-mono mt-0.5">
                  +{totalXpEarned} XP
                </span>
              </div>
            </div>

            {/* 5. Pending XP */}
            <div className="p-2 sm:p-2.5 flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-purple-400" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-medium text-zinc-500 leading-none truncate">Pending</span>
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight truncate font-mono mt-0.5">
                  +{potentialXp} XP
                </span>
              </div>
            </div>

            {/* 6. Success Rate */}
            <div className="p-2 sm:p-2.5 flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
                <HeartHandshake className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-rose-400" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-medium text-zinc-500 leading-none truncate">Success</span>
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight truncate font-mono mt-0.5">
                  {conversionRate}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Responsive Content Grid (Left: Invite Controls, Right: Invited Friends Table) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] xl:grid-cols-[420px_1fr] gap-4 items-start">

          {/* ── Left Column: Invite Card & Quick Instructions ── */}
          <div className="space-y-4">
            {/* Referral Link & Code Card */}
            <ReferralClient referralCode={referralCode} />

            {/* How it works */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-1">
                How Referrals Work
              </div>

              <div className="bg-zinc-950 rounded-xl border border-zinc-900 p-3.5 sm:p-4 space-y-3">
                {[
                  { 
                    step: "1", 
                    title: "Share your code or direct link", 
                    desc: "Send your unique code or invite link to gaming buddies via WhatsApp, X, or direct message.",
                  },
                  { 
                    step: "2", 
                    title: `Friend plays ${XP_CONFIG.GAMES_REQUIRED_FOR_REFERRAL} games`, 
                    desc: "When they sign up and play their first 10 instant browser games, their progress updates in real-time.",
                  },
                  { 
                    step: "3", 
                    title: `Both unlock +${XP_CONFIG.REFERRAL_REWARD} XP instantly`, 
                    desc: "Bonus XP is credited directly to your player profiles to unlock leaderboards and rewards.",
                  },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {step}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs font-semibold text-white leading-tight">
                        {title}
                      </p>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right Column: Friends List & Live Progress ── */}
          <div className="space-y-1.5 min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-1 flex items-center justify-between">
              <span>Invited Friends &amp; Progress</span>
              <span className="text-[11px] text-zinc-500 normal-case font-mono">
                {referredUsers.length} total invite{referredUsers.length !== 1 ? "s" : ""}
              </span>
            </div>

            {referredUsers.length > 0 ? (
              <div className="bg-black rounded-xl border border-zinc-900 divide-y divide-zinc-900 overflow-hidden">
                {referredUsers.map((user) => {
                  const gamesPlayed = user.gamesPlayedCount || 0;
                  const isCompleted = user.referralRewardPaid;
                  const progress = Math.min(100, Math.round((gamesPlayed / XP_CONFIG.GAMES_REQUIRED_FOR_REFERRAL) * 100));
                  const joinedDate = (user as any).createdAt 
                    ? new Date((user as any).createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : "Recently";

                  return (
                    <div
                      key={user._id.toString()}
                      className="flex items-center gap-3 p-3 sm:p-3.5 hover:bg-zinc-950 transition-colors"
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {user.image ? (
                          <Image 
                            src={user.image} 
                            alt={user.name || "User"} 
                            width={36} 
                            height={36} 
                            className="w-9 h-9 rounded-full border border-zinc-800 object-cover bg-zinc-900" 
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-xs text-white">
                            {(user.name || "U").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-black ${
                          isCompleted ? "bg-emerald-400" : "bg-amber-400"
                        }`} />
                      </div>

                      {/* Name + progress */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-white truncate">{user.name || "Player"}</p>
                            <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
                              Joined {joinedDate}
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-400 shrink-0 font-medium font-mono">
                            {gamesPlayed}/{XP_CONFIG.GAMES_REQUIRED_FOR_REFERRAL} games
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-1.5 bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCompleted ? "bg-emerald-400" : "bg-amber-400"
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Status badge */}
                      {isCompleted ? (
                        <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                          <Check className="w-3 h-3" /> +{XP_CONFIG.REFERRAL_REWARD} XP
                        </span>
                      ) : (
                        <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium bg-zinc-900 text-zinc-400 px-2.5 py-1 rounded-lg border border-zinc-800">
                          <Hourglass className="w-3 h-3 text-amber-400" /> {progress}%
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-8 flex flex-col items-center text-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <Users className="w-5 h-5 text-zinc-500" />
                </div>
                <p className="text-sm font-semibold text-zinc-200">No invited friends yet</p>
                <p className="text-xs text-zinc-500 max-w-sm">
                  Share your referral link above with friends. Once they join and try 10 games, both of you will receive bonus XP here!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
