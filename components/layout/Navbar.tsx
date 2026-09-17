"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Gamepad2, User as UserIcon, LogOut, X, UploadCloud, Dices, Loader2, ChevronRight, Coins, Flame, HeartHandshake, ShoppingBag, Trophy, ArrowLeft, Share2, Check, Settings, Sparkles, Handshake, Rocket } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import clsx from "clsx";
import PWAInstallButton from "./PWAInstallButton";
import SearchBar from "./SearchBar";
import NotificationBell from "../notifications/NotificationBell";


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

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [copied, setCopied] = useState(false);

  const isGameSlugPage = Boolean(pathname?.startsWith("/games/") && pathname !== "/games");

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

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = typeof document !== "undefined" ? document.title : "Play free game on Bluebuff";

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (err) {
        // Fallback to clipboard if user dismissed or unsupported
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isGameSlugPage) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 sm:h-16 w-full bg-[#0d0d10]/85 backdrop-blur-xl border-b border-white/[0.08] flex items-center justify-between px-3 sm:px-4 lg:px-8 select-none">
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
                sizes="32px" 
                priority 
                className="object-contain" 
                onError={() => setLogoError(true)}
              />
            </div>
          )}
        </Link>

        {/* Right: Share Button (Icon only) */}
        <div className="relative flex items-center">
          <button
            onClick={handleShare}
            className="w-[34px] h-[34px] sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.08] hover:border-white/40 transition-all shrink-0 active:scale-95 cursor-pointer shadow-sm"
            aria-label="Share Game"
            title="Share"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Share2 className="w-4 h-4 text-zinc-300 hover:text-white" />
            )}
          </button>

          {/* Copied confirmation tooltip */}
          {copied && (
            <span className="absolute -bottom-8 right-0 text-[10px] font-semibold bg-[#18181b] border border-white/[0.12] text-emerald-400 px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
              Link copied!
            </span>
          )}
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 sm:h-16 w-full bg-[#0d0d10]/85 backdrop-blur-xl border-b border-white/[0.08] flex items-center justify-between px-3 sm:px-4 lg:px-8 select-none">
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
                sizes="36px" 
                priority 
                className="object-contain" 
                onError={() => setLogoError(true)}
              />
            </div>
          )}
        </Link>
        
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
        "fixed top-0 right-0 h-full w-[310px] max-w-[86vw] bg-[#0d0d10] border-l border-white/[0.08] z-50 transform transition-transform duration-300 ease-out flex flex-col shadow-2xl",
        isSidebarOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* iOS Sheet Header */}
        <div className="p-3 sm:p-3.5 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-[#0d0d10]">
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
              <div className="mt-0.5">
                {session ? (
                  session.user?.email === (process.env.ADMIN_EMAIL || "tusharkantanayak713@gmail.com") ? (
                    <span className="inline-flex items-center text-[10.5px] font-medium text-white">
                      Administrator
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10.5px] text-[#8e8e93]">
                      Member
                    </span>
                  )
                ) : (
                  <span className="text-[10.5px] text-[#8e8e93]">Play &amp; Earn XP</span>
                )}
              </div>
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
            {/* Unique Dynamic Dual Capsule: XP & Streak */}
            <div className="bg-[#141416] border border-white/[0.07] rounded-xl p-1 flex items-center shadow-sm">
              <Link 
                href="/rewards" 
                onClick={(e) => {
                  if (!session) {
                    e.preventDefault();
                    router.push("/login");
                  }
                  setIsSidebarOpen(false);
                }}
                className="flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] active:bg-white/[0.08] transition-colors group"
              >
                <div className="w-6 h-6 rounded-full bg-white/[0.08] border border-white/[0.12] flex items-center justify-center shrink-0">
                  <Coins className="w-3 h-3 text-white" />
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider leading-none mb-0.5">XP Balance</span>
                  <span className="text-[12.5px] font-bold text-white tracking-tight leading-tight">0 XP</span>
                </div>
              </Link>

              {/* Vertical Hairline Divider */}
              <div className="w-px h-6 bg-white/[0.08] shrink-0" />

              <Link 
                href="/rewards" 
                onClick={(e) => {
                  if (!session) {
                    e.preventDefault();
                    router.push("/login");
                  }
                  setIsSidebarOpen(false);
                }}
                className="flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] active:bg-white/[0.08] transition-colors group"
              >
                <div className="w-6 h-6 rounded-full bg-white/[0.08] border border-white/[0.12] flex items-center justify-center shrink-0">
                  <Flame className="w-3 h-3 text-white" />
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider leading-none mb-0.5">Streak</span>
                  <span className="text-[12.5px] font-bold text-white tracking-tight leading-tight">0 Days</span>
                </div>
              </Link>
            </div>

            {/* iOS Inset Grouped Navigation */}
            <div className="bg-[#141416] rounded-xl border border-white/[0.07] divide-y divide-white/[0.05] overflow-hidden shadow-sm">
              {session && (
                <Link 
                  href="/profile" 
                  onClick={() => setIsSidebarOpen(false)} 
                  className="flex items-center justify-between px-3 py-2 hover:bg-white/[0.04] active:bg-white/[0.08] transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-6 h-6 rounded-md bg-[#007AFF] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <UserIcon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex flex-col text-left min-w-0">
                      <span className="text-[12.5px] font-medium text-white tracking-tight truncate">My Profile</span>
                      <span className="text-[9.5px] text-zinc-400 truncate">Account &amp; gameplay stats</span>
                    </div>
                  </div>
                  <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0 ml-2" />
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
                className="flex items-center justify-between px-3 py-2 hover:bg-white/[0.04] active:bg-white/[0.08] transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-6 h-6 rounded-md bg-[#34C759] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <HeartHandshake className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-[12.5px] font-medium text-white tracking-tight truncate">Refer &amp; Earn</span>
                    <span className="text-[9.5px] text-zinc-400 truncate">Invite friends for bonus XP</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <span className="text-[9.5px] font-semibold text-[#34c759] bg-[#34c759]/15 px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                    +50 XP
                  </span>
                  <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
                </div>
              </Link>

              {/* Setting Link to /profile/settings */}
              <Link
                href="/profile/settings"
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center justify-between px-3 py-2 hover:bg-white/[0.04] active:bg-white/[0.08] transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-6 h-6 rounded-md bg-[#8E8E93] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Settings className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-[12.5px] font-medium text-white tracking-tight truncate">Settings</span>
                    <span className="text-[9.5px] text-zinc-400 truncate">Notifications, audio &amp; app</span>
                  </div>
                </div>
                <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0 ml-2" />
              </Link>
              {/* Our Products Link to /products */}
              <Link
                href="/products"
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center justify-between px-3 py-2 hover:bg-white/[0.04] active:bg-white/[0.08] transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-6 h-6 rounded-md bg-white/[0.1] border border-white/10 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <ShoppingBag className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-[12.5px] font-medium text-white tracking-tight truncate">Our Products</span>
                    <span className="text-[9.5px] text-zinc-400 truncate">Products you may like</span>
                  </div>
                </div>
                <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0 ml-2" />
              </Link>

              {/* Sponsor Us or Partnership (Disabled) */}
              <div
                className="flex items-center justify-between px-3 py-2 opacity-45 cursor-not-allowed select-none"
                title="Coming Soon"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-6 h-6 rounded-md bg-white/[0.06] border border-white/[0.08] text-zinc-400 flex items-center justify-center shrink-0 shadow-sm">
                    <Handshake className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-[12.5px] font-medium text-zinc-300 tracking-tight truncate">Sponsor Us or Partnership</span>
                    <span className="text-[9.5px] text-zinc-500 truncate">Brand &amp; partner collaborations</span>
                  </div>
                </div>
                <span className="text-[9px] font-medium text-zinc-500 bg-white/[0.04] border border-white/[0.08] px-1.5 py-0.5 rounded-full shrink-0 ml-2">
                  Soon
                </span>
              </div>

              {/* Publish Your Game to Us (Disabled) */}
              <div
                className="flex items-center justify-between px-3 py-2 opacity-45 cursor-not-allowed select-none"
                title="Coming Soon"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-6 h-6 rounded-md bg-white/[0.06] border border-white/[0.08] text-zinc-400 flex items-center justify-center shrink-0 shadow-sm">
                    <Rocket className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-[12.5px] font-medium text-zinc-300 tracking-tight truncate">Publish Your Game to Us</span>
                    <span className="text-[9.5px] text-zinc-500 truncate">Submit games to our platform</span>
                  </div>
                </div>
                <span className="text-[9px] font-medium text-zinc-500 bg-white/[0.04] border border-white/[0.08] px-1.5 py-0.5 rounded-full shrink-0 ml-2">
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

        {/* Footer Action */}
        <div className="p-3 border-t border-white/[0.06] bg-[#0d0d10] shrink-0">
          {!session ? (
            <button
              onClick={() => {
                setIsSidebarOpen(false);
                router.push("/login");
              }}
              className="w-full py-2 px-3.5 bg-[#007AFF] hover:bg-[#0071E3] active:bg-[#0062C4] text-white font-semibold text-[13px] rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm touch-manipulation cursor-pointer"
            >
              <UserIcon className="w-4 h-4" />
              <span>Sign In with Google</span>
            </button>
          ) : (
            session?.user?.email === (process.env.ADMIN_EMAIL || "tusharkantanayak713@gmail.com") && (
              <Link 
                href="/admin" 
                onClick={() => setIsSidebarOpen(false)} 
                className="w-full py-2 px-3.5 bg-white/[0.06] hover:bg-white/[0.1] active:bg-white/[0.14] text-white font-semibold text-[12.5px] rounded-xl border border-white/[0.08] transition-colors flex items-center justify-center gap-2 touch-manipulation cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-white" />
                <span>Admin Dashboard</span>
              </Link>
            )
          )}
        </div>
      </div>
    </>
  );
}

