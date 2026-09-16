import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import SettingsClient from "./SettingsClient";

export const metadata = {
  title: "Settings – Bluebuff Games",
  description: "Manage notification preferences, sound effects, and account settings on Bluebuff Games.",
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5">
        {/* iOS-Style Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href={session ? "/profile" : "/"}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.09] active:bg-white/[0.12] border border-white/[0.08] text-zinc-300 hover:text-white text-xs font-medium transition-all group touch-manipulation"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
            <span>{session ? "Profile" : "Home"}</span>
          </Link>

          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Preferences
          </span>
        </div>

        {/* Header */}
        <div className="space-y-0.5">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Settings
          </h1>
          <p className="text-xs text-zinc-400">
            Personalize your alerts, audio, cloud sync, and application settings.
          </p>
        </div>

        {/* Main Settings Client */}
        <SettingsClient user={session?.user || null} />
      </div>
    </div>
  );
}
