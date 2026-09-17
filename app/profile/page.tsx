import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";
import GameCard from "@/components/game/GameCard";
import ProfileClient from "./ProfileClient";
import { Clock, Heart, Gamepad2, Settings, ChevronLeft, Coins, Flame, Gift } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getHorizontalBentoSpanClass, getImageContainerClass } from "@/lib/bento";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/");
  }

  await dbConnect();

  const userFavorites = ((session.user as any).favorites || []).slice(0, 9);
  const userRecent = ((session.user as any).recentlyPlayed || []).slice(0, 9);

  const favoriteGames = await Game.find({ slug: { $in: userFavorites } }).lean();
  const recentGames = await Game.find({ slug: { $in: userRecent } }).lean();

  const favoriteMap = new Map(favoriteGames.map(g => [(g as any).slug, g]));
  const recentMap = new Map(recentGames.map(g => [(g as any).slug, g]));

  const orderedFavorites = userFavorites.map((slug: string) => favoriteMap.get(slug)).filter(Boolean).slice(0, 9);
  const orderedRecent = userRecent.map((slug: string) => recentMap.get(slug)).filter(Boolean).slice(0, 9);

  const xp = (session.user as any).xp || 0;
  const streak = (session.user as any).currentStreak || 0;
  const referralCode = (session.user as any).referralCode || "—";

  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-7">

        {/* ── iOS Top Navigation Bar ── */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.09] active:bg-white/[0.12] border border-white/[0.08] text-zinc-300 hover:text-white text-xs font-medium transition-all group touch-manipulation"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
            <span>Home</span>
          </Link>

          <Link
            href="/profile/settings"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.09] active:bg-white/[0.12] border border-white/[0.08] text-zinc-300 hover:text-white text-xs font-medium transition-all group"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
            <span>Settings</span>
          </Link>
        </div>

        {/* ── Apple ID / Profile Card ── */}
        <div className="relative overflow-hidden rounded-[20px] bg-[#141416] border border-white/[0.08] p-3.5 sm:p-4 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-3.5">
              {/* Avatar with status indicator */}
              <div className="relative shrink-0">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={56}
                    height={56}
                    className="w-13 h-13 sm:w-14 sm:h-14 rounded-full border border-white/[0.12] shadow-md object-cover bg-zinc-800"
                  />
                ) : (
                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-xl font-black text-white border border-white/[0.12] shadow-md">
                    {(session.user.name || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#141416]" />
              </div>

              {/* Name & Email */}
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight truncate">
                  {session.user.name}
                </h1>
                <p className="text-xs text-zinc-400 font-normal mt-0.5 truncate">
                  {session.user.email}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/referral"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-semibold text-zinc-200 hover:text-white transition-all"
              >
                <Gift className="w-3.5 h-3.5 text-orange-400" />
                <span>Invite Friends</span>
              </Link>
              <Link
                href="/profile/settings"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500 hover:bg-orange-600 text-xs font-semibold text-white transition-all shadow-sm"
              >
                <span>Preferences</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Dynamic Responsive Capsules (XP, Streak, Invite Code) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {/* XP Segment */}
          <Link 
            href="/rewards" 
            className="bg-[#141416] p-3 rounded-[20px] border border-white/[0.07] flex items-center gap-2.5 hover:bg-white/[0.04] active:scale-[0.98] transition-all group shadow-sm"
          >
            <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
              <Coins className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider leading-none mb-1">XP Balance</span>
              <span className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight truncate">{xp} XP</span>
            </div>
          </Link>

          {/* Streak Segment */}
          <Link 
            href="/rewards" 
            className="bg-[#141416] p-3 rounded-[20px] border border-white/[0.07] flex items-center gap-2.5 hover:bg-white/[0.04] active:scale-[0.98] transition-all group shadow-sm"
          >
            <div className="w-8 h-8 rounded-full bg-orange-500/15 border border-orange-500/25 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider leading-none mb-1">Streak</span>
              <span className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight truncate">{streak} Days</span>
            </div>
          </Link>

          {/* Referral Segment */}
          <Link 
            href="/referral" 
            className="col-span-2 sm:col-span-1 bg-[#141416] p-3 rounded-[20px] border border-white/[0.07] flex items-center justify-between sm:justify-start gap-2.5 hover:bg-white/[0.04] active:scale-[0.98] transition-all group shadow-sm"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center shrink-0">
                <Gift className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider leading-none mb-1">Invite Code</span>
                <span className="text-xs sm:text-sm font-bold font-mono text-indigo-400 tracking-wider leading-tight truncate">{referralCode}</span>
              </div>
            </div>
            <span className="sm:hidden text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full shrink-0">
              Invite ↗
            </span>
          </Link>
        </div>

        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-7 items-start">

          {/* ── Left: Profile Inset Group ── */}
          <div className="lg:sticky lg:top-24 space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-3.5 mb-1.5 flex items-center justify-between">
              <span>Profile Info</span>
              <Link href="/profile/settings" className="text-[11px] text-zinc-500 hover:text-zinc-300 normal-case font-normal transition-colors">
                Settings →
              </Link>
            </div>

            <ProfileClient
              initialBio={(session.user as any).bio || ""}
              initialPhone={(session.user as any).phone || ""}
            />
          </div>

          {/* ── Right: Games History & Favorites ── */}
          <div className="space-y-5">
            {/* Recently Played Section */}
            <section className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-[6px] bg-[#007AFF] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Clock className="w-3 h-3" />
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    Recently Played
                  </h2>
                </div>
                {orderedRecent.length > 0 && (
                  <span className="text-zinc-500 text-xs font-normal">
                    {orderedRecent.length} game{orderedRecent.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {orderedRecent.length > 0 ? (
                <div className="grid grid-rows-2 [grid-auto-flow:column_dense] auto-cols-[74px] sm:auto-cols-[84px] md:auto-cols-[92px] auto-rows-[78px] sm:auto-rows-[88px] md:auto-rows-[96px] gap-2 sm:gap-2.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none snap-x snap-mandatory scroll-smooth touch-pan-x">
                  {orderedRecent.map((game: any, index: number) => {
                    const spanClass = getHorizontalBentoSpanClass(index);
                    const imageContainerClass = getImageContainerClass(spanClass);

                    return (
                      <div
                        key={`recent-${game.slug}-${index}`}
                        className={`${spanClass} snap-start h-full`}
                      >
                        <GameCard
                          game={game}
                          imageContainerClassName={imageContainerClass}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState 
                  icon={<Gamepad2 className="w-5 h-5 text-zinc-500" />} 
                  label="No games played yet" 
                  sub="Browse trending titles to build your gameplay record." 
                />
              )}
            </section>

            {/* Favorite Games Section */}
            <section className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-[6px] bg-[#FF2D55] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Heart className="w-3 h-3" />
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    Favorite Games
                  </h2>
                </div>
                {orderedFavorites.length > 0 && (
                  <span className="text-zinc-500 text-xs font-normal">
                    {orderedFavorites.length} game{orderedFavorites.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {orderedFavorites.length > 0 ? (
                <div className="grid grid-rows-2 [grid-auto-flow:column_dense] auto-cols-[74px] sm:auto-cols-[84px] md:auto-cols-[92px] auto-rows-[78px] sm:auto-rows-[88px] md:auto-rows-[96px] gap-2 sm:gap-2.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none snap-x snap-mandatory scroll-smooth touch-pan-x">
                  {orderedFavorites.map((game: any, index: number) => {
                    const spanClass = getHorizontalBentoSpanClass(index);
                    const imageContainerClass = getImageContainerClass(spanClass);

                    return (
                      <div
                        key={`fav-${game.slug}-${index}`}
                        className={`${spanClass} snap-start h-full`}
                      >
                        <GameCard
                          game={game}
                          imageContainerClassName={imageContainerClass}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState 
                  icon={<Heart className="w-5 h-5 text-zinc-500" />} 
                  label="No favorites added yet" 
                  sub="Tap the heart icon on any game card to bookmark it here." 
                />
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon, label, sub }: { icon: React.ReactNode; label: string; sub: string }) {
  return (
    <div className="rounded-[22px] border border-white/[0.06] bg-[#141416] p-8 flex flex-col items-center text-center gap-2.5 shadow-sm">
      <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
        {icon}
      </div>
      <p className="text-sm font-medium text-zinc-200">{label}</p>
      <p className="text-xs text-zinc-500 max-w-xs">{sub}</p>
    </div>
  );
}
