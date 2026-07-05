"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Gamepad2, User as UserIcon, LogOut, X, UploadCloud, Dices, Loader2, ChevronDown, ChevronRight } from "lucide-react";
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
            <Image src="/logo.png" alt="Logo" fill priority className="object-contain" />
          </div>
        </Link>
        
        <div className="flex-1 max-w-xl mx-4 hidden sm:block">
          <SearchBar />
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            className="sm:hidden text-zinc-400 hover:text-white p-2 transition-colors"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleSurpriseMe}
            disabled={isRolling}
            className="group relative flex items-center justify-center p-2 rounded-full bg-gradient-to-tr from-indigo-600/20 to-purple-500/20 hover:from-indigo-600/40 hover:to-purple-500/40 border border-indigo-500/30 hover:border-indigo-400/50 transition-all shadow-[0_0_15px_rgba(99,102,241,0.15)] hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] disabled:opacity-50"
            title="Surprise Me!"
          >
            {isRolling ? (
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
            ) : (
              <Dices className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-colors transform group-hover:rotate-12" />
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
                className="flex items-center gap-1.5 bg-zinc-800/40 hover:bg-zinc-700/60 border border-zinc-700/50 hover:border-zinc-500 pl-2.5 pr-1 py-1 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <ChevronDown className="w-4 h-4 text-zinc-400" />
                {session.user?.image ? (
                  <div className="relative w-8 h-8 rounded-full border border-zinc-700 overflow-hidden shrink-0">
                    <Image src={session.user.image} alt="User" fill sizes="32px" className="object-cover" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-border-strong shrink-0">
                    <UserIcon className="w-4 h-4 text-text-muted" />
                  </div>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2 rounded-full transition-colors flex items-center justify-center gap-2"
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
        "fixed top-0 right-0 h-full w-72 bg-zinc-900 border-l border-zinc-800 z-50 transform transition-transform duration-300 ease-out flex flex-col shadow-2xl",
        isSidebarOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-surface-hover/30">
          <div className="flex items-center gap-3">
            {session?.user?.image ? (
              <div className="relative w-10 h-10 rounded-full border border-zinc-700 shadow-sm overflow-hidden">
                <Image src={session.user.image} alt="User" fill sizes="40px" className="object-cover" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 shadow-sm">
                <UserIcon className="w-5 h-5 text-text-muted" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white truncate max-w-[140px]">{session?.user?.name || "Guest"}</span>
              {session?.user?.email === (process.env.ADMIN_EMAIL || "tusharkantanayak713@gmail.com") && (
                <span className="text-xs font-semibold text-indigo-400 tracking-wide uppercase mt-0.5">Admin</span>
              )}
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="text-zinc-400 hover:text-white p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          {session && (
            <div className="px-3 mb-2">
              <Link 
                href="/profile" 
                onClick={() => setIsSidebarOpen(false)} 
                className="flex items-center gap-3 px-4 py-3 text-zinc-300 hover:bg-primary/10 hover:text-primary-light transition-colors rounded-lg font-medium group"
              >
                <UserIcon className="w-5 h-5 text-zinc-500 group-hover:text-primary-light" />
                My Profile
              </Link>
            </div>
          )}

          {/* Gamification Stats */}
          <div className="px-3 mb-2">
            <Link 
              href="/rewards" 
              onClick={(e) => {
                if (!session) {
                  e.preventDefault();
                  router.push("/login");
                }
                setIsSidebarOpen(false);
              }}
            >
              <div className="flex gap-2">
                <div className="flex-1 bg-black/40 border border-zinc-800 rounded-lg p-3 hover:border-amber-500/50 transition-colors group relative overflow-hidden">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">XP Balance</p>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-500 text-sm">🪙</span>
                    <ChevronRight className="w-4 h-4 text-amber-500/50 group-hover:text-amber-400 transition-colors" />
                  </div>
                </div>
                <div className="flex-1 bg-black/40 border border-zinc-800 rounded-lg p-3 hover:border-orange-500/50 transition-colors group relative overflow-hidden">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Daily Streak</p>
                  <div className="flex items-center justify-between">
                    <span className="text-orange-500 text-sm">🔥</span>
                    <ChevronRight className="w-4 h-4 text-orange-500/50 group-hover:text-orange-400 transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Refer and Earn Button */}
          <div className="px-3 mb-2">
            <Link
              href="/referral"
              onClick={(e) => {
                if (!session) {
                  e.preventDefault();
                  router.push("/login");
                }
                setIsSidebarOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 border border-indigo-500/20 hover:border-indigo-500/40 transition-all rounded-lg font-medium group"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">🤝</span>
                <div className="flex flex-col items-start">
                  <span className="text-indigo-300 font-semibold text-sm group-hover:text-indigo-200 transition-colors">Refer & Earn +50 XP</span>
                  <span className="text-zinc-500 text-xs">View dashboard & link</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-indigo-500/50 group-hover:text-indigo-400 transition-colors" />
            </Link>
          </div>
          
          <div className="px-3 mt-1">
            <PWAInstallButton variant="menuItem" onInstall={() => setIsSidebarOpen(false)} />
          </div>

          {!session && (
            <div className="px-5 py-4 mt-2 text-center border-t border-zinc-800/50">
              <p className="text-zinc-400 text-sm">Sign in to save your favorite games and track your recent plays!</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-zinc-800 bg-surface">
          {session ? (
            <div className="flex flex-col gap-2">
              {session?.user?.email === (process.env.ADMIN_EMAIL || "tusharkantanayak713@gmail.com") && (
                <Link 
                  href="/admin" 
                  onClick={() => setIsSidebarOpen(false)} 
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white transition-colors rounded-lg font-medium border border-indigo-500/20"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-colors rounded-lg font-medium border border-red-500/20"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsSidebarOpen(false);
                router.push("/login");
              }}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white transition-colors rounded-lg font-medium"
            >
              <UserIcon className="w-4 h-4" />
              <span>Sign In with Google</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
