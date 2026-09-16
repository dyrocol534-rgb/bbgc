import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { XP_CONFIG } from "@/lib/xp";
import { Coins, Flame, Clock, Gamepad2, Users, ShoppingBag, Gift, ArrowRight, ChevronLeft } from "lucide-react";
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
            Rewards
          </span>
        </div>

        {/* ── Large Header ── */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Rewards &amp; Bonuses
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Earn XP from active playtime, maintain your daily streaks, and redeem player perks.
          </p>
        </div>

        {/* ── Responsive Stats Grid ── */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-3.5 mb-2">
            Your Balance &amp; Progress
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {/* Total XP */}
            <div className="bg-[#141416] p-4 rounded-[20px] border border-white/[0.07] flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Total Balance</span>
                <div className="w-7 h-7 rounded-[8px] bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0 shadow-sm">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-none">
                  {xp}
                </p>
                <p className="text-[11px] text-amber-400 font-semibold mt-1">XP Points</p>
              </div>
            </div>

            {/* Streak */}
            <div className="bg-[#141416] p-4 rounded-[20px] border border-white/[0.07] flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Daily Streak</span>
                <div className="w-7 h-7 rounded-[8px] bg-orange-500/15 border border-orange-500/25 flex items-center justify-center shrink-0 shadow-sm">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-none">
                  {streak}
                  <span className="text-xs font-normal text-zinc-400 ml-1">Days</span>
                </p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Next: <span className="text-orange-400 font-semibold">+{XP_CONFIG.DAILY_LOGIN + nextStreakBonus} XP</span>
                </p>
              </div>
            </div>

            {/* Playtime */}
            <div className="col-span-2 sm:col-span-1 bg-[#141416] p-4 rounded-[20px] border border-white/[0.07] flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Total Playtime</span>
                <div className="w-7 h-7 rounded-[8px] bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center shrink-0 shadow-sm">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-none">
                    {playtimeHours}h {playtimeMinutes}m
                  </p>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">In-game duration</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Ways to Earn XP (iOS Inset 2-Col Grid) ── */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-3.5 mb-2">
            Ways to Earn XP
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Play Games */}
            <div className="bg-[#141416] p-4 sm:p-5 rounded-[22px] border border-white/[0.07] flex flex-col justify-between space-y-3 shadow-sm hover:border-white/[0.12] transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-[9px] bg-[#007AFF] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Gamepad2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Play New Games</p>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                    Earn XP bonus whenever you discover and launch games from the library.
                  </p>
                </div>
              </div>
              <div>
                <span className="inline-flex text-[11px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-full">
                  +{XP_CONFIG.PLAY_GAME} XP / Game
                </span>
              </div>
            </div>

            {/* Daily Streak */}
            <div className="bg-[#141416] p-4 sm:p-5 rounded-[22px] border border-white/[0.07] flex flex-col justify-between space-y-3 shadow-sm hover:border-white/[0.12] transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-[9px] bg-[#FF9500] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Daily Streak Check-in</p>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                    Log in every day. Your multiplier compounds with each consecutive day.
                  </p>
                </div>
              </div>
              <div>
                <span className="inline-flex text-[11px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full">
                  Up to +{XP_CONFIG.DAILY_LOGIN + XP_CONFIG.MAX_STREAK_BONUS} XP / Day
                </span>
              </div>
            </div>

            {/* Playtime */}
            <div className="bg-[#141416] p-4 sm:p-5 rounded-[22px] border border-white/[0.07] flex flex-col justify-between space-y-3 shadow-sm hover:border-white/[0.12] transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-[9px] bg-[#5856D6] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Gameplay Duration</p>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                    Stay active in any arcade or HTML5 game to accumulate hourly XP drops.
                  </p>
                </div>
              </div>
              <div>
                <span className="inline-flex text-[11px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                  +{XP_CONFIG.PLAYTIME_PER_HOUR} XP / Hour
                </span>
              </div>
            </div>

            {/* Refer Friends */}
            <div className="bg-[#141416] p-4 sm:p-5 rounded-[22px] border border-white/[0.07] flex flex-col justify-between space-y-3 shadow-sm hover:border-white/[0.12] transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-[9px] bg-[#34C759] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Refer Friends</p>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                    Share your invite code. You both receive bonus XP when they play.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  +{XP_CONFIG.REFERRAL_REWARD} XP / Friend
                </span>
                <Link
                  href="/referral"
                  className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>Invite</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Rewards Store Card (iOS Inset) ── */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-3.5 mb-2">
            Redeem &amp; Perks
          </div>

          <div className="relative overflow-hidden rounded-[24px] bg-[#141416] border border-white/[0.08] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-[12px] bg-[#FF2D55]/15 border border-[#FF2D55]/25 flex items-center justify-center text-[#FF2D55] shrink-0 shadow-sm">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-white">Player Rewards Store</p>
                <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                  Redeem earned XP for exclusive gamer badges, avatar frames, and game perks.
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.06] border border-white/[0.08] text-zinc-300 font-semibold rounded-full text-xs">
              <Gift className="w-3.5 h-3.5 text-amber-400" />
              <span>Catalog Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
