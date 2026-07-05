import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center p-8 min-h-[50vh] animate-in fade-in duration-300">
      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
      <h2 className="text-xl font-bold text-white mb-2">Loading Games...</h2>
      <p className="text-zinc-400 text-sm animate-pulse">Getting the best games ready for you</p>
    </div>
  );
}
