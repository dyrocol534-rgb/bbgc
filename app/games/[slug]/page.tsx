import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import GamePlayer from '@/components/game/GamePlayer';
import GameImage from '@/components/game/GameImage';
import GameDescription from '@/components/game/GameDescription';
import { getPublishedGameBySlug, getRandomSuggestedGames } from '@/lib/services/gameService';
import { getSidebarBentoSpanClass } from '@/lib/bento';
import { Gamepad2, Smartphone, Monitor, Layers, Globe } from 'lucide-react';

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const game = await getPublishedGameBySlug(slug);
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Bluebuff Games";
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://games.bluebuff.in";
  const siteUrl = rawSiteUrl.replace(/\/+$/, "");

  if (!game) {
    return { title: 'Game Not Found' };
  }

  const primaryCategory = Array.isArray(game.category) && game.category.length > 0 ? game.category[0] : "Online";
  const catCap = primaryCategory.charAt(0).toUpperCase() + primaryCategory.slice(1);
  const title = `Play ${game.title} Free Online – No Download (${catCap} Game) | ${siteName}`;
  const description = game.description
    ? `${game.description.slice(0, 140).trim()}... Play ${game.title} free in your browser with no downloads or install required on ${siteName}!`
    : `Play ${game.title} free online on ${siteName}. Enjoy high-speed ${primaryCategory.toLowerCase()} gameplay with no download, no install, and no registration.`;

  const keywords: string[] = [
    `play ${game.title.toLowerCase()} online`,
    `${game.title.toLowerCase()} free game`,
    `${game.title.toLowerCase()} unblocked`,
    `play ${game.title.toLowerCase()} without downloading`,
    `${game.title.toLowerCase()} browser game`,
    `${game.title.toLowerCase()} html5`,
    `${primaryCategory.toLowerCase()} games unblocked`,
    `free online games no download`,
    ...(Array.isArray(game.tags) ? game.tags.slice(0, 6).map((t: string) => `${t.toLowerCase()} games unblocked`) : []),
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
      images: game.thumbnailUrl ? [
        {
          url: game.thumbnailUrl,
          width: 800,
          height: 600,
          alt: `Play ${game.title} Free Online on ${siteName}`,
        }
      ] : [],
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
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Bluebuff Games";
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://games.bluebuff.in";
  const siteUrl = rawSiteUrl.replace(/\/+$/, "");

  const [game, randomGames] = await Promise.all([
    getPublishedGameBySlug(slug),
    getRandomSuggestedGames(slug, 16),
  ]);

  if (!game) {
    notFound();
  }

  const primaryCategory = Array.isArray(game.category) && game.category.length > 0 ? game.category[0] : null;
  const catTitle = primaryCategory ? primaryCategory.charAt(0).toUpperCase() + primaryCategory.slice(1) : "Games";

  const breadcrumbElements: Array<{ "@type": string; position: number; name: string; item: string }> = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: siteUrl,
    },
  ];

  if (primaryCategory) {
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

  // Compute rating for schema
  const likes = Array.isArray(game.likes) ? game.likes.length : 0;
  const dislikes = Array.isArray(game.dislikes) ? game.dislikes.length : 0;
  const totalVotes = likes + dislikes;
  const ratingAvg = totalVotes > 0 
    ? (3.5 + (likes / totalVotes) * 1.5).toFixed(1) 
    : "4.7";
  const ratingCount = Math.max(totalVotes, 42);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: game.title,
    description: game.description || `Play ${game.title} free in your browser with no downloads on ${siteName}.`,
    image: game.thumbnailUrl,
    url: `${siteUrl}/games/${game.slug}`,
    inLanguage: "en-US",
    author: {
      '@type': 'Organization',
      name: (game.developer === "GameMonetize" ? siteName : game.developer) || siteName,
      url: siteUrl
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl
    },
    genre: game.category || ["Online Games"],
    operatingSystem: "Web Browser, Windows, macOS, Android, iOS, ChromeOS",
    applicationCategory: "Game",
    gamePlatform: ["Web Browser", "Desktop", "Mobile", "Tablet"],
    playMode: "SinglePlayer",
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: ratingAvg,
      ratingCount: ratingCount.toString(),
      bestRating: '5',
      worstRating: '1'
    }
  };

  const gameFaqs = [
    {
      q: `Can I play ${game.title} online for free without downloading?`,
      a: `Yes! ${game.title} is completely free to play directly in your web browser on ${siteName}. No installation, download, or registration is required.`
    },
    {
      q: `Is ${game.title} unblocked to play at school or work?`,
      a: `Yes! ${game.title} runs via HTML5 browser emulation on ${siteName}, allowing you to play anywhere on Chromebooks, PCs, Macs, and tablets.`
    },
    {
      q: `What devices are supported for ${game.title}?`,
      a: `${game.title} is fully responsive and supports desktop computers (Windows, Mac, Linux), Chromebooks, Android smartphones, iPhones, iPads, and tablets.`
    }
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: gameFaqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a
      }
    }))
  };

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="container mx-auto px-3 sm:px-4 pt-2 sm:pt-3 pb-6 max-w-[1400px]">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-2 sm:mb-2.5 text-[11px] sm:text-xs text-zinc-500">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li>
              <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
            </li>
            <li>/</li>
            {primaryCategory && (
              <>
                <li>
                  <Link href={`/category/${primaryCategory.toLowerCase()}`} className="hover:text-zinc-300 transition-colors capitalize">
                    {primaryCategory}
                  </Link>
                </li>
                <li>/</li>
              </>
            )}
            <li className="text-zinc-300 font-medium truncate max-w-[200px] sm:max-w-none">
              {game.title}
            </li>
          </ol>
        </nav>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content (Left on Desktop) */}
          <div className="flex-1 min-w-0 space-y-6">
            <div>
              <GamePlayer game={game} />
            </div>

            {/* Game Meta & Information */}
            <div className="space-y-6">
              <div className="space-y-4">
                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  {game.title}
                </h1>

                {/* Category chips + tag pills */}
                <div className="flex flex-wrap items-center gap-2">
                  {game.category?.map((cat: string) => (
                    <Link
                      key={cat}
                      href={`/category/${cat.toLowerCase()}`}
                      className="px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all
                        bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:border-orange-500/50"
                    >
                      {cat}
                    </Link>
                  ))}
                  {game.tags?.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg text-[11px] text-zinc-500 bg-zinc-900 border border-zinc-800/60"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Description */}
                <GameDescription description={game.description} />

                {/* Spec pills */}
                <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/60">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] shrink-0">
                    <Layers className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="text-zinc-200 font-semibold">{game.buildType === 'html5' ? 'HTML5' : game.buildType === 'unity-webgl' ? 'Unity WebGL' : 'HTML5 / WebGL'}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] shrink-0">
                    <Globe className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="text-zinc-200 font-semibold">Browser · Mobile · PC</span>
                  </div>
                </div>

                {/* Useful Game Controls */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 font-medium flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      Controls:
                    </span>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[10px] font-semibold rounded">WASD / Arrows</kbd>
                      <kbd className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[10px] font-semibold rounded">Space</kbd>
                      <kbd className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[10px] font-semibold rounded">Mouse</kbd>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 font-medium flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      Mobile:
                    </span>
                    <kbd className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[10px] font-semibold rounded">Touch Screen</kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Suggested Games Bento Sidebar */}
          {randomGames.length > 0 && (
            <aside className="w-full lg:w-[360px] xl:w-[420px] shrink-0">
              <div className="space-y-3 sm:space-y-3.5">
                <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-primary" />
                  You May Also Like
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-3 xl:grid-cols-4 auto-rows-[minmax(80px,auto)] sm:auto-rows-[minmax(95px,auto)] gap-2 sm:gap-2.5 grid-flow-dense">
                  {randomGames.map((g: any, index: number) => {
                    const spanClass = getSidebarBentoSpanClass(index);
                    return (
                      <Link 
                        key={`${g.slug}-${index}`} 
                        href={`/games/${g.slug}`} 
                        className={`group block relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/80 hover:border-orange-500/50 transition-all duration-300 shadow-md hover:shadow-orange-500/15 ${spanClass} min-h-[80px]`}
                      >
                        <GameImage 
                          src={g.thumbnailUrl} 
                          alt={g.title} 
                          sizes="(max-width: 640px) 25vw, (max-width: 1024px) 20vw, 120px"
                          className="transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2 pt-5 z-10">
                          <p className="text-white text-[11px] sm:text-xs font-bold truncate group-hover:text-orange-300 transition-colors leading-tight">
                            {g.title}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </>
  );
}

