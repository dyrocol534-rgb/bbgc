import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { Gamepad2 } from "lucide-react";

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
          "relative w-full rounded-2xl overflow-hidden skeleton-shimmer border border-white/5 flex-1 flex items-center justify-center",
          imageContainerClass
        )}
      >
        <Gamepad2 className="w-6 h-6 text-zinc-600/40 animate-pulse" />
      </div>
      <div className="mt-1.5 px-1 flex justify-center shrink-0">
        <Skeleton className="h-3.5 w-3/4 rounded-full bg-zinc-800" />
      </div>
    </div>
  );
}

