import { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/config";
import { ChevronLeft } from "lucide-react";
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

  // If no rewards seeded, seed default BGMI & MLBB rewards
  const count = await Reward.countDocuments();
  if (count === 0) {
    await Reward.insertMany([
      {
        title: "60 BGMI UC",
        game: "Battlegrounds Mobile India",
        requiredXp: 50,
        badge: "Hot Demand",
        description: "Instant 60 Unknown Cash voucher delivered directly via Character ID.",
        stockStatus: "in_stock",
        isComingSoon: false,
        iconUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80",
        active: true,
        sortOrder: 1,
      },
      {
        title: "MLBB Weekly Diamond Pass",
        game: "Mobile Legends: Bang Bang (Indian Server)",
        requiredXp: 111,
        badge: "Best Value",
        description: "7-day diamond delivery with daily pass bonus claimed via User ID + Zone ID.",
        stockStatus: "in_stock",
        isComingSoon: false,
        iconUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&auto=format&fit=crop&q=80",
        active: true,
        sortOrder: 2,
      },
    ]);
  }

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
    <div className="min-h-screen bg-black pb-12">
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 py-3 sm:py-4 space-y-4">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium border border-zinc-800 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-zinc-400" />
            <span>Profile</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/rewards-dashboard"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium border border-zinc-800 transition-colors"
            >
              <span>Bonus Stats</span>
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium border border-zinc-800 transition-colors"
            >
              <span>Leaderboard</span>
            </Link>
          </div>
        </div>

        {/* Dynamic Rewards Client Component */}
        <RewardsStoreClient
          rewards={rewards}
          initialClaims={initialClaims}
          initialCooldowns={initialCooldowns}
          userXp={userXp}
          isAuthenticated={Boolean(session?.user?.email)}
        />
      </div>
    </div>
  );
}
