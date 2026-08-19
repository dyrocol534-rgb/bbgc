import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import GamePlayer from '@/components/game/GamePlayer';
import { getPublishedGameBySlug, getRandomSuggestedGames } from '@/lib/services/gameService';

// Revalidate every hour since game pages don't change often
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const game = await getPublishedGameBySlug(slug);
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Bluebuff Games";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://games.bluebuff.in";

  if (!game) {
    return { title: 'Game Not Found' };
  }

  const title = `Play ${game.title} Free Online – No Download | ${siteName}`;
  const description = game.description
    ? `${game.description.slice(0, 120).trim()}... Play ${game.title} free in your browser – no download or registration needed!`
    : `Play ${game.title} free online on ${siteName}. No download, no login required. Works on PC, mobile, and tablet.`;

  const keywords: string[] = [
    `${game.title.toLowerCase()} play free online`,
    `${game.title.toLowerCase()} unblocked`,
    `play ${game.title.toLowerCase()} unblocked online`,
    `${game.title.toLowerCase()} game free`,
    `${game.title.toLowerCase()} without downloading`,
    ...(Array.isArray(game.category) ? game.category.map((c: string) => `${c.toLowerCase()} games unblocked`) : []),
    ...(Array.isArray(game.tags) ? game.tags.slice(0, 5).map((t: string) => `${t.toLowerCase()} unblocked games`) : []),
  ];

  return {
    title: { absolute: title },
    description,
    keywords,
    alternates: {
      canonical: `${siteUrl}/games/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/games/${slug}`,
      siteName,
      type: "website",
      images: game.thumbnailUrl ? [{ url: game.thumbnailUrl, alt: game.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: game.thumbnailUrl ? [game.thumbnailUrl] : [],
    },
  };
}

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://games.bluebuff.in").replace(/\/+$/, "");

  const [game, randomGames] = await Promise.all([
    getPublishedGameBySlug(slug),
    getRandomSuggestedGames(slug),
  ]);

  if (!game) {
    notFound();
  }

  const primaryCategory = Array.isArray(game.category) && game.category.length > 0 ? game.category[0] : null;
  const breadcrumbElements: Array<{ "@type": string; position: number; name: string; item: string }> = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: siteUrl,
    },
  ];

  if (primaryCategory) {
    const catTitle = primaryCategory.charAt(0).toUpperCase() + primaryCategory.slice(1);
    breadcrumbElements.push({
      "@type": "ListItem",
      position: 2,
      name: `${catTitle} Games`,
      item: `${siteUrl}/category/${primaryCategory.toLowerCase()}`,
    });
    breadcrumbElements.push({
      "@type": "ListItem",
      position: 3,
      name: game.title,
      item: `${siteUrl}/games/${game.slug}`,
    });
  } else {
    breadcrumbElements.push({
      "@type": "ListItem",
      position: 2,
      name: game.title,
      item: `${siteUrl}/games/${game.slug}`,
    });
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbElements,
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: game.title,
    description: game.description,
    image: game.thumbnailUrl,
    author: {
      '@type': 'Organization',
      name: (game.developer === "GameMonetize" ? "Bluebuff Games" : game.developer) || "Bluebuff Games"
    },
    genre: game.category,
    operatingSystem: game.platforms || "Web browser",
    applicationCategory: "Game",
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock'
    }
  };

  if (game.rating && game.rating.count > 0) {
    (jsonLd as any).aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: game.rating.avg.toString(),
      ratingCount: game.rating.count.toString(),
      bestRating: '5',
      worstRating: '1'
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto px-4 py-6 max-w-[1400px]">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Main Content (Left on Desktop) */}
        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <GamePlayer game={game} />
          </div>

          <div className="bg-zinc-900 rounded-2xl p-4 sm:p-6 shadow-lg border border-border-main">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-text-main">{game.title}</h1>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {game.category?.map((cat: string) => (
                    <span key={cat} className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-md border border-zinc-700 capitalize">
                      {cat}
                    </span>
                  ))}
                  {game.tags?.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-surface-hover/50 text-zinc-400 text-xs rounded-md border border-border-strong/50">
                      #{tag}
                    </span>
                  ))}
                </div>

                <p className="text-zinc-300 leading-relaxed text-sm sm:text-base max-w-3xl whitespace-pre-line mb-5">
                  {game.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-8 max-w-3xl text-sm border-t border-border-main pt-4">
                  <div className="flex justify-between sm:justify-start gap-4">
                    <span className="text-zinc-500 font-medium sm:w-28 shrink-0">Developer:</span>
                    <span className="text-indigo-400 font-semibold">{game.developer === "GameMonetize" ? "Bluebuff Games" : (game.developer || "Bluebuff Games")}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start gap-4">
                    <span className="text-zinc-500 font-medium sm:w-28 shrink-0">Released:</span>
                    <span className="text-zinc-200 font-semibold">
                      {new Date(game.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between sm:justify-start gap-4">
                    <span className="text-zinc-500 font-medium sm:w-28 shrink-0">Last Updated:</span>
                    <span className="text-zinc-200 font-semibold">
                      {new Date(game.updatedAt || game.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between sm:justify-start gap-4">
                    <span className="text-zinc-500 font-medium sm:w-28 shrink-0">Game engine:</span>
                    <span className="text-zinc-200 font-semibold">
                      {game.buildType === 'html5' ? 'HTML5' : game.buildType === 'unity-webgl' ? 'Unity WebGL' : game.buildType}
                    </span>
                  </div>
                  
                  <div className="col-span-1 sm:col-span-2 pt-3 mt-1 border-t border-border-main/50 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <span className="text-zinc-500 font-medium sm:w-28 shrink-0">Platforms:</span>
                      <span className="text-zinc-200 font-semibold">{game.platforms || "Browser (desktop, mobile, tablet)"}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <span className="text-zinc-500 font-medium sm:w-28 shrink-0">Orientation:</span>
                      <span className="text-zinc-200 font-semibold capitalize">
                        {game.orientation === 'any' ? 'Landscape / Portrait' : game.orientation || 'Landscape / Portrait'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Suggested Games Sidebar (Right on Desktop, Below on Mobile) */}
        {randomGames.length > 0 && (
          <aside className="w-full lg:w-[450px] xl:w-[500px] shrink-0">
            <div className="bg-zinc-900 rounded-2xl p-4 sm:p-5 shadow-lg border border-border-main">
              <h3 className="font-bold text-lg text-white mb-4">Play next</h3>
              <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-3">
                {randomGames.map((g: any) => (
                  <Link key={g.slug} href={`/games/${g.slug}`} className="group block">
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-800 shadow-md border border-border-main group-hover:border-indigo-500/50 transition-colors">
                      <Image 
                        src={g.thumbnailUrl} 
                        alt={g.title} 
                        width={200}
                        height={200}
                        className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2 pt-6">
                        <p className="text-white text-xs font-bold truncate group-hover:text-indigo-300 transition-colors">{g.title}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
    </>
  );
}
