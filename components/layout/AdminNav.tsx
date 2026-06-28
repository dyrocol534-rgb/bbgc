"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UploadCloud, BarChart3, Users, Gamepad2, MessageSquareWarning, Activity, DownloadCloud, Menu, X } from "lucide-react";
import clsx from "clsx";

export default function AdminNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Prevent scrolling when slider is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const links = [
    { name: "Analytics", href: "/admin", icon: BarChart3, exact: true },
    { name: "Manage Games", href: "/admin/games", icon: Gamepad2, exact: false },
    { name: "Instant Import", href: "/admin/import", icon: DownloadCloud, exact: false },
    { name: "Upload Game", href: "/admin/upload", icon: UploadCloud, exact: false },
    { name: "Scanner", href: "/admin/scanner", icon: Activity, exact: false },
    { name: "Feedback", href: "/admin/feedback", icon: MessageSquareWarning, exact: false },
    { name: "Users", href: "/admin/users", icon: Users, exact: false },
  ];

  return (
    <div className="lg:w-full">
      {/* Mobile Menu Toggle */}
      <button 
        onClick={() => setIsOpen(true)}
        className="flex lg:hidden items-center justify-center p-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg text-white transition-colors border border-zinc-700/50"
      >
        <Menu className="w-5 h-5 text-zinc-400" />
      </button>

      {/* Backdrop for Slider */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[100] lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Navigation Links Slider */}
      <nav className={clsx(
        "fixed inset-y-0 right-0 z-[110] w-64 bg-surface border-l border-border-main p-6 shadow-2xl flex flex-col gap-2 transition-transform duration-300 ease-in-out lg:static lg:w-full lg:p-0 lg:border-none lg:shadow-none lg:bg-transparent lg:translate-x-0",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex items-center justify-between lg:hidden mb-6">
          <span className="font-bold text-white text-lg">Admin Menu</span>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {links.map((link) => {
          const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          const Icon = link.icon;
          
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                isActive 
                  ? "bg-indigo-500/10 text-indigo-400 shadow-[inset_2px_0_0_0_rgba(99,102,241,1)]" 
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
              )}
            >
              <Icon className={clsx("w-5 h-5", isActive ? "text-indigo-400" : "text-zinc-500")} />
              {link.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
