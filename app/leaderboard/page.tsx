import { Metadata } from "next";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { Trophy, Flame, Medal } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: `Global Player Leaderboard | ${SITE_CONFIG.name}`,
  description: `Check the top players on ${SITE_CONFIG.name}. Level up, earn game XP, keep daily login streaks alive, and climb to the #1 spot on the global gaming leaderboard!`,
  alternates: {
    canonical: `${SITE_CONFIG.url}/leaderboard`,
  },
  openGraph: {
    title: `Global Player Leaderboard | ${SITE_CONFIG.name}`,
    description: `Check the top players on ${SITE_CONFIG.name}. Level up, earn XP, and climb the leaderboard!`,
    url: `${SITE_CONFIG.url}/leaderboard`,
    siteName: SITE_CONFIG.name,
    type: "website",
  },
};

export const revalidate = 60; // Revalidate every 60 seconds

function maskName(name: string): string {
  if (!name || !name.trim()) return "Player";
  const trimmed = name.trim();
  if (trimmed.length <= 2) return trimmed[0] + "*";
  if (trimmed.length === 3) return trimmed[0] + "*" + trimmed[2];
  const startLen = Math.min(2, Math.floor(trimmed.length / 3));
  const endLen = Math.min(2, Math.floor(trimmed.length / 3));
  const maskedCount = Math.max(3, trimmed.length - startLen - endLen);
  return (
    trimmed.slice(0, startLen) +
    "*".repeat(Math.min(maskedCount, 4)) +
    trimmed.slice(trimmed.length - endLen)
  );
}

export default async function LeaderboardPage() {
  await dbConnect();
  
  // Fetch top 100 users by lifetimeXp
  const users = await User.find({ lifetimeXp: { $gt: 0 } })
    .sort({ lifetimeXp: -1 })
    .limit(100)
    .lean();

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl min-h-screen">
      <div className="flex flex-col items-center justify-center mb-6 text-center">
        <div className="inline-flex items-center justify-center p-2.5 bg-white/[0.05] border border-white/10 rounded-xl mb-3">
          <Trophy className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Global Leaderboard</h1>
        <p className="text-zinc-500 text-xs mt-1">
          Top active players on {SITE_CONFIG.name}
        </p>
      </div>

      <div className="border border-zinc-900 rounded-2xl overflow-hidden bg-black">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-900 text-zinc-500 text-xs uppercase tracking-wider">
              <th className="py-2.5 px-3 w-12 text-center font-semibold">#</th>
              <th className="py-2.5 px-3 font-semibold">Player</th>
              <th className="py-2.5 px-3 text-center font-semibold">Streak</th>
              <th className="py-2.5 px-3 text-right font-semibold">XP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900/60">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-zinc-600 text-xs">
                  No players yet. Be the first to earn XP!
                </td>
              </tr>
            ) : (
              users.map((user, index) => {
                const rank = index + 1;
                const displayName = maskName(user.name);

                return (
                  <tr 
                    key={user._id.toString()} 
                    className="hover:bg-zinc-950 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-center">
                      {rank === 1 ? (
                        <Medal className="w-4 h-4 mx-auto text-yellow-400" />
                      ) : rank === 2 ? (
                        <Medal className="w-4 h-4 mx-auto text-slate-300" />
                      ) : rank === 3 ? (
                        <Medal className="w-4 h-4 mx-auto text-amber-600" />
                      ) : (
                        <span className="text-zinc-500 font-mono text-xs">#{rank}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-medium text-zinc-200 tracking-wide font-mono text-xs sm:text-sm">
                        {displayName}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {user.currentStreak > 0 ? (
                        <span className="inline-flex items-center gap-1 text-zinc-300 font-medium text-xs">
                          <Flame className="w-3.5 h-3.5 text-zinc-400" />
                          {user.currentStreak}
                        </span>
                      ) : (
                        <span className="text-zinc-700 text-xs">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      <span className="text-white font-semibold text-xs sm:text-sm">
                        {(user.lifetimeXp || 0).toLocaleString()}
                      </span>
                      <span className="text-zinc-600 text-[10px] ml-1">XP</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
