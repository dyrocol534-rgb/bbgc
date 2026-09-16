import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

interface GameCardSkeletonProps {
  spanClass?: string;
  imageContainerClass?: string;
  className?: string;
}

export default function GameCardSkeleton({
  spanClass = "col-span-1 row-span-1",
  imageContainerClass = "aspect-square",
  className,
}: GameCardSkeletonProps) {
  return (
    <div className={cn("flex flex-col h-full", spanClass, className)}>
      <div
        className={cn(
          "relative w-full rounded-2xl overflow-hidden skeleton-shimmer border border-white/5 flex-1",
          imageContainerClass
        )}
      />
      <div className="mt-1.5 px-1 flex justify-center shrink-0">
        <Skeleton className="h-3 w-3/5 rounded-md" />
      </div>
    </div>
  );
}

