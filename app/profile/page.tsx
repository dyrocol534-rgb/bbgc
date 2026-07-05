import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";
import GameCard from "@/components/game/GameCard";
import ProfileClient from "./ProfileClient";
import { Clock, Heart, Gamepad2, Settings } from "lucide-react";
import Image from "next/image";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/");
  }

  await dbConnect();

  // The session user object contains favorites and recentlyPlayed as arrays of slugs
  const userFavorites = (session.user as any).favorites || [];
  const userRecent = ((session.user as any).recentlyPlayed || []).slice(0, 3);

  // Fetch full game objects
  const favoriteGames = await Game.find({ slug: { $in: userFavorites } }).lean();
  const recentGames = await Game.find({ slug: { $in: userRecent } }).lean();

  // Create lookup maps to preserve order from the arrays
  const favoriteMap = new Map(favoriteGames.map(g => [(g as any).slug, g]));
  const recentMap = new Map(recentGames.map(g => [(g as any).slug, g]));

  const orderedFavorites = userFavorites.map((slug: string) => favoriteMap.get(slug)).filter(Boolean);
  const orderedRecent = userRecent.map((slug: string) => recentMap.get(slug)).filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white mb-1 tracking-tight">My Profile</h1>
          <p className="text-sm text-zinc-400">Manage your profile and view your games.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: User Details */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900/50 rounded-2xl overflow-hidden border border-zinc-800 shadow-xl sticky top-24">
            {/* Banner */}
            <div className="h-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 w-full relative">
              <div className="absolute inset-0 bg-black/20" />
            </div>
            
            <div className="px-4 pb-4 relative">
              <div className="flex flex-col items-center text-center -mt-8">
                {session.user.image ? (
                  <Image 
                    src={session.user.image} 
                    alt={session.user.name || "User"} 
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full mb-2 border-4 border-zinc-900 shadow-xl object-cover bg-zinc-800 relative z-10" 
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-zinc-800 mb-2 flex items-center justify-center text-2xl font-black text-zinc-500 border-4 border-zinc-900 shadow-xl relative z-10">
                    {(session.user.name || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                
                <h2 className="text-xl font-bold text-white mb-1">{session.user.name}</h2>
                <p className="text-xs text-zinc-400 font-mono mb-6">{session.user.email}</p>
                
                {/* Gamification Stats */}
                <div className="w-full bg-black/40 border border-zinc-800 rounded-xl p-4 mb-6 flex flex-col gap-3 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-400">Total XP</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-amber-500 text-sm">🪙</span>
                      <span className="font-bold text-amber-400">{(session.user as any).xp || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-400">Daily Streak</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-orange-500 text-sm">🔥</span>
                      <span className="font-bold text-orange-400">{(session.user as any).currentStreak || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-medium text-zinc-400">Referral Code</span>
                    <span className="font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded text-xs tracking-wider">
                      {(session.user as any).referralCode || "NONE"}
                    </span>
                  </div>
                </div>

                <div className="w-full h-px bg-zinc-800 mb-6"></div>
  
                <div className="w-full text-left">
                  <ProfileClient 
                    initialBio={(session.user as any).bio || ""} 
                    initialPhone={(session.user as any).phone || ""}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Games */}
        <div className="lg:col-span-3 space-y-6">
          
          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <Clock className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Recently Played</h3>
            </div>
            
            {orderedRecent.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {orderedRecent.map((game: any) => (
                  <GameCard
                    key={`recent-${game.slug}`}
                    game={game}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center mb-3">
                  <Gamepad2 className="w-6 h-6 text-zinc-600" />
                </div>
                <h4 className="text-zinc-200 font-medium text-sm mb-1">No recently played games</h4>
                <p className="text-xs text-zinc-500">Games you play will appear here.</p>
              </div>
            )}
          </section>

          <div className="w-full h-px bg-zinc-800/50"></div>

          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 bg-pink-500/10 rounded-lg border border-pink-500/20">
                <Heart className="w-4 h-4 text-pink-400" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Favorite Games</h3>
            </div>
            
            {orderedFavorites.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {orderedFavorites.map((game: any) => (
                  <GameCard
                    key={`fav-${game.slug}`}
                    game={game}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center mb-3">
                  <Heart className="w-6 h-6 text-zinc-600" />
                </div>
                <h4 className="text-zinc-200 font-medium text-sm mb-1">No favorite games yet</h4>
                <p className="text-xs text-zinc-500">Click the heart icon on any game to save it here.</p>
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
