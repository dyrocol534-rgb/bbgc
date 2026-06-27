"use client";

import Link from "next/link";
import { Search, Gamepad2, User as UserIcon, LogOut, X, UploadCloud } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsMobileSearchOpen(false);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 h-16 bg-surface/80 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center text-primary hover:text-primary-light transition-colors" title="TapAndPlay Home">
          <Gamepad2 className="w-8 h-8" />
        </Link>
        
        <div className="flex-1 max-w-xl mx-4 hidden sm:block">
          <form onSubmit={handleSearch} className="relative group">
            <button 
              type="submit"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-primary-light transition-colors z-10"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search games..."
              className="w-full bg-surface-hover/50 border border-zinc-700 rounded-full py-2 pl-11 pr-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all group-hover:bg-surface-hover"
            />
          </form>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            className="sm:hidden text-zinc-400 hover:text-white p-2 transition-colors"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-zinc-300 hidden sm:block">{session.user?.name}</span>
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full overflow-hidden transition-transform hover:scale-105"
              >
                {session.user?.image ? (
                  <img src={session.user.image} alt="User" className="w-8 h-8 rounded-full border border-zinc-700 object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-border-strong">
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
          <form onSubmit={handleSearch} className="relative group">
            <button 
              type="submit"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-primary-light transition-colors z-10"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search games..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 pl-11 pr-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary-hover transition-colors"
              autoFocus
            />
          </form>
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
              <img src={session.user.image} alt="User" className="w-10 h-10 rounded-full border border-zinc-700 object-cover shadow-sm" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 shadow-sm">
                <UserIcon className="w-5 h-5 text-text-muted" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white truncate max-w-[140px]">{session?.user?.name || "Guest"}</span>
              {session?.user?.email === "tusharkantanayak713@gmail.com" && (
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
          {session ? (
            <>
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
              
              {session?.user?.email === "tusharkantanayak713@gmail.com" && (
                <div className="px-3">
                  <Link 
                    href="/admin" 
                    onClick={() => setIsSidebarOpen(false)} 
                    className="flex items-center gap-3 px-4 py-3 text-zinc-300 hover:bg-primary/10 hover:text-primary-light transition-colors rounded-lg font-medium group"
                  >
                    <UploadCloud className="w-5 h-5 text-indigo-500 group-hover:text-primary-light" />
                    Admin Dashboard
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="px-5 py-4 text-center">
              <p className="text-zinc-400 text-sm mb-4">Sign in to save your favorite games and track your recent plays!</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-zinc-800 bg-surface">
          {session ? (
            <button
              onClick={() => signOut()}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-zinc-800 hover:bg-red-500/10 text-zinc-300 hover:text-red-400 transition-colors rounded-lg font-medium border border-zinc-700 hover:border-red-500/20"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white transition-colors rounded-lg font-medium"
            >
              <UserIcon className="w-4 h-4" />
              Sign In with Google
            </button>
          )}
        </div>
      </div>
    </>
  );
}
