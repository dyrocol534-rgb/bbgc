import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";
import GameCard from "@/components/game/GameCard";
import ProfileClient from "./ProfileClient";
import { Clock, Heart, Gamepad2, Settings, ChevronLeft, Coins, Flame, Gift, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=in.bluebuff.games";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/");
  }

  await dbConnect();

  const userFavorites = (session.user as any).favorites || [];
  const userRecent = ((session.user as any).recentlyPlayed || []).slice(0, 8);

  const favoriteGames = await Game.find({ slug: { $in: userFavorites } }).lean();
  const recentGames = await Game.find({ slug: { $in: userRecent } }).lean();

  const favoriteMap = new Map(favoriteGames.map(g => [(g as any).slug, g]));
  const recentMap = new Map(recentGames.map(g => [(g as any).slug, g]));

  const orderedFavorites = userFavorites.map((slug: string) => favoriteMap.get(slug)).filter(Boolean);
  const orderedRecent = userRecent.map((slug: string) => recentMap.get(slug)).filter(Boolean);

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
        <div className="relative overflow-hidden rounded-[24px] bg-[#141416] border border-white/[0.08] p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative shrink-0">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={72}
                    height={72}
                    className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 border-white/[0.12] shadow-xl object-cover bg-zinc-800"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-2xl font-black text-white border-2 border-white/[0.12] shadow-xl">
                    {(session.user.name || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#141416]" />
              </div>

              {/* Name & Email */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
                    {session.user.name}
                  </h1>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    Active Account
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 font-normal mt-0.5 truncate">
                  {session.user.email}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/referral"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-semibold text-zinc-200 hover:text-white transition-all"
              >
                <Gift className="w-3.5 h-3.5 text-orange-400" />
                <span>Invite Friends</span>
              </Link>
              <Link
                href="/profile/settings"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-xs font-semibold text-white transition-all shadow-sm"
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
          <div className="space-y-8">

            {/* Recently Played */}
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-1 mb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-[6px] bg-[#007AFF] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Clock className="w-3 h-3" />
                  </div>
                  <span>Recently Played</span>
                </div>
                {orderedRecent.length > 0 && (
                  <span className="text-zinc-500 text-[11px] font-normal normal-case">
                    {orderedRecent.length} game{orderedRecent.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {orderedRecent.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 xl:grid-cols-4 gap-3">
                  {orderedRecent.map((game: any) => (
                    <GameCard key={`recent-${game.slug}`} game={game} />
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={<Gamepad2 className="w-5 h-5 text-zinc-500" />} 
                  label="No games played yet" 
                  sub="Browse trending titles to build your gameplay record." 
                />
              )}
            </div>

            {/* Favorite Games */}
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-1 mb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-[6px] bg-[#FF2D55] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Heart className="w-3 h-3" />
                  </div>
                  <span>Favorite Games</span>
                </div>
                {orderedFavorites.length > 0 && (
                  <span className="text-zinc-500 text-[11px] font-normal normal-case">
                    {orderedFavorites.length} game{orderedFavorites.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {orderedFavorites.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 xl:grid-cols-4 gap-3">
                  {orderedFavorites.map((game: any) => (
                    <GameCard key={`fav-${game.slug}`} game={game} />
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={<Heart className="w-5 h-5 text-zinc-500" />} 
                  label="No favorites added yet" 
                  sub="Tap the heart icon on any game card to bookmark it here." 
                />
              )}
            </div>

          </div>
        </div>

        {/* ── Bottom Section: Play Store Companion Card ── */}
        <div className="pt-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-3.5 mb-2 flex items-center justify-between">
            <span>Android App</span>
            <span className="text-sky-400 flex items-center gap-1 normal-case font-normal text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              Free on Google Play
            </span>
          </div>

          <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#161619] via-[#131316] to-[#0d0d0f] border border-white/[0.08] p-5 sm:p-6 shadow-xl group">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-sky-500/20 transition-all duration-700" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-12 h-12 rounded-[14px] bg-[#1a1a20] border border-white/[0.12] flex items-center justify-center shrink-0 shadow-lg shadow-black/40 group-hover:border-sky-500/40 transition-colors">
                  <svg className="w-6 h-6" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#32BBFF" d="M396.121 229.173 34.445 19.532C25.061 14.118 14.968 13.418 6.458 17.696L261.929 256 396.121 229.173z" />
                    <path fill="#32BBFF" d="m6.458 494.304 255.471-238.303L6.458 17.696C2.592 19.636 0 24.169 0 30.47v451.06c0 6.301 2.592 10.834 6.458 12.774z" />
                    <path fill="#FFD700" d="M419.978 274.638 396.121 261.17 261.929 256l134.192 26.827 23.857 13.469c11.27-6.408 11.27-15.25 0-21.658z" />
                    <path fill="#F3BC00" d="m396.121 282.827-361.676 209.64c9.084 5.203 19.018 4.66 27.547-.407L419.978 274.638 396.121 282.827z" />
                    <path fill="#00F076" d="M261.929 256 6.458 17.696c-1.054.516-2.058 1.142-2.993 1.89L261.929 256z" />
                    <path fill="#00DA65" d="M261.929 256 3.465 492.414c.934.748 1.939 1.374 2.993 1.89L261.929 256z" />
                    <path fill="#FF3A44" d="M419.978 237.362 61.992 19.26C53.463 14.192 43.529 13.65 34.445 19.532L261.929 256 419.978 237.362z" />
                    <path fill="#C31162" d="M261.929 256 34.445 492.468c9.084 5.882 19.018 5.34 27.547.272l358.986-218.103L261.929 256z" />
                  </svg>
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-bold text-white tracking-tight">
                      Bluebuff Games
                    </span>
             
                  </div>
                  <span className="text-xs text-zinc-400 mt-0.5">
                    Official Android App • Fullscreen &amp; Offline Play
                  </span>
              
                </div>
              </div>

              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-zinc-100 active:bg-zinc-200 text-black text-xs sm:text-sm font-semibold shadow-lg shadow-white/10 active:scale-[0.98] transition-all cursor-pointer shrink-0"
              >
                <span>Get on Google Play</span>
                <ArrowUpRight className="w-4 h-4 text-black" />
              </a>
            </div>
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
