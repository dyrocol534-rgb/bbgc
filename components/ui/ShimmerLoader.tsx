import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Gift, History, Settings } from "lucide-react";

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
export function MetricsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 animate-in fade-in duration-300">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20 rounded-md" />
            <Skeleton className="w-6 h-6 rounded-lg" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-16 rounded-lg" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="h-2.5 w-28 rounded-md" />
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
        "relative rounded-2xl bg-zinc-950/90 border border-zinc-800/80 p-3.5 sm:p-4 flex flex-col justify-between gap-3 overflow-hidden shadow-lg shadow-black/40",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* Main Card Content */}
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Game Icon */}
            <div className="relative w-12 h-12 rounded-xl bg-zinc-900 border border-white/[0.08] overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
              <Skeleton className="w-full h-full rounded-xl" />
            </div>

            {/* Game Name + Reward Title */}
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3 w-24 sm:w-28 rounded-md" />
              <Skeleton className="h-4 w-36 max-w-[85%] rounded-md" />
            </div>
          </div>

          {/* Cost Pill Badge */}
          <div className="shrink-0">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 shadow-xs">
              <div className="w-3.5 h-3.5 rounded-full bg-amber-400/30" />
              <Skeleton className="h-3.5 w-9 rounded-sm bg-amber-400/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="pt-2.5 border-t border-zinc-900/80 flex items-center justify-between gap-2">
        {/* Status Indicator */}
        <div className="flex items-center gap-1.5">
          <Skeleton className="w-1.5 h-1.5 rounded-full" />
          <Skeleton className="h-2.5 w-24 rounded-md" />
        </div>

        {/* Action CTA Button */}
        <Skeleton className="h-6 sm:h-7 w-18 sm:w-20 rounded-full" />
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
              <h2 className="text-[10.5px] sm:text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Available Rewards
              </h2>
              <div className="w-3.5 h-3.5 rounded-full bg-zinc-800/80 border border-white/5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-900/80 border border-white/[0.06] px-2.5 py-0.5 rounded-full font-mono">
              1 claim / 7 days
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

/**
 * Full Page Skeleton Loader for User Profile (/profile)
 */
export function ProfileSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "min-h-screen bg-black pb-12 animate-in fade-in duration-200 text-white",
        className
      )}
    >
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 py-3 sm:py-4 space-y-4">
        {/* ── Top Navigation Bar Skeleton ── */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 text-zinc-300 text-xs font-medium border border-white/[0.08]"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-zinc-400" />
            <span>Home</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 text-zinc-400 text-xs font-medium border border-white/[0.08]">
              <Gift className="w-3.5 h-3.5" />
              <span>Invite</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 text-zinc-400 text-xs font-medium border border-white/[0.08]">
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            </div>
          </div>
        </div>

        {/* ── Compact User Profile Bar Skeleton ── */}
        <div className="relative overflow-hidden rounded-2xl bg-zinc-950 border border-white/[0.08] py-2.5 px-3 sm:py-2.5 sm:px-3.5">
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <Skeleton className="w-9 h-9 rounded-full" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500/60 border border-black" />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-3.5 w-24 sm:w-32 rounded-md" />
                  <Skeleton className="h-3 w-16 rounded-full" />
                </div>
                <Skeleton className="h-2.5 w-36 sm:w-48 rounded" />
              </div>
            </div>

            <Skeleton className="h-6 w-16 rounded-full shrink-0" />
          </div>
        </div>

        {/* ── Key Player Stats Skeleton (2 rows x 3 cols tiles) ── */}
        <div className="space-y-2 py-1">
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="p-2 sm:p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-900/80 flex items-center gap-2 min-w-0"
              >
                <Skeleton className="w-4 h-4 rounded shrink-0" />
                <div className="flex flex-col min-w-0 space-y-1">
                  <Skeleton className="h-2.5 w-12 rounded" />
                  <Skeleton className="h-3.5 w-14 rounded" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="p-2 sm:p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-900/80 flex items-center gap-2 min-w-0"
              >
                <Skeleton className="w-4 h-4 rounded shrink-0" />
                <div className="flex flex-col min-w-0 space-y-1">
                  <Skeleton className="h-2.5 w-12 rounded" />
                  <Skeleton className="h-3.5 w-14 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main Content Grid Skeleton ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr] gap-5 items-start">
          {/* Profile Info Inset Group */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1 mb-1">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-3 w-14 rounded" />
            </div>

            <div className="bg-[#141416] rounded-[22px] border border-white/[0.07] divide-y divide-white/[0.05] overflow-hidden shadow-sm">
              {/* Phone row skeleton */}
              <div className="p-3.5 sm:p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-[8px] bg-emerald-500/20 flex items-center justify-center">
                      <div className="w-3.5 h-3.5 rounded bg-emerald-400/40" />
                    </div>
                    <Skeleton className="h-3 w-24 rounded" />
                  </div>
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
                <div className="pl-9">
                  <Skeleton className="h-3 w-36 rounded" />
                </div>
              </div>

              {/* Bio row skeleton */}
              <div className="p-3.5 sm:p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-[8px] bg-sky-500/20 flex items-center justify-center">
                      <div className="w-3.5 h-3.5 rounded bg-sky-400/40" />
                    </div>
                    <Skeleton className="h-3 w-20 rounded" />
                  </div>
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
                <div className="pl-9">
                  <Skeleton className="h-3 w-48 rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Recently Played Section Skeleton */}
          <div className="space-y-5 min-w-0">
            <section className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#007AFF]/30 shrink-0" />
                  <Skeleton className="h-3.5 w-28 rounded" />
                </div>
              </div>

              {/* Empty state skeleton */}
              <div className="rounded-[22px] border border-white/[0.06] bg-[#141416] p-8 flex flex-col items-center text-center gap-2.5">
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="h-4 w-36 rounded-md" />
                <Skeleton className="h-3 w-56 rounded-md" />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
