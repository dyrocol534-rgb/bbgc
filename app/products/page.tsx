import { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Products | Bluebuff Games",
  description: "Our products you may like.",
};

export default function ProductsPage() {
  return (
    <div className="min-h-[75vh] py-8 sm:py-12 max-w-xl mx-auto px-4">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>
      </div>

      <div className="space-y-5">
        {/* Simple Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Our Products
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Products you may like
          </p>
        </div>

        {/* Clean, Simple Card for mlbbtopup.in */}
        <div className="rounded-2xl bg-[#141416] border border-white/[0.08] p-4 sm:p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  mlbbtopup.in
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 font-medium">
                  MLBB Top-Up
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Instant diamonds &amp; Weekly Pass for Mobile Legends: Bang Bang. Fast, direct, and secure top-up.
              </p>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-white/[0.06]">
            <a
              href="https://instagram.com/mlbbtopup.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              @mlbbtopup.in
            </a>

            <a
              href="https://mlbbtopup.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 active:scale-95 text-zinc-950 font-semibold text-xs transition-all cursor-pointer"
            >
              <span>Visit Website</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
