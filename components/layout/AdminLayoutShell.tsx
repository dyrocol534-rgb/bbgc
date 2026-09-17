"use client";

import { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, Gamepad2, DownloadCloud, UploadCloud, 
  BellRing, Activity, MessageSquareWarning, Users, 
  ChevronLeft, ChevronRight, LayoutDashboard,
  Menu, X
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("admin_sidebar_collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  // Automatically close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent background scrolling when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("admin_sidebar_collapsed", String(next));
  };

  const activeLink = NAV_LINKS.find((link) =>
    link.exact ? pathname === link.href : pathname.startsWith(link.href)
  ) || NAV_LINKS[0];

  return (
    <div className="w-full max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-5">
      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-50 transition-opacity backdrop-blur-md lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Right-Side Sliding Drawer */}
      <div
        className={clsx(
          "fixed top-0 right-0 h-full w-72 max-w-[86vw] bg-[#0d0d10] border-l border-white/[0.08] z-50 transform transition-transform duration-300 ease-out flex flex-col shadow-2xl lg:hidden",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Drawer Header */}
        <div className="p-4 bg-[#141416] border-b border-white/[0.08] flex items-center justify-between">
          <span className="text-xs font-bold text-white tracking-wide uppercase">Admin Panel</span>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-7 h-7 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Drawer Navigation Links */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1 custom-scrollbar bg-[#000000]">
          {NAV_LINKS.map((link) => {
            const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={clsx(
                  "flex items-center justify-between px-3 py-2.5 rounded-[14px] text-xs font-medium transition-all group",
                  isActive
                    ? "bg-[#1c1c1e] text-white font-semibold border border-white/[0.1] shadow-xs"
                    : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200 border border-transparent"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={clsx(
                      "w-4 h-4 shrink-0 transition-transform group-hover:scale-105",
                      isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                    )}
                  />
                  <span className="truncate">{link.name}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 bg-[#141416] border-t border-white/[0.08]">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-300 hover:text-white text-xs font-medium rounded-xl transition-all"
          >
            <span>Back to Main Site</span>
          </Link>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-5 items-start">
        
        {/* Admin Sidebar */}
        <aside
          className={clsx(
            "w-full shrink-0 transition-all duration-300 lg:sticky lg:top-20 z-20",
            isCollapsed ? "lg:w-16" : "lg:w-56"
          )}
        >
          <div className="relative bg-transparent border-0 p-1 lg:bg-[#141416] lg:border lg:border-white/[0.08] lg:rounded-[20px] lg:p-2.5 flex flex-col gap-2 shadow-none lg:shadow-xs">
            
            {/* Collapse Toggle Button (Desktop) */}
            <button
              type="button"
              onClick={toggleCollapse}
              title={isCollapsed ? "Expand Navigation" : "Collapse Navigation"}
              className="hidden lg:flex absolute -right-3 top-4 w-6 h-6 bg-[#1a1a1e] border border-white/[0.1] hover:border-white/[0.2] rounded-full items-center justify-center text-zinc-400 hover:text-white z-30 transition-all cursor-pointer shadow-xs"
            >
              {isCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <ChevronLeft className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Header / Title & Mobile Hamburger */}
            <div className="flex items-center justify-between gap-2 px-1 py-0.5">
              <div
                className={clsx(
                  "flex items-center transition-all duration-300 min-w-0 overflow-hidden",
                  isCollapsed ? "lg:opacity-0 lg:w-0 lg:hidden" : "opacity-100"
                )}
              >
                <h2 className="text-xs font-semibold text-white leading-tight truncate">Admin Panel</h2>
              </div>

              {/* Mobile Status Badge & Hamburger Button */}
              <div className="flex items-center gap-1.5 lg:hidden">
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[10.5px] font-medium text-zinc-300">
                  <activeLink.icon className="w-3 h-3 text-white" />
                  <span className="truncate max-w-[120px]">{activeLink.name}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white border border-white/[0.08] transition-colors cursor-pointer"
                  aria-label="Open admin menu"
                >
                  <Menu className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex lg:flex-col gap-0.5">
              {NAV_LINKS.map((link) => {
                const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
                const Icon = link.icon;

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    title={isCollapsed ? link.name : undefined}
                    className={clsx(
                      "flex items-center gap-2.5 px-2.5 py-1.5 rounded-[12px] text-xs font-medium transition-all whitespace-nowrap shrink-0 group relative",
                      isActive
                        ? "bg-[#202024] text-white font-semibold border border-white/[0.1] shadow-xs"
                        : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200 border border-transparent"
                    )}
                  >
                    <Icon
                      className={clsx(
                        "w-4 h-4 shrink-0 transition-transform group-hover:scale-105",
                        isActive
                          ? "text-white"
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
                      <div className="hidden lg:group-hover:flex absolute left-full ml-2.5 px-2.5 py-1 bg-[#1c1c1e] border border-white/[0.1] rounded-md text-white text-[11px] font-medium shadow-xl whitespace-nowrap z-50 pointer-events-none items-center">
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
          <div className="bg-[#141416] border border-white/[0.08] rounded-[20px] p-3.5 sm:p-5 lg:p-6 shadow-xs">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
