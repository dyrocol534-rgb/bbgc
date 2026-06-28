import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "TapAndPlay";
export const metadata: Metadata = {
  title: `${siteName} - Free HTML5 Browser Games & Unblocked Arcade`,
  description: `Play the best free online HTML5 and Unity WebGL games directly in your browser on ${siteName}. No downloads, instant play!`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased text-zinc-100 bg-background">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col bg-background text-text-main`}>
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
