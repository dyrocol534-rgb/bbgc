"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UploadCloud, BarChart3, Users, Gamepad2, MessageSquareWarning, Activity, DownloadCloud, BellRing, Menu, X } from "lucide-react";
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
    { name: "Push Notifications", href: "/admin/notifications", icon: BellRing, exact: false },
    { name: "Scanner", href: "/admin/scanner", icon: Activity, exact: false },
    { name: "Feedback", href: "/admin/feedback", icon: MessageSquareWarning, exact: false },
    { name: "Users", href: "/admin/users", icon: Users, exact: false },
  ];

  return (
    <nav className="w-full flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 custom-scrollbar hide-scrollbar-on-mobile">
      {links.map((link) => {
        const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        const Icon = link.icon;
        
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "flex items-center gap-2.5 px-2.5 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0",
              isActive 
                ? "bg-zinc-800/90 text-white font-semibold border border-zinc-700/60" 
                : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200 border border-transparent"
            )}
          >
            <Icon className={clsx("w-4 h-4 shrink-0", isActive ? "text-indigo-400" : "text-zinc-500")} />
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
