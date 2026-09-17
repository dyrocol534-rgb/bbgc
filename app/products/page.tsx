import { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ArrowUpRight, Gamepad2, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Products | Bluebuff Games",
  description: "Checkout our other projects and gaming products.",
};

const PRODUCTS = [
  {
    title: "mlbbtopup.in",
    subtitle: "BGMI, MLBB, HoK, Genshin Impact & more top-up",
    url: "https://mlbbtopup.in",
    icon: Gamepad2,
    action: "Visit",
  },
  {
    title: "bluebuff.in",
    subtitle: "Checkout our other project products here",
    url: "https://bluebuff.in",
    icon: Globe,
    action: "Visit",
  },
];

export default function ProductsPage() {
  return (
    <div className="min-h-[75vh] py-6 sm:py-8 max-w-md mx-auto px-4">
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

      <div className="space-y-3">
        {/* Header */}
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Our Products
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Products &amp; projects you may like
          </p>
        </div>

        {/* 1-Row List of Products */}
        <div className="flex flex-col gap-2 pt-1">
          {PRODUCTS.map((prod) => {
            const Icon = prod.icon;
            return (
              <a
                key={prod.title}
                href={prod.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-[#141416] hover:bg-[#19191d] border border-white/[0.08] hover:border-white/[0.16] transition-all group text-left cursor-pointer active:scale-[0.99] shadow-xs"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs sm:text-[13px] font-semibold text-white truncate leading-tight group-hover:text-zinc-200 transition-colors">
                      {prod.title}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-zinc-400 truncate leading-tight mt-1">
                      {prod.subtitle}
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-black bg-white hover:bg-zinc-200 px-3 py-1 rounded-full shrink-0 flex items-center gap-1 transition-all shadow-xs">
                  <span>{prod.action}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
