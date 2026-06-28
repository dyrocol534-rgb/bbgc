"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { 
  Home, Clock, Sparkles, Flame, RefreshCw, Star, Users, Trophy,
  Zap, Compass, Gamepad2, Grid, Layers, MousePointer2, Car, CircleDot, Puzzle, Crosshair,
  Mail, ChevronRight, ChevronLeft, Menu, X, Dices, Loader2, Rocket, TrendingUp
} from "lucide-react";

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
  const [categories, setCategories] = useState<{name: string, href: string, icon: any}[]>([]);

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
    } catch (error) {
      console.error("Failed to fetch random game");
    } finally {
      setIsRolling(false);
    }
  };

  return (
    <>
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
            <div className="flex justify-center items-center py-4">
              <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
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
          <button className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors flex items-center justify-center w-8 h-8">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-text-muted"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </button>
          <button className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors flex items-center justify-center w-8 h-8">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-text-muted"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </button>
          <button className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors flex items-center justify-center w-8 h-8">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-text-muted"><path d="M16.365 1.5c-1.139 0-2.585.55-3.328 1.45-.632.75-.956 1.71-.956 2.67 0 .2.022.42.046.6-1.121-.05-2.613-.67-3.415-1.63-.734-.87-1.071-1.92-1.071-3.03 0-.25.023-.49.057-.72C4.12 2.66 2.1 5.92 2.1 9.38c0 1.95.88 3.63 2.22 4.75-.41-.05-.8-.16-1.16-.32v.08c0 2.13 1.5 3.95 3.51 4.38-.34.09-.7.14-1.07.14-.25 0-.49-.02-.73-.06.58 1.78 2.22 3.09 4.19 3.12-1.5 1.18-3.38 1.88-5.43 1.88-.34 0-.67-.02-1-.06 1.97 1.27 4.33 2.01 6.84 2.01 8.24 0 12.75-6.84 12.75-12.75 0-.19 0-.39-.01-.58.87-.63 1.63-1.42 2.22-2.31-.8.36-1.66.6-2.56.71.92-.55 1.62-1.42 1.95-2.45-.86.51-1.81.88-2.82 1.08-1.55-1.65-4.14-1.74-5.79-.19-.76.71-1.19 1.72-1.19 2.76 0 .09.01.19.02.28z"/></svg>
          </button>
        </div>

        <div className="text-xs text-text-placeholder">
          © {new Date().getFullYear()} {process.env.NEXT_PUBLIC_SITE_NAME || "CloudGames"}
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
