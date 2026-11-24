export default function AdminLoading() {
  return (
    <div className="w-full space-y-4 animate-pulse">
      {/* Top Header Strip Skeleton */}
      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-zinc-900 rounded-md" />
          <div className="h-6 w-52 bg-zinc-800 rounded-lg" />
          <div className="h-3 w-72 bg-zinc-900 rounded-md" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-28 bg-zinc-900 rounded-lg" />
          <div className="h-8 w-28 bg-zinc-900 rounded-lg" />
        </div>
      </div>

      {/* Search / Filter Bar Skeleton */}
      <div className="h-10 w-full bg-zinc-950 border border-zinc-900 rounded-xl" />

      {/* Content Skeleton Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-36 rounded-xl bg-zinc-950 border border-zinc-900 p-4 flex flex-col justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-zinc-900 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-28 bg-zinc-800 rounded" />
                <div className="h-3 w-40 bg-zinc-900 rounded" />
              </div>
            </div>
            <div className="h-8 w-full bg-zinc-900/60 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
