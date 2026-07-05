import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { XP_CONFIG } from "@/lib/xp";
import { Coins, Flame, Clock, Gamepad2, Users, ShoppingBag, Gift, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function RewardsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/");
  }

  await dbConnect();
  
  const currentUser = await User.findById((session.user as any).id).lean();
  
  if (!currentUser) {
    redirect("/");
  }

  const xp = currentUser.xp || 0;
  const streak = currentUser.currentStreak || 0;
  const playtimeSeconds = currentUser.playtimeSeconds || 0;
  const playtimeHours = Math.floor(playtimeSeconds / 3600);
  const playtimeMinutes = Math.floor((playtimeSeconds % 3600) / 60);

  const nextStreakBonus = Math.min(streak * XP_CONFIG.STREAK_BONUS_PER_DAY, XP_CONFIG.MAX_STREAK_BONUS);

  return (
    <div className="container mx-auto px-4 py-8 space-y-12 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Your Rewards Dashboard
        </h1>
        <p className="text-sm text-zinc-400">
          Track your progress, earn massive XP, and prepare for upcoming rewards!
        </p>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {/* Total XP */}
        <div className="bg-surface border border-zinc-800 rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-150" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Total XP Balance</p>
              <h3 className="text-2xl font-black text-white">{xp}</h3>
            </div>
            <div className="p-2.5 bg-amber-500/20 rounded-xl border border-amber-500/30 text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Daily Streak */}
        <div className="bg-surface border border-zinc-800 rounded-2xl p-5 relative overflow-hidden group hover:border-orange-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-150" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Daily Streak</p>
              <div className="flex items-end gap-1.5">
                <h3 className="text-2xl font-black text-white">{streak}</h3>
                <p className="text-[11px] font-bold text-orange-500 mb-1 uppercase">Days</p>
              </div>
              <p className="text-[10px] font-medium text-zinc-500 mt-1.5">
                Next Bonus: <span className="text-amber-400">+{XP_CONFIG.DAILY_LOGIN + nextStreakBonus} XP</span>
              </p>
            </div>
            <div className="p-2.5 bg-orange-500/20 rounded-xl border border-orange-500/30 text-orange-400">
              <Flame className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Playtime */}
        <div className="bg-surface border border-zinc-800 rounded-2xl p-5 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-150" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Active Playtime</p>
              <div className="flex items-end gap-1">
                <h3 className="text-2xl font-black text-white">{playtimeHours}</h3>
                <p className="text-[11px] font-bold text-indigo-400 mb-1 uppercase">hr</p>
                <h3 className="text-2xl font-black text-white ml-1">{playtimeMinutes}</h3>
                <p className="text-[11px] font-bold text-indigo-400 mb-1 uppercase">min</p>
              </div>
            </div>
            <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-500/30 text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* How to Earn */}
      <h2 className="text-xl font-bold text-white mb-4">How to Earn XP</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        
        {/* Play Games */}
        <div className="bg-black/40 border border-zinc-800/80 rounded-2xl p-4 hover:bg-black/60 transition-colors">
          <Gamepad2 className="w-5 h-5 text-sky-400 mb-3" />
          <h4 className="text-white text-sm font-bold mb-1">Play Games</h4>
          <p className="text-xs text-zinc-400 mb-2">Earn XP simply by trying out new games on the platform.</p>
          <span className="inline-flex font-black text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded text-xs">
            +{XP_CONFIG.PLAY_GAME} XP / Game
          </span>
        </div>

        {/* Daily Login */}
        <div className="bg-black/40 border border-zinc-800/80 rounded-2xl p-4 hover:bg-black/60 transition-colors">
          <Flame className="w-5 h-5 text-orange-400 mb-3" />
          <h4 className="text-white text-sm font-bold mb-1">Daily Streak</h4>
          <p className="text-xs text-zinc-400 mb-2">Login daily. Your base +5 XP grows by +10 XP every consecutive day!</p>
          <span className="inline-flex font-black text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded text-xs">
            Up to +{XP_CONFIG.DAILY_LOGIN + XP_CONFIG.MAX_STREAK_BONUS} XP / Day
          </span>
        </div>

        {/* Active Playtime */}
        <div className="bg-black/40 border border-zinc-800/80 rounded-2xl p-4 hover:bg-black/60 transition-colors">
          <Clock className="w-5 h-5 text-indigo-400 mb-3" />
          <h4 className="text-white text-sm font-bold mb-1">Active Playtime</h4>
          <p className="text-xs text-zinc-400 mb-2">The more time you spend actively playing games, the more you earn.</p>
          <span className="inline-flex font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded text-xs">
            +{XP_CONFIG.PLAYTIME_PER_HOUR} XP / Hour
          </span>
        </div>

        {/* Referrals */}
        <div className="bg-black/40 border border-zinc-800/80 rounded-2xl p-4 hover:bg-black/60 transition-colors flex flex-col h-full">
          <div>
            <Users className="w-5 h-5 text-purple-400 mb-3" />
            <h4 className="text-white text-sm font-bold mb-1">Refer Friends</h4>
            <p className="text-xs text-zinc-400 mb-2">Invite friends and you both get massively rewarded when they play 10 games.</p>
          </div>
          <div className="mt-auto pt-3 flex items-center justify-between">
            <span className="inline-flex font-black text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded text-xs">
              +{XP_CONFIG.REFERRAL_REWARD} XP
            </span>
            <Link href="/referral" className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Redeem Store (Coming Soon) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-zinc-900 to-black border border-zinc-800 rounded-3xl p-6 md:p-8 text-center group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
        
        <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-zinc-800 rounded-2xl border border-zinc-700 flex items-center justify-center mb-6">
            <ShoppingBag className="w-8 h-8 text-zinc-400" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4">Rewards Store</h2>
          <p className="text-zinc-400 mb-8">
            Keep stacking your XP! Soon you will be able to redeem your hard-earned XP for exclusive avatars, premium games, and special account badges.
          </p>
          
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800/50 border border-zinc-700 text-zinc-300 font-bold rounded-full uppercase tracking-widest text-sm backdrop-blur-md">
            <Gift className="w-4 h-4" />
            Coming Soon
          </div>
        </div>
      </div>

    </div>
  );
}
