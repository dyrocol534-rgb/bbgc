"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
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
import { XP_CONFIG } from "@/lib/xp-config";
import { triggerHaptic } from "@/lib/utils";
import { useUIStore } from "@/lib/stores/uiStore";

const PRIMARY_LINKS = [
  { name: "Home", href: "/", icon: Home, color: "text-blue-400", bg: "bg-blue-500/15" },
  { name: "New", href: "/category/new", icon: Rocket, color: "text-white", bg: "bg-white/[0.08]" },
  { name: "Popular Games", href: "/category/popular", icon: TrendingUp, color: "text-pink-400", bg: "bg-pink-500/15" },
  // { name: "Global Leaderboard", href: "/leaderboard", icon: Trophy, color: "text-amber-400", bg: "bg-amber-500/15" },
  { name: "Featured", href: "/category/featured", icon: Crown, color: "text-white", bg: "bg-white/[0.08]" },
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
  const seen = new Set<string>();
  const links: { name: string; href: string; icon: React.ElementType }[] = [];

  for (const rawCat of categoryList) {
    if (!rawCat || typeof rawCat !== "string") continue;
    const norm = rawCat.trim().toLowerCase();
    const canonicalCat = norm === ".io" ? "io" : norm;
    const displayName = canonicalCat === "io" ? ".io" : canonicalCat.charAt(0).toUpperCase() + canonicalCat.slice(1);

    if (seen.has(canonicalCat) || seen.has(displayName)) continue;
    seen.add(canonicalCat);
    seen.add(displayName);

    links.push({
      name: displayName,
      href: `/category/${canonicalCat}`,
      icon: getCategoryIcon(canonicalCat),
    });
  }

  return links;
}

interface SidebarProps {
  initialCategories?: string[];
}

export default function Sidebar({ initialCategories = [] }: SidebarProps) {
  const { data: session } = useSession();
  const isExpanded = useUIStore((state) => state.isNavSidebarOpen);
  const setNavSidebarOpen = useUIStore((state) => state.setNavSidebarOpen);
  const closeNavSidebar = useUIStore((state) => state.closeNavSidebar);
  const setIsExpanded = (val: boolean | ((prev: boolean) => boolean)) => {
    if (typeof val === "function") {
      setNavSidebarOpen(val(isExpanded));
    } else {
      setNavSidebarOpen(val);
    }
  };
  const pathname = usePathname();
  const router = useRouter();
  const [isRolling, setIsRolling] = useState(false);
  const [categories, setCategories] = useState<{name: string, href: string, icon: React.ElementType}[]>(() =>
    initialCategories.length > 0 ? formatCategoryLinks(initialCategories) : []
  );

  const isLoginPage = pathname === "/login" || pathname?.startsWith("/login");
  const isAdminPage = pathname === "/admin" || pathname?.startsWith("/admin");

  useEffect(() => {
    if (initialCategories.length > 0 || isAdminPage) return;
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
  }, [initialCategories, isAdminPage]);

  // Auto-close on route navigation
  useEffect(() => {
    closeNavSidebar();
  }, [pathname, closeNavSidebar]);

  if (isAdminPage) return null;

  const handleSurpriseMe = async () => {
    if (isRolling) return;
    triggerHaptic("medium");
    try {
      setIsRolling(true);
      const res = await fetch("/api/games/random");
      const data = await res.json();
      if (data.slug) {
        triggerHaptic("success");
        setIsExpanded(false);
        router.push(`/games/${data.slug}`);
      }
    } catch (err) {
      triggerHaptic("warning");
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

      {/* ── Mobile Backdrop ─────────────────────────────────────── */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 md:hidden transition-opacity duration-300"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* ── Mobile Floating Circular Action Button (FAB) ─────────── */}
      {!isLoginPage && (
        <button 
          type="button"
          onClick={() => setIsExpanded(prev => !prev)}
          className={clsx(
            "md:hidden fixed z-40 select-none flex items-center justify-center w-11 h-11 rounded-full bg-[#18181c]/90 backdrop-blur-xl border border-white/[0.15] shadow-[0_8px_24px_rgba(0,0,0,0.6)] text-white transition-all duration-300 transform-gpu bottom-5 left-4 active:scale-95 hover:scale-105 cursor-pointer",
            isExpanded && "hidden"
          )}
          aria-label="Open navigation"
          title="Open navigation"
        >
          <Gamepad2 className="w-5 h-5 text-white" />
        </button>
      )}

      {/* ── Mobile Off-Canvas Navigation Drawer ─────────────────── */}
      <div 
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-black border-r border-white/[0.08] flex flex-col shadow-2xl transition-transform duration-300 ease-out md:hidden",
          isExpanded ? "translate-x-0" : "-translate-x-full pointer-events-none"
        )}
      >
        {/* Drawer Header */}
        <div className="p-3.5 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-black">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
              <Image
                src="/logo.png"
                alt="Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">Navigation</span>
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col justify-between">
          <div>
            {/* Surprise Me Button */}
            <div className="mb-2">
              <button
                type="button"
                onClick={handleSurpriseMe}
                disabled={isRolling}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-zinc-400 hover:bg-white/[0.05] hover:text-white transition-all whitespace-nowrap cursor-pointer active:scale-95 group"
              >
                <div className="w-7 h-7 flex items-center justify-center shrink-0">
                  {isRolling ? <Loader2 className="w-4 h-4 text-purple-300 animate-spin" /> : <Dices className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />}
                </div>
                <span className="font-medium text-zinc-300 group-hover:text-white transition-colors">Surprise Me!</span>
              </button>
            </div>

            {/* Primary Navigation */}
            <nav className="flex flex-col gap-1 mb-4">
              {PRIMARY_LINKS.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={`mob-${link.name}`}
                    href={link.href}
                    onClick={() => setIsExpanded(false)}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap",
                      isActive 
                        ? "bg-white/[0.09] text-white ring-1 ring-white/[0.1]" 
                        : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                    )}
                  >
                    <div className="w-7 h-7 flex items-center justify-center shrink-0">
                      <Icon className={clsx("w-4 h-4 transition-colors", isActive ? link.color : "text-zinc-400 group-hover:text-white")} />
                    </div>
                    <span className="font-medium">{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Rewards */}
            <div className="mb-3 flex flex-col gap-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-3 py-1">Rewards</span>
              <Link
                href="/referral"
                onClick={(e) => {
                  if (!session?.user) {
                    e.preventDefault();
                    router.push("/login");
                  }
                  setIsExpanded(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-zinc-400 hover:bg-white/[0.05] hover:text-white transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 flex items-center justify-center shrink-0">
                    <Handshake className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-zinc-300 text-xs font-medium group-hover:text-white transition-colors truncate">Refer & Earn</span>
                </div>
                <span className="text-emerald-400/90 text-[10px] uppercase tracking-wider font-semibold">+{XP_CONFIG.REFERRAL_REWARD} XP</span>
              </Link>
              <Link
                href="/rewards"
                onClick={(e) => {
                  if (!session?.user) {
                    e.preventDefault();
                    router.push("/login");
                  }
                  setIsExpanded(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-zinc-400 hover:bg-white/[0.05] hover:text-white transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 flex items-center justify-center shrink-0">
                    <Flame className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-zinc-300 text-xs font-medium group-hover:text-white transition-colors truncate">Daily Streak</span>
                </div>
                <span className="text-amber-400/90 text-[10px] uppercase tracking-wider font-semibold">
                  {session?.user ? `${(session.user as any).currentStreak || 0} DAYS` : "0 DAYS"}
                </span>
              </Link>
            </div>

            {/* Categories */}
            <div className="mb-2">
              <div className="h-px bg-white/[0.06] w-full mb-2" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-1">Categories</span>
            </div>

            <nav className="flex flex-col gap-0.5">
              {categories.map((link, idx) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={`mob-cat-${link.href}-${idx}`}
                    href={link.href}
                    onClick={() => setIsExpanded(false)}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap",
                      isActive ? "bg-white/[0.09] text-white ring-1 ring-white/[0.1]" : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                    )}
                  >
                    <div className="w-7 h-7 flex items-center justify-center shrink-0">
                      <Icon className={clsx("w-4 h-4 transition-colors", isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300")} />
                    </div>
                    <span className="font-medium">{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Mobile Footer */}
          <div className="border-t border-white/[0.06] pt-3 mt-4 flex items-center justify-between text-[10px] text-zinc-500">
            <span>© {new Date().getFullYear()} {process.env.NEXT_PUBLIC_SITE_NAME || "Bluebuff"}</span>
          </div>
        </div>
      </div>

      {/* ── Desktop Sticky Sidebar ──────────────────────────────── */}
      <aside 
        className={clsx(
          "hidden md:flex flex-col bg-black/95 backdrop-blur-xl border-r border-white/[0.08] sticky top-14 sm:top-16 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] transition-[width] duration-300 ease-in-out z-30 shrink-0 select-none relative",
          isExpanded ? "w-64" : "w-[68px]"
        )}
      >
        {/* Manual Toggle Button on Desktop */}
        <button 
          type="button"
          onClick={() => setIsExpanded(prev => !prev)}
          className="absolute -right-3 top-5 w-6 h-6 rounded-full bg-[#18181b] hover:bg-[#27272a] border border-white/20 text-zinc-300 hover:text-white flex items-center justify-center shadow-lg z-40 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          title={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {/* Scrollable Navigation Area */}
        <div className={clsx(
          "flex-1 overflow-y-auto overflow-x-hidden py-3 flex flex-col justify-between",
          isExpanded ? "custom-scrollbar" : "no-scrollbar"
        )}>
          <div>
            {/* Surprise Me Button */}
            <div className={clsx("mb-2", isExpanded ? "px-3" : "px-2 flex justify-center")}>
              <button
                type="button"
                onClick={handleSurpriseMe}
                disabled={isRolling}
                className={clsx(
                  "flex items-center rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer active:scale-95 group",
                  isExpanded 
                    ? "w-full gap-3 px-3 py-2 text-zinc-400 hover:bg-white/[0.05] hover:text-white" 
                    : "w-10 h-10 justify-center p-0 text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                )}
                title={!isExpanded ? "Surprise Me (Random Game)" : undefined}
              >
                <div className="w-7 h-7 flex items-center justify-center shrink-0">
                  {isRolling ? <Loader2 className="w-4 h-4 text-purple-300 animate-spin" /> : <Dices className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />}
                </div>
                {isExpanded && (
                  <span className="font-medium text-zinc-300 group-hover:text-white transition-colors truncate">Surprise Me!</span>
                )}
              </button>
            </div>

            {/* Primary Navigation Links */}
            <nav className={clsx("flex flex-col gap-1 mb-4", isExpanded ? "px-3" : "px-2 items-center")}>
              {PRIMARY_LINKS.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={clsx(
                      "flex items-center rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap group",
                      isActive 
                        ? (isExpanded ? "bg-white/[0.09] text-white shadow-xs ring-1 ring-white/[0.1]" : "text-white")
                        : "text-zinc-400 hover:bg-white/[0.04] hover:text-white",
                      isExpanded ? "w-full gap-3 px-3 py-2" : "w-10 h-10 justify-center p-0 hover:bg-white/[0.04]"
                    )}
                    title={!isExpanded ? link.name : undefined}
                  >
                    <div className="w-7 h-7 flex items-center justify-center shrink-0 transition-all">
                      <Icon className={clsx("w-4 h-4 transition-colors", isActive ? link.color : "text-zinc-400 group-hover:text-white")} />
                    </div>
                    {isExpanded && (
                      <span className="font-medium truncate">{link.name}</span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Rewards & Referral Buttons */}
            <div className={clsx("mb-3 flex flex-col gap-0.5", isExpanded ? "px-3" : "px-2 items-center")}>
              {isExpanded && (
                <div className="flex items-center gap-2 mb-0.5 px-3 py-1 text-zinc-500">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Rewards</span>
                </div>
              )}
              {/* Refer & Earn */}
              <Link
                href="/referral"
                onClick={(e) => {
                  if (!session?.user) {
                    e.preventDefault();
                    router.push("/login");
                  }
                }}
                className={clsx(
                  "flex items-center transition-all rounded-xl group overflow-hidden",
                  isExpanded 
                    ? "w-full justify-between px-3 py-2 text-zinc-400 hover:bg-white/[0.05] hover:text-white" 
                    : "w-10 h-10 justify-center p-0 text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                )}
                title={!isExpanded ? `Refer & Earn (+${XP_CONFIG.REFERRAL_REWARD} XP)` : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 flex items-center justify-center shrink-0">
                    <Handshake className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                  </div>
                  {isExpanded && (
                    <div className="flex flex-col items-start whitespace-nowrap min-w-0">
                      <span className="text-zinc-300 text-xs font-medium group-hover:text-white transition-colors truncate">Refer & Earn</span>
                      <span className="text-emerald-400/90 text-[9.5px] uppercase tracking-wider font-semibold">+{XP_CONFIG.REFERRAL_REWARD} XP</span>
                    </div>
                  )}
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
                }}
                className={clsx(
                  "flex items-center transition-all rounded-xl group overflow-hidden",
                  isExpanded 
                    ? "w-full justify-between px-3 py-2 text-zinc-400 hover:bg-white/[0.05] hover:text-white" 
                    : "w-10 h-10 justify-center p-0 text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                )}
                title={!isExpanded ? "Daily Streak & XP" : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 flex items-center justify-center shrink-0">
                    <Flame className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                  </div>
                  {isExpanded && (
                    <div className="flex flex-col items-start whitespace-nowrap min-w-0">
                      <span className="text-zinc-300 text-xs font-medium group-hover:text-white transition-colors truncate">Daily Streak</span>
                      <span className="text-zinc-400 text-[9.5px] uppercase tracking-wider font-semibold">
                        {session?.user ? `${(session.user as any).currentStreak || 0} DAYS` : "0 DAYS"}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            </div>

            {/* Divider */}
            <div className={clsx("mb-2", isExpanded ? "px-3" : "px-2")}>
              <div className="h-px bg-white/[0.06] w-full mb-2" />
              {isExpanded && (
                <div className="flex items-center gap-2 px-1 text-zinc-500">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Categories</span>
                </div>
              )}
            </div>

            {/* Category Navigation */}
            <nav className={clsx("flex flex-col gap-0.5", isExpanded ? "px-3" : "px-2 items-center")}>
              {categories.length === 0 ? (
                <div className="flex flex-col gap-1 w-full items-center">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={`sidebar-skel-${i}`} className={clsx("flex items-center py-1.5", isExpanded ? "w-full gap-3 px-3" : "w-10 h-10 justify-center")}>
                      <Skeleton className="w-7 h-7 rounded-[7px] shrink-0" />
                      {isExpanded && <Skeleton className="h-3.5 w-24 rounded-sm" />}
                    </div>
                  ))}
                </div>
              ) : categories.map((link, idx) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={`${link.href}-${idx}`}
                    href={link.href}
                    className={clsx(
                      "flex items-center rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap group",
                      isActive 
                        ? (isExpanded ? "bg-white/[0.09] text-white ring-1 ring-white/[0.1]" : "text-white") 
                        : "text-zinc-400 hover:bg-white/[0.04] hover:text-white",
                      isExpanded ? "w-full gap-3 px-3 py-1.5" : "w-10 h-10 justify-center p-0 hover:bg-white/[0.04]"
                    )}
                    title={!isExpanded ? link.name : undefined}
                  >
                    <div className="w-7 h-7 flex items-center justify-center shrink-0 transition-all">
                      <Icon className={clsx("w-4 h-4 transition-colors", isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300")} />
                    </div>
                    {isExpanded && (
                      <span className="font-medium truncate">{link.name}</span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer Area (only when expanded) */}
          {isExpanded && (
            <div className="border-t border-white/[0.06] px-3 py-2 mt-4 flex items-center justify-between gap-2">
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
          )}
        </div>
      </aside>
    </>
  );
}
