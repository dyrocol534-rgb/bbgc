import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  className
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center p-8 sm:p-12 md:p-16 rounded-3xl bg-zinc-900/50 border border-zinc-800/50 shadow-inner", className)}>
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-zinc-800/50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-zinc-700/50">
        <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-zinc-400" />
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-zinc-400 text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
        {description}
      </p>
      
      {actionLabel && actionHref && (
        <Link 
          href={actionHref}
          className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all shadow-lg hover:shadow-indigo-500/25 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
