import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Bluebuff Games";
const siteDescription = `Play the best free online HTML5 and Unity WebGL games directly in your browser on ${siteName}. No downloads, instant play!`;
const siteUrl = "https://games.bluebuff.in/";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} - Free HTML5 Browser Games`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: ["free games", "browser games", "html5 games", "unblocked games", "online games", "arcade", "webgl games", "play instantly"],
  authors: [{ name: siteName }],
  creator: siteName,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: `${siteName} - Free HTML5 Browser Games`,
    description: siteDescription,
    siteName: siteName,
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: `${siteName} Logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} - Free HTML5 Browser Games`,
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased text-zinc-100 bg-background">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col bg-background text-text-main`}>
        {/* Google Analytics */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-XL79QHW97L" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-XL79QHW97L');
          `}
        </Script>
        <Providers>
          <Navbar />
          <div className="flex flex-1 pt-16 w-full">
            <Sidebar />
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
