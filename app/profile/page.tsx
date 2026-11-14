import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Game from "@/models/Game";
import GameCard from "@/components/game/GameCard";
import ProfileClient from "./ProfileClient";
import { Clock, Heart, Gamepad2, Settings, ChevronLeft, Coins, Flame, Gift, Trophy, Calendar, Activity, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getHorizontalBentoSpanClass, getImageContainerClass } from "@/lib/bento";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/");
  }

  await dbConnect();

  // Load fresh user data for accurate play time, streak, games played count, createdAt, and lastActiveAt
  const currentUser = await User.findById((session.user as any).id)
    .select("xp currentStreak referralCode playtimeSeconds gamesPlayedCount createdAt lastActiveAt lastStreakDate")
    .lean();

  const userFavorites = ((session.user as any).favorites || []).slice(0, 9);
  const userRecent = ((session.user as any).recentlyPlayed || []).slice(0, 9);

  const favoriteGames = await Game.find({ slug: { $in: userFavorites } }).lean();
  const recentGames = await Game.find({ slug: { $in: userRecent } }).lean();

  const favoriteMap = new Map(favoriteGames.map(g => [(g as any).slug, g]));
  const recentMap = new Map(recentGames.map(g => [(g as any).slug, g]));

  const orderedFavorites = userFavorites.map((slug: string) => favoriteMap.get(slug)).filter(Boolean).slice(0, 9);
  const orderedRecent = userRecent.map((slug: string) => recentMap.get(slug)).filter(Boolean).slice(0, 9);

  const xp = currentUser?.xp ?? ((session.user as any).xp || 0);
  const streak = currentUser?.currentStreak ?? ((session.user as any).currentStreak || 0);
  const referralCode = currentUser?.referralCode || (session.user as any).referralCode || "—";
  const playtimeSeconds = currentUser?.playtimeSeconds || 0;
  const playtimeHours = Math.floor(playtimeSeconds / 3600);
  const playtimeMinutes = Math.floor((playtimeSeconds % 3600) / 60);
  const gamesPlayedCount = currentUser?.gamesPlayedCount ?? (orderedRecent.length || 0);

  // 1. Member Since
  const createdAtDate = currentUser?.createdAt ? new Date(currentUser.createdAt) : null;
  const memberSince = createdAtDate 
    ? createdAtDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Recently";

  // 2. Average games per day
  const daysSinceJoining = createdAtDate
    ? Math.max(1, Math.floor((Date.now() - createdAtDate.getTime()) / (1000 * 60 * 60 * 24)))
    : 1;
  const avgGamesPerDay = (gamesPlayedCount / daysSinceJoining).toFixed(1);

  // 3. Last played time
  const lastActiveDate = currentUser?.lastActiveAt || currentUser?.lastStreakDate;
  const lastPlayedTime = lastActiveDate
    ? new Date(lastActiveDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "Today";

  return (
    <div className="min-h-screen bg-black pb-12">
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 py-3 sm:py-4 space-y-4">

        {/* ── Top Navigation Bar ── */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium border border-zinc-800 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
            <span>Home</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/rewards"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 text-amber-400 hover:text-amber-300 text-xs font-medium transition-colors"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Rewards</span>
            </Link>

            <Link
              href="/referral"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium border border-zinc-800 transition-colors"
            >
              <Gift className="w-3.5 h-3.5 text-zinc-400" />
              <span>Invite</span>
            </Link>

            <Link
              href="/profile/settings"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium border border-zinc-800 transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
              <span>Settings</span>
            </Link>
          </div>
        </div>

        {/* ── Compact User Profile Bar ── */}
        <div className="rounded-xl bg-zinc-950 border border-zinc-900 p-3 sm:p-3.5">
          <div className="flex items-center gap-3">
            {/* Avatar with status indicator */}
            <div className="relative shrink-0">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full border border-zinc-800 object-cover bg-zinc-900"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-sm font-bold text-white border border-zinc-800">
                  {(session.user.name || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black" />
            </div>

            {/* Name, Email & Member Since badge */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug truncate">
                  {session.user.name}
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
                  <Calendar className="w-2.5 h-2.5 text-zinc-500" />
                  <span>Member since {memberSince}</span>
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                {session.user.email}
              </p>
            </div>
          </div>
        </div>

        {/* ── Key Player Stats (Clean 2-Row Grid, No Card, No Icon Border) ── */}
        <div className="space-y-3 py-1">
          {/* Row 1: XP, Streak, Play Time */}
          <div className="grid grid-cols-3 gap-2">
            {/* Total XP */}
            <Link 
              href="/rewards" 
              className="flex items-center gap-2 min-w-0 hover:opacity-85 transition-opacity group"
            >
              <Coins className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-medium text-zinc-500 leading-none truncate">Total XP</span>
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight truncate font-mono mt-0.5">
                  {xp.toLocaleString()} XP
                </span>
              </div>
            </Link>

            {/* Daily Streak */}
            <Link 
              href="/rewards" 
              className="flex items-center gap-2 min-w-0 hover:opacity-85 transition-opacity group"
            >
              <Flame className="w-4 h-4 text-orange-400 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-medium text-zinc-500 leading-none truncate">Streak</span>
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight truncate mt-0.5">
                  {streak} Days
                </span>
              </div>
            </Link>

            {/* Total Play Time */}
            <div className="flex items-center gap-2 min-w-0">
              <Clock className="w-4 h-4 text-sky-400 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-medium text-zinc-500 leading-none truncate">Play Time</span>
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight truncate font-mono mt-0.5">
                  {playtimeHours}h {playtimeMinutes}m
                </span>
              </div>
            </div>
          </div>

          {/* Row 2: Games Played, Avg Games/Day, Last Played */}
          <div className="grid grid-cols-3 gap-2">
            {/* Games Played */}
            <div className="flex items-center gap-2 min-w-0">
              <Gamepad2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-medium text-zinc-500 leading-none truncate">Games</span>
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight truncate font-mono mt-0.5">
                  {gamesPlayedCount}
                </span>
              </div>
            </div>

            {/* Average Games / Day */}
            <div className="flex items-center gap-2 min-w-0">
              <Activity className="w-4 h-4 text-purple-400 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-medium text-zinc-500 leading-none truncate">Avg/Day</span>
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight truncate font-mono mt-0.5">
                  {avgGamesPerDay}
                </span>
              </div>
            </div>

            {/* Last Played */}
            <div className="flex items-center gap-2 min-w-0">
              <Zap className="w-4 h-4 text-rose-400 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-medium text-zinc-500 leading-none truncate">Last Played</span>
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight truncate font-mono mt-0.5">
                  {lastPlayedTime}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr] gap-5 items-start">

          {/* ── Left: Profile Inset Group ── */}
          <div className="lg:sticky lg:top-20 space-y-1.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-1 mb-1 flex items-center justify-between">
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

          {/* ── Right: Games History & Favorites (Compact Bento Size) ── */}
          <div className="space-y-5 min-w-0">
            {/* Recently Played Section */}
            <section className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#007AFF] text-white flex items-center justify-center shrink-0">
                    <Clock className="w-2.5 h-2.5" />
                  </div>
                  <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                    Recently Played
                  </h2>
                </div>
                {orderedRecent.length > 0 && (
                  <span className="text-zinc-500 text-[11px] font-normal">
                    {orderedRecent.length} game{orderedRecent.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {orderedRecent.length > 0 ? (
                <div className="grid grid-rows-2 [grid-auto-flow:column_dense] auto-cols-[74px] sm:auto-cols-[82px] md:auto-cols-[88px] auto-rows-[78px] sm:auto-rows-[86px] md:auto-rows-[92px] gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none snap-x snap-mandatory scroll-smooth touch-pan-x">
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
                  <div className="w-4 h-4 rounded bg-[#FF2D55] text-white flex items-center justify-center shrink-0">
                    <Heart className="w-2.5 h-2.5" />
                  </div>
                  <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                    Favorite Games
                  </h2>
                </div>
                {orderedFavorites.length > 0 && (
                  <span className="text-zinc-500 text-[11px] font-normal">
                    {orderedFavorites.length} game{orderedFavorites.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {orderedFavorites.length > 0 ? (
                <div className="grid grid-rows-2 [grid-auto-flow:column_dense] auto-cols-[74px] sm:auto-cols-[82px] md:auto-cols-[88px] auto-rows-[78px] sm:auto-rows-[86px] md:auto-rows-[92px] gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none snap-x snap-mandatory scroll-smooth touch-pan-x">
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
