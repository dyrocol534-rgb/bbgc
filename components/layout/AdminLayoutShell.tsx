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
    <div className="w-full max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-6 py-6">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">
        
        {/* Admin Sidebar */}
        <aside
          className={clsx(
            "w-full shrink-0 transition-all duration-300 lg:sticky lg:top-20 z-20",
            isCollapsed ? "lg:w-20" : "lg:w-60"
          )}
        >
          <div className="relative bg-[#0c0c0e] border border-[#1f1f22] rounded-2xl p-3 sm:p-4 shadow-2xl shadow-black/60 flex flex-col gap-4">
            
            {/* Collapse Toggle Button (Desktop) */}
            <button
              type="button"
              onClick={toggleCollapse}
              title={isCollapsed ? "Expand Admin Navigation" : "Collapse Admin Navigation"}
              className="hidden lg:flex absolute -right-3.5 top-6 w-7 h-7 bg-[#121214] border border-[#1f1f22] hover:border-indigo-500/50 rounded-full items-center justify-center text-zinc-400 hover:text-white shadow-lg shadow-black/80 z-30 transition-all cursor-pointer"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>

            {/* Header / Title */}
            <div className="flex items-center gap-3 px-2 py-1 overflow-hidden min-h-[36px]">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div
                className={clsx(
                  "flex items-center transition-all duration-300 min-w-0",
                  isCollapsed ? "lg:opacity-0 lg:w-0 lg:hidden" : "opacity-100"
                )}
              >
                <h2 className="text-sm font-bold text-white leading-tight truncate">Admin Panel</h2>
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
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap shrink-0 group relative",
                      isActive
                        ? "bg-[#16161a] text-white shadow-md border-b-2 lg:border-b-0 lg:border-l-2 border-indigo-500"
                        : "text-zinc-400 hover:bg-[#16161a]/60 hover:text-zinc-200 border-b-2 lg:border-b-0 lg:border-l-2 border-transparent"
                    )}
                  >
                    <Icon
                      className={clsx(
                        "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
                        isActive
                          ? "text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]"
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
                      <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-2.5 py-1 bg-[#16161a] border border-[#27272e] rounded-lg text-white text-[11px] font-semibold tracking-normal shadow-xl whitespace-nowrap z-50 pointer-events-none items-center">
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
          <div className="bg-[#0c0c0e] border border-[#1f1f22] rounded-2xl p-4 sm:p-6 lg:p-7 shadow-2xl shadow-black/50">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
