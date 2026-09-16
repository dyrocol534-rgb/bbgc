import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import GamePlayer from '@/components/game/GamePlayer';
import GameImage from '@/components/game/GameImage';
import GameDescription from '@/components/game/GameDescription';
import { getPublishedGameBySlug, getRandomSuggestedGames } from '@/lib/services/gameService';
import { getSidebarBentoSpanClass } from '@/lib/bento';
import { Gamepad2, Smartphone, Monitor, Layers, Globe, ChevronRight, Star, Info, Sparkles } from 'lucide-react';

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

      <div className="container mx-auto px-3 sm:px-4 pt-2 sm:pt-3 pb-8 max-w-[1400px]">
        {/* iOS Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-3 text-[11px] sm:text-xs text-zinc-400">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li>
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
            </li>
            <li><ChevronRight className="w-3 h-3 text-zinc-600" /></li>
            {primaryCategory && (
              <>
                <li>
                  <Link href={`/category/${primaryCategory.toLowerCase()}`} className="hover:text-white transition-colors capitalize">
                    {primaryCategory}
                  </Link>
                </li>
                <li><ChevronRight className="w-3 h-3 text-zinc-600" /></li>
              </>
            )}
            <li className="text-zinc-200 font-medium truncate max-w-[200px] sm:max-w-none">
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

            {/* iOS Inset Grouped Details Card */}
            <div className="rounded-[24px] bg-[#141416] border border-white/[0.08] p-5 sm:p-6 shadow-sm space-y-5">
              {/* Header Info */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                    {game.title}
                  </h1>
                </div>

                {/* Categories & Tags - Horizontal Scroll with small text */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-nowrap py-1 -mx-1 px-1">
                  {game.category?.map((cat: string) => (
                    <Link
                      key={cat}
                      href={`/category/${cat.toLowerCase()}`}
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize transition-all bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/25 shrink-0 whitespace-nowrap cursor-pointer active:scale-95"
                    >
                      {cat}
                    </Link>
                  ))}
                  {game.tags?.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-[10px] text-zinc-400 bg-white/[0.04] border border-white/[0.07] shrink-0 whitespace-nowrap"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* iOS Quick Spec Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-white/[0.06]">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Engine</span>
                    <span className="text-xs font-semibold text-white truncate">
                      {game.buildType === 'html5' ? 'HTML5' : game.buildType === 'unity-webgl' ? 'Unity WebGL' : 'HTML5 WebGL'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Devices</span>
                    <span className="text-xs font-semibold text-white truncate">Mobile, iOS &amp; PC</span>
                  </div>
                </div>
              </div>

              {/* About This Game Description */}
              <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-orange-400" />
                  About This Game
                </h3>
                <GameDescription description={game.description} />
              </div>

              {/* iOS Controls Section */}
              <div className="space-y-2.5 pt-2 border-t border-white/[0.06]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5 text-orange-400" />
                  Controls &amp; How to Play
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-xs font-medium text-zinc-300 flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-orange-400 shrink-0" />
                      Desktop Keyboard
                    </span>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-0.5 bg-white/[0.06] border border-white/[0.1] text-zinc-200 font-mono text-[10px] font-semibold rounded-md">WASD</kbd>
                      <kbd className="px-2 py-0.5 bg-white/[0.06] border border-white/[0.1] text-zinc-200 font-mono text-[10px] font-semibold rounded-md">Space</kbd>
                      <kbd className="px-2 py-0.5 bg-white/[0.06] border border-white/[0.1] text-zinc-200 font-mono text-[10px] font-semibold rounded-md">Mouse</kbd>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-xs font-medium text-zinc-300 flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-sky-400 shrink-0" />
                      Mobile &amp; Tablet
                    </span>
                    <kbd className="px-2.5 py-0.5 bg-white/[0.06] border border-white/[0.1] text-zinc-200 font-mono text-[10px] font-semibold rounded-md">Touch Screen</kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Suggested Games Bento Sidebar */}
          {randomGames.length > 0 && (
            <aside className="w-full lg:w-[360px] xl:w-[420px] shrink-0">
              <div className="space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-[#ff7a1a] to-[#ea580c] flex items-center justify-center text-white shadow-sm shrink-0">
                    <Gamepad2 className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-white tracking-tight">
                    You May Also Like
                  </h3>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-3 xl:grid-cols-4 auto-rows-[minmax(80px,auto)] sm:auto-rows-[minmax(95px,auto)] gap-2 sm:gap-2.5 grid-flow-dense">
                  {randomGames.map((g: any, index: number) => {
                    const spanClass = getSidebarBentoSpanClass(index);
                    return (
                      <Link 
                        key={`${g.slug}-${index}`} 
                        href={`/games/${g.slug}`} 
                        className={`group block relative rounded-[18px] overflow-hidden bg-[#141416] border border-white/[0.08] hover:border-orange-500/50 transition-all duration-300 shadow-sm hover:shadow-orange-500/15 ${spanClass} min-h-[80px] active:scale-[0.98]`}
                      >
                        <GameImage 
                          src={g.thumbnailUrl} 
                          alt={g.title} 
                          sizes="(max-width: 640px) 25vw, (max-width: 1024px) 20vw, 120px"
                          className="transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2 pt-5 z-10">
                          <p className="text-white text-[11px] sm:text-xs font-semibold truncate group-hover:text-orange-300 transition-colors leading-tight">
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

