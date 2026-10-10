import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

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
