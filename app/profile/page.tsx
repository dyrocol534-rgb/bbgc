import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";
import GameCard from "@/components/game/GameCard";
import ProfileClient from "./ProfileClient";
import { Clock, Heart, Gamepad2 } from "lucide-react";
import Image from "next/image";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/");
  }

  await dbConnect();

  const userFavorites = (session.user as any).favorites || [];
  const userRecent = ((session.user as any).recentlyPlayed || []).slice(0, 6);

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
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* ── Hero Card ── */}
        <div className="relative rounded-2xl overflow-hidden border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-sm shadow-2xl">
          {/* Banner */}
          <div className="h-24 sm:h-28 bg-gradient-to-br from-indigo-700 via-purple-700 to-fuchsia-700 relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.35),transparent_60%)]" />
            <div className="absolute inset-0 bg-black/25" />
          </div>

          {/* Avatar + Info */}
          <div className="px-4 pb-5 -mt-10 relative">
            <div className="flex items-end gap-4">
              {/* Avatar */}
              <div className="relative shrink-0">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={72}
                    height={72}
                    className="w-[72px] h-[72px] rounded-2xl border-[3px] border-zinc-900 shadow-xl object-cover ring-2 ring-indigo-500/40"
                  />
                ) : (
                  <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-2xl font-black text-white border-[3px] border-zinc-900 shadow-xl ring-2 ring-indigo-500/40">
                    {(session.user.name || "U").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name + Email */}
              <div className="flex-1 min-w-0 pb-1">
                <h1 className="text-lg sm:text-xl font-bold text-white truncate leading-tight">{session.user.name}</h1>
                <p className="text-xs text-zinc-500 font-mono truncate">{session.user.email}</p>
              </div>
            </div>

            {/* Stats Row */}
            <div className="mt-4 flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1.5">
                <span className="text-sm">🪙</span>
                <span className="text-xs font-bold text-amber-400">{xp} XP</span>
              </div>
              <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1.5">
                <span className="text-sm">🔥</span>
                <span className="text-xs font-bold text-orange-400">{streak} day streak</span>
              </div>
              <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1.5">
                <span className="text-xs text-zinc-400">Code</span>
                <span className="text-xs font-mono font-bold text-indigo-400 tracking-wider">{referralCode}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">

          {/* ── Left: Editable Profile ── */}
          <div className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800/50">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Profile Details</p>
              </div>
              <div className="p-4">
                <ProfileClient
                  initialBio={(session.user as any).bio || ""}
                  initialPhone={(session.user as any).phone || ""}
                />
              </div>
            </div>
          </div>

          {/* ── Right: Games ── */}
          <div className="space-y-6">

            {/* Recently Played */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <h2 className="text-sm font-bold text-white tracking-tight">Recently Played</h2>
                {orderedRecent.length > 0 && (
                  <span className="ml-auto text-xs text-zinc-600">{orderedRecent.length} game{orderedRecent.length !== 1 ? "s" : ""}</span>
                )}
              </div>

              {orderedRecent.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                  {orderedRecent.map((game: any) => (
                    <GameCard key={`recent-${game.slug}`} game={game} />
                  ))}
                </div>
              ) : (
                <EmptyState icon={<Gamepad2 className="w-5 h-5 text-zinc-600" />} label="No games played yet" sub="Start playing to see your history." />
              )}
            </section>

            <div className="h-px bg-zinc-800/40" />

            {/* Favorites */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-pink-500/15 border border-pink-500/20 flex items-center justify-center">
                  <Heart className="w-3.5 h-3.5 text-pink-400" />
                </div>
                <h2 className="text-sm font-bold text-white tracking-tight">Favorite Games</h2>
                {orderedFavorites.length > 0 && (
                  <span className="ml-auto text-xs text-zinc-600">{orderedFavorites.length} game{orderedFavorites.length !== 1 ? "s" : ""}</span>
                )}
              </div>

              {orderedFavorites.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                  {orderedFavorites.map((game: any) => (
                    <GameCard key={`fav-${game.slug}`} game={game} />
                  ))}
                </div>
              ) : (
                <EmptyState icon={<Heart className="w-5 h-5 text-zinc-600" />} label="No favorites yet" sub="Tap the heart on any game to save it here." />
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
    <div className="rounded-xl border border-zinc-800/40 bg-zinc-900/20 p-6 flex flex-col items-center text-center gap-2">
      <div className="w-10 h-10 rounded-full bg-zinc-800/60 flex items-center justify-center">
        {icon}
      </div>
      <p className="text-sm font-medium text-zinc-300">{label}</p>
      <p className="text-xs text-zinc-600">{sub}</p>
    </div>
  );
}
