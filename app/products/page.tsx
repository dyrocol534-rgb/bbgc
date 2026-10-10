import { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ArrowUpRight, Gamepad2, Globe, Server, Laptop } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Products | Bluebuff Games",
  description: "Checkout our other projects and gaming products across Bluebuff ecosystem.",
};

const PRODUCTS = [
  {
    title: "mlbbtopup.in",
    subtitle: "BGMI, MLBB, HoK, Genshin Impact & instant gaming top-up",
    url: "https://mlbbtopup.in",
    icon: Gamepad2,
    badge: "Store",
  },
  {
    title: "bluebuff.in",
    subtitle: "Explore our main hub and product suite",
    url: "https://bluebuff.in",
    icon: Globe,
    badge: "Ecosystem",
  },
  {
    title: "web.bluebuff.in",
    subtitle: "Web applications, cloud portals, and developer suites",
    url: "https://web.bluebuff.in",
    icon: Laptop,
    badge: "Web App",
  },
  {
    title: "api.bluebuff.in",
    subtitle: "High-performance developer APIs, game services & docs",
    url: "https://api.bluebuff.in",
    icon: Server,
    badge: "API / Dev",
  },
];

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-black pb-12">
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 py-3 sm:py-4 space-y-4">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium border border-zinc-800 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
            <span>Home</span>
          </Link>

          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
            Bluebuff Ecosystem
          </span>
        </div>

        {/* Header */}
        <div className="rounded-xl bg-zinc-950 border border-zinc-900 p-3.5 sm:p-4">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
              Our Products &amp; Ecosystem
            </h1>
            <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
              {PRODUCTS.length} Projects
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Explore our gaming platforms, web tools, developer APIs, and digital services.
          </p>
        </div>

        {/* Products Grid (Responsive Full Width) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {PRODUCTS.map((prod) => {
            const Icon = prod.icon;
            return (
              <a
                key={prod.title}
                href={prod.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-900/80 border border-zinc-900 hover:border-zinc-800 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-white group-hover:border-zinc-700 transition-colors">
                    <Icon className="w-4 h-4 text-zinc-300 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white truncate group-hover:text-zinc-200 transition-colors">
                        {prod.title}
                      </span>
                      {prod.badge && (
                        <span className="text-[10px] font-medium text-zinc-400 bg-black border border-zinc-900 px-1.5 py-0.5 rounded shrink-0">
                          {prod.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-zinc-500 truncate mt-0.5">
                      {prod.subtitle}
                    </span>
                  </div>
                </div>

                <div className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-zinc-200 text-black flex items-center gap-1 shrink-0 transition-colors">
                  <span>Visit</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
