"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import clsx from "clsx";
import { 
  Home, RefreshCw, Star, Users, Trophy, Crown,
  Zap, Compass, Gamepad2, Grid, Layers, MousePointer2, Car, CircleDot, Puzzle, Crosshair,
  Mail, ChevronRight, ChevronLeft, Menu, X, Dices, Loader2, Rocket, TrendingUp, Flame, Handshake, ExternalLink,
  Smile, Heart, PersonStanding, BrainCircuit
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

const PRIMARY_LINKS = [
  { name: "Home", href: "/", icon: Home, color: "text-blue-400", bg: "bg-blue-500/15 border-blue-500/25" },
  { name: "New", href: "/category/new", icon: Rocket, color: "text-orange-400", bg: "bg-orange-500/15 border-orange-500/25" },
  { name: "Popular Games", href: "/category/popular", icon: TrendingUp, color: "text-pink-400", bg: "bg-pink-500/15 border-pink-500/25" },
  // { name: "Global Leaderboard", href: "/leaderboard", icon: Trophy, color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/25" },
  { name: "Featured", href: "/category/featured", icon: Crown, color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/25" },
];

const getCategoryIcon = (category: string) => {
  const normalized = category.toLowerCase();
  switch (normalized) {
    case "action": return Zap;
    case "adventure": return Compass;
    case "arcade": return Gamepad2;
    case "board": return Grid;
    case "card": return Layers;
    case "casual": return Smile;
    case "clicker": return MousePointer2;
    case "driving":
    case "racing": return Car;
    case "girls": return Heart;
    case "hypercasual": return Dices;
    case ".io":
    case "io": return CircleDot;
    case "multiplayer": return Users;
    case "puzzle": return Puzzle;
    case "shooting":
    case "shooter": return Crosshair;
    case "soccer": return CircleDot;
    case "sports": return Trophy;
    case "stickman": return PersonStanding;
    case "strategy": return BrainCircuit;
    default: return Gamepad2;
  }
};

function formatCategoryLinks(categoryList: string[]) {
  return categoryList.map((c: string) => {
    const displayName = c === "io" ? ".io" : c.charAt(0).toUpperCase() + c.slice(1);
    return {
      name: displayName,
      href: `/category/${c}`,
      icon: getCategoryIcon(c),
    };
  });
}

interface SidebarProps {
  initialCategories?: string[];
}

export default function Sidebar({ initialCategories = [] }: SidebarProps) {
  const { data: session } = useSession();
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login" || pathname?.startsWith("/login");
  const [isRolling, setIsRolling] = useState(false);
  const [categories, setCategories] = useState<{name: string, href: string, icon: React.ElementType}[]>(() =>
    initialCategories.length > 0 ? formatCategoryLinks(initialCategories) : []
  );

  useEffect(() => {
    if (initialCategories.length > 0) return;
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (data.categories) {
          setCategories(formatCategoryLinks(data.categories));
        }
      } catch (error) {
        console.error("Failed to fetch dynamic categories", error);
      }
    }
    fetchCategories();
  }, [initialCategories]);

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
          className="fixed inset-0 top-13 sm:top-16 bg-black/60 z-30 md:hidden backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Mobile Floating Circular Action Button (FAB) */}
      {!isLoginPage && (
        <button 
          type="button"
          onClick={() => setIsExpanded(prev => !prev)}
          className={clsx(
            "md:hidden fixed z-50 select-none",
            "flex items-center justify-center",
            "w-12 h-12 rounded-full",
            "bg-[#18181c]/90 backdrop-blur-xl",
            "border border-white/[0.15] shadow-[0_8px_24px_rgba(0,0,0,0.6)]",
            "text-white transition-all duration-300 transform-gpu",
            "bottom-6 left-4 active:scale-95 hover:scale-105",
            isExpanded && "left-[290px]"
          )}
          aria-label={isExpanded ? "Close navigation" : "Open navigation"}
        >
          {isExpanded ? (
            <X className="w-5 h-5 text-white transition-transform duration-200" />
          ) : (
            <Gamepad2 className="w-5 h-5 text-orange-400 transition-transform duration-200" />
          )}
        </button>
      )}

      <aside 
        className={clsx(
          "flex flex-col bg-[#0d0d10]/95 backdrop-blur-xl border-white/[0.08] transition-all duration-300 ease-in-out z-40 transform-gpu",
          // Desktop styles
          "md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:translate-x-0",
          isExpanded ? "w-72" : "md:w-16 w-0 md:border-r", 
          // Mobile styles
          "fixed top-13 sm:top-16 bottom-0 left-0 h-[calc(100vh-3.25rem)] sm:h-[calc(100vh-4rem)] md:shadow-none border-r",
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
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-3">
        <div className="px-2.5 mb-3">
          <button
            onClick={handleSurpriseMe}
            disabled={isRolling}
            className={clsx(
              "w-full flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all whitespace-nowrap",
              "bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 hover:from-orange-500/20 hover:to-amber-500/20",
              "border border-orange-500/25 hover:border-orange-500/40 shadow-xs",
              !isExpanded && "justify-center px-0"
            )}
            title={!isExpanded ? "Surprise Me (Random Game)" : undefined}
          >
            <div className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-[#ff7a1a] to-[#ea580c] flex items-center justify-center shrink-0 shadow-sm">
              {isRolling ? (
                <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
              ) : (
                <Dices className="w-3.5 h-3.5 text-white" />
              )}
            </div>
            <span className={clsx(
              "font-semibold text-xs text-orange-200 transition-all duration-300", 
              isExpanded ? "opacity-100" : "opacity-0 hidden"
            )}>
              Surprise Me!
            </span>
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-2.5 mb-4">
          {PRIMARY_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsExpanded(false)}
                className={clsx(
                  "flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap group",
                  isActive 
                    ? "bg-white/[0.09] text-white shadow-xs ring-1 ring-white/[0.1]" 
                    : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                )}
                title={!isExpanded ? link.name : undefined}
              >
                <div className={clsx(
                  "w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0 border transition-all",
                  isActive ? link.bg : "bg-white/[0.04] border-white/[0.06] text-zinc-400 group-hover:text-white group-hover:bg-white/[0.08]"
                )}>
                  <Icon className={clsx("w-3.5 h-3.5", isActive ? link.color : "text-zinc-400 group-hover:text-white")} />
                </div>
                <span className={clsx("transition-opacity duration-300 font-medium", isExpanded ? "opacity-100" : "opacity-0 hidden")}>
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Rewards & Referral Buttons in Sidebar */}
        <div className="px-2.5 mb-3 flex flex-col gap-1.5">
          <div className={clsx("flex items-center gap-2 mb-0.5 px-1 text-zinc-500 transition-opacity duration-300", isExpanded ? "opacity-100" : "opacity-0 hidden")}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Rewards</span>
          </div>
          {/* Refer & Earn */}
          <Link
            href="/referral"
            onClick={(e) => {
              if (!session?.user) {
                e.preventDefault();
                router.push("/login");
              }
              setIsExpanded(false);
            }}
            className={clsx(
              "w-full flex items-center justify-between px-2.5 py-2 bg-white/[0.04] border border-white/[0.07] hover:border-white/[0.15] hover:bg-white/[0.07] transition-all rounded-xl group overflow-hidden",
              !isExpanded && "justify-center"
            )}
            title={!isExpanded ? "Refer & Earn +50 XP" : undefined}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-[8px] bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                <Handshake className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </div>
              <div className={clsx("flex flex-col items-start transition-opacity duration-300 whitespace-nowrap", isExpanded ? "opacity-100" : "opacity-0 hidden")}>
                <span className="text-white text-xs font-medium group-hover:text-emerald-300 transition-colors">Refer & Earn</span>
                <span className="text-emerald-400/90 text-[9.5px] uppercase tracking-wider font-semibold">+50 XP</span>
              </div>
            </div>
          </Link>

          {/* Daily Streak */}
          <Link
            href="/rewards"
            onClick={(e) => {
              if (!session?.user) {
                e.preventDefault();
                router.push("/login");
              }
              setIsExpanded(false);
            }}
            className={clsx(
              "w-full flex items-center justify-between px-2.5 py-2 bg-white/[0.04] border border-white/[0.07] hover:border-white/[0.15] hover:bg-white/[0.07] transition-all rounded-xl group overflow-hidden",
              !isExpanded && "justify-center"
            )}
            title={!isExpanded ? "Daily Streak & XP" : undefined}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-[8px] bg-orange-500/15 border border-orange-500/25 flex items-center justify-center shrink-0">
                <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              </div>
              <div className={clsx("flex flex-col items-start transition-opacity duration-300 whitespace-nowrap", isExpanded ? "opacity-100" : "opacity-0 hidden")}>
                <span className="text-white text-xs font-medium group-hover:text-orange-300 transition-colors">Daily Streak</span>
                <span className="text-orange-400/90 text-[9.5px] uppercase tracking-wider font-semibold">
                  {session?.user ? `${(session.user as any).currentStreak || 0} DAYS` : "0 DAYS"}
                </span>
              </div>
            </div>
          </Link>
        </div>

        <div className="px-3 mb-2">
          <div className="h-px bg-white/[0.06] w-full mb-2" />
          <div className={clsx("flex items-center gap-2 px-1 text-zinc-500 transition-opacity duration-300", isExpanded ? "opacity-100" : "opacity-0 hidden")}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Tags</span>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5 px-2.5">
          {categories.length === 0 ? (
            <div className="flex flex-col gap-1 w-full">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={`sidebar-skel-${i}`} className="flex items-center gap-3 px-2.5 py-1.5">
                  <Skeleton className="w-6 h-6 rounded-[7px] shrink-0" />
                  <Skeleton className={clsx("h-3.5 rounded-sm transition-all duration-300", isExpanded ? "w-24 opacity-100" : "w-0 opacity-0 hidden")} />
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
                  "flex items-center gap-3 px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap group",
                  isActive 
                    ? "bg-white/[0.09] text-white shadow-xs ring-1 ring-white/[0.1]" 
                    : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                )}
                title={!isExpanded ? link.name : undefined}
              >
                <div className={clsx(
                  "w-6 h-6 rounded-[7px] flex items-center justify-center shrink-0 border transition-all",
                  isActive 
                    ? "bg-orange-500/15 border-orange-500/25 text-orange-400" 
                    : "bg-white/[0.03] border-white/[0.05] text-zinc-500 group-hover:text-zinc-300 group-hover:bg-white/[0.06]"
                )}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className={clsx("transition-opacity duration-300 font-medium", isExpanded ? "opacity-100" : "opacity-0 hidden")}>
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Area - Compact single row */}
      <div className={clsx("border-t border-white/[0.06] px-3 py-2 overflow-hidden transition-all duration-300 flex items-center justify-between gap-2", isExpanded ? "opacity-100" : "opacity-0 hidden")}>
        <div className="flex items-center gap-1.5">
          <a
            href="https://whatsapp.com/channel/0029Vb7zuwD0VycLqwDcE53y"
            target="_blank"
            rel="noopener noreferrer"
            className="w-6 h-6 hover:text-green-400 rounded-full bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors flex items-center justify-center text-zinc-400"
            aria-label="WhatsApp"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
              <path d="M12.031 21.054c-1.845 0-3.623-.473-5.221-1.372l-.375-.213-3.87.102 1.041-3.771-.233-.37c-.985-1.573-1.503-3.39-1.503-5.26 0-5.465 4.453-9.914 9.932-9.914 2.65 0 5.143 1.033 7.018 2.909 1.874 1.877 2.908 4.368 2.908 7.022 0 5.466-4.453 9.914-9.931 9.914h.202zm5.728-7.795c-.314-.158-1.859-.918-2.146-1.023-.287-.105-.497-.158-.707.158-.21.314-.808 1.023-1.002 1.231-.194.208-.388.234-.702.076-2.023-1.008-3.32-2.142-4.135-4.264-.105-.285.105-.436.26-.59.139-.14.314-.367.472-.55.158-.184.21-.314.314-.525.105-.21.052-.394-.026-.552-.079-.158-.707-1.705-.968-2.336-.254-.616-.511-.532-.707-.542-.184-.01-.394-.01-.604-.01-.21 0-.551.079-.84.394-.288.315-1.101 1.076-1.101 2.624 0 1.549 1.127 3.045 1.285 3.255.158.21 2.217 3.385 5.372 4.747 3.155 1.362 3.155.918 3.731.866.577-.052 1.859-.761 2.121-1.496.262-.735.262-1.365.184-1.496-.078-.131-.288-.21-.603-.368z" />
            </svg>
          </a>
          <a
            href="https://instagram.com/mlbbtopup.in"
            target="_blank"
            rel="noopener noreferrer"
            className="w-6 h-6 hover:text-pink-400 rounded-full bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors flex items-center justify-center text-zinc-400"
            aria-label="Instagram"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/company/bluebuffesports/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-6 h-6 hover:text-blue-400 rounded-full bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors flex items-center justify-center text-zinc-400"
            aria-label="LinkedIn"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.74a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
            </svg>
          </a>
        </div>
        <p className="text-[10px] text-zinc-500 leading-tight">© {new Date().getFullYear()} {process.env.NEXT_PUBLIC_SITE_NAME || "Bluebuff Games"}</p>
      </div>

      {/* Manual Toggle Button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-6 bg-[#18181b] border border-white/[0.12] rounded-full p-1 text-zinc-400 hover:text-white z-40 hidden md:flex items-center justify-center shadow-md transition-colors"
      >
        {isExpanded ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>
    </aside>
    </>
  );
}
