import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Gift, History, Trophy, Settings } from "lucide-react";

/**
 * Universal Page Skeleton Loader (Header + Grid or Content)
 */
export function PageSkeleton({ 
  className,
  items = 12,
}: { 
  className?: string; 
  items?: number;
}) {
  return (
    <div className={cn("container mx-auto px-3 sm:px-4 py-4 space-y-6 max-w-7xl animate-in fade-in duration-300", className)}>
      {/* Page Header Skeleton */}
      <div className="space-y-2 border-b border-white/[0.06] pb-4">
        <Skeleton className="h-3 w-28 rounded-md" />
        <Skeleton className="h-7 sm:h-8 w-60 rounded-xl" />
        <Skeleton className="h-3.5 w-80 max-w-full rounded-md" />
      </div>

      {/* Grid items Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="aspect-square w-full rounded-2xl skeleton-shimmer border border-white/5" />
            <Skeleton className="h-3 w-3/4 mx-auto rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Metric Skeleton Row for Admin Analytics and Dashboard Stats
 */
export function MetricsSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] overflow-hidden grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-px bg-white/[0.06] animate-in fade-in duration-300">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-3 sm:p-3.5 bg-black/60 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded-[6px]" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
          <Skeleton className="h-7 w-20 rounded-lg" />
          <Skeleton className="h-2.5 w-24 rounded-md" />
        </div>
      ))}
    </div>
  );
}

/**
 * Table/List Skeleton Loader for Admin tables (Games, Users, Feedback)
 */
export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="w-full space-y-3 animate-in fade-in duration-200">
      <div className="h-10 w-full rounded-xl skeleton-shimmer border border-white/5" />
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div 
            key={i} 
            className="h-14 w-full rounded-xl skeleton-shimmer border border-white/5 flex items-center px-4 justify-between"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-32 rounded-md" />
                <Skeleton className="h-2.5 w-20 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Centered Content Box Skeleton (for forms, login, modals)
 */
export function BoxSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("min-h-[70vh] flex flex-col items-center justify-center p-4 animate-in fade-in duration-300", className)}>
      <div className="w-full max-w-[340px] sm:max-w-[360px] p-6 rounded-3xl border border-white/[0.08] bg-black/50 space-y-5">
        <div className="flex justify-center">
          <div className="w-18 h-18 rounded-[20px] skeleton-shimmer border border-white/10" />
        </div>
        <div className="space-y-2 flex flex-col items-center">
          <Skeleton className="h-6 w-40 rounded-lg" />
          <Skeleton className="h-3 w-56 rounded-md" />
        </div>
        <div className="space-y-3 pt-2">
          <Skeleton className="h-11 w-full rounded-full" />
          <Skeleton className="h-11 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Individual Reward Redemption Card Skeleton
 */
export function RewardCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative rounded-2xl bg-zinc-950/80 border border-white/[0.08] p-3.5 sm:p-4 flex flex-col justify-between gap-3 overflow-hidden backdrop-blur-xl shadow-xl shadow-black/50",
        className
      )}
    >
      {/* Dynamic Subtle Shimmer Bloom */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/30 to-zinc-950/90 rounded-2xl z-0" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent z-10 pointer-events-none" />

      {/* Main Card Content */}
      <div className="relative z-10 space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Game Icon Squircle */}
            <div className="relative w-14 h-14 rounded-2xl bg-zinc-900 border border-white/[0.12] overflow-hidden flex items-center justify-center shrink-0 shadow-md shadow-black/60">
              <Skeleton className="w-full h-full rounded-2xl" />
            </div>

            {/* Game Name + Reward Title */}
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3 w-28 sm:w-36 rounded-md" />
              <Skeleton className="h-4 sm:h-5 w-44 max-w-[85%] rounded-md" />
            </div>
          </div>

          {/* Cost Pill Badge */}
          <div className="shrink-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 shadow-sm">
              <div className="w-3.5 h-3.5 rounded-full bg-amber-400/30" />
              <Skeleton className="h-3.5 w-10 rounded-sm bg-amber-400/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 pt-2.5 border-t border-white/[0.06] flex items-center justify-between gap-2">
        {/* Status Indicator */}
        <div className="flex items-center gap-1.5">
          <Skeleton className="w-1.5 h-1.5 rounded-full" />
          <Skeleton className="h-2.5 w-16 rounded-md" />
          <span className="text-zinc-600 text-xs">•</span>
          <Skeleton className="h-2.5 w-10 rounded-md" />
        </div>

        {/* Action CTA Button */}
        <Skeleton className="h-7 w-20 sm:w-22 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Full Page Skeleton Loader for Rewards Store (/rewards)
 */
export function RewardsStoreSkeleton({
  items = 2,
  showHeader = true,
  className,
}: {
  items?: number;
  showHeader?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-h-screen bg-black text-white pb-16 selection:bg-amber-500/30 animate-in fade-in duration-200",
        className
      )}
    >
      {/* ── Full Width iOS Glass Navbar ── */}
      {showHeader && (
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
      )}

      {/* ── Main Container ── */}
      <main className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 pt-3 sm:pt-4 space-y-3.5">
        {/* Title Header */}
        <div className="flex items-center gap-2 pt-1 pb-0.5">
          <Gift className="w-5 h-5 text-amber-400 shrink-0" />
          <h1 className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
            Rewards Store
          </h1>
        </div>

        <div className="space-y-3.5">
          {/* ── Gamer XP Balance Card Skeleton ── */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900/80 to-zinc-950 border border-white/[0.08] p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-xl shadow-black/50 backdrop-blur-xl">
            {/* Ambient gold glow */}
            <div className="absolute -top-8 -left-8 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent pointer-events-none" />

            {/* Left: XP Available + Number Skeleton */}
            <div className="relative z-10 flex flex-col justify-center min-w-0 pl-1 space-y-1.5">
              <span className="text-[10px] sm:text-[11px] font-semibold text-zinc-400 uppercase tracking-wider leading-none">
                XP Available
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <Skeleton className="h-6 sm:h-7 w-12 rounded-lg bg-amber-400/10 border-amber-400/20" />
                <span className="text-[11px] font-bold text-amber-400/50 font-mono">
                  XP
                </span>
              </div>
            </div>

            {/* Right: History Pill Skeleton */}
            <div className="relative z-10 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-zinc-400 shadow-xs">
              <History className="w-3.5 h-3.5 text-zinc-500" />
              <span>History</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            </div>
          </div>

          {/* ── Section Header ── */}
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-1.5">
              <h2 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Available Redemptions
              </h2>
              <div className="w-3.5 h-3.5 rounded-full bg-zinc-800/80 border border-white/5" />
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">
              1 Claim / 7 Days
            </span>
          </div>

          {/* ── Full Width Responsive Grid of Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {Array.from({ length: items }).map((_, i) => (
              <RewardCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
