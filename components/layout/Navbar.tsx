"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Gamepad2, User as UserIcon, LogOut, X, UploadCloud, Dices, Loader2, ChevronDown, ChevronRight, Coins, Flame, HeartHandshake } from "lucide-react";
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
        <div className="p-4 border-b border-[#1f1f22] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {session?.user?.image ? (
              <div className="relative w-10 h-10 rounded-full border border-zinc-700/50 shadow-sm overflow-hidden shrink-0">
                <Image src={session.user.image} alt="User" fill sizes="40px" className="object-cover" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 shadow-sm shrink-0">
                <UserIcon className="w-5 h-5 text-text-muted" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-bold text-zinc-100 tracking-wide truncate max-w-[140px]">{session?.user?.name || "Guest"}</span>
              {session?.user?.email === (process.env.ADMIN_EMAIL || "tusharkantanayak713@gmail.com") && (
                <span className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase mt-0.5">Admin</span>
              )}
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="text-zinc-500 hover:text-zinc-300 p-1.5 hover:bg-[#1f1f22] rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-3">
          {session && (
            <div>
              <Link 
                href="/profile" 
                onClick={() => setIsSidebarOpen(false)} 
                className="flex items-center gap-3 text-zinc-200 hover:text-white transition-colors font-medium group"
              >
                <div className="w-7 h-7 rounded flex items-center justify-center border border-zinc-800 bg-[#121214] group-hover:border-zinc-600 transition-colors">
                  <UserIcon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-300" />
                </div>
                <span className="text-[14px]">My Profile</span>
              </Link>
            </div>
          )}

          {/* Gamification Stats */}
          <div>
            <Link 
              href="/rewards" 
              onClick={(e) => {
                if (!session) {
                  e.preventDefault();
                  router.push("/login");
                }
                setIsSidebarOpen(false);
              }}
              className="flex gap-2"
            >
              <div className="flex-1 bg-[#121214] border border-[#1f1f22] rounded-lg p-2.5 hover:border-[#333339] transition-colors group relative">
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">XP Balance</p>
                <div className="flex items-center justify-between">
                  <Coins className="w-4 h-4 text-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
                  <ChevronRight className="w-3 h-3 text-amber-600/70 group-hover:text-amber-500 transition-colors" />
                </div>
              </div>
              <div className="flex-1 bg-[#121214] border border-[#1f1f22] rounded-lg p-2.5 hover:border-[#333339] transition-colors group relative">
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Daily Streak</p>
                <div className="flex items-center justify-between">
                  <Flame className="w-4 h-4 text-orange-500 drop-shadow-[0_0_6px_rgba(249,115,22,0.4)]" />
                  <ChevronRight className="w-3 h-3 text-orange-600/70 group-hover:text-orange-500 transition-colors" />
                </div>
              </div>
            </Link>
          </div>

          {/* Refer and Earn Button */}
          <div>
            <Link
              href="/referral"
              onClick={(e) => {
                if (!session) {
                  e.preventDefault();
                  router.push("/login");
                }
                setIsSidebarOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-[#1a1727] border border-[#2b2540] hover:bg-[#201d32] hover:border-[#3d345c] transition-all rounded-lg group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <HeartHandshake className="w-4 h-4 text-indigo-300 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-indigo-200 font-bold text-[14px] tracking-wide mb-0.5 group-hover:text-indigo-100 transition-colors">Refer & Earn +50 XP</span>
                  <span className="text-[#847da3] text-[10px] font-medium leading-tight">View dashboard & link</span>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#5c4e91] group-hover:text-[#796bb0] transition-colors" />
            </Link>
          </div>
          
          <div>
            <PWAInstallButton variant="menuItem" onInstall={() => setIsSidebarOpen(false)} />
          </div>

          {!session && (
            <div className="py-4 mt-2 text-center border-t border-[#1f1f22]">
              <p className="text-zinc-500 text-xs">Sign in to save your favorite games and track your recent plays!</p>
            </div>
          )}
        </div>

        <div className="p-3 flex flex-col gap-2 mt-auto border-t border-[#1f1f22]">
          {session ? (
            <>
              {session?.user?.email === (process.env.ADMIN_EMAIL || "tusharkantanayak713@gmail.com") && (
                <Link 
                  href="/admin" 
                  onClick={() => setIsSidebarOpen(false)} 
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#0f0e15] text-[#7572d4] hover:text-[#8885f0] hover:bg-[#13121b] transition-colors rounded-lg font-medium border border-[#242145] hover:border-[#302b5e]"
                >
                  <UploadCloud className="w-[16px] h-[16px]" />
                  <span className="text-[13px]">Admin Dashboard</span>
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#150e0e] text-[#d45656] hover:text-[#f06262] hover:bg-[#1a1111] transition-colors rounded-lg font-medium border border-[#3d1c1c] hover:border-[#522525]"
              >
                <LogOut className="w-[16px] h-[16px]" />
                <span className="text-[13px]">Sign Out</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setIsSidebarOpen(false);
                router.push("/login");
              }}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white transition-colors rounded-lg font-medium shadow-md shadow-indigo-500/20"
            >
              <UserIcon className="w-[16px] h-[16px]" />
              <span className="text-[13px]">Sign In with Google</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
