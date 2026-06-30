import { Skeleton } from "@/components/ui/Skeleton";

// This skeleton exactly mirrors the bento grid pattern in InfiniteGameGrid
// Pattern repeats every 14 items: 0,7=2x2 | 4,11=1x2 | 3,13=2x1 | rest=1x1
function BentoSkeleton({ index }: { index: number }) {
  const pattern = index % 14;
  let spanClass = "col-span-1 row-span-1";
  if (pattern === 0 || pattern === 7) spanClass = "col-span-2 row-span-2";
  else if (pattern === 4 || pattern === 11) spanClass = "col-span-1 row-span-2";
  else if (pattern === 3 || pattern === 13) spanClass = "col-span-2 row-span-1";

  return (
    <Skeleton
      className={`${spanClass} rounded-2xl w-full h-full min-h-[100px]`}
      style={{ animationDelay: `${(index % 14) * 80}ms` }}
    />
  );
}

export default function HomeLoading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* "All Games" title skeleton */}
      <Skeleton className="h-8 w-36 rounded-lg" />

      {/* Bento grid skeleton — exact same grid as InfiniteGameGrid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 auto-rows-[minmax(100px,auto)] md:auto-rows-[minmax(120px,auto)] gap-2 sm:gap-3 grid-flow-dense">
        {Array.from({ length: 28 }).map((_, i) => (
          <BentoSkeleton key={i} index={i} />
        ))}
      </div>
    </div>
  );
}