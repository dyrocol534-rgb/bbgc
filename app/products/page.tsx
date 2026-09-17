import { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Products | Bluebuff Games",
  description: "Checkout our other projects and gaming products.",
};

export default function ProductsPage() {
  return (
    <div className="min-h-[75vh] py-6 sm:py-8 max-w-lg mx-auto px-4">
      {/* Back button */}
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </Link>
      </div>

      <div className="space-y-3.5">
        {/* Compact Header */}
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Our Products
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Products &amp; projects you may like
          </p>
        </div>

        {/* Card 1: mlbbtopup.in (Multi-game topup: BGMI, MLBB, HoK, Genshin) */}
        <div className="rounded-xl bg-[#141416] border border-white/[0.08] p-3.5 sm:p-4 space-y-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                mlbbtopup.in
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.08] text-zinc-300 border border-white/10 font-medium">
                Game Top-Up
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Instant in-game top-ups for BGMI, MLBB, Honor of Kings (HoK), Genshin Impact &amp; more. Fast, safe, and direct credits.
            </p>
          </div>

          <div className="pt-2.5 flex items-center justify-between border-t border-white/[0.06]">
            <a
              href="https://instagram.com/mlbbtopup.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              @mlbbtopup.in
            </a>

            <a
              href="https://mlbbtopup.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white hover:bg-zinc-200 active:scale-95 text-black font-semibold text-xs transition-all cursor-pointer shadow-xs"
            >
              <span>Visit Website</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Card 2: bluebuff.in (Main Project) */}
        <div className="rounded-xl bg-[#141416] border border-white/[0.08] p-3.5 sm:p-4 space-y-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                bluebuff.in
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.08] text-zinc-300 border border-white/10 font-medium">
                Main Project
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Checkout our other project products here.
            </p>
          </div>

          <div className="pt-2.5 flex items-center justify-between border-t border-white/[0.06]">
            <a
              href="https://bluebuff.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              bluebuff.in
            </a>

            <a
              href="https://bluebuff.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white hover:bg-zinc-200 active:scale-95 text-black font-semibold text-xs transition-all cursor-pointer shadow-xs"
            >
              <span>Visit Website</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
