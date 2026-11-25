import { Metadata } from 'next';
import dbConnect from '@/lib/mongodb';
import Game from '@/models/Game';
import GameCard from '@/components/game/GameCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchX } from 'lucide-react';
import SearchInputHeader from '@/components/search/SearchInputHeader';

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Bluebuff Games';

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }
): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const query = typeof resolvedParams.q === 'string' ? resolvedParams.q.trim() : '';

  if (!query) {
    return {
      title: `Search Free Online Games | ${siteName}`,
      description: `Search thousands of free browser games on ${siteName}. No download needed – find action, puzzle, racing, sports games and more.`,
      robots: { index: false, follow: true },
    };
  }

  return {
    title: `"${query}" Games – Play Free Online | ${siteName}`,
    description: `Find free online ${query} games on ${siteName}. Play instantly in your browser – no download, no registration required.`,
    robots: { index: false, follow: true }, // search result pages should not be indexed
  };
}

async function searchGames(query: string) {
  try {
    await dbConnect();
    const trimmed = query.trim();
    if (!trimmed) return [];

    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = new RegExp(escaped, 'i');
    const wholeWordRegex = new RegExp(`\\b${escaped}\\b`, 'i');

    const candidates = await Game.find({
      status: "published",
      $or: [
        { title: { $regex: searchRegex } },
        { category: { $regex: searchRegex } },
        { tags: { $regex: searchRegex } },
      ],
    })
      .select("_id slug title thumbnailUrl category playCount rating")
      .sort({ playCount: -1 })
      .limit(120)
      .lean();

    const lowerQuery = trimmed.toLowerCase();
    const scored = candidates.map((g: any) => {
      const title = (g.title || "").toLowerCase();
      let score = 0;
      if (title === lowerQuery) {
        score = 1000; // Exact title match
      } else if (title.startsWith(lowerQuery)) {
        score = 800; // Starts with query
      } else if (wholeWordRegex.test(title)) {
        score = 600; // Contains full word in title
      } else if (title.includes(lowerQuery)) {
        score = 400; // Substring in title
      } else if (Array.isArray(g.category) && g.category.some((c: string) => c.toLowerCase().includes(lowerQuery))) {
        score = 200; // Category match
      } else {
        score = 100; // Tag match
      }
      return { game: g, score };
    });

    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (b.game.playCount || 0) - (a.game.playCount || 0);
    });

    return scored.slice(0, 60).map((item) => ({
      ...item.game,
      _id: item.game._id?.toString() || "",
    }));
  } catch (error) {
    console.error("Error searching games:", error);
    return [];
  }
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams;
  const query = typeof resolvedParams.q === 'string' ? resolvedParams.q : '';
  
  const games = query ? await searchGames(query) : [];

  const getBentoSpanClass = (index: number) => {
    const pattern = index % 14; 
    if (pattern === 0 || pattern === 7) return "col-span-2 row-span-2 md:col-span-2 md:row-span-2";
    if (pattern === 4 || pattern === 11) return "col-span-1 row-span-2 md:col-span-1 md:row-span-2";
    if (pattern === 3 || pattern === 13) return "col-span-2 row-span-1 md:col-span-2 md:row-span-1";
    return "col-span-1 row-span-1 md:col-span-1 md:row-span-1";
  };

  const getImageContainerClass = (spanClass: string) => {
    if (spanClass.includes("row-span-2") || spanClass.includes("col-span-2")) {
      return "h-full w-full"; 
    }
    return "aspect-square";
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
      <SearchInputHeader initialQuery={query} totalGames={games.length} />

      {query && games.length === 0 ? (
        <EmptyState 
          icon={SearchX} 
          title="No Games Found" 
          description={`We couldn't find any games matching "${query}". Try searching for a different keyword or genre.`} 
          actionLabel="Browse All Games"
          actionHref="/"
        />
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 auto-rows-[minmax(100px,auto)] md:auto-rows-[minmax(120px,auto)] gap-2 sm:gap-3 grid-flow-dense pb-6">
          {games.map((game: any, index: number) => {
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
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
