import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import InfoTooltip from "@/components/ui/InfoTooltip";
import SettingsClient from "./SettingsClient";

export const metadata = {
  title: "Settings – Bluebuff Games",
  description: "Manage notification preferences, sound effects, and account settings on Bluebuff Games.",
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-black pb-12">
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 py-3 sm:py-4 space-y-4">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href={session ? "/profile" : "/"}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium border border-zinc-800 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
            <span>{session ? "Profile" : "Home"}</span>
          </Link>
        </div>

        {/* Header with InfoTooltip */}
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
              Settings &amp; Preferences
            </h1>
            <InfoTooltip
              size="xs"
              title="Settings & Preferences"
              content="Personalize audio, push notifications, cloud sync, and account security."
            />
          </div>
        </div>

        {/* Main Settings Client */}
        <SettingsClient user={session?.user || null} />
      </div>
    </div>
  );
}
