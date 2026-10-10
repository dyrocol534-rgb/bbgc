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
    .select("xp currentStreak playtimeSeconds")
    .lean();
  if (!currentUser) redirect("/");

  const xp = currentUser.xp || 0;
  const streak = currentUser.currentStreak || 0;
  const playtimeSeconds = currentUser.playtimeSeconds || 0;
  const playtimeHours = Math.floor(playtimeSeconds / 3600);
  const playtimeMinutes = Math.floor((playtimeSeconds % 3600) / 60);
  const nextStreakBonus = Math.min(streak * XP_CONFIG.STREAK_BONUS_PER_DAY, XP_CONFIG.MAX_STREAK_BONUS);

  return (
    <div className="min-h-screen bg-black pb-12">
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-5">

        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium border border-zinc-800 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-zinc-400" />
            <span>Profile</span>
          </Link>
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
            Rewards &amp; Bonuses
          </span>
        </div>

        {/* ── Balance Stats (Compact AMOLED Row) ── */}
        <div className="grid grid-cols-3 gap-2 border border-zinc-900 bg-black rounded-xl p-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
              <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Balance</span>
            </div>
            <p className="text-lg sm:text-xl font-bold font-mono text-white leading-tight">
              {xp.toLocaleString()}
            </p>
            <p className="text-[10px] text-zinc-500">XP Points</p>
          </div>

          <div className="space-y-1 border-x border-zinc-900 px-3">
            <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
              <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span>Daily Streak</span>
            </div>
            <p className="text-lg sm:text-xl font-bold font-mono text-white leading-tight">
              {streak} <span className="text-xs font-normal text-zinc-500">Days</span>
            </p>
            <p className="text-[10px] text-zinc-400">
              Next: <span className="text-white font-medium">+{XP_CONFIG.DAILY_LOGIN + nextStreakBonus} XP</span>
            </p>
          </div>

          <div className="space-y-1 pl-1">
            <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Playtime</span>
            </div>
            <p className="text-lg sm:text-xl font-bold font-mono text-white leading-tight">
              {playtimeHours}h {playtimeMinutes}m
            </p>
            <p className="text-[10px] text-zinc-500">In-game</p>
          </div>
        </div>

        {/* ── Ways to Earn XP (Clean Flat List) ── */}
        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
            Ways to Earn XP
          </h2>

          <div className="border border-zinc-900 rounded-xl divide-y divide-zinc-900 overflow-hidden bg-black">
            {/* Daily Streak */}
            <div className="p-3 flex items-center justify-between gap-3 hover:bg-zinc-950 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-white">Daily Streak Check-in</p>
                  <p className="text-[11px] text-zinc-500">Log in every day to stack multiplier rewards</p>
                </div>
              </div>
              <span className="shrink-0 text-[11px] font-mono font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md">
                Up to +{XP_CONFIG.DAILY_LOGIN + XP_CONFIG.MAX_STREAK_BONUS} XP/d
              </span>
            </div>

            {/* Gameplay Duration */}
            <div className="p-3 flex items-center justify-between gap-3 hover:bg-zinc-950 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-white">Gameplay Duration</p>
                  <p className="text-[11px] text-zinc-500">Play any HTML5 game to receive hourly drops</p>
                </div>
              </div>
              <span className="shrink-0 text-[11px] font-mono font-medium text-indigo-300 bg-indigo-950/40 border border-indigo-900/60 px-2 py-0.5 rounded-md">
                +{XP_CONFIG.PLAYTIME_PER_HOUR} XP/hr
              </span>
            </div>

            {/* Refer Friends */}
            <div className="p-3 flex items-center justify-between gap-3 hover:bg-zinc-950 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-white">Refer Friends</p>
                  <p className="text-[11px] text-zinc-500">Share your invite link and both earn bonus XP</p>
                </div>
              </div>
              <Link
                href="/referral"
                className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-2 py-0.5 rounded-md hover:bg-emerald-900/50 transition-colors"
              >
                <span>+{XP_CONFIG.REFERRAL_REWARD} XP</span>
                <ArrowRight className="w-3 h-3 ml-0.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Rewards Store (Compact) ── */}
        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
            Redeem &amp; Perks
          </h2>

          <div className="p-3 rounded-xl border border-zinc-900 bg-black flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                <Gift className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-white">Rewards Store</p>
                <p className="text-[11px] text-zinc-500">Gamer badges, avatar frames, and game perks</p>
              </div>
            </div>
            <span className="shrink-0 text-[10px] font-medium text-zinc-500 bg-zinc-900/70 border border-zinc-800 px-2 py-0.5 rounded-md">
              Coming Soon
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
