import { Skeleton } from "@/components/ui/Skeleton";
import { getSidebarBentoSpanClass } from "@/lib/bento";

export default function GameLoading() {
  return (
    <div className="container mx-auto px-3 sm:px-4 pt-2 sm:pt-3 pb-6 max-w-[1400px]">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
        <Skeleton className="h-3.5 w-12 rounded-md" />
        <span className="text-zinc-700 text-xs">/</span>
        <Skeleton className="h-3.5 w-16 rounded-md" />
        <span className="text-zinc-700 text-xs">/</span>
        <Skeleton className="h-3.5 w-24 rounded-md" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content Skeleton */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Game Player Area */}
          <div
            className="w-full rounded-2xl overflow-hidden skeleton-shimmer border border-white/5"
            style={{ aspectRatio: "16/9", minHeight: "300px" }}
          />

          {/* Game Meta & Information */}
          <div className="space-y-4">
            {/* Title */}
            <Skeleton className="h-8 sm:h-9 w-2/5 rounded-xl" />

            {/* Category & Tag pills */}
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-6 w-20 rounded-lg" />
              <Skeleton className="h-6 w-16 rounded-lg" />
              <Skeleton className="h-5 w-14 rounded-lg" />
              <Skeleton className="h-5 w-16 rounded-lg" />
            </div>

            {/* Description lines */}
            <div className="space-y-2 pt-1">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-5/6 rounded-md" />
              <Skeleton className="h-4 w-3/5 rounded-md" />
            </div>

            {/* Spec pills row */}
            <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60">
              <Skeleton className="h-7 w-28 rounded-lg" />
              <Skeleton className="h-7 w-36 rounded-lg" />
            </div>

            {/* Controls Bar Skeleton */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Skeleton className="h-6 w-52 rounded-md" />
              <Skeleton className="h-6 w-32 rounded-md" />
            </div>
          </div>
        </div>

        {/* Suggested Games Sidebar */}
        <aside className="w-full lg:w-[360px] xl:w-[420px] shrink-0">
          <div className="space-y-3 sm:space-y-3.5">
            <Skeleton className="h-6 w-36 rounded-lg" />
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-3 xl:grid-cols-4 auto-rows-[minmax(80px,auto)] sm:auto-rows-[minmax(95px,auto)] gap-2 sm:gap-2.5 grid-flow-dense">
              {Array.from({ length: 12 }).map((_, i) => {
                const spanClass = getSidebarBentoSpanClass(i);
                return (
                  <div
                    key={i}
                    className={`rounded-2xl overflow-hidden skeleton-shimmer border border-white/5 min-h-[80px] ${spanClass}`}
                  />
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}