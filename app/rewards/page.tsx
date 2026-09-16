import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { XP_CONFIG } from "@/lib/xp";
import { Coins, Flame, Clock, Gamepad2, Users, ShoppingBag, Gift, ArrowRight, ChevronLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Bluebuff Games";
const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://games.bluebuff.in";
const siteUrl = rawSiteUrl.replace(/\/+$/, "");
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=in.bluebuff.games";

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
