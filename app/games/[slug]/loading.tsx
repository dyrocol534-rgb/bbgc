import { Skeleton } from "@/components/ui/Skeleton";

export default function GameLoading() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-[1400px]">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <Skeleton className="w-full rounded-2xl" style={{ aspectRatio: "16/9", minHeight: "300px" }} />
          </div>
          <div className="bg-zinc-900 rounded-2xl p-4 sm:p-6 border border-zinc-800 space-y-4">
            <Skeleton className="h-9 w-2/3 rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-6 w-24 rounded-md" />
            </div>
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
            <Skeleton className="h-4 w-4/6 rounded" />
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
              <Skeleton className="h-5 w-full rounded" />
              <Skeleton className="h-5 w-full rounded" />
              <Skeleton className="h-5 w-full rounded" />
              <Skeleton className="h-5 w-full rounded" />
            </div>
          </div>
        </div>
        <aside className="w-full lg:w-[450px] xl:w-[500px] shrink-0">
          <div className="bg-zinc-900 rounded-2xl p-4 sm:p-5 border border-zinc-800">
            <Skeleton className="h-6 w-28 rounded-lg mb-4" />
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}