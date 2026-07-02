"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { 
  Home, RefreshCw, Star, Users, Trophy,
  Zap, Compass, Gamepad2, Grid, Layers, MousePointer2, Car, CircleDot, Puzzle, Crosshair,
  Mail, ChevronRight, ChevronLeft, Menu, X, Dices, Loader2, Rocket, TrendingUp
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

const PRIMARY_LINKS = [
  { name: "Home", href: "/", icon: Home },
  { name: "New", href: "/category/new", icon: Rocket },
  { name: "Popular Games", href: "/category/popular", icon: TrendingUp },
  { name: "Updated", href: "/category/updated", icon: RefreshCw },
  { name: "Originals", href: "/category/originals", icon: Star },
  { name: "Multiplayer", href: "/category/multiplayer", icon: Users },
];

const getCategoryIcon = (category: string) => {
  const normalized = category.toLowerCase();
  switch (normalized) {
    case "action": return Zap;
    case "adventure": return Compass;
    case "arcade": return Gamepad2;
    case "board": return Grid;
    case "card": return Layers;
    case "clicker": return MousePointer2;
    case "driving": 
    case "racing": return Car;
    case ".io": 
    case "io": return CircleDot;
    case "puzzle": return Puzzle;
    case "shooting": 
    case "shooter": return Crosshair;
    case "sports": return Trophy;
    default: return Gamepad2;
  }
};

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [isRolling, setIsRolling] = useState(false);
  const [categories, setCategories] = useState<{name: string, href: string, icon: React.ElementType}[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (data.categories) {
          const formattedLinks = data.categories.map((c: string) => {
            // Special case for io
            const displayName = c === "io" ? ".io" : c.charAt(0).toUpperCase() + c.slice(1);
            return {
              name: displayName,
              href: `/category/${c}`,
              icon: getCategoryIcon(c)
            };
          });
          setCategories(formattedLinks);
        }
      } catch (error) {
        console.error("Failed to fetch dynamic categories", error);
      }
    }
    fetchCategories();
  }, []);

  const handleSurpriseMe = async () => {
    if (isRolling) return;
    try {
      setIsRolling(true);
      const res = await fetch("/api/games/random");
      const data = await res.json();
      if (data.slug) {
        setIsExpanded(false);
        router.push(`/games/${data.slug}`);
      }
    } catch (err) {
      console.error("Failed to fetch random game");
    } finally {
      setIsRolling(false);
    }
  };

  return (
    <>
      {/* Full-screen Loader Overlay for "Surprise Me" */}
      {isRolling && (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center w-32 h-32 mb-8">
            <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
            <div className="absolute inset-4 border-4 border-zinc-800 rounded-full"></div>
            <div className="absolute inset-4 border-4 border-b-purple-500 rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }}></div>
            <div className="absolute inset-0 bg-indigo-600/20 rounded-full animate-pulse blur-2xl"></div>
            <Dices className="w-12 h-12 text-indigo-400 animate-bounce relative z-10" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-3 tracking-wide">
            Rolling the Dice...
          </h3>
          <p className="text-zinc-400 text-lg">
            Finding your next favorite game
          </p>
        </div>
      )}

      {/* Mobile Backdrop */}
      {isExpanded && (
        <div 
          className="fixed inset-0 top-16 bg-black/60 z-30 md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Mobile Toggle Handle */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className={clsx(
          "md:hidden fixed top-1/2 -translate-y-1/2 z-50 bg-[#6c40ff] border-y border-r border-[#8b68ff] rounded-r-xl py-4 pl-1 pr-1.5 text-white shadow-[0_0_15px_rgba(108,64,255,0.5)] transition-all duration-300",
          isExpanded ? "left-60" : "left-0"
        )}
      >
        {isExpanded ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <aside 
        className={clsx(
          "flex flex-col bg-zinc-900 border-zinc-800 transition-all duration-300 ease-in-out z-40",
          // Desktop styles
          "md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:translate-x-0",
          isExpanded ? "w-60" : "md:w-16 w-0 md:border-r", 
          // Mobile styles
          "fixed top-16 bottom-0 left-0 h-[calc(100vh-4rem)] shadow-2xl md:shadow-none border-r",
          !isExpanded && "max-md:-translate-x-full"
        )}
        onMouseEnter={() => {
          if (typeof window !== "undefined" && window.innerWidth >= 768 && !isExpanded) {
            setIsExpanded(true);
          }
        }}
        onMouseLeave={() => {
          if (typeof window !== "undefined" && window.innerWidth >= 768) {
            setIsExpanded(false);
          }
        }}
      >
      {/* Scrollable Navigation Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-4">
        <div className="px-2 mb-4">
          <button
            onClick={handleSurpriseMe}
            disabled={isRolling}
            className={clsx(
              "w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all whitespace-nowrap",
              "bg-gradient-to-r from-indigo-600/20 to-purple-600/20 hover:from-indigo-600/30 hover:to-purple-600/30",
              "border border-indigo-500/30 hover:border-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]",
              !isExpanded && "justify-center px-0"
            )}
            title={!isExpanded ? "Surprise Me (Random Game)" : undefined}
          >
            {isRolling ? (
              <Loader2 className="w-5 h-5 shrink-0 text-indigo-400 animate-spin" />
            ) : (
              <Dices className="w-5 h-5 shrink-0 text-indigo-400" />
            )}
            <span className={clsx(
              "font-bold text-sm bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent transition-opacity duration-300", 
              isExpanded ? "opacity-100" : "opacity-0 hidden"
            )}>
              Surprise Me!
            </span>
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-2 mb-6">
          {PRIMARY_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsExpanded(false)}
                className={clsx(
                  "flex items-center gap-4 px-3 py-2.5 rounded-xl transition-colors whitespace-nowrap",
                  isActive 
                    ? "bg-primary/10 text-primary-light" 
                    : "text-zinc-400 hover:bg-surface-hover/50 hover:text-zinc-200"
                )}
                title={!isExpanded ? link.name : undefined}
              >
                <Icon className={clsx("w-5 h-5 shrink-0", isActive ? "text-primary-hover" : "text-text-placeholder")} />
                <span className={clsx("font-medium text-sm transition-opacity duration-300", isExpanded ? "opacity-100" : "opacity-0 hidden")}>
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="px-5 mb-2">
          <div className="h-px bg-zinc-800 w-full" />
        </div>

        <nav className="flex flex-col gap-1 px-2">
          {categories.length === 0 ? (
            <div className="flex flex-col gap-1 w-full">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={`sidebar-skel-${i}`} className="flex items-center gap-4 px-3 py-2.5">
                  <Skeleton className="w-5 h-5 rounded-md shrink-0 bg-zinc-800/80" />
                  <Skeleton className={clsx("h-4 rounded-sm bg-zinc-800/80 transition-all duration-300", isExpanded ? "w-24 opacity-100" : "w-0 opacity-0 hidden")} />
                </div>
              ))}
            </div>
          ) : categories.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsExpanded(false)}
                className={clsx(
                  "flex items-center gap-4 px-3 py-2.5 rounded-xl transition-colors whitespace-nowrap",
                  isActive 
                    ? "bg-primary/10 text-primary-light" 
                    : "text-zinc-400 hover:bg-surface-hover/50 hover:text-zinc-200"
                )}
                title={!isExpanded ? link.name : undefined}
              >
                <Icon className={clsx("w-5 h-5 shrink-0", isActive ? "text-primary-hover" : "text-text-placeholder")} />
                <span className={clsx("font-medium text-sm transition-opacity duration-300", isExpanded ? "opacity-100" : "opacity-0 hidden")}>
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Area */}
      <div className={clsx("border-t border-zinc-800 p-4 overflow-hidden transition-all duration-300", isExpanded ? "opacity-100" : "opacity-0 hidden")}>
        <div className="flex items-center gap-2 mb-4 text-text-muted">
          <span className="text-xs font-semibold uppercase tracking-wider">Tags</span>
        </div>
        
        <button className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 px-4 rounded-xl font-medium transition-colors mb-6 text-sm">
          <Mail className="w-4 h-4" />
          Contact us
        </button>

        <div className="flex flex-wrap gap-3 mb-6">
          <a 
            href="https://whatsapp.com/channel/0029Vb7zuwD0VycLqwDcE53y" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors flex items-center justify-center w-8 h-8"
            aria-label="WhatsApp"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-text-muted">
              <path d="M12.031 21.054c-1.845 0-3.623-.473-5.221-1.372l-.375-.213-3.87.102 1.041-3.771-.233-.37c-.985-1.573-1.503-3.39-1.503-5.26 0-5.465 4.453-9.914 9.932-9.914 2.65 0 5.143 1.033 7.018 2.909 1.874 1.877 2.908 4.368 2.908 7.022 0 5.466-4.453 9.914-9.931 9.914h.202zm5.728-7.795c-.314-.158-1.859-.918-2.146-1.023-.287-.105-.497-.158-.707.158-.21.314-.808 1.023-1.002 1.231-.194.208-.388.234-.702.076-2.023-1.008-3.32-2.142-4.135-4.264-.105-.285.105-.436.26-.59.139-.14.314-.367.472-.55.158-.184.21-.314.314-.525.105-.21.052-.394-.026-.552-.079-.158-.707-1.705-.968-2.336-.254-.616-.511-.532-.707-.542-.184-.01-.394-.01-.604-.01-.21 0-.551.079-.84.394-.288.315-1.101 1.076-1.101 2.624 0 1.549 1.127 3.045 1.285 3.255.158.21 2.217 3.385 5.372 4.747 3.155 1.362 3.155.918 3.731.866.577-.052 1.859-.761 2.121-1.496.262-.735.262-1.365.184-1.496-.078-.131-.288-.21-.603-.368z" />
            </svg>
          </a>
        </div>

        <div className="text-xs text-text-placeholder">
          © {new Date().getFullYear()} {process.env.NEXT_PUBLIC_SITE_NAME || "Bluebuff Games"}
        </div>
      </div>
      
      {/* Manual Toggle Button (optional, since hover handles it, but good for UX) */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-6 bg-zinc-800 border border-zinc-700 rounded-full p-1 text-zinc-400 hover:text-white z-40 hidden md:block shadow-lg"
      >
        {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
    </aside>
    </>
  );
}
