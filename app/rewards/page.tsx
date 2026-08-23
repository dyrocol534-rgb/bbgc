import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { XP_CONFIG } from "@/lib/xp";
import { Coins, Flame, Clock, Gamepad2, Users, ShoppingBag, Gift, ArrowRight } from "lucide-react";
import Link from "next/link";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Bluebuff Games";
const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://games.bluebuff.in";
const siteUrl = rawSiteUrl.replace(/\/+$/, "");

export const metadata: Metadata = {
  title: `Player Rewards & Daily Bonuses | ${siteName}`,
  description: `Claim your daily gaming streak bonuses, convert playtime into XP, level up your profile, and unlock rewards on ${siteName}!`,
  alternates: {
    canonical: `${siteUrl}/rewards`,
  },
  openGraph: {
    title: `Player Rewards & Daily Bonuses | ${siteName}`,
    description: `Claim daily streak coins and bonuses on ${siteName}.`,
    url: `${siteUrl}/rewards`,
    siteName,
    type: "website",
  },
};

export default async function RewardsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/");

  await dbConnect();
  const currentUser = await User.findById((session.user as any).id).lean();
  if (!currentUser) redirect("/");

  const xp = currentUser.xp || 0;
  const streak = currentUser.currentStreak || 0;
  const playtimeSeconds = currentUser.playtimeSeconds || 0;
  const playtimeHours = Math.floor(playtimeSeconds / 3600);
  const playtimeMinutes = Math.floor((playtimeSeconds % 3600) / 60);
  const nextStreakBonus = Math.min(streak * XP_CONFIG.STREAK_BONUS_PER_DAY, XP_CONFIG.MAX_STREAK_BONUS);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Rewards</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Earn XP, track progress, redeem rewards.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* XP */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5 group hover:border-amber-500/40 transition-colors">
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-amber-500/15 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
          <div className="relative">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-2">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-0.5">Total XP</p>
            <p className="text-2xl font-black text-white leading-none">{xp}</p>
          </div>
        </div>

        {/* Streak */}
        <div className="relative overflow-hidden rounded-2xl border border-orange-500/20 bg-orange-500/5 p-3.5 group hover:border-orange-500/40 transition-colors">
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-orange-500/15 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
          <div className="relative">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center mb-2">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-0.5">Streak</p>
            <div className="flex items-end gap-1 leading-none">
              <p className="text-2xl font-black text-white">{streak}</p>
              <p className="text-[10px] font-bold text-orange-400 mb-0.5 uppercase">days</p>
            </div>
            <p className="text-[10px] text-zinc-600 mt-1">Next: <span className="text-amber-400 font-semibold">+{XP_CONFIG.DAILY_LOGIN + nextStreakBonus} XP</span></p>
          </div>
        </div>

        {/* Playtime */}
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-3.5 group hover:border-indigo-500/40 transition-colors">
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-indigo-500/15 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
          <div className="relative">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-2">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-0.5">Playtime</p>
            <div className="flex items-end gap-1 leading-none">
              <p className="text-2xl font-black text-white">{playtimeHours}</p>
              <p className="text-[10px] font-bold text-indigo-400 mb-0.5 uppercase">hr</p>
              <p className="text-2xl font-black text-white">{playtimeMinutes}</p>
              <p className="text-[10px] font-bold text-indigo-400 mb-0.5 uppercase">m</p>
            </div>
          </div>
        </div>
      </div>

      {/* How to Earn */}
      <div>
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2.5">How to earn XP</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">

          <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/40 p-3 space-y-2 hover:border-zinc-700/70 transition-colors">
            <Gamepad2 className="w-4 h-4 text-sky-400" />
            <div>
              <p className="text-xs font-bold text-white">Play Games</p>
              <p className="text-[11px] text-zinc-500 leading-snug mt-0.5">Earn XP for each new game you try.</p>
            </div>
            <span className="inline-flex text-[11px] font-black text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full">
              +{XP_CONFIG.PLAY_GAME} XP / Game
            </span>
          </div>

          <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/40 p-3 space-y-2 hover:border-zinc-700/70 transition-colors">
            <Flame className="w-4 h-4 text-orange-400" />
            <div>
              <p className="text-xs font-bold text-white">Daily Streak</p>
              <p className="text-[11px] text-zinc-500 leading-snug mt-0.5">Log in daily — bonus grows every consecutive day.</p>
            </div>
            <span className="inline-flex text-[11px] font-black text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
              Up to +{XP_CONFIG.DAILY_LOGIN + XP_CONFIG.MAX_STREAK_BONUS} XP/day
            </span>
          </div>

          <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/40 p-3 space-y-2 hover:border-zinc-700/70 transition-colors">
            <Clock className="w-4 h-4 text-indigo-400" />
            <div>
              <p className="text-xs font-bold text-white">Playtime</p>
              <p className="text-[11px] text-zinc-500 leading-snug mt-0.5">The longer you actively play, the more you earn.</p>
            </div>
            <span className="inline-flex text-[11px] font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
              +{XP_CONFIG.PLAYTIME_PER_HOUR} XP / Hour
            </span>
          </div>

          <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/40 p-3 space-y-2 hover:border-zinc-700/70 transition-colors">
            <Users className="w-4 h-4 text-purple-400" />
            <div>
              <p className="text-xs font-bold text-white">Refer Friends</p>
              <p className="text-[11px] text-zinc-500 leading-snug mt-0.5">Both of you get rewarded when they play 10 games.</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex text-[11px] font-black text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                +{XP_CONFIG.REFERRAL_REWARD} XP
              </span>
              <Link href="/referral" className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Coming Soon Store */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-5 flex items-center gap-4">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 via-transparent to-purple-600/5 pointer-events-none" />
        <div className="shrink-0 w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center">
          <ShoppingBag className="w-5 h-5 text-zinc-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white">Rewards Store</p>
          <p className="text-[11px] text-zinc-500 leading-snug">Redeem XP for avatars, badges &amp; premium games.</p>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/60 border border-zinc-700/50 text-zinc-400 font-bold rounded-full text-[10px] uppercase tracking-widest">
          <Gift className="w-3 h-3" />
          Soon
        </div>
      </div>

    </div>
  );
}
