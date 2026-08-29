"use client";

import { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, Gamepad2, DownloadCloud, UploadCloud, 
  BellRing, Activity, MessageSquareWarning, Users, 
  ChevronLeft, ChevronRight, ShieldCheck, LayoutDashboard
} from "lucide-react";
import clsx from "clsx";

interface AdminLayoutShellProps {
  children: ReactNode;
}

const NAV_LINKS = [
  { name: "Analytics", href: "/admin", icon: BarChart3, exact: true },
  { name: "Manage Games", href: "/admin/games", icon: Gamepad2, exact: false },
  { name: "Instant Import", href: "/admin/import", icon: DownloadCloud, exact: false },
  { name: "Upload Game", href: "/admin/upload", icon: UploadCloud, exact: false },
  { name: "Push Notifications", href: "/admin/notifications", icon: BellRing, exact: false },
  { name: "Scanner", href: "/admin/scanner", icon: Activity, exact: false },
  { name: "Feedback", href: "/admin/feedback", icon: MessageSquareWarning, exact: false },
  { name: "Users", href: "/admin/users", icon: Users, exact: false },
];

export default function AdminLayoutShell({ children }: AdminLayoutShellProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("admin_sidebar_collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("admin_sidebar_collapsed", String(next));
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-5 items-start">
        
        {/* Admin Sidebar */}
        <aside
          className={clsx(
            "w-full shrink-0 transition-all duration-300 lg:sticky lg:top-20 z-20",
            isCollapsed ? "lg:w-16" : "lg:w-56"
          )}
        >
          <div className="relative bg-[#0d0d10] border border-zinc-800/60 rounded-xl p-2 sm:p-2.5 flex flex-col gap-2">
            
            {/* Collapse Toggle Button (Desktop) */}
            <button
              type="button"
              onClick={toggleCollapse}
              title={isCollapsed ? "Expand Navigation" : "Collapse Navigation"}
              className="hidden lg:flex absolute -right-3 top-4 w-6 h-6 bg-[#141418] border border-zinc-800 hover:border-zinc-700 rounded-full items-center justify-center text-zinc-400 hover:text-white z-30 transition-all cursor-pointer shadow-sm"
            >
              {isCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <ChevronLeft className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Header / Title */}
            <div className="flex items-center gap-2 px-1.5 py-1 overflow-hidden">
              <div className="w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div
                className={clsx(
                  "flex items-center transition-all duration-300 min-w-0",
                  isCollapsed ? "lg:opacity-0 lg:w-0 lg:hidden" : "opacity-100"
                )}
              >
                <h2 className="text-xs font-semibold text-white leading-tight truncate">Admin Panel</h2>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 custom-scrollbar">
              {NAV_LINKS.map((link) => {
                const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
                const Icon = link.icon;

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    title={isCollapsed ? link.name : undefined}
                    className={clsx(
                      "flex items-center gap-2.5 px-2.5 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 group relative",
                      isActive
                        ? "bg-zinc-800/90 text-white font-semibold border border-zinc-700/60"
                        : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200 border border-transparent"
                    )}
                  >
                    <Icon
                      className={clsx(
                        "w-4 h-4 shrink-0 transition-transform group-hover:scale-105",
                        isActive
                          ? "text-indigo-400"
                          : "text-zinc-500 group-hover:text-zinc-300"
                      )}
                    />
                    
                    <span
                      className={clsx(
                        "transition-all duration-200 truncate",
                        isCollapsed ? "lg:opacity-0 lg:w-0 lg:hidden" : "opacity-100"
                      )}
                    >
                      {link.name}
                    </span>

                    {/* Floating Tooltip when Collapsed */}
                    {isCollapsed && (
                      <div className="hidden lg:group-hover:flex absolute left-full ml-2.5 px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded-md text-white text-[11px] font-medium shadow-md whitespace-nowrap z-50 pointer-events-none items-center">
                        {link.name}
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 w-full transition-all duration-300">
          <div className="bg-[#0d0d10] border border-zinc-800/60 rounded-xl p-3 sm:p-5 lg:p-6">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
