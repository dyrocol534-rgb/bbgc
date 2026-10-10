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
    <div className="min-h-screen bg-black pb-12">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href={session ? "/profile" : "/"}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium border border-zinc-800 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
            <span>{session ? "Profile" : "Home"}</span>
          </Link>

          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
            Preferences &amp; Settings
          </span>
        </div>

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Personalize your alerts, audio, cloud sync, and application settings.
          </p>
        </div>

        {/* Main Settings Client */}
        <SettingsClient user={session?.user || null} />
      </div>
    </div>
  );
}
