import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { XP_CONFIG } from "@/lib/xp";
import { SITE_CONFIG } from "@/lib/config";
import { Coins, Flame, Clock, Users, ArrowRight, ChevronLeft, Gift } from "lucide-react";
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
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium border border-zinc-800 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
            <span>Profile</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/rewards"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 text-amber-400 hover:text-amber-300 text-xs font-medium transition-colors"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Rewards Store</span>
            </Link>

            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium border border-zinc-800 transition-colors"
            >
              <span>Leaderboard</span>
            </Link>
          </div>
        </div>

        {/* ── Header Card ── */}
        <div className="rounded-xl bg-zinc-950 border border-zinc-900 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
              Rewards &amp; XP Bonuses
            </h1>
            <p className="text-xs text-zinc-400">
              Track your daily login streaks, hourly play drops, and accumulated bonus points.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <Link
              href="/rewards"
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-colors inline-flex items-center gap-1"
            >
              <span>Redeem Rewards</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ── 6-Metric Player Overview Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
          {/* 1. Spendable XP Balance */}
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[10px] font-medium text-zinc-500 leading-none mb-1">XP Balance</span>
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight truncate font-mono">
                {xp.toLocaleString()} XP
              </span>
            </div>
          </div>

          {/* 2. Lifetime Earned XP */}
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
              <Coins className="w-3.5 h-3.5 text-yellow-400" />
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[10px] font-medium text-zinc-500 leading-none mb-1">Lifetime XP</span>
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight truncate font-mono">
                {lifetimeXp.toLocaleString()} XP
              </span>
            </div>
          </div>

          {/* 3. Daily Streak */}
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[10px] font-medium text-zinc-500 leading-none mb-1">Streak</span>
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight truncate">
                {streak} Days
              </span>
            </div>
          </div>

          {/* 4. Total Playtime */}
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[10px] font-medium text-zinc-500 leading-none mb-1">Playtime</span>
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight truncate font-mono">
                {playtimeHours}h {playtimeMinutes}m
              </span>
            </div>
          </div>

          {/* 5. Games Played */}
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[10px] font-medium text-zinc-500 leading-none mb-1">Games Played</span>
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight truncate font-mono">
                {gamesPlayedCount}
              </span>
            </div>
          </div>

          {/* 6. Current Daily Reward */}
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[10px] font-medium text-zinc-500 leading-none mb-1">Daily Drop</span>
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight truncate font-mono">
                +{XP_CONFIG.DAILY_LOGIN + nextStreakBonus} XP
              </span>
            </div>
          </div>
        </div>

        {/* ── 2-Column Responsive Breakdown ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

          {/* ── Left Column: Ways to Earn XP ── */}
          <div className="space-y-1.5">
            <h2 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-1">
              Active XP Multipliers &amp; Earn Ways
            </h2>

            <div className="border border-zinc-900 rounded-xl divide-y divide-zinc-900 overflow-hidden bg-black">
              {/* Daily Streak */}
              <div className="p-3.5 flex items-center justify-between gap-3 hover:bg-zinc-950 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-white truncate">Daily Login Streak</p>
                    <p className="text-[11px] text-zinc-500 truncate">Log in each day to maintain your streak multiplier</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] font-mono font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-md inline-block">
                    +{XP_CONFIG.DAILY_LOGIN + nextStreakBonus} XP/day
                  </span>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Cap: +{maxPossibleDaily} XP</div>
                </div>
              </div>

              {/* Gameplay Duration */}
              <div className="p-3.5 flex items-center justify-between gap-3 hover:bg-zinc-950 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-white truncate">Playtime Activity Drop</p>
                    <p className="text-[11px] text-zinc-500 truncate">Play any HTML5 browser game to trigger hourly drops</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] font-mono font-bold text-indigo-300 bg-indigo-950/40 border border-indigo-900/60 px-2 py-0.5 rounded-md inline-block">
                    +{XP_CONFIG.PLAYTIME_PER_HOUR} XP/hr
                  </span>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Auto-synced</div>
                </div>
              </div>

              {/* Refer Friends */}
              <div className="p-3.5 flex items-center justify-between gap-3 hover:bg-zinc-950 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-white truncate">Invite Friends (Referral)</p>
                    <p className="text-[11px] text-zinc-500 truncate">Both receive bonus XP when friend plays 10 games</p>
                  </div>
                </div>
                <Link
                  href="/referral"
                  className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg hover:bg-emerald-500/20 transition-colors"
                >
                  <span>+{XP_CONFIG.REFERRAL_REWARD} XP</span>
                  <ArrowRight className="w-3 h-3 ml-0.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* ── Right Column: Rewards Catalog & Tiers ── */}
          <div className="space-y-1.5">
            <h2 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-1">
              Redeem, Store &amp; Tier Perks
            </h2>

            <div className="border border-zinc-900 rounded-xl divide-y divide-zinc-900 overflow-hidden bg-black">
              {/* Rewards Store */}
              <div className="p-3.5 flex items-center justify-between gap-3 hover:bg-zinc-950 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-white truncate">Player Rewards Store</p>
                    <p className="text-[11px] text-zinc-500 truncate">Exclusive profile frames, chat badges &amp; custom themes</p>
                  </div>
                </div>
                <Link
                  href="/rewards"
                  className="shrink-0 text-[10px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md hover:bg-amber-500/20 transition-colors"
                >
                  Coming Soon →
                </Link>
              </div>

              {/* Leaderboard Competitions */}
              <div className="p-3.5 flex items-center justify-between gap-3 hover:bg-zinc-950 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-white truncate">Global Leaderboard Rank</p>
                    <p className="text-[11px] text-zinc-500 truncate">Climb top 100 global rankings with lifetime XP</p>
                  </div>
                </div>
                <Link
                  href="/leaderboard"
                  className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <span>View Rank</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* VIP Perks */}
              <div className="p-3.5 flex items-center justify-between gap-3 hover:bg-zinc-950 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                    <Flame className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-white truncate">Streak Saver Perk</p>
                    <p className="text-[11px] text-zinc-500 truncate">Protect your streak if you miss a single calendar day</p>
                  </div>
                </div>
                <span className="shrink-0 text-[10px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md">
                  In Dev
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
