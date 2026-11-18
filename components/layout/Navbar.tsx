"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Gamepad2, User as UserIcon, LogOut, X, UploadCloud, Dices, Loader2, ChevronRight, Coins, Flame, HeartHandshake, ShoppingBag, Trophy, ArrowLeft, Share2, Check, Settings, Sparkles, Handshake, Rocket, Menu } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import clsx from "clsx";
import dynamic from "next/dynamic";
import PWAInstallButton from "./PWAInstallButton";
import SearchBar from "./SearchBar";
import NotificationBell from "../notifications/NotificationBell";
import { XP_CONFIG } from "@/lib/xp-config";
import { useUIStore } from "@/lib/stores/uiStore";
import { useGamificationStore } from "@/lib/stores/gamificationStore";

const ShareModal = dynamic(() => import("../game/ShareModal"), { ssr: false });


function MovingOuterRing({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        "absolute -inset-[2.5px] rounded-full border border-dashed border-white/40 animate-[spin_10s_linear_infinite] pointer-events-none select-none",
        className
      )}
    />
  );
}

function XpCoinIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="xpCoinGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FFF275" />
          <stop offset="35%" stopColor="#FFC72C" />
          <stop offset="75%" stopColor="#E08E00" />
          <stop offset="100%" stopColor="#9E5D00" />
        </radialGradient>
        <linearGradient id="xpRimGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFEAA7" />
          <stop offset="100%" stopColor="#8A4E00" />
        </linearGradient>
        <filter id="xpGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#FFB703" floodOpacity="0.45" />
        </filter>
      </defs>
      <g filter="url(#xpGlow)">
        <circle cx="16" cy="16" r="13.5" fill="url(#xpCoinGrad)" stroke="url(#xpRimGrad)" strokeWidth="1.2" />
        <circle cx="16" cy="16" r="10.5" fill="none" stroke="#FFE79A" strokeWidth="0.8" strokeDasharray="1.5 1" opacity="0.65" />
        <text
          x="16"
          y="20.2"
          textAnchor="middle"
          fontSize="11"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#5C3500"
          opacity="0.9"
        >
          XP
        </text>
        <text
          x="16"
          y="19.2"
          textAnchor="middle"
          fontSize="11"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#FFFDF0"
        >
          XP
        </text>
        <ellipse cx="12" cy="8.5" rx="4.5" ry="2" fill="#FFFFFF" opacity="0.5" transform="rotate(-25 12 8.5)" />
      </g>
    </svg>
  );
}

function StreakFlameIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="flameOuterGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#E63946" />
          <stop offset="45%" stopColor="#F77F00" />
          <stop offset="90%" stopColor="#FCBF49" />
          <stop offset="100%" stopColor="#FFE49E" />
        </linearGradient>
        <linearGradient id="flameInnerGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#F77F00" />
          <stop offset="50%" stopColor="#FFD166" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>
        <filter id="flameGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" floodColor="#F77F00" floodOpacity="0.5" />
        </filter>
      </defs>
      <g filter="url(#flameGlow)">
        <path
          d="M16 3C16 3 19.5 7.5 19.5 11C19.5 12.2 19 13.2 18.2 14C19.8 13.5 22.5 14.5 23.5 17C24.8 20.3 23.5 24 20.8 26.5C18 29.1 13.8 29.5 10.8 27.5C7.5 25.3 6.2 21 7.8 17.2C8.8 14.8 11.2 13 12.2 10.5C13.5 7.2 13.2 4.8 16 3Z"
          fill="url(#flameOuterGrad)"
        />
        <path
          d="M16 14C17.2 16 18.2 17.5 18.2 20C18.2 22.2 16.8 24.2 15 24.8C13.2 24.2 12.2 22.5 12.2 20.5C12.2 18.2 13.8 16 16 14Z"
          fill="url(#flameInnerGrad)"
        />
      </g>
    </svg>
  );
}

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const isShareModalOpen = useUIStore((state) => state.isShareModalOpen);
  const shareData = useUIStore((state) => state.shareData);
  const openShareModal = useUIStore((state) => state.openShareModal);
  const closeShareModal = useUIStore((state) => state.closeShareModal);
  const toggleNavSidebar = useUIStore((state) => state.toggleNavSidebar);

  // Global Gamification Store
  const xp = useGamificationStore((state) => state.xp);
  const streak = useGamificationStore((state) => state.streak);
  const isStatsInitialized = useGamificationStore((state) => state.isInitialized);
  const initFromSession = useGamificationStore((state) => state.initFromSession);
  const fetchProfileStats = useGamificationStore((state) => state.fetchProfileStats);
  const checkDailyStreak = useGamificationStore((state) => state.checkDailyStreak);

  const isGameSlugPage = Boolean(pathname?.startsWith("/games/") && pathname !== "/games");
  const gameSlug = isGameSlugPage ? pathname?.replace("/games/", "").split("/")[0].split("?")[0] : undefined;

  const handleOpenShareFromNavbar = () => {
    if (typeof document !== "undefined") {
      const h1 = document.querySelector("h1");
      const title = h1?.textContent?.trim() || document.title.split("–")[0].replace(/^Play\s+/i, "").trim();
      const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute("content") || "";
      const breadcrumbLinks = document.querySelectorAll('nav[aria-label="Breadcrumb"] a');
      const category = breadcrumbLinks.length > 1 ? (breadcrumbLinks[1].textContent?.trim() || "") : "";
      
      openShareModal({
        title,
        thumbnailUrl: ogImage,
        category,
        slug: gameSlug,
      });
    } else {
      openShareModal({ slug: gameSlug });
    }
  };

  // Keep store synced with session whenever session loads
  useEffect(() => {
    if (session?.user) {
      initFromSession(session.user);
    }
  }, [session, initFromSession]);

  // Fetch fresh profile stats when drawer opens
  useEffect(() => {
    if (isSidebarOpen && session?.user?.email) {
      fetchProfileStats();
    }
  }, [isSidebarOpen, session, fetchProfileStats]);

  // Silently check and update daily streak
  useEffect(() => {
    if (session?.user?.email) {
      checkDailyStreak();
    }
  }, [session, checkDailyStreak]);

  const handleSurpriseMe = async () => {
    if (isRolling) return;
    try {
      setIsRolling(true);
      const res = await fetch("/api/games/random");
      const data = await res.json();
      if (data.slug) {
        router.push(`/games/${data.slug}`);
      }
    } catch (error) {
      console.error("Failed to fetch random game");
    } finally {
      setIsRolling(false);
    }
  };

  const displayXp = session ? (isStatsInitialized ? xp : ((session.user as any)?.xp ?? 0)) : 0;
  const displayStreak = session ? (isStatsInitialized ? streak : ((session.user as any)?.currentStreak ?? 0)) : 0;

  if (isGameSlugPage) {
    return (
      <>
        <nav className="fixed top-0 left-0 right-0 z-50 h-14 sm:h-16 w-full bg-black/95 backdrop-blur-xl border-b border-white/[0.08] flex items-center justify-between px-3 sm:px-4 lg:px-8 select-none">
          {/* Left: Back Button (Icon only) */}
          <button
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push("/");
              }
            }}
            className="w-[34px] h-[34px] sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.08] hover:border-white/[0.15] transition-all shrink-0 active:scale-95 cursor-pointer shadow-sm"
            aria-label="Go Back"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Center: Website Logo / Home Link */}
          <Link href="/" className="flex items-center text-primary shrink-0" title={`${process.env.NEXT_PUBLIC_SITE_NAME || "Bluebuff Games"} Home`}>
            {logoError ? (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center font-black text-white text-base shadow-sm border border-white/20 select-none">
                B
              </div>
            ) : (
              <div className="relative w-7 h-7 sm:w-8 sm:h-8">
                <Image 
                  src="/logo.png" 
                  alt="Logo" 
                  fill 
                  sizes="32px" preload loading="eager" className="object-contain" 
                  onError={() => setLogoError(true)}
                />
              </div>
            )}
          </Link>

          {/* Right: Share Button (Icon only) */}
          <div className="relative flex items-center">
            <button
              onClick={handleOpenShareFromNavbar}
              className="w-[34px] h-[34px] sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.08] hover:border-white/40 transition-all shrink-0 active:scale-95 cursor-pointer shadow-sm"
              aria-label="Share Game"
              title="Share"
            >
              <Share2 className="w-4 h-4 text-zinc-300 hover:text-white" />
            </button>
          </div>
        </nav>

        <ShareModal
          isOpen={isShareModalOpen}
          onClose={closeShareModal}
          slug={shareData?.slug || gameSlug}
          title={shareData?.title}
          thumbnailUrl={shareData?.thumbnailUrl}
          category={shareData?.category}
        />
      </>
    );
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 sm:h-16 w-full bg-black/95 backdrop-blur-xl border-b border-white/[0.08] flex items-center justify-between px-3 sm:px-4 lg:px-8 select-none">
        <div className="flex items-center gap-2">
          {/* Mobile Navigation Drawer Toggle */}
          <button
            type="button"
            onClick={toggleNavSidebar}
            className="md:hidden w-[34px] h-[34px] flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.1] active:bg-white/[0.15] text-zinc-300 hover:text-white border border-white/[0.08] transition-all cursor-pointer shadow-xs active:scale-90"
            aria-label="Toggle navigation menu"
            title="Menu"
          >
            <Menu className="w-4 h-4 stroke-[2.2]" />
          </button>

          <Link href="/" className="flex items-center text-primary shrink-0" title={`${process.env.NEXT_PUBLIC_SITE_NAME || "Bluebuff Games"} Home`}>
          {logoError ? (
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center font-black text-white text-lg sm:text-xl shadow-[0_0_15px_rgba(255,255,255,0.15)] border border-white/20 select-none tracking-tight">
              B
            </div>
          ) : (
            <div className="relative w-8 h-8 sm:w-9 sm:h-9">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                fill 
                sizes="36px" preload loading="eager" className="object-contain" 
                onError={() => setLogoError(true)}
              />
            </div>
          )}
        </Link>
      </div>
        
        <div className="flex-1 max-w-xl mx-4 hidden sm:block">
          <SearchBar />
        </div>
        
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile Search Button */}
          <button 
            className="sm:hidden w-[34px] h-[34px] flex items-center justify-center text-white rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_2px_8px_rgba(0,0,0,0.3)] transition-all duration-150 shrink-0 active:scale-90"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            title="Search"
          >
            <Search className="w-4 h-4 stroke-[2.2]" />
          </button>
          
          {/* Surprise Me / Dice Button */}
          <button
            onClick={handleSurpriseMe}
            disabled={isRolling}
            className="group relative flex items-center justify-center w-[34px] h-[34px] sm:w-[36px] sm:h-[36px] rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_2px_8px_rgba(0,0,0,0.3)] transition-all duration-150 disabled:opacity-50 shrink-0 active:scale-90 cursor-pointer"
            title="Surprise Me!"
          >
            <MovingOuterRing />
            {isRolling ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Dices className="w-4 h-4 text-white transition-transform duration-200 group-hover:rotate-12 stroke-[2.2]" />
            )}

            {/* Tooltip */}
            <span className="absolute -bottom-9 right-0 w-max opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity bg-[#1c1c1e]/95 backdrop-blur-xl border border-white/[0.12] text-[11px] font-medium text-white px-2.5 py-1 rounded-xl hidden sm:block z-50 shadow-2xl">
              Random Game 🎲
            </span>
          </button>

          {/* Notification Bell Button */}
          <NotificationBell />

          {/* Profile / Menu Button */}
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="relative w-[34px] h-[34px] sm:w-[36px] sm:h-[36px] rounded-full overflow-hidden border border-white/[0.15] hover:border-white/[0.35] bg-white/[0.06] backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_2px_8px_rgba(0,0,0,0.3)] active:scale-90 transition-all duration-150 flex items-center justify-center shrink-0 touch-manipulation cursor-pointer"
            aria-label="User Profile & Menu"
            title={session?.user?.name || "Account & Menu"}
          >
            {session?.user?.image ? (
              <Image src={session.user.image} alt="User" fill sizes="36px" className="object-cover" />
            ) : (
              <UserIcon className="w-4 h-4 text-white stroke-[2.2]" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="fixed top-16 left-0 right-0 z-30 bg-[#121215]/95 backdrop-blur-xl border-b border-white/[0.08] p-4 sm:hidden shadow-xl animate-in slide-in-from-top-2">
          <SearchBar isMobile={true} onClose={() => setIsMobileSearchOpen(false)} />
        </div>
      )}

      {/* Sidebar Slider */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 transition-opacity backdrop-blur-sm" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={clsx(
        "fixed top-0 right-0 h-full w-[340px] sm:w-[380px] max-w-[92vw] bg-black border-l border-white/[0.08] z-50 transform transition-transform duration-300 ease-out flex flex-col shadow-2xl",
        isSidebarOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* iOS Sheet Header */}
        <div className="p-3 sm:p-3.5 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-black">
          <div className="flex items-center gap-2.5 min-w-0">
            {session?.user?.image ? (
              <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-white/10 ring-1 ring-white/5">
                <Image src={session.user.image} alt="User" fill sizes="36px" className="object-cover" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#1c1c1e] border border-white/10 flex items-center justify-center shrink-0 text-[#8e8e93]">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] font-semibold text-white tracking-tight truncate leading-tight">
                {session?.user?.name || "Guest Player"}
              </span>
              {session && (
                <div className="mt-0.5">
                  {session.user?.email === (process.env.ADMIN_EMAIL || "tusharkantanayak713@gmail.com") ? (
                    <span className="inline-flex items-center text-[10.5px] font-medium text-white">
                      Administrator
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10.5px] text-[#8e8e93]">
                      Member
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {session && (
              <button
                onClick={() => signOut()}
                className="w-7 h-7 rounded-full bg-red-500/15 hover:bg-red-500/25 active:bg-red-500/35 border border-red-500/25 text-red-400 hover:text-red-300 flex items-center justify-center transition-all touch-manipulation cursor-pointer shadow-xs"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className="w-7 h-7 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c2e] text-[#8e8e93] hover:text-white flex items-center justify-center transition-colors touch-manipulation cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col justify-between gap-3 custom-scrollbar bg-[#000000]">
          <div className="flex flex-col gap-2.5">
            {/* Top Sign In with Google for Guest */}
            {!session && (
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  router.push("/login");
                }}
                className="w-full py-2.5 px-3.5 bg-[#007AFF] hover:bg-[#0071E3] active:bg-[#0062C4] text-white font-semibold text-[13px] rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm touch-manipulation cursor-pointer"
              >
                <UserIcon className="w-4 h-4" />
                <span>Sign In with Google</span>
              </button>
            )}

            {/* Dynamic Dual Stat Row: XP & Streak */}
            <div className="flex items-center px-1 py-0.5">
              <Link 
                href="/rewards" 
                onClick={(e) => {
                  if (!session) {
                    e.preventDefault();
                    router.push("/login");
                  }
                  setIsSidebarOpen(false);
                }}
                className="flex-1 flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.05] active:bg-white/[0.08] transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <XpCoinIcon className="w-6 h-6 shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider leading-none mb-0.5">XP Balance</span>
                    <span className="text-[13px] font-black text-white group-hover:text-amber-300 transition-colors tracking-tight leading-tight">{displayXp} XP</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>

              {/* Vertical Hairline Divider */}
              <div className="w-px h-6 bg-white/[0.08] shrink-0 mx-0.5" />

              <Link 
                href="/rewards" 
                onClick={(e) => {
                  if (!session) {
                    e.preventDefault();
                    router.push("/login");
                  }
                  setIsSidebarOpen(false);
                }}
                className="flex-1 flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.05] active:bg-white/[0.08] transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <StreakFlameIcon className="w-6 h-6 shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider leading-none mb-0.5">Streak</span>
                    <span className="text-[13px] font-black text-white group-hover:text-orange-300 transition-colors tracking-tight leading-tight">{displayStreak} Days</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            </div>

            {/* iOS Inset Grouped Navigation */}
            <div className="bg-gradient-to-b from-[#15151a] to-[#0f0f13] rounded-2xl border border-white/[0.08] divide-y divide-white/[0.04] overflow-hidden shadow-lg shadow-black/40">
              {session && (
                <Link 
                  href="/profile" 
                  onClick={() => setIsSidebarOpen(false)} 
                  className="flex items-center justify-between px-3.5 py-2.5 hover:bg-white/[0.05] active:bg-white/[0.08] transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/30 group-hover:scale-105 transition-transform">
                      <UserIcon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex flex-col text-left min-w-0">
                      <span className="text-[13px] font-semibold text-zinc-100 group-hover:text-white transition-colors tracking-tight truncate">My Profile</span>
                      <span className="text-[10px] text-zinc-400 group-hover:text-zinc-300 transition-colors truncate mt-0.5">Account &amp; gameplay stats</span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </Link>
              )}

              <Link
                href="/referral"
                onClick={(e) => {
                  if (!session) {
                    e.preventDefault();
                    router.push("/login");
                  }
                  setIsSidebarOpen(false);
                }}
                className="flex items-center justify-between px-3.5 py-2.5 hover:bg-white/[0.05] active:bg-white/[0.08] transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                    <HeartHandshake className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-[13px] font-semibold text-zinc-100 group-hover:text-white transition-colors tracking-tight truncate">Refer &amp; Earn</span>
                    <span className="text-[10px] text-zinc-400 group-hover:text-zinc-300 transition-colors truncate mt-0.5">Invite friends for bonus XP</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 shadow-xs">
                    +{XP_CONFIG.REFERRAL_REWARD} XP
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              </Link>

              {/* Setting Link to /profile/settings */}
              <Link
                href="/profile/settings"
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 hover:bg-white/[0.05] active:bg-white/[0.08] transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 border border-white/10 text-zinc-100 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <Settings className="w-3.5 h-3.5 text-zinc-200" />
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-[13px] font-semibold text-zinc-100 group-hover:text-white transition-colors tracking-tight truncate">Settings</span>
                    <span className="text-[10px] text-zinc-400 group-hover:text-zinc-300 transition-colors truncate mt-0.5">Notifications, audio &amp; app</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </Link>

              {/* Our Products Link to /products */}
              <Link
                href="/products"
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 hover:bg-white/[0.05] active:bg-white/[0.08] transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-purple-500/30 group-hover:scale-105 transition-transform">
                    <ShoppingBag className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-[13px] font-semibold text-zinc-100 group-hover:text-white transition-colors tracking-tight truncate">Our Products</span>
                    <span className="text-[10px] text-zinc-400 group-hover:text-zinc-300 transition-colors truncate mt-0.5">Products you may like</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </Link>

              {/* Sponsor Us or Partnership (Disabled) */}
              <div
                className="flex items-center justify-between px-3.5 py-2.5 opacity-50 cursor-not-allowed select-none"
                title="Coming Soon"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-zinc-400 flex items-center justify-center shrink-0 shadow-sm">
                    <Handshake className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-[13px] font-medium text-zinc-300 tracking-tight truncate">Sponsor Us or Partnership</span>
                    <span className="text-[10px] text-zinc-500 truncate mt-0.5">Brand &amp; partner collaborations</span>
                  </div>
                </div>
                <span className="text-[9.5px] font-medium text-zinc-400 bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded-full shrink-0 ml-2">
                  Soon
                </span>
              </div>

              {/* Publish Your Game to Us (Disabled) */}
              <div
                className="flex items-center justify-between px-3.5 py-2.5 opacity-50 cursor-not-allowed select-none"
                title="Coming Soon"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-zinc-400 flex items-center justify-center shrink-0 shadow-sm">
                    <Rocket className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-[13px] font-medium text-zinc-300 tracking-tight truncate">Publish Your Game to Us</span>
                    <span className="text-[10px] text-zinc-500 truncate mt-0.5">Submit games to our platform</span>
                  </div>
                </div>
                <span className="text-[9.5px] font-medium text-zinc-400 bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded-full shrink-0 ml-2">
                  Soon
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Area: Play Store App Card & Footer */}
          <div className="flex flex-col gap-1.5 pt-1">
            {/* Play Store moved to bottom */}
            <PWAInstallButton variant="bottomBanner" onInstall={() => setIsSidebarOpen(false)} />
          </div>
        </div>

        {/* Footer Action (Admin Only) */}
        {session?.user?.email === (process.env.ADMIN_EMAIL || "tusharkantanayak713@gmail.com") && (
          <div className="p-3 border-t border-white/[0.06] bg-black shrink-0">
            <Link 
              href="/admin" 
              onClick={() => setIsSidebarOpen(false)} 
              className="w-full py-2 px-3.5 bg-white/[0.06] hover:bg-white/[0.1] active:bg-white/[0.14] text-white font-semibold text-[12.5px] rounded-xl border border-white/[0.08] transition-colors flex items-center justify-center gap-2 touch-manipulation cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-white" />
              <span>Admin Dashboard</span>
            </Link>
          </div>
        )}
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={closeShareModal}
        slug={shareData?.slug || gameSlug}
        title={shareData?.title}
        thumbnailUrl={shareData?.thumbnailUrl}
        category={shareData?.category}
      />
    </>
  );
}

