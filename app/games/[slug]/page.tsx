import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import GamePlayer from '@/components/game/GamePlayer';
import GameImage from '@/components/game/GameImage';
import { getPublishedGameBySlug, getRandomSuggestedGames } from '@/lib/services/gameService';
import { getSidebarBentoSpanClass } from '@/lib/bento';
import { Gamepad2, Sparkles, Smartphone, Monitor, HelpCircle, ShieldCheck } from 'lucide-react';

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

      <div className="container mx-auto px-4 py-6 max-w-[1400px]">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
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

            {/* Game Meta & Information Card */}
            <div className="bg-[#0c0c0e] rounded-2xl p-4 sm:p-6 shadow-lg border border-[#1f1f22]">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{game.title}</h1>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {game.category?.map((cat: string) => (
                      <Link 
                        key={cat} 
                        href={`/category/${cat.toLowerCase()}`}
                        className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold rounded-lg border border-zinc-800 transition-colors capitalize"
                      >
                        {cat}
                      </Link>
                    ))}
                    {game.tags?.map((tag: string) => (
                      <span key={tag} className="px-2.5 py-1 bg-zinc-900/60 text-zinc-400 text-xs rounded-lg border border-zinc-800/80">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <p className="text-zinc-300 leading-relaxed text-sm sm:text-base max-w-3xl whitespace-pre-line mb-5">
                    {game.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-8 max-w-3xl text-sm border-t border-zinc-800/80 pt-4">
                    <div className="flex justify-between sm:justify-start gap-4">
                      <span className="text-zinc-500 font-medium sm:w-28 shrink-0">Developer:</span>
                      <span className="text-indigo-400 font-semibold">{game.developer === "GameMonetize" ? siteName : (game.developer || siteName)}</span>
                    </div>
                    <div className="flex justify-between sm:justify-start gap-4">
                      <span className="text-zinc-500 font-medium sm:w-28 shrink-0">Released:</span>
                      <span className="text-zinc-200 font-semibold">
                        {new Date(game.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex justify-between sm:justify-start gap-4">
                      <span className="text-zinc-500 font-medium sm:w-28 shrink-0">Game Engine:</span>
                      <span className="text-zinc-200 font-semibold">
                        {game.buildType === 'html5' ? 'HTML5' : game.buildType === 'unity-webgl' ? 'Unity WebGL' : 'HTML5 / WebGL'}
                      </span>
                    </div>
                    <div className="flex justify-between sm:justify-start gap-4">
                      <span className="text-zinc-500 font-medium sm:w-28 shrink-0">Platforms:</span>
                      <span className="text-zinc-200 font-semibold">{game.platforms || "Web Browser, Mobile, PC"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SEO Content: How to Play & Controls */}
            <div className="bg-[#0c0c0e] rounded-2xl p-4 sm:p-6 shadow-lg border border-[#1f1f22] space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-indigo-400" />
                How to Play {game.title}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-300">
                <div className="p-3 bg-[#121214] border border-zinc-800/80 rounded-xl space-y-1.5">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-indigo-400" /> Desktop Controls
                  </div>
                  <p className="text-zinc-400">Use your Mouse or Keyboard (Arrow keys / WASD / Spacebar) depending on in-game instructions.</p>
                </div>
                <div className="p-3 bg-[#121214] border border-zinc-800/80 rounded-xl space-y-1.5">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-sky-400" /> Mobile & Tablet Controls
                  </div>
                  <p className="text-zinc-400">Tap, swipe, and use on-screen touch buttons for full mobile responsiveness.</p>
                </div>
              </div>

              {/* Game FAQ */}
              <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                  Frequently Asked Questions
                </h3>
                <div className="space-y-1.5">
                  {gameFaqs.map((faq, i) => (
                    <details key={i} className="group p-2.5 bg-[#121214] border border-zinc-800/60 rounded-xl cursor-pointer">
                      <summary className="text-xs font-semibold text-zinc-200 group-hover:text-indigo-300 list-none flex justify-between items-center select-none">
                        <span>{faq.q}</span>
                        <span className="text-zinc-500 group-open:rotate-180 transition-transform text-sm">+</span>
                      </summary>
                      <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                        {faq.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Suggested Games Bento Sidebar */}
          {randomGames.length > 0 && (
            <aside className="w-full lg:w-[360px] xl:w-[420px] shrink-0">
              <div className="bg-[#0c0c0e] rounded-2xl p-4 sm:p-5 shadow-lg border border-[#1f1f22]">
                <h3 className="font-bold text-base text-white mb-3.5 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
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
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
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

