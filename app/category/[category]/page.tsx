import { Metadata } from 'next';
import GameCard from '@/components/game/GameCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Gamepad2, Sparkles, HelpCircle } from 'lucide-react';
import { getBentoSpanClass, getImageContainerClass } from "@/lib/bento";
import { getPublishedGamesByCategory } from '@/lib/services/gameService';
import Link from 'next/link';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Bluebuff Games";
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://games.bluebuff.in";
  const siteUrl = rawSiteUrl.replace(/\/+$/, "");
  const catTitle = category.charAt(0).toUpperCase() + category.slice(1);
  const title = `Free ${catTitle} Games Online – No Download Needed | ${siteName}`;
  const description = `Play the best free ${catTitle.toLowerCase()} games online with no download, no install, and no login required on ${siteName}. Browse top-rated ${catTitle.toLowerCase()} browser games for PC & mobile.`;

  return {
    title: { absolute: title },
    description,
    keywords: [
      `${catTitle.toLowerCase()} games unblocked`,
      `play ${catTitle.toLowerCase()} games free online`,
      `unblocked ${catTitle.toLowerCase()} games at school`,
      `${catTitle.toLowerCase()} games without downloading`,
      `best free ${catTitle.toLowerCase()} games`,
      `${catTitle.toLowerCase()} browser games html5`,
      `free online games no install`,
    ],
    alternates: {
      canonical: `${siteUrl}/category/${category.toLowerCase()}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/category/${category.toLowerCase()}`,
      siteName,
      type: "website",
      images: [
        {
          url: `${siteUrl}/logo.png`,
          width: 1200,
          height: 630,
          alt: `Free ${catTitle} Games on ${siteName}`,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteUrl}/logo.png`],
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const games = await getPublishedGamesByCategory(category);
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Bluebuff Games";
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://games.bluebuff.in";
  const siteUrl = rawSiteUrl.replace(/\/+$/, "");
  const catTitle = category.charAt(0).toUpperCase() + category.slice(1);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: `${catTitle} Games`, item: `${siteUrl}/category/${category.toLowerCase()}` },
    ],
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Free ${catTitle} Games Online`,
    description: `Play free online ${catTitle.toLowerCase()} games instantly on ${siteName}.`,
    url: `${siteUrl}/category/${category.toLowerCase()}`,
    mainEntity: {
      "@type": "ItemList",
      name: `${catTitle} Games Collection`,
      numberOfItems: games.length,
      itemListElement: games.slice(0, 16).map((game: Record<string, any>, index: number) => ({
        "@type": "ListItem",
        position: index + 1,
        name: game.title,
        url: `${siteUrl}/games/${game.slug}`,
      })),
    },
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />

      {/* Category Header */}
      <div className="border-b border-[#1f1f22] pb-6">
        {/* Breadcrumb links */}
        <nav aria-label="Breadcrumb" className="mb-2 text-xs text-zinc-500">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link></li>
            <li>/</li>
            <li className="text-zinc-300 font-medium capitalize">{catTitle} Games</li>
          </ol>
        </nav>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white capitalize tracking-tight">
          Free {catTitle} Games Online
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base mt-2 max-w-3xl">
          {games.length > 0
            ? `Play ${games.length} free ${catTitle.toLowerCase()} games directly in your browser – no download, no install, and no registration required.`
            : `Explore top free online ${catTitle.toLowerCase()} games with instant no-download play.`}
        </p>
      </div>

      {games.length === 0 ? (
        <EmptyState
          icon={Gamepad2}
          title="No Games Yet"
          description={`We don't have any games in the ${category} category right now. Check back soon or explore other popular categories.`}
          actionLabel="View All Games"
          actionHref="/"
        />
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 auto-rows-[minmax(85px,auto)] md:auto-rows-[minmax(110px,auto)] gap-2 sm:gap-2.5 grid-flow-dense pb-6">
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
                  priority={index < 6}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* SEO Information Footer for Category */}
      {games.length > 0 && (
        <div className="bg-[#0c0c0e] rounded-2xl p-5 sm:p-6 border border-[#1f1f22] space-y-4 text-xs text-zinc-400">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            About {catTitle} Games on {siteName}
          </h2>
          <p className="leading-relaxed">
            Welcome to the premier collection of free online <strong className="text-zinc-200">{catTitle.toLowerCase()} games</strong> on {siteName}. All of our {catTitle.toLowerCase()} games are curated for instant fun without needing any installation, third-party software, or plugins. Whether you are on a school Chromebook, office laptop, iPhone, Android device, or iPad, you can enjoy seamless {catTitle.toLowerCase()} gameplay with zero delay.
          </p>
          <div className="pt-2 flex flex-wrap gap-2">
            <span className="font-semibold text-zinc-300">Explore more:</span>
            {['action', 'puzzle', 'racing', 'sports', 'shooting', 'io', 'adventure'].filter(c => c !== category.toLowerCase()).map(c => (
              <Link key={c} href={`/category/${c}`} className="text-indigo-400 hover:text-indigo-300 font-medium capitalize underline underline-offset-2">
                {c} games
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
