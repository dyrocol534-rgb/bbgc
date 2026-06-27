import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";
import GameCard from "@/components/game/GameCard";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/");
  }

  await dbConnect();

  // The session user object contains favorites and recentlyPlayed as arrays of slugs
  const userFavorites = (session.user as any).favorites || [];
  const userRecent = (session.user as any).recentlyPlayed || [];

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
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-zinc-400">Manage your profile and view your games.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: User Details */}
        <div className="lg:col-span-1">
          <div className="bg-surface rounded-2xl p-6 border border-border-main sticky top-24">
            <div className="flex flex-col items-center text-center">
              {session.user.image ? (
                <img src={session.user.image} alt={session.user.name || "User"} className="w-24 h-24 rounded-full mb-4 border-4 border-surface-hover shadow-lg object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-surface-hover mb-4 flex items-center justify-center text-3xl font-bold text-zinc-500 border-4 border-zinc-800">
                  {(session.user.name || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <h2 className="text-xl font-bold text-white mb-1">{session.user.name}</h2>
              <p className="text-sm text-zinc-400 mb-6">{session.user.email}</p>
              
              <div className="w-full h-px bg-border-main mb-6"></div>

              <ProfileClient initialBio={(session.user as any).bio || ""} />
            </div>
          </div>
        </div>

        {/* Right Column: Games */}
        <div className="lg:col-span-3 space-y-12">
          
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🕒</span>
              <h3 className="text-2xl font-bold text-white">Recently Played</h3>
            </div>
            
            {orderedRecent.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {orderedRecent.map((game: any) => (
                  <GameCard
                    key={`recent-${game.slug}`}
                    game={game}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-surface border border-border-main rounded-xl p-8 text-center">
                <p className="text-zinc-400">You haven't played any games yet.</p>
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">❤️</span>
              <h3 className="text-2xl font-bold text-white">Favorite Games</h3>
            </div>
            
            {orderedFavorites.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {orderedFavorites.map((game: any) => (
                  <GameCard
                    key={`fav-${game.slug}`}
                    game={game}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-surface border border-border-main rounded-xl p-8 text-center">
                <p className="text-zinc-400">You haven't favorited any games yet.</p>
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
