import { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/config";
import { ChevronLeft, ChevronRight, Gift, Coins } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Reward from "@/models/Reward";
import RewardClaim from "@/models/RewardClaim";
import User from "@/models/User";
import RewardsStoreClient from "./RewardsStoreClient";

export const metadata: Metadata = {
  title: `Rewards Store | ${SITE_CONFIG.name}`,
  description: `Redeem your earned game XP for BGMI 60 UC, MLBB Weekly Diamond Pass, and exclusive gamer rewards on ${SITE_CONFIG.name}!`,
  alternates: {
    canonical: `${SITE_CONFIG.url}/rewards`,
  },
  openGraph: {
    title: `Rewards Store | ${SITE_CONFIG.name}`,
    description: `Redeem game XP for BGMI UC and MLBB Weekly Diamond Passes on ${SITE_CONFIG.name}.`,
    url: `${SITE_CONFIG.url}/rewards`,
    siteName: SITE_CONFIG.name,
    type: "website",
  },
};

export const dynamic = "force-dynamic";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export default async function RewardsPage() {
  await dbConnect();

  // Fetch active store rewards
  const rawRewards = await Reward.find({ active: true })
    .sort({ sortOrder: 1, requiredXp: 1 })
    .lean();
  const rewards = JSON.parse(JSON.stringify(rawRewards));

  // Check user session
  const session = await getServerSession(authOptions);
  let userXp = 0;
  let initialClaims: any[] = [];
  const initialCooldowns: Record<string, { availableAt: string; daysLeft: number }> = {};

  if (session?.user?.email) {
    const user = await User.findOne({ email: session.user.email }).lean();
    if (user) {
      userXp = user.xp || 0;

      const rawClaims = await RewardClaim.find({ userId: user._id })
        .sort({ claimedAt: -1 })
        .lean();
      initialClaims = JSON.parse(JSON.stringify(rawClaims));

      // Calculate cooldown per reward item
      const now = Date.now();
      initialClaims.forEach((c) => {
        const rewardIdStr = c.rewardId.toString();
        if (!initialCooldowns[rewardIdStr] && c.status !== "rejected") {
          const elapsed = now - new Date(c.claimedAt).getTime();
          if (elapsed < SEVEN_DAYS_MS) {
            const availableAt = new Date(
              new Date(c.claimedAt).getTime() + SEVEN_DAYS_MS
            ).toISOString();
            const daysLeft = Math.ceil((SEVEN_DAYS_MS - elapsed) / (1000 * 60 * 60 * 24));
            initialCooldowns[rewardIdStr] = {
              availableAt,
              daysLeft,
            };
          }
        }
      });
    }
  }

  return (
    <div className="min-h-screen bg-black text-white pb-16 selection:bg-amber-500/30">
      {/* ── Full Width iOS Glass Navbar ── */}
      <header className="sticky top-0 z-40 bg-black/85 backdrop-blur-xl border-b border-zinc-900/80 px-3 sm:px-6 lg:px-8 xl:px-10">
        <div className="w-full h-13 sm:h-14 flex items-center justify-between">
          <Link
            href="/profile"
            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] text-zinc-300 hover:text-white active:scale-95 transition-all text-xs font-semibold shadow-xs"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
            <span>Profile</span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/rewards-dashboard"
              className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] text-zinc-300 hover:text-white active:scale-95 transition-all text-xs font-medium shadow-xs"
            >
              <span>Stats</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
            </Link>
            <Link
              href="/leaderboard"
              className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] text-zinc-300 hover:text-white active:scale-95 transition-all text-xs font-medium shadow-xs"
            >
              <span>Ranks</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Full Width Responsive Main Container ── */}
      <main className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 pt-3 sm:pt-4 space-y-3.5">
        <div className="flex items-center gap-2 pt-1 pb-0.5">
          <Gift className="w-5 h-5 text-amber-400 shrink-0" />
          <h1 className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
            Rewards Store
          </h1>
        </div>

        <RewardsStoreClient
          rewards={rewards}
          initialClaims={initialClaims}
          initialCooldowns={initialCooldowns}
          userXp={userXp}
          isAuthenticated={Boolean(session?.user?.email)}
        />
      </main>
    </div>
  );
}
