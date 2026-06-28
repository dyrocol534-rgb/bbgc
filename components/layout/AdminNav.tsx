"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UploadCloud, BarChart3, Users, Gamepad2, MessageSquareWarning, Activity } from "lucide-react";
import clsx from "clsx";

export default function AdminNav() {
  const pathname = usePathname();

  const links = [
    { name: "Analytics", href: "/admin", icon: BarChart3, exact: true },
    { name: "Manage Games", href: "/admin/games", icon: Gamepad2, exact: false },
    { name: "Upload Game", href: "/admin/upload", icon: UploadCloud, exact: false },
    { name: "Scanner", href: "/admin/scanner", icon: Activity, exact: false },
    { name: "Feedback", href: "/admin/feedback", icon: MessageSquareWarning, exact: false },
    { name: "Users", href: "/admin/users", icon: Users, exact: false },
  ];

  return (
    <nav className="flex space-x-2 overflow-x-auto custom-scrollbar pb-2 md:pb-0 w-full max-w-full md:w-auto">
      {links.map((link) => {
        const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        const Icon = link.icon;
        
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
              isActive 
                ? "bg-primary/10 text-primary-light" 
                : "text-text-muted hover:bg-surface-hover hover:text-text-main"
            )}
          >
            <Icon className="w-4 h-4" />
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
