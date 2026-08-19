import dynamic from "next/dynamic";
import { Gamepad2 } from "lucide-react";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import { getBentoSpanClass, getImageContainerClass } from "@/lib/bento";
import { getInitialHomeGames, getRecentGamesForUserOrGuest } from "@/lib/services/gameService";
import GameCard from "@/components/game/GameCard";
import ContinuePlayingRow from "@/components/game/ContinuePlayingRow";

const InfiniteGameGrid = dynamic(() => import("@/components/game/InfiniteGameGrid"));

export const revalidate = 60; // Revalidate page every 60 seconds

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const session = await getServerSession(authOptions);
  
  const resolvedParams = await searchParams;
  const pageParam = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page, 10) : 1;
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const cookieStore = await cookies();
  const guestId = cookieStore.get('guestId')?.value;

  const [initialAllGames, userRecentGames] = await Promise.all([
    getInitialHomeGames(page),
    getRecentGamesForUserOrGuest(session, guestId),
  ]);

  const hasGames = initialAllGames.length > 0;

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {!hasGames && (
        <div className="text-center py-32 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(var(--primary-rgb),0.15)] border border-primary/20">
            <Gamepad2 className="w-10 h-10 text-primary-light" />
          </div>
          <h2 className="text-3xl font-bold text-text-main mb-4 tracking-tight">Welcome to {process.env.NEXT_PUBLIC_SITE_NAME || "Bluebuff Games"}!</h2>
          <p className="text-text-secondary max-w-md mx-auto text-lg leading-relaxed">
            Your database is connected, but no published games were found yet. Head over to the admin dashboard to upload and publish some games.
          </p>
        </div>
      )}

      {userRecentGames.length > 0 && (
        <ContinuePlayingRow games={userRecentGames} />
      )}


      {initialAllGames.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-text-main flex items-center gap-3">
              All Games
            </h2>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 auto-rows-[minmax(80px,auto)] md:auto-rows-[minmax(100px,auto)] gap-2 sm:gap-3 grid-flow-dense pb-6">
            {initialAllGames.map((game: any, index: number) => {
              const spanClass = getBentoSpanClass(index);
              const imageContainerClass = getImageContainerClass(spanClass);
              
              return (
                <div
                  key={`${game._id}-${index}`}
                  className={`${spanClass} game-card-enter`}
                  style={{ animationDelay: `${Math.min(index % 24, 12) * 40}ms` }}
                >
                  <GameCard 
                    game={game} 
                    className="h-full w-full"
                    imageContainerClassName={imageContainerClass}
                    priority={index < 8}
                  />
                </div>
              );
            })}
            
            <InfiniteGameGrid 
              initialPage={page} 
              sortType={page === 1 ? 'random' : 'popular'} 
              startIndex={initialAllGames.length}
              excludeIds={initialAllGames.map((g: any) => g._id).join(',')}
              hasMoreInitial={initialAllGames.length >= 24}
            />
          </div>
          
          {/* SEO Bot Pagination */}
          <div className="sr-only">
            <nav aria-label="Pagination">
              {page > 1 && <a href={`/?page=${page - 1}`}>Previous Page</a>}
              {initialAllGames.length === 24 && <a href={`/?page=${page + 1}`}>Next Page</a>}
            </nav>
          </div>
        </section>
      )}
    </div>
  );
}
