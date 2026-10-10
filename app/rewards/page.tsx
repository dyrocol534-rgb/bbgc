import { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/config";
import { Gift, ChevronLeft, Sparkles, ArrowRight, Coins, ShieldCheck, CheckCircle2, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import dbConnect from "@/lib/mongodb";
import Reward, { IReward } from "@/models/Reward";

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
        isComingSoon: true,
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
        isComingSoon: true,
        iconUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&auto=format&fit=crop&q=80",
        active: true,
        sortOrder: 2,
      },
    ]);
  }

  const rawRewards = await Reward.find({ active: true })
    .sort({ sortOrder: 1, requiredXp: 1 })
    .lean();
  const rewards = JSON.parse(JSON.stringify(rawRewards));

  return (
    <div className="min-h-screen bg-black pb-12">
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 py-3 sm:py-4 space-y-5">
        
        {/* Navigation */}
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

        {/* Header Hero Banner */}
        <div className="rounded-xl bg-zinc-950 border border-zinc-900 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>Official Gamer Rewards</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Player Rewards &amp; Game Top-Up Store
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Earn XP for every minute you play HTML5 games and log in daily. Redeem your XP for real in-game currency vouchers and passes!
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-colors"
            >
              <span>Play Games &amp; Earn XP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ── Featured Rewards Showcase ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Available Game Redemptions
            </h2>
            <span className="text-[11px] text-zinc-500 font-mono">
              {rewards.length} {rewards.length === 1 ? "Reward Item" : "Reward Items"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {rewards.map((item: any) => {
              const isOutOfStock = item.stockStatus === "out_of_stock";
              const isComingSoon = item.isComingSoon;

              return (
                <div
                  key={item._id}
                  className="relative overflow-hidden rounded-xl bg-zinc-950 border border-zinc-900 p-4 sm:p-5 flex flex-col justify-between gap-4 hover:border-zinc-800 transition-colors"
                >
                  {/* Header row of card */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Game Logo Image */}
                      <div className="relative w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center shrink-0">
                        {item.iconUrl ? (
                          <Image
                            src={item.iconUrl}
                            alt={item.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <Gift className="w-6 h-6 text-zinc-500" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                            {item.title}
                          </h3>
                          {item.badge && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-500/20 bg-amber-500/10 text-amber-400">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 font-medium mt-0.5">
                          {item.game}
                        </p>
                      </div>
                    </div>

                    {/* Cost Capsule */}
                    <div className="text-right shrink-0">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black border border-zinc-800 text-amber-400 font-mono font-black text-xs sm:text-sm">
                        <Coins className="w-3.5 h-3.5" />
                        <span>{item.requiredXp} XP</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* Footer Action Card with Stock and Coming Soon indicator */}
                  <div className="pt-3 border-t border-zinc-900 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Direct UID Delivery</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Stock badge */}
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-semibold text-[11px]">
                          <XCircle className="w-3 h-3" />
                          <span>Out of Stock</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium text-[10px]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>In Stock</span>
                        </span>
                      )}

                      {/* Coming soon or Redeem button */}
                      {isComingSoon ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 font-semibold text-xs cursor-not-allowed select-none">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          <span>Coming Soon</span>
                        </span>
                      ) : isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900/60 border border-zinc-900 text-zinc-500 font-medium text-xs cursor-not-allowed select-none">
                          Unavailable
                        </span>
                      ) : (
                        <button
                          disabled
                          title="Connect player UID to redeem"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors"
                        >
                          <span>Claim Voucher</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {rewards.length === 0 && (
            <div className="p-12 text-center rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-400 text-xs">
              No rewards available currently. Check back soon!
            </div>
          )}
        </div>

        {/* ── Catalog FAQ & Redemption Instructions ── */}
        <div className="rounded-xl border border-zinc-900 bg-black p-4 sm:p-5 space-y-3">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            How Redemption Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-zinc-400">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 font-bold shrink-0 text-[11px]">
                1
              </span>
              <div>
                <p className="font-semibold text-white">Stack Your Play XP</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Accumulate XP by playing games, keeping streaks, and daily logins.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 font-bold shrink-0 text-[11px]">
                2
              </span>
              <div>
                <p className="font-semibold text-white">Enter Player UID</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Provide your in-game Character ID / Zone ID when claiming your reward voucher.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 font-bold shrink-0 text-[11px]">
                3
              </span>
              <div>
                <p className="font-semibold text-white">Instant Voucher Delivery</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Voucher code or pass is credited to your character mailbox directly.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
