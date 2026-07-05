import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { XP_CONFIG } from "@/lib/xp";
import ReferralClient from "./ReferralClient";
import { Users, Coins, Hourglass, HelpCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function ReferralPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/");
  }

  await dbConnect();
  
  // The user should have a referral code since auth.ts auto-generates it in the session callback
  const currentUser = await User.findById((session.user as any).id).lean();
  
  if (!currentUser) {
    redirect("/");
  }
  
  const referralCode = currentUser.referralCode || "NONE";

  // Fetch all users who used this user's referral code
  const referredUsers = await User.find({ referredBy: currentUser._id }).lean();
  
  const totalInvited = referredUsers.length;
  const rewardsUnlocked = referredUsers.filter(u => u.referralRewardPaid).length;
  const pendingInvites = totalInvited - rewardsUnlocked;
  
  const totalXpEarned = rewardsUnlocked * XP_CONFIG.REFERRAL_REWARD;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl min-h-screen">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400 mb-4 tracking-tight drop-shadow-[0_0_15px_rgba(167,139,250,0.3)]">
          Invite Friends. <br className="sm:hidden" /> Earn Massive XP.
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-8">
          Share your unique code with friends. When they sign up and play their first {XP_CONFIG.GAMES_REQUIRED_FOR_REFERRAL} games, you <span className="font-bold text-amber-400">BOTH</span> earn a massive <span className="font-bold text-amber-400">+{XP_CONFIG.REFERRAL_REWARD} XP</span> bonus!
        </p>
      </div>

      {/* Referral Client Component (Link & Copy button) */}
      <ReferralClient referralCode={referralCode} />

      {/* Stats Dashboard */}
      <h2 className="text-2xl font-bold text-white mb-6">Your Referral Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        
        {/* Total Invited */}
        <div className="bg-surface border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-150" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400 mb-1">Total Friends Invited</p>
              <h3 className="text-3xl font-black text-white">{totalInvited}</h3>
            </div>
            <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30 text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Rewards Unlocked */}
        <div className="bg-surface border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-150" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400 mb-1">Rewards Unlocked</p>
              <h3 className="text-3xl font-black text-white">{rewardsUnlocked}</h3>
              <p className="text-xs font-bold text-amber-500 mt-2">+{totalXpEarned} XP Earned</p>
            </div>
            <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/30 text-amber-400">
              <Coins className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Pending Invites */}
        <div className="bg-surface border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group hover:border-orange-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-150" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400 mb-1">Pending Unlocks</p>
              <h3 className="text-3xl font-black text-white">{pendingInvites}</h3>
              <p className="text-xs text-zinc-500 mt-2">Friends must play 10 games</p>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-xl border border-orange-500/30 text-orange-400">
              <Hourglass className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Friends List Table */}
      {referredUsers.length > 0 && (
        <>
          <h3 className="text-xl font-bold text-white mb-4">Your Invited Friends</h3>
          <div className="bg-surface border border-zinc-800 rounded-2xl overflow-hidden mb-12">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/40 border-b border-zinc-800">
                    <th className="p-4 text-sm font-semibold text-zinc-400">Friend</th>
                    <th className="p-4 text-sm font-semibold text-zinc-400 text-center">Games Played</th>
                    <th className="p-4 text-sm font-semibold text-zinc-400 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {referredUsers.map(user => {
                    const gamesPlayed = user.gamesPlayedCount || 0;
                    const isCompleted = user.referralRewardPaid;
                    const progress = Math.min(100, Math.round((gamesPlayed / XP_CONFIG.GAMES_REQUIRED_FOR_REFERRAL) * 100));

                    return (
                      <tr key={user._id.toString()} className="hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {user.image ? (
                              <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-500">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="font-medium text-zinc-200">{user.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col items-center max-w-[150px] mx-auto gap-1.5">
                            <span className="text-xs font-medium text-zinc-400">{gamesPlayed} / {XP_CONFIG.GAMES_REQUIRED_FOR_REFERRAL} games</span>
                            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${isCompleted ? 'bg-amber-400' : 'bg-indigo-500'}`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-500/20 text-amber-400 px-2 py-1 rounded-md border border-amber-500/30">
                              <Check className="w-3 h-3" /> Paid (+50 XP)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md border border-zinc-700">
                              <Hourglass className="w-3 h-3" /> Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* FAQ / How it works */}
      <div className="bg-black/30 border border-zinc-800 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
          How does the Referral Program work?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black mb-3">1</div>
            <h4 className="font-bold text-zinc-200 mb-2">Share Your Link</h4>
            <p className="text-sm text-zinc-500">Send your unique link to friends. When they visit, your code is automatically applied when they sign in.</p>
          </div>
          <div>
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black mb-3">2</div>
            <h4 className="font-bold text-zinc-200 mb-2">They Play Games</h4>
            <p className="text-sm text-zinc-500">Your friend needs to play {XP_CONFIG.GAMES_REQUIRED_FOR_REFERRAL} unique games to verify they are a real, active player.</p>
          </div>
          <div>
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-black mb-3">3</div>
            <h4 className="font-bold text-amber-300 mb-2">Both Get Rewarded!</h4>
            <p className="text-sm text-amber-500/70">The moment they play their 10th game, both of your accounts instantly receive +{XP_CONFIG.REFERRAL_REWARD} XP!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
