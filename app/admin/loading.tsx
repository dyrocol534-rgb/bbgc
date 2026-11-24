export default function AdminLoading() {
  return (
    <div className="w-full space-y-4 animate-pulse">
      {/* 4 KPI Metrics Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-3.5 sm:p-4 rounded-xl bg-zinc-950 border border-zinc-900 space-y-2">
            <div className="flex justify-between items-center">
              <div className="h-3 w-20 bg-zinc-900 rounded" />
              <div className="w-7 h-7 rounded-lg bg-zinc-900" />
            </div>
            <div className="h-6 w-16 bg-zinc-800 rounded mt-2" />
          </div>
        ))}
      </div>

      {/* Search / Filter Bar Skeleton */}
      <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-900 space-y-2">
        <div className="h-9 w-full bg-zinc-900 rounded-lg" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-7 w-20 bg-zinc-900 rounded-lg shrink-0" />
          ))}
        </div>
      </div>

      {/* 2-Column Activity Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-3 sm:p-4 rounded-xl bg-zinc-950 border border-zinc-900 space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 bg-zinc-800 rounded" />
                <div className="h-3 w-56 bg-zinc-900 rounded" />
              </div>
            </div>
            <div className="pt-2 border-t border-zinc-900 flex justify-between">
              <div className="h-3 w-32 bg-zinc-900 rounded" />
              <div className="h-3 w-20 bg-zinc-900 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
