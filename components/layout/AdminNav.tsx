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
    <nav className="w-full flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 custom-scrollbar hide-scrollbar-on-mobile">
      {links.map((link) => {
        const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        const Icon = link.icon;
        
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "flex items-center gap-2 lg:gap-2.5 px-3 lg:px-3 py-2 lg:py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap shrink-0",
              isActive 
                ? "bg-indigo-500/10 text-indigo-400 shadow-[inset_0_-2px_0_0_rgba(99,102,241,1)] lg:shadow-none lg:border-l-2 lg:border-indigo-500 lg:rounded-l-none" 
                : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
            )}
          >
            <Icon className={clsx("w-4 h-4 lg:w-5 lg:h-5", isActive ? "text-indigo-400" : "text-zinc-500")} />
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
