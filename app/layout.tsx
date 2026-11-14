import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import Script from "next/script";
import { getCachedPublishedCategories } from "@/lib/services/gameService";
import DisableInspect from "@/components/layout/DisableInspect";
import LazyWelcomeModal from "@/components/auth/LazyWelcomeModal";
import NotificationPrompt from "@/components/notifications/NotificationPrompt";
import { SITE_CONFIG } from "@/lib/config";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Bluebuff Games";
const siteDescription = `Play 1000+ free online games instantly – no download, no login! Action, puzzle, racing, sports, shooting & io games on ${siteName}. Works seamlessly on PC, mobile & tablet. New games added daily!`;
const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://games.bluebuff.in";
const siteUrl = rawSiteUrl.replace(/\/+$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} – Play Free Online Games (No Download, No Install)`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "play free games online",
    "unblocked games premium",
    "free online games no download",
    "unblocked browser games at school",
    "play games without downloading or installing",
    "html5 games unblocked",
    "free web games to play when bored",
    "best unblocked games for school chromebook",
    "multiplayer games no download unblocked",
    "play unblocked io games free",
    "instant browser games",
    "action games free online",
    "puzzle games free online",
    "racing games unblocked free",
    "shooting games no download",
    "fun mobile browser games",
    "bluebuff games",
  ],
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: `${siteName} – Play 1000+ Free Online Games Instantly`,
    description: siteDescription,
    siteName: siteName,
    images: [
      {
        url: `${siteUrl}/logo.png`,
        width: 1200,
        height: 630,
        alt: `${siteName} – Play Free Browser Games Online Without Downloading`,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} – Play Free Online Games (No Download)`,
    description: siteDescription,
    images: [`${siteUrl}/logo.png`],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
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
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCachedPublishedCategories();
  const websiteSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: siteName,
        url: siteUrl,
        description: siteDescription,
        inLanguage: "en-US",
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: siteName,
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/logo.png`,
          width: 512,
          height: 512,
        },
        sameAs: [
          "https://bluebuff.in",
        ],
      },
    ],
  };

  return (
    <html lang="en" className="dark h-full antialiased text-zinc-100 bg-background">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <link rel="preconnect" href="https://img.gamedistribution.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://img.gamemonetize.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://html5.gamedistribution.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://html5.gamemonetize.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://img.gamedistribution.com" />
        <link rel="dns-prefetch" href="https://img.gamemonetize.com" />
        <link rel="dns-prefetch" href="https://html5.gamedistribution.com" />
        <link rel="dns-prefetch" href="https://html5.gamemonetize.com" />
      </head>
      <body className={`min-h-screen flex flex-col bg-background text-text-main`}>
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
          {SITE_CONFIG.showNotificationPrompt && <NotificationPrompt />}
          <div className="flex flex-1 pt-14 sm:pt-16 w-full">
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
