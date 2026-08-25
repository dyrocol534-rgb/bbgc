"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import clsx from "clsx";
import { 
  Home, RefreshCw, Star, Users, Trophy, Crown,
  Zap, Compass, Gamepad2, Grid, Layers, MousePointer2, Car, CircleDot, Puzzle, Crosshair,
  Mail, ChevronRight, ChevronLeft, Menu, X, Dices, Loader2, Rocket, TrendingUp, Flame, Handshake, ExternalLink
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

const PRIMARY_LINKS = [
  { name: "Home", href: "/", icon: Home },
  { name: "New", href: "/category/new", icon: Rocket },
  { name: "Popular Games", href: "/category/popular", icon: TrendingUp },
  // { name: "Global Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Featured", href: "/category/featured", icon: Crown },
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
          className="fixed inset-0 top-13 sm:top-16 bg-black/60 z-30 md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Mobile Toggle Handle */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className={clsx(
          "md:hidden fixed top-1/2 -translate-y-1/2 z-50 bg-[#ff6b00] hover:bg-[#ea580c] border-y border-r border-orange-400/40 rounded-r-lg py-2.5 px-1 text-white transition-all duration-300 transform-gpu active:scale-95",
          isExpanded ? "left-60" : "left-0"
        )}
        aria-label={isExpanded ? "Close sidebar" : "Open sidebar"}
      >
        {isExpanded ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
      </button>

      <aside 
        className={clsx(
          "flex flex-col bg-[#0c0c0e] border-[#1f1f22] transition-all duration-300 ease-in-out z-40 transform-gpu",
          // Desktop styles
          "md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:translate-x-0",
          isExpanded ? "w-60" : "md:w-16 w-0 md:border-r", 
          // Mobile styles
          "fixed top-13 sm:top-16 bottom-0 left-0 h-[calc(100vh-3.25rem)] sm:h-[calc(100vh-4rem)] shadow-2xl md:shadow-none border-r",
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
              "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all whitespace-nowrap",
              "bg-[#121214] border border-[#1f1f22] hover:border-orange-500/50 hover:bg-[#1a1410] shadow-md shadow-black/40",
              !isExpanded && "justify-center px-0"
            )}
            title={!isExpanded ? "Surprise Me (Random Game)" : undefined}
          >
            {isRolling ? (
              <Loader2 className="w-5 h-5 shrink-0 text-orange-400 animate-spin" />
            ) : (
              <Dices className="w-5 h-5 shrink-0 text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
            )}
            <span className={clsx(
              "font-bold text-sm text-orange-100 transition-all duration-300", 
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
                  "flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap",
                  isActive 
                    ? "bg-[#121214] text-white shadow-md shadow-black/40 border-l-2 border-orange-500 rounded-l-none" 
                    : "text-zinc-400 hover:bg-[#121214]/50 hover:text-zinc-200 border-l-2 border-transparent"
                )}
                title={!isExpanded ? link.name : undefined}
              >
                <Icon className={clsx("w-5 h-5 shrink-0", isActive ? "text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" : "text-zinc-500")} />
                <span className={clsx("transition-opacity duration-300", isExpanded ? "opacity-100" : "opacity-0 hidden")}>
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Rewards & Referral Buttons in Sidebar */}
        <div className="px-3 mb-4 flex flex-col gap-1.5">
          <div className={clsx("flex items-center gap-2 mb-1 px-1 text-zinc-500 transition-opacity duration-300", isExpanded ? "opacity-100" : "opacity-0 hidden")}>
            <span className="text-[10px] font-bold uppercase tracking-widest">Rewards</span>
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
              "w-full flex items-center justify-between px-4 py-3 bg-[#121214] border border-[#1f1f22] hover:border-orange-500/30 hover:bg-[#1a1410] transition-all rounded-xl font-bold group overflow-hidden shadow-sm",
              !isExpanded && "justify-center"
            )}
            title={!isExpanded ? "Refer & Earn +50 XP" : undefined}
          >
            <div className="flex items-center gap-3">
              <Handshake className="w-5 h-5 text-orange-400 shrink-0 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
              <div className={clsx("flex flex-col items-start transition-opacity duration-300 whitespace-nowrap", isExpanded ? "opacity-100" : "opacity-0 hidden")}>
                <span className="text-white text-sm group-hover:text-orange-200 transition-colors">Refer & Earn</span>
                <span className="text-orange-400/80 text-[10px] uppercase tracking-wider font-bold">+50 XP</span>
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
              "w-full flex items-center justify-between px-4 py-3 bg-[#121214] border border-[#1f1f22] hover:border-orange-500/30 hover:bg-[#1a1512] transition-all rounded-xl font-bold group overflow-hidden shadow-sm",
              !isExpanded && "justify-center"
            )}
            title={!isExpanded ? "Daily Streak & XP" : undefined}
          >
            <div className="flex items-center gap-3">
              <Flame className="w-5 h-5 text-orange-500 shrink-0 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
              <div className={clsx("flex flex-col items-start transition-opacity duration-300 whitespace-nowrap", isExpanded ? "opacity-100" : "opacity-0 hidden")}>
                <span className="text-white text-sm group-hover:text-orange-200 transition-colors">Daily Streak</span>
                <span className="text-orange-500/80 text-[10px] uppercase tracking-wider font-bold">
                  {session?.user ? `${(session.user as any).currentStreak || 0} DAYS` : "0 DAYS"}
                </span>
              </div>
            </div>
          </Link>
        </div>

        <div className="px-5 mb-3">
          <div className="h-px bg-zinc-800 w-full mb-3" />
          <div className={clsx("flex items-center gap-2 px-1 text-zinc-500 transition-opacity duration-300", isExpanded ? "opacity-100" : "opacity-0 hidden")}>
            <span className="text-[10px] font-bold uppercase tracking-widest">Tags</span>
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-2">
          {categories.length === 0 ? (
            <div className="flex flex-col gap-1 w-full">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={`sidebar-skel-${i}`} className="flex items-center gap-4 px-3 py-2.5">
                  <Skeleton className="w-5 h-5 rounded-md shrink-0" />
                  <Skeleton className={clsx("h-4 rounded-sm transition-all duration-300", isExpanded ? "w-24 opacity-100" : "w-0 opacity-0 hidden")} />
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
                  "flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap",
                  isActive 
                    ? "bg-[#121214] text-white shadow-md shadow-black/40 border-l-2 border-orange-500 rounded-l-none" 
                    : "text-zinc-500 hover:bg-[#121214]/50 hover:text-zinc-300 border-l-2 border-transparent"
                )}
                title={!isExpanded ? link.name : undefined}
              >
                <Icon className={clsx("w-5 h-5 shrink-0", isActive ? "text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" : "text-zinc-500")} />
                <span className={clsx("transition-opacity duration-300", isExpanded ? "opacity-100" : "opacity-0 hidden")}>
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Area */}
      <div className={clsx("border-t border-zinc-800/80 p-3 pb-6 sm:pb-3 overflow-hidden transition-all duration-300 flex flex-col items-center justify-center gap-2", isExpanded ? "opacity-100" : "opacity-0 hidden")}>
        <div className="flex items-center gap-2">
          <a 
            href="https://whatsapp.com/channel/0029Vb7zuwD0VycLqwDcE53y" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-7 h-7 bg-zinc-800/80 hover:bg-green-900/50 hover:text-green-400 rounded-full transition-colors flex items-center justify-center text-zinc-400"
            aria-label="WhatsApp"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M12.031 21.054c-1.845 0-3.623-.473-5.221-1.372l-.375-.213-3.87.102 1.041-3.771-.233-.37c-.985-1.573-1.503-3.39-1.503-5.26 0-5.465 4.453-9.914 9.932-9.914 2.65 0 5.143 1.033 7.018 2.909 1.874 1.877 2.908 4.368 2.908 7.022 0 5.466-4.453 9.914-9.931 9.914h.202zm5.728-7.795c-.314-.158-1.859-.918-2.146-1.023-.287-.105-.497-.158-.707.158-.21.314-.808 1.023-1.002 1.231-.194.208-.388.234-.702.076-2.023-1.008-3.32-2.142-4.135-4.264-.105-.285.105-.436.26-.59.139-.14.314-.367.472-.55.158-.184.21-.314.314-.525.105-.21.052-.394-.026-.552-.079-.158-.707-1.705-.968-2.336-.254-.616-.511-.532-.707-.542-.184-.01-.394-.01-.604-.01-.21 0-.551.079-.84.394-.288.315-1.101 1.076-1.101 2.624 0 1.549 1.127 3.045 1.285 3.255.158.21 2.217 3.385 5.372 4.747 3.155 1.362 3.155.918 3.731.866.577-.052 1.859-.761 2.121-1.496.262-.735.262-1.365.184-1.496-.078-.131-.288-.21-.603-.368z" />
            </svg>
          </a>
          <a 
            href="https://instagram.com/mlbbtopup.in" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-7 h-7 bg-zinc-800/80 hover:bg-pink-900/40 hover:text-pink-400 rounded-full transition-colors flex items-center justify-center text-zinc-400"
            aria-label="Instagram"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
          </a>
          <a 
            href="https://www.linkedin.com/company/bluebuffesports/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-7 h-7 bg-zinc-800/80 hover:bg-blue-900/40 hover:text-blue-400 rounded-full transition-colors flex items-center justify-center text-zinc-400"
            aria-label="LinkedIn"
            title="Follow Bluebuff Esports on LinkedIn"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.74a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
            </svg>
          </a>
        </div>

        <div className="text-center flex flex-col items-center gap-0.5">
          <p className="text-[11px] text-zinc-400 font-medium leading-tight">© {new Date().getFullYear()} {process.env.NEXT_PUBLIC_SITE_NAME || "Bluebuff Games"}</p>
          <a 
            href="https://bluebuff.in" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-[9.5px] text-zinc-500 hover:text-indigo-400 transition-colors inline-flex items-center gap-1 font-medium leading-tight"
          >
            <span>A product from bluebuff.in</span>
            <ExternalLink className="w-2.5 h-2.5 text-zinc-600" />
          </a>
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
