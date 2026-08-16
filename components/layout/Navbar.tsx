"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Gamepad2, User as UserIcon, LogOut, X, UploadCloud, Dices, Loader2, ChevronDown, ChevronRight, Coins, Flame, HeartHandshake, ExternalLink, ShoppingBag, Trophy, Globe } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import clsx from "clsx";
import PWAInstallButton from "./PWAInstallButton";
import GoogleTranslate from "./GoogleTranslate";
import SearchBar from "./SearchBar";


export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    if (session?.user?.email) {
      // Silently check and update daily streak
      const hasCheckedStreak = sessionStorage.getItem("hasCheckedStreak");
      if (!hasCheckedStreak) {
        fetch("/api/user/streak", { method: "POST" })
          .then(() => sessionStorage.setItem("hasCheckedStreak", "true"))
          .catch(console.error);
      }
    }
  }, [session]);

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

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 h-16 bg-surface/80 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center text-primary hover:text-primary-light transition-transform hover:scale-105" title={`${process.env.NEXT_PUBLIC_SITE_NAME || "Bluebuff Games"} Home`}>
          <div className="relative w-10 h-10 drop-shadow-[0_0_8px_rgba(108,64,255,0.6)]">
            <Image src="/logo.png" alt="Logo" fill sizes="40px" priority className="object-contain" />
          </div>
        </Link>
        
        <div className="flex-1 max-w-xl mx-4 hidden sm:block">
          <SearchBar />
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            className="sm:hidden text-zinc-200 hover:text-white p-2 rounded-lg bg-zinc-800/60 hover:bg-zinc-700/70 border border-zinc-700/50 hover:border-zinc-500/70 transition-all shadow-sm"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleSurpriseMe}
            disabled={isRolling}
            className="group relative flex items-center justify-center p-2 rounded-full bg-gradient-to-tr from-indigo-600/30 to-purple-500/30 hover:from-indigo-600/50 hover:to-purple-500/50 border border-indigo-400/50 hover:border-indigo-300/70 transition-all shadow-[0_0_18px_rgba(99,102,241,0.25)] hover:shadow-[0_0_26px_rgba(99,102,241,0.45)] disabled:opacity-50"
            title="Surprise Me!"
          >
            {isRolling ? (
              <Loader2 className="w-5 h-5 text-indigo-200 animate-spin" />
            ) : (
              <Dices className="w-5 h-5 text-indigo-200 group-hover:text-white transition-colors transform group-hover:rotate-12" />
            )}
            
            {/* Tooltip for desktop */}
            <span className="absolute -bottom-10 right-0 w-max opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity bg-zinc-800 text-xs text-white px-2 py-1 rounded shadow-lg hidden sm:block">
              Random Game
            </span>
          </button>

          <GoogleTranslate />

          {session ? (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="flex items-center gap-1.5 bg-zinc-800/60 hover:bg-zinc-700/80 border border-zinc-600/70 hover:border-zinc-400/80 pl-2.5 pr-1 py-1 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-[0_0_10px_rgba(0,0,0,0.4)]"
                aria-label="User Profile"
              >
                <ChevronDown className="w-4 h-4 text-zinc-200" />
                {session.user?.image ? (
                  <div className="relative w-8 h-8 rounded-full border-2 border-indigo-500/60 overflow-hidden shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.35)]">
                    <Image src={session.user.image} alt="User" fill sizes="32px" className="object-cover" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center border-2 border-zinc-500 shrink-0">
                    <UserIcon className="w-4 h-4 text-zinc-200" />
                  </div>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2 rounded-full transition-colors flex items-center justify-center gap-2"
              aria-label="Sign In"
            >
              <UserIcon className="w-5 h-5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="fixed top-16 left-0 right-0 z-30 bg-zinc-900 border-b border-zinc-800 p-4 sm:hidden shadow-lg animate-in slide-in-from-top-2">
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
        "fixed top-0 right-0 h-full w-72 bg-[#0c0c0e] border-l border-[#1f1f22] z-50 transform transition-transform duration-300 ease-out flex flex-col shadow-2xl",
        isSidebarOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="p-4 bg-gradient-to-r from-indigo-950/40 via-[#121217] to-[#0c0c0e] border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {session?.user?.image ? (
              <div className="relative w-10 h-10 rounded-full border border-indigo-500/40 shadow-md shadow-indigo-500/20 overflow-hidden shrink-0">
                <Image src={session.user.image} alt="User" fill sizes="40px" className="object-cover" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.25)]">
                <UserIcon className="w-5 h-5" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white tracking-wide truncate max-w-[140px]">{session?.user?.name || "Guest Player"}</span>
              <span className="text-[10px] text-zinc-400 font-medium">
                {session ? (session.user?.email === (process.env.ADMIN_EMAIL || "tusharkantanayak713@gmail.com") ? "Administrator" : "Member") : "Play & Earn Rewards"}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="text-zinc-400 hover:text-white p-1.5 hover:bg-zinc-800/60 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {session && (
            <Link 
              href="/profile" 
              onClick={() => setIsSidebarOpen(false)} 
              className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 text-zinc-200 hover:text-white transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 group-hover:text-indigo-400 transition-colors">
                  <UserIcon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold">My Profile</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
            </Link>
          )}

          {/* Gamification Stats */}
          <div className="grid grid-cols-2 gap-2.5">
            <Link 
              href="/rewards" 
              onClick={(e) => {
                if (!session) {
                  e.preventDefault();
                  router.push("/login");
                }
                setIsSidebarOpen(false);
              }}
              className="bg-gradient-to-b from-[#141418] to-[#0f0f12] border border-zinc-800/80 hover:border-amber-500/40 rounded-xl p-3 transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">XP Balance</span>
                <Coins className="w-4 h-4 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300">0 XP</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-amber-400 transition-colors" />
              </div>
            </Link>

            <Link 
              href="/rewards" 
              onClick={(e) => {
                if (!session) {
                  e.preventDefault();
                  router.push("/login");
                }
                setIsSidebarOpen(false);
              }}
              className="bg-gradient-to-b from-[#141418] to-[#0f0f12] border border-zinc-800/80 hover:border-orange-500/40 rounded-xl p-3 transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Streak</span>
                <Flame className="w-4 h-4 text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-400">0 Days</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-orange-400 transition-colors" />
              </div>
            </Link>
          </div>

          {/* Menu Actions Group */}
          <div className="flex flex-col gap-2 bg-[#0e0e11] border border-zinc-800/70 rounded-xl p-1.5">
            <Link
              href="/referral"
              onClick={(e) => {
                if (!session) {
                  e.preventDefault();
                  router.push("/login");
                }
                setIsSidebarOpen(false);
              }}
              className="flex items-center justify-between p-2.5 hover:bg-zinc-800/50 rounded-lg transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">Refer & Earn</span>
                  <span className="text-[10px] text-zinc-500">Get +50 XP per invite</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                +50 XP
              </span>
            </Link>

            <div className="px-1">
              <PWAInstallButton variant="menuItem" onInstall={() => setIsSidebarOpen(false)} />
            </div>
          </div>
        </div>

        {/* Drawer Footer - Minimalist Brand Mention & Sign-In CTA */}
        <div className="p-4 border-t border-zinc-800/80 bg-[#0b0b0d] flex flex-col gap-3">
          {/* Unique Pill Badge for bluebuff.in Product */}
          <a 
            href="https://bluebuff.in" 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-800 hover:border-indigo-500/40 text-zinc-400 hover:text-indigo-300 transition-all group"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-xs font-bold text-zinc-200 group-hover:text-white">bluebuff.in</span>
              <span className="text-zinc-600 text-[10px]">&bull;</span>
              <span className="text-[10px] text-zinc-400 font-medium">Official Product</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
          </a>

          {!session ? (
            <div className="flex flex-col gap-2 pt-1">
              <p className="text-zinc-500 text-[11px] text-center leading-tight">
                Sign in to sync XP, unlock rewards & save favorites!
              </p>
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  router.push("/login");
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs transition-all rounded-xl shadow-lg shadow-indigo-600/25 active:scale-[0.98]"
              >
                <UserIcon className="w-4 h-4" />
                <span>Sign In with Google</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-1">
              {session?.user?.email === (process.env.ADMIN_EMAIL || "tusharkantanayak713@gmail.com") && (
                <Link 
                  href="/admin" 
                  onClick={() => setIsSidebarOpen(false)} 
                  className="flex items-center justify-center gap-2 w-full py-2 bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/50 transition-colors rounded-lg text-xs font-bold border border-indigo-800/40"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Admin Dashboard</span>
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="flex items-center justify-center gap-2 w-full py-2 bg-red-950/30 text-red-400 hover:bg-red-900/40 transition-colors rounded-lg text-xs font-bold border border-red-900/30"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
