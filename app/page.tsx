import dynamic from "next/dynamic";
import { Gamepad2, Sparkles, ShieldCheck, Zap, Smartphone, Globe, HelpCircle, ChevronDown, Puzzle, Car, Trophy, Crosshair, Compass, Crown } from "lucide-react";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import { getBentoSpanClass, getImageContainerClass } from "@/lib/bento";
import { getInitialHomeGames, getRecentGamesForUserOrGuest, getPublishedGamesByCategory } from "@/lib/services/gameService";
import GameCard from "@/components/game/GameCard";
import ContinuePlayingRow from "@/components/game/ContinuePlayingRow";
import HorizontalGameSection from "@/components/game/HorizontalGameSection";
import Link from "next/link";

import InfiniteGameGrid from "@/components/game/InfiniteGameGrid";

export const revalidate = 60; // Revalidate page every 60 seconds

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const session = await getServerSession(authOptions);
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Bluebuff Games";
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://games.bluebuff.in";
  const siteUrl = rawSiteUrl.replace(/\/+$/, "");
  
  const resolvedParams = await searchParams;
  const pageParam = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page, 10) : 1;
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const cookieStore = await cookies();
  const guestId = cookieStore.get('guestId')?.value;

  const [initialAllGames, userRecentGames, featuredGames] = await Promise.all([
    getInitialHomeGames(page),
    getRecentGamesForUserOrGuest(session, guestId),
    getPublishedGamesByCategory("featured"),
  ]);

  const hasGames = initialAllGames.length > 0;

  const homeCollectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${siteName} – Free Online Games`,
    description: `Play 1000+ free online games instantly – no download, no install required on ${siteName}.`,
    url: siteUrl,
    mainEntity: {
      "@type": "ItemList",
      name: "All Games",
      numberOfItems: initialAllGames.length,
      itemListElement: initialAllGames.slice(0, 20).map((g: any, index: number) => ({
        "@type": "ListItem",
        position: index + 1,
        name: g.title,
        url: `${siteUrl}/games/${g.slug}`,
      })),
    },
  };

  const homeFaqs = [
    {
      q: "Can I play games on Bluebuff without downloading or installing?",
      a: "Yes! Every game on Bluebuff runs entirely in your web browser. There is zero installation, no third-party downloads, and no plugins needed. Click any game to start playing instantly."
    },
    {
      q: "Are all games on Bluebuff 100% free?",
      a: "Yes. All games across every category—including action, puzzle, racing, shooting, sports, and multiplayer IO games—are 100% free with unlimited play."
    },
    {
      q: "Do Bluebuff games work on school Chromebooks and mobile devices?",
      a: "Yes. Bluebuff games are built with lightweight HTML5 and WebGL technology, ensuring fast loading and smooth performance on school Chromebooks, Windows, Macs, iPhones, Androids, and tablets."
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeCollectionSchema) }}
      />

      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-6 space-y-6 sm:space-y-10">
        {!hasGames && (
          <div className="text-center py-32 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(var(--primary-rgb),0.15)] border border-primary/20">
              <Gamepad2 className="w-10 h-10 text-primary-light" />
            </div>
            <h2 className="text-3xl font-bold text-text-main mb-4 tracking-tight">Welcome to {siteName}!</h2>
            <p className="text-text-secondary max-w-md mx-auto text-lg leading-relaxed">
              Your database is connected, but no published games were found yet. Head over to the admin dashboard to upload and publish some games.
            </p>
          </div>
        )}

        {userRecentGames.length > 0 && (
          <ContinuePlayingRow games={userRecentGames} />
        )}

        {/* Featured Games */}
        {featuredGames.length > 0 && (
          <HorizontalGameSection
            title="Featured Games"
            icon={Crown}
            categorySlug="featured"
            games={featuredGames}
          />
        )}

        {initialAllGames.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-orange-400" />
                All Games
              </h1>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 xl:grid-cols-12 auto-rows-[minmax(85px,auto)] md:auto-rows-[minmax(110px,auto)] gap-2 sm:gap-2.5 grid-flow-dense pb-6">
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
                      priority={index < 12}
                    />
                  </div>
                );
              })}
              
              <InfiniteGameGrid 
                initialPage={1} 
                sortType="popular" 
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

        {/* SEO Editorial Content & FAQ Section */}
        {hasGames && (
          <footer className="bg-black rounded-2xl p-6 sm:p-8 border border-zinc-800/80 space-y-6 text-xs text-zinc-400">
            <div className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                Play Free Online Games on {siteName}
              </h2>
              <p className="leading-relaxed text-zinc-300">
                {siteName} is your ultimate destination for instant, free browser games. We host over a thousand high-quality games across every genre—action, adventure, puzzle, sports, racing, shooting, and IO games. All games run directly in your web browser with zero downloads, no installation, and no registration required.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-start gap-3 p-3.5 bg-zinc-900 border border-zinc-800/80 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-white text-xs">Instant No-Download Play</div>
                  <p className="text-zinc-400 text-[11px] mt-0.5 leading-relaxed">Click and play in seconds with lightweight HTML5 & WebGL emulation.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-[#121214] border border-zinc-800/80 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0 text-sky-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-white text-xs">Works on All Devices</div>
                  <p className="text-zinc-400 text-[11px] mt-0.5 leading-relaxed">Fully responsive controls on PC, Mac, Chromebook, iPhone, and Android.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-[#121214] border border-zinc-800/80 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-white text-xs">Safe & Family Friendly</div>
                  <p className="text-zinc-400 text-[11px] mt-0.5 leading-relaxed">Clean, curated browser gaming experience safe for players of all ages.</p>
                </div>
              </div>
            </div>

            {/* Split Grid: Categories & FAQ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-zinc-800/80">
              {/* Popular Categories */}
              <div className="lg:col-span-5 space-y-3">
                <h3 className="font-bold text-xs text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5 text-orange-400" />
                  Popular Game Categories
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: "Action Games", href: "/category/action", icon: Zap, color: "text-amber-400" },
                    { name: "Puzzle Games", href: "/category/puzzle", icon: Puzzle, color: "text-emerald-400" },
                    { name: "Racing Games", href: "/category/racing", icon: Car, color: "text-rose-400" },
                    { name: "Sports Games", href: "/category/sports", icon: Trophy, color: "text-orange-400" },
                    { name: "Shooting Games", href: "/category/shooting", icon: Crosshair, color: "text-red-400" },
                    { name: "IO Games", href: "/category/io", icon: Globe, color: "text-cyan-400" },
                    { name: "Adventure Games", href: "/category/adventure", icon: Compass, color: "text-blue-400" },
                    { name: "Arcade Games", href: "/category/arcade", icon: Gamepad2, color: "text-purple-400" },
                  ].map((cat) => (
                    <Link
                      key={cat.name}
                      href={cat.href}
                      className="flex items-center gap-2 px-2.5 py-2 bg-[#121214] hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-all text-[11px] font-medium group"
                    >
                      <cat.icon className={`w-3.5 h-3.5 ${cat.color} group-hover:scale-110 transition-transform shrink-0`} />
                      <span className="truncate">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Homepage FAQ */}
              <div className="lg:col-span-7 space-y-3">
                <h3 className="font-bold text-xs text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                  Frequently Asked Questions
                </h3>
                <div className="space-y-2">
                  {homeFaqs.map((faq, i) => (
                    <details key={i} className="group p-3 bg-[#121214] border border-zinc-800/60 hover:border-zinc-700/80 rounded-xl cursor-pointer transition-colors">
                      <summary className="text-xs font-semibold text-zinc-200 group-hover:text-white list-none flex justify-between items-center select-none gap-2">
                        <span>{faq.q}</span>
                        <ChevronDown className="w-4 h-4 text-zinc-500 group-open:rotate-180 group-hover:text-zinc-400 transition-transform duration-200 shrink-0" />
                      </summary>
                      <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                        {faq.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>
    </>
  );
}
