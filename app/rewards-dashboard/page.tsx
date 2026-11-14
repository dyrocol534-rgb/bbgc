import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { XP_CONFIG } from "@/lib/xp";
import { SITE_CONFIG } from "@/lib/config";
import { Coins, Flame, Clock, Users, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import InfoTooltip from "@/components/ui/InfoTooltip";
import Link from "next/link";

export const metadata: Metadata = {
  title: `Player Rewards & Daily Bonuses | ${SITE_CONFIG.name}`,
  description: `Claim your daily gaming streak bonuses, convert playtime into XP, level up your profile, and unlock rewards on ${SITE_CONFIG.name}!`,
  alternates: {
    canonical: `${SITE_CONFIG.url}/rewards`,
  },
  openGraph: {
    title: `Player Rewards & Daily Bonuses | ${SITE_CONFIG.name}`,
    description: `Claim daily streak coins and bonuses on ${SITE_CONFIG.name}.`,
    url: `${SITE_CONFIG.url}/rewards`,
    siteName: SITE_CONFIG.name,
    type: "website",
  },
};

export default async function RewardsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/");

  await dbConnect();
  const currentUser = await User.findById((session.user as any).id)
    .select("xp lifetimeXp currentStreak lastStreakDate playtimeSeconds gamesPlayedCount createdAt")
    .lean();
  if (!currentUser) redirect("/");

  const xp = currentUser.xp || 0;
  const lifetimeXp = currentUser.lifetimeXp || xp;
  const streak = currentUser.currentStreak || 0;
  const playtimeSeconds = currentUser.playtimeSeconds || 0;
  const playtimeHours = Math.floor(playtimeSeconds / 3600);
  const playtimeMinutes = Math.floor((playtimeSeconds % 3600) / 60);
  const gamesPlayedCount = currentUser.gamesPlayedCount || 0;

  // Streak calculations
  const nextStreakBonus = Math.min(streak * XP_CONFIG.STREAK_BONUS_PER_DAY, XP_CONFIG.MAX_STREAK_BONUS);
  const maxPossibleDaily = XP_CONFIG.DAILY_LOGIN + XP_CONFIG.MAX_STREAK_BONUS;

  return (
    <div className="min-h-screen bg-black pb-12">
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 py-3 sm:py-4 space-y-4">

        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between">
          <Link
            href="/profile"
            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium border border-white/[0.08] active:scale-95 transition-all shadow-xs"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
            <span>Profile</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/leaderboard"
              className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium border border-white/[0.08] active:scale-95 transition-all shadow-xs"
            >
              <span>Leaderboard</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>

        {/* ── Header Card ── */}
        <div className="rounded-xl bg-zinc-950 border border-zinc-900 px-3.5 py-3 sm:px-4 sm:py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <h1 className="text-sm sm:text-base font-black text-white tracking-tight truncate">
              Rewards &amp; XP Bonuses
            </h1>
            <InfoTooltip
              size="xs"
              title="Rewards &amp; XP Bonuses"
              content="Track your daily login streaks, hourly play drops, and accumulated bonus points."
            />
          </div>

          <Link
            href="/rewards"
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-colors inline-flex items-center gap-1 shrink-0 active:scale-95 shadow-sm"
          >
            <span>Redeem Rewards</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* ── 2-Metric XP Overview Row ── */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {/* 1. Spendable XP Balance */}
          <div className="bg-zinc-950 p-3 sm:p-3.5 rounded-xl border border-zinc-900 flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Coins className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="text-[10px] sm:text-[11px] font-medium text-zinc-500 leading-none mb-1">XP Balance</span>
                <span className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight truncate font-mono">
                  {xp.toLocaleString()} XP
                </span>
              </div>
            </div>
            <InfoTooltip
              size="xs"
              title="Redeemable XP"
              content="Your spendable coin balance. Use this in the Rewards Store to claim BGMI UC and MLBB Weekly Passes."
            />
          </div>

          {/* 2. Lifetime Earned XP */}
          <div className="bg-zinc-950 p-3 sm:p-3.5 rounded-xl border border-zinc-900 flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
                <Coins className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="text-[10px] sm:text-[11px] font-medium text-zinc-500 leading-none mb-1">Lifetime XP</span>
                <span className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight truncate font-mono">
                  {lifetimeXp.toLocaleString()} XP
                </span>
              </div>
            </div>
            <InfoTooltip
              size="xs"
              title="Lifetime XP"
              content="Total accumulated XP earned across all daily logins, playtime drops, and referral rewards. Used for your Global Leaderboard rank."
            />
          </div>
        </div>

        {/* ── Ways to Earn XP ── */}
        <div className="space-y-1.5">
          <h2 className="text-[10px] sm:text-[10.5px] font-semibold text-zinc-500 uppercase tracking-wider px-1">
            Ways to Earn XP
          </h2>

          <div className="border border-zinc-900 rounded-xl divide-y divide-zinc-900 overflow-hidden bg-black">
            {/* Daily Streak */}
            <div className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-zinc-950/70 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <Flame className="w-5 h-5 text-orange-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-[13px] font-bold text-white tracking-tight truncate">Daily Login Bonus</p>
                  <p className="text-[10.5px] sm:text-[11px] text-zinc-400 truncate">Log in every day to grow your bonus XP</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10.5px] font-mono font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-md inline-block">
                  +{XP_CONFIG.DAILY_LOGIN + nextStreakBonus} XP/day
                </span>
                <div className="text-[9.5px] text-zinc-500 mt-0.5">Max: +{maxPossibleDaily} XP</div>
              </div>
            </div>

            {/* Gameplay Duration */}
            <div className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-zinc-950/70 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <Clock className="w-5 h-5 text-sky-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-[13px] font-bold text-white tracking-tight truncate">Play Games</p>
                  <p className="text-[10.5px] sm:text-[11px] text-zinc-400 truncate">Earn XP for every hour you play</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10.5px] font-mono font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-md inline-block">
                  +{XP_CONFIG.PLAYTIME_PER_HOUR} XP/hr
                </span>
                <div className="text-[9.5px] text-zinc-500 mt-0.5">Auto-synced</div>
              </div>
            </div>

            {/* Refer Friends */}
            <div className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-zinc-950/70 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <Users className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-[13px] font-bold text-white tracking-tight truncate">Invite Friends</p>
                  <p className="text-[10.5px] sm:text-[11px] text-zinc-400 truncate">Get bonus XP when a friend plays games</p>
                </div>
              </div>
              <Link
                href="/referral"
                className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full hover:bg-emerald-500/20 active:scale-95 transition-all"
              >
                <span>+{XP_CONFIG.REFERRAL_REWARD} XP</span>
                <ArrowRight className="w-3 h-3 ml-0.5" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
