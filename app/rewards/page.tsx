import { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/config";
import { Gift, ChevronLeft, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: `Rewards & Store – Coming Soon | ${SITE_CONFIG.name}`,
  description: `Exciting rewards, gamer perks, avatar frames, and badges are coming soon to ${SITE_CONFIG.name}!`,
  alternates: {
    canonical: `${SITE_CONFIG.url}/rewards`,
  },
  openGraph: {
    title: `Rewards – Coming Soon | ${SITE_CONFIG.name}`,
    description: `Exciting player rewards and perks are coming soon to ${SITE_CONFIG.name}.`,
    url: `${SITE_CONFIG.url}/rewards`,
    siteName: SITE_CONFIG.name,
    type: "website",
  },
};

export default function RewardsPage() {
  return (
    <div className="min-h-[85vh] bg-black flex flex-col justify-between py-6 px-4">
      <div className="max-w-md w-full mx-auto space-y-8">
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium border border-zinc-800 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-zinc-400" />
            <span>Profile</span>
          </Link>
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-600">
            Player Rewards
          </span>
        </div>

        {/* Coming Soon Hero */}
        <div className="text-center space-y-4 pt-6 sm:pt-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-900 relative">
            <Gift className="w-8 h-8 text-amber-400" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-medium">
              <Sparkles className="w-3 h-3" />
              <span>Catalog In Development</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Rewards Coming Soon
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
              We&apos;re crafting an exclusive rewards catalog. Soon you&apos;ll be able to redeem your earned XP for gamer badges, avatar frames, custom themes, and VIP perks!
            </p>
          </div>
        </div>

        {/* Highlights Preview Card */}
        <div className="border border-zinc-900 rounded-2xl bg-black p-4 space-y-3">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            What&apos;s arriving
          </p>
          <div className="space-y-2.5 text-xs text-zinc-400">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span>Redeem XP for rare player profile badges</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span>Unlock animated avatar frames &amp; gamer tags</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span>Exclusive tournaments &amp; bonus XP events</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors"
          >
            <span>Play Games &amp; Earn XP</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/rewards-dashboard"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium text-xs hover:bg-zinc-850 hover:text-white transition-colors"
          >
            <span>View Bonus Stats</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
