import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Image from "next/image";
import { Trophy, Flame, Medal, Search } from "lucide-react";
import Link from "next/link";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function LeaderboardPage() {
  await dbConnect();
  
  // Fetch top 100 users by lifetimeXp
  const users = await User.find({ lifetimeXp: { $gt: 0 } })
    .sort({ lifetimeXp: -1 })
    .limit(100)
    .lean();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl min-h-screen">
      <div className="flex flex-col items-center justify-center mb-12 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-amber-500/20 rounded-2xl mb-4">
          <Trophy className="w-10 h-10 text-amber-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Global Leaderboard</h1>
        <p className="text-zinc-400 max-w-lg mx-auto">
          The most active players on Bluebuff Games. Earn XP by playing games, logging in daily, and inviting friends!
        </p>
      </div>

      <div className="bg-surface border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-black/40">
                <th className="p-4 font-bold text-zinc-400 w-16 text-center">Rank</th>
                <th className="p-4 font-bold text-zinc-400">Player</th>
                <th className="p-4 font-bold text-zinc-400 text-center">Streak</th>
                <th className="p-4 font-bold text-amber-400 text-right">Total XP</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-zinc-500">
                    No players on the leaderboard yet. Be the first to earn XP!
                  </td>
                </tr>
              ) : (
                users.map((user, index) => {
                  const rank = index + 1;
                  
                  // Rank styling
                  let rankStyle = "text-zinc-400 font-medium";
                  let borderStyle = "";
                  
                  if (rank === 1) {
                    rankStyle = "text-yellow-400 font-black text-xl drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]";
                    borderStyle = "border-yellow-500/50 shadow-[0_0_15px_rgba(250,204,21,0.2)]";
                  } else if (rank === 2) {
                    rankStyle = "text-slate-300 font-bold text-lg drop-shadow-[0_0_8px_rgba(203,213,225,0.5)]";
                    borderStyle = "border-slate-400/50 shadow-[0_0_15px_rgba(203,213,225,0.2)]";
                  } else if (rank === 3) {
                    rankStyle = "text-amber-600 font-bold text-lg drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]";
                    borderStyle = "border-amber-600/50 shadow-[0_0_15px_rgba(217,119,6,0.2)]";
                  }

                  return (
                    <tr 
                      key={user._id.toString()} 
                      className={`border-b border-zinc-800/50 hover:bg-white/5 transition-colors ${rank <= 3 ? "bg-black/20" : ""}`}
                    >
                      <td className="p-4 text-center">
                        {rank === 1 ? <Medal className="w-6 h-6 mx-auto text-yellow-400" /> : 
                         rank === 2 ? <Medal className="w-5 h-5 mx-auto text-slate-300" /> : 
                         rank === 3 ? <Medal className="w-5 h-5 mx-auto text-amber-600" /> : 
                         <span className={rankStyle}>#{rank}</span>}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`relative w-10 h-10 rounded-full overflow-hidden border-2 ${borderStyle || "border-zinc-700"}`}>
                            {user.image ? (
                              <Image src={user.image} alt={user.name} fill sizes="40px" className="object-cover" />
                            ) : (
                              <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                <span className="text-zinc-500 font-bold">{user.name.charAt(0).toUpperCase()}</span>
                              </div>
                            )}
                          </div>
                          <span className="font-semibold text-white">{user.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {user.currentStreak > 0 ? (
                          <div className="inline-flex items-center gap-1 bg-black/40 border border-orange-500/20 px-2 py-1 rounded-lg">
                            <Flame className="w-4 h-4 text-orange-500" />
                            <span className="text-orange-400 font-bold">{user.currentStreak}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-600">-</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
                          <span className="text-amber-500 font-black">{(user.lifetimeXp || 0).toLocaleString()}</span>
                          <span className="text-amber-600/50 text-xs font-bold uppercase ml-1">XP</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
