import { Metadata } from 'next';
import dbConnect from '@/lib/mongodb';
import Game from '@/models/Game';
import GameCard from '@/components/game/GameCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Gamepad2 } from 'lucide-react';
import { getBentoSpanClass, getImageContainerClass } from "@/lib/bento";

export const revalidate = 3600;

async function getCategoryGames(category: string) {
  try {
    await dbConnect();
    let query: any = { status: "published" };
    let sort: any = { playCount: -1 };
    let limitAmount = 0; // 0 means no limit

    const cat = category.toLowerCase();
    
    if (cat === 'new') {
      sort = { createdAt: -1 };
      limitAmount = 18;
    } else if (cat === 'popular') {
      sort = { playCount: -1 };
      limitAmount = 18;
    } else if (cat === 'updated') {
      sort = { updatedAt: -1 };
      limitAmount = 18;
    } else if (cat === 'featured') {
      sort = { playCount: -1 };
      query.featured = true;
      limitAmount = 18;
    } else {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    const queryBuilder = Game.find(query)
      .sort(sort)
      .select('_id slug title thumbnailUrl category playCount');
      
    if (limitAmount > 0) {
      queryBuilder.limit(limitAmount);
    }

    const games = await queryBuilder.lean();
    return JSON.parse(JSON.stringify(games));
  } catch (error) {
    console.error(`Error fetching ${category} games:`, error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Bluebuff Games";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://games.bluebuff.in";
  const catTitle = category.charAt(0).toUpperCase() + category.slice(1);
  const title = `Free ${catTitle} Games Online – No Download | ${siteName}`;
  const description = `Play the best free online ${catTitle.toLowerCase()} games instantly – no download, no registration required. Browse our full collection of ${catTitle.toLowerCase()} games on ${siteName}.`;

  return {
    title: { absolute: title },
    description,
    keywords: [
      `${catTitle.toLowerCase()} games unblocked`,
      `play ${catTitle.toLowerCase()} games free online`,
      `unblocked ${catTitle.toLowerCase()} games at school`,
      `${catTitle.toLowerCase()} games without downloading`,
      `${catTitle.toLowerCase()} browser games unblocked`,
    ],
    alternates: {
      canonical: `/category/${category}`,
    },
    openGraph: {
      title,
      description,
      url: `/category/${category}`,
      siteName,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const games = await getCategoryGames(category);
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Bluebuff Games";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://games.bluebuff.in";
  const catTitle = category.charAt(0).toUpperCase() + category.slice(1);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: `${catTitle} Games`, item: `${siteUrl}/category/${category}` },
    ],
  };

  const itemListSchema = games.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Free ${catTitle} Games`,
    description: `Play free ${catTitle.toLowerCase()} games online – no download needed.`,
    numberOfItems: games.length,
    itemListElement: games.slice(0, 10).map((game: Record<string, any>, index: number) => ({
      "@type": "ListItem",
      position: index + 1,
      name: game.title,
      url: `${siteUrl}/games/${game.slug}`,
    })),
  } : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {itemListSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      )}

      <div className="mb-8 border-b border-zinc-800 pb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white capitalize">Free {catTitle} Games Online</h1>
        <p className="text-zinc-400 mt-2">
          {games.length > 0
            ? `Play ${games.length} free ${catTitle.toLowerCase()} games instantly – no download, no registration required.`
            : `Explore free ${catTitle.toLowerCase()} games – no download needed.`}
        </p>
      </div>

      {games.length === 0 ? (
        <EmptyState
          icon={Gamepad2}
          title="No Games Yet"
          description={`We don't have any games in the ${category} category right now. Check back later or explore other categories.`}
          actionLabel="View All Games"
          actionHref="/"
        />
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 auto-rows-[minmax(100px,auto)] md:auto-rows-[minmax(120px,auto)] gap-2 sm:gap-3 grid-flow-dense pb-6">
          {games.map((game: Record<string, any>, index: number) => {
            const spanClass = getBentoSpanClass(index);
            const imageContainerClass = getImageContainerClass(spanClass);
              
            return (
              <div
                key={game._id?.toString() || game.slug}
                className={`${spanClass} game-card-enter`}
                style={{ animationDelay: `${Math.min(index % 24, 12) * 40}ms` }}
              >
                <GameCard 
                  game={game as any} 
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
