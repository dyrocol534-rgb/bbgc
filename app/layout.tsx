import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import Script from "next/script";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCachedPublishedCategories } from "@/lib/services/gameService";
import DisableInspect from "@/components/layout/DisableInspect";
import LazyWelcomeModal from "@/components/auth/LazyWelcomeModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Bluebuff Games";
const siteDescription = `Play 1000+ free online games instantly – no download, no login! Action, puzzle, racing, sports & more on ${siteName}. Works on PC, mobile & tablet. New games added daily!`;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://games.bluebuff.in/";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} – Free Online Games, No Download Needed!`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "unblocked games premium",
    "play free games online without downloading",
    "unblocked games at school",
    "unblocked browser games",
    "free html5 games unblocked",
    "play games without downloading or installing",
    "best unblocked games for school",
    "free online games to play when bored unblocked",
    "free multiplayer games no download unblocked",
    "play unblocked io games free",
    "no download web browser games",
    "fun games to play at school unblocked",
    "action games unblocked free",
    "puzzle games unblocked free",
    "racing games unblocked free",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: `${siteName} – Free Online Games, No Download Needed!`,
    description: siteDescription,
    siteName: siteName,
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: `${siteName} – Play 1000+ Free Browser Games`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} – Free Online Games, No Download Needed!`,
    description: siteDescription,
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteName,
  },
  category: "games",
};

export const viewport = {
  themeColor: "#09090b",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [session, categories] = await Promise.all([
    getServerSession(authOptions),
    getCachedPublishedCategories(),
  ]);
  const isAdmin = session?.user?.email === (process.env.ADMIN_EMAIL || "tusharkantanayak713@gmail.com");
  const isProd = process.env.NODE_ENV === "production";
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}#website`,
    name: siteName,
    url: siteUrl,
    description: siteDescription,
    inLanguage: "en",
    publisher: {
      "@type": "Organization",
      "@id": `${siteUrl}#organization`,
      name: siteName,
      url: siteUrl,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en" className="dark h-full antialiased text-zinc-100 bg-background">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <link rel="preconnect" href="https://img.gamedistribution.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col bg-background text-text-main`}>
        {/* Google Analytics */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-XL79QHW97L" strategy="lazyOnload" />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-XL79QHW97L');
          `}
        </Script>
        
        {/* PWA Service Worker Registration */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  },
                  function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  }
                );
              });
            }
          `}
        </Script>
        
        <DisableInspect />
        
        <Providers>
          <Navbar />
          <LazyWelcomeModal />
          <div className="flex flex-1 pt-16 w-full">
            <Sidebar initialCategories={categories} />
            <main className="flex-1 min-w-0 flex flex-col">
              {children}
              <Footer />
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
