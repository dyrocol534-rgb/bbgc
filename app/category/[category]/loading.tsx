import GameCardSkeleton from "@/components/game/GameCardSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";
import { getBentoSpanClass, getImageContainerClass } from "@/lib/bento";

export default function CategoryLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8 animate-in fade-in duration-300">
      {/* Category Header Skeleton */}
      <div className="border-b border-[#1f1f22] pb-6 space-y-3">
        <Skeleton className="h-4 w-32 rounded bg-zinc-800" />
        <Skeleton className="h-8 sm:h-10 w-64 rounded-lg bg-zinc-800" />
        <Skeleton className="h-4 w-96 max-w-full rounded bg-zinc-800" />
      </div>

      {/* Bento Grid Skeletons */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 auto-rows-[minmax(85px,auto)] md:auto-rows-[minmax(110px,auto)] gap-2 sm:gap-2.5 grid-flow-dense pb-6">
        {Array.from({ length: 18 }).map((_, index) => {
          const spanClass = getBentoSpanClass(index);
          const imageContainerClass = getImageContainerClass(spanClass);

          return (
            <GameCardSkeleton
              key={index}
              spanClass={spanClass}
              imageContainerClass={imageContainerClass}
            />
          );
        })}
      </div>
    </div>
  );
}

