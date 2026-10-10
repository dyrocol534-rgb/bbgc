"use client";

import { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, Gamepad2, DownloadCloud, UploadCloud, 
  BellRing, Activity, MessageSquareWarning, Users, 
  ChevronLeft, ChevronRight, LayoutDashboard,
  Menu, X, Mail, Gift
} from "lucide-react";
import clsx from "clsx";

interface AdminLayoutShellProps {
  children: ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [
      { name: "Analytics", href: "/admin", icon: BarChart3, exact: true },
    ],
  },
  {
    title: "Games",
    items: [
      { name: "Manage Games", href: "/admin/games", icon: Gamepad2, exact: false },
      { name: "Instant Import", href: "/admin/import", icon: DownloadCloud, exact: false },
      { name: "Upload Game", href: "/admin/upload", icon: UploadCloud, exact: false },
      { name: "Scanner", href: "/admin/scanner", icon: Activity, exact: false },
    ],
  },
  {
    title: "Management",
    items: [
      { name: "Rewards Store", href: "/admin/rewards", icon: Gift, exact: false },
      { name: "Push Notifications", href: "/admin/notifications", icon: BellRing, exact: false },
      { name: "Feedback", href: "/admin/feedback", icon: MessageSquareWarning, exact: false },
      { name: "Users", href: "/admin/users", icon: Users, exact: false },
      { name: "Subscribers", href: "/admin/subscribers", icon: Mail, exact: false },
    ],
  },
];

const ALL_NAV_LINKS = NAV_SECTIONS.flatMap((s) => s.items);

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

  const activeLink = ALL_NAV_LINKS.find((link) =>
    link.exact ? pathname === link.href : pathname.startsWith(link.href)
  ) || ALL_NAV_LINKS[0];

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
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/[0.08] border border-white/[0.1] flex items-center justify-center text-white">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white tracking-wide uppercase">Admin Panel</span>
          </div>
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
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 custom-scrollbar bg-[#000000]">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-2 py-0.5">
                {section.title}
              </span>
              {section.items.map((link) => {
                const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
                const Icon = link.icon;

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={clsx(
                      "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group",
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
          ))}
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
            isCollapsed ? "lg:w-[68px]" : "lg:w-60"
          )}
        >
          <div className="relative bg-transparent border-0 p-1 lg:bg-black/90 lg:backdrop-blur-xl lg:border lg:border-zinc-900 lg:rounded-2xl lg:p-2.5 flex flex-col shadow-2xl">
            
            {/* Header: Title & Desktop Toggle Button */}
            <div className="hidden lg:flex items-center justify-between mb-2">
              {!isCollapsed ? (
                <>
                  <div className="flex items-center gap-2.5 px-2 py-1 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white shrink-0 shadow-inner">
                      <LayoutDashboard className="w-3.5 h-3.5 text-zinc-300" />
                    </div>
                    <span className="text-xs font-black text-white tracking-wider uppercase truncate">
                      Admin Panel
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={toggleCollapse}
                    title="Collapse navigation"
                    className="w-7 h-7 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <div className="w-full flex items-center justify-center pb-2 border-b border-zinc-900">
                  <button
                    type="button"
                    onClick={toggleCollapse}
                    title="Expand navigation"
                    className="w-9 h-9 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Header / Status Badge & Hamburger */}
            <div className="flex items-center justify-between gap-2 px-1 py-0.5 lg:hidden">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
                  <LayoutDashboard className="w-3.5 h-3.5 text-zinc-300" />
                </div>
                <h2 className="text-xs font-bold text-white leading-tight">Admin Panel</h2>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10.5px] font-medium text-zinc-300">
                  <activeLink.icon className="w-3 h-3 text-white" />
                  <span className="truncate max-w-[120px]">{activeLink.name}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
                  aria-label="Open admin menu"
                >
                  <Menu className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex lg:flex-col gap-2.5">
              {NAV_SECTIONS.map((section, sectionIdx) => (
                <div key={section.title} className="flex flex-col gap-1">
                  {/* Section Title (Expanded) or Divider (Collapsed) */}
                  {!isCollapsed ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-2.5 pt-1.5 pb-0.5 select-none">
                      {section.title}
                    </span>
                  ) : sectionIdx > 0 ? (
                    <div className="h-px bg-zinc-900 my-1 mx-1.5" />
                  ) : null}

                  {/* Links */}
                  <div className={clsx("flex flex-col", isCollapsed ? "gap-1.5 items-center" : "gap-1")}>
                    {section.items.map((link) => {
                      const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
                      const Icon = link.icon;

                      return (
                        <Link
                          key={link.name}
                          href={link.href}
                          title={isCollapsed ? link.name : undefined}
                          className={clsx(
                            "transition-all font-medium whitespace-nowrap group relative",
                            isCollapsed
                              ? "w-10 h-10 flex items-center justify-center rounded-xl"
                              : "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs w-full",
                            isActive
                              ? "bg-zinc-900 text-white font-bold border border-zinc-800 shadow-md"
                              : "text-zinc-400 hover:bg-zinc-950 hover:text-white border border-transparent"
                          )}
                        >
                          <Icon
                            className={clsx(
                              "w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                              isActive
                                ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                                : "text-zinc-500 group-hover:text-zinc-300"
                            )}
                          />

                          {!isCollapsed && (
                            <>
                              <span className="truncate">{link.name}</span>
                              {isActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-auto shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                              )}
                            </>
                          )}

                          {/* Floating Tooltip when Collapsed */}
                          {isCollapsed && (
                            <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-3 py-1.5 bg-black border border-zinc-800 rounded-lg text-white text-xs font-semibold shadow-2xl whitespace-nowrap z-50 pointer-events-none items-center">
                              {link.name}
                              {isActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-2" />
                              )}
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 w-full transition-all duration-300">
          {children}
        </main>

      </div>
    </div>
  );
}
