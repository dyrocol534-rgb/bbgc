import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { XP_CONFIG } from "@/lib/xp";
import { Coins, Flame, Clock, Users, ShoppingBag, Gift, ArrowRight, ChevronLeft } from "lucide-react";
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
            Rewards
          </span>
        </div>

        {/* ── Header ── */}
        <div className="space-y-0.5">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Rewards &amp; Bonuses
          </h1>
          <p className="text-xs text-zinc-400">
            Earn XP from active playtime, maintain daily streaks, and redeem player perks.
          </p>
        </div>

        {/* ── Balance & Progress Cards ── */}
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 px-1 mb-1.5">
            Your Balance &amp; Progress
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
            {/* Total XP */}
            <div className="bg-[#141416] p-3.5 rounded-[18px] border border-white/[0.07] flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9.5px] font-semibold text-zinc-400 uppercase tracking-wider">Total Balance</span>
                <div className="w-6 h-6 rounded-[7px] bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0 shadow-xs">
                  <Coins className="w-3 h-3 text-amber-400" />
                </div>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-none">
                  {xp}
                </p>
                <p className="text-[10.5px] text-amber-400 font-semibold mt-0.5">XP Points</p>
              </div>
            </div>

            {/* Streak */}
            <div className="bg-[#141416] p-3.5 rounded-[18px] border border-white/[0.07] flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9.5px] font-semibold text-zinc-400 uppercase tracking-wider">Daily Streak</span>
                <div className="w-6 h-6 rounded-[7px] bg-white/[0.08] border border-white/[0.12] flex items-center justify-center shrink-0 shadow-xs">
                  <Flame className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-none">
                  {streak}
                  <span className="text-xs font-normal text-zinc-400 ml-1">Days</span>
                </p>
                <p className="text-[10.5px] text-zinc-500 mt-0.5">
                  Next: <span className="text-white font-semibold">+{XP_CONFIG.DAILY_LOGIN + nextStreakBonus} XP</span>
                </p>
              </div>
            </div>

            {/* Playtime */}
            <div className="col-span-2 sm:col-span-1 bg-[#141416] p-3.5 rounded-[18px] border border-white/[0.07] flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9.5px] font-semibold text-zinc-400 uppercase tracking-wider">Total Playtime</span>
                <div className="w-6 h-6 rounded-[7px] bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center shrink-0 shadow-xs">
                  <Clock className="w-3 h-3 text-indigo-400" />
                </div>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-none">
                  {playtimeHours}h {playtimeMinutes}m
                </p>
                <p className="text-[10.5px] text-zinc-500 mt-0.5">In-game duration</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Ways to Earn XP ── */}
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 px-1 mb-1.5">
            Ways to Earn XP
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Daily Streak */}
            <div className="bg-[#141416] p-3.5 rounded-[18px] border border-white/[0.07] flex flex-col justify-between space-y-2.5 shadow-xs hover:border-white/[0.12] transition-colors">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-[8px] bg-white/10 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Flame className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-white">Daily Streak Check-in</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-normal">
                    Log in every day. Your multiplier compounds with each consecutive day.
                  </p>
                </div>
              </div>
              <div>
                <span className="inline-flex text-[10.5px] font-bold text-white bg-white/10 border border-white/20 px-2.5 py-0.5 rounded-full">
                  Up to +{XP_CONFIG.DAILY_LOGIN + XP_CONFIG.MAX_STREAK_BONUS} XP / Day
                </span>
              </div>
            </div>

            {/* Playtime */}
            <div className="bg-[#141416] p-3.5 rounded-[18px] border border-white/[0.07] flex flex-col justify-between space-y-2.5 shadow-xs hover:border-white/[0.12] transition-colors">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-[8px] bg-[#5856D6] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-white">Gameplay Duration</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-normal">
                    Stay active in any arcade or HTML5 game to accumulate hourly XP drops.
                  </p>
                </div>
              </div>
              <div>
                <span className="inline-flex text-[10.5px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                  +{XP_CONFIG.PLAYTIME_PER_HOUR} XP / Hour
                </span>
              </div>
            </div>

            {/* Refer Friends */}
            <div className="bg-[#141416] p-3.5 rounded-[18px] border border-white/[0.07] flex flex-col justify-between space-y-2.5 shadow-xs hover:border-white/[0.12] transition-colors">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-[8px] bg-[#34C759] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-white">Refer Friends</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-normal">
                    Share your invite code. You both receive bonus XP when they play.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex text-[10.5px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  +{XP_CONFIG.REFERRAL_REWARD} XP / Friend
                </span>
                <Link
                  href="/referral"
                  className="text-[11px] font-semibold text-zinc-300 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>Invite</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Rewards Store Card ── */}
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 px-1 mb-1.5">
            Redeem &amp; Perks
          </div>

          <div className="relative overflow-hidden rounded-[20px] bg-[#141416] border border-white/[0.08] p-4 sm:p-4.5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-[#FF2D55]/15 border border-[#FF2D55]/25 flex items-center justify-center text-[#FF2D55] shrink-0 shadow-xs">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white">Player Rewards Store</p>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-normal">
                  Redeem earned XP for exclusive gamer badges, avatar frames, and game perks.
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.06] border border-white/[0.08] text-zinc-300 font-semibold rounded-full text-[11px]">
              <Gift className="w-3.5 h-3.5 text-amber-400" />
              <span>Catalog Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
