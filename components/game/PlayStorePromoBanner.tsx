"use client";

import { useState, useEffect } from "react";
import { Gamepad2, X, ChevronRight, Star } from "lucide-react";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=in.bluebuff.games";

export default function PlayStorePromoBanner() {
  const [isDismissed, setIsDismissed] = useState(true);
  const [isInApp, setIsInApp] = useState(false);

  useEffect(() => {
    // 1. Session dismiss check
    const dismissed = sessionStorage.getItem("dismissed_play_store_banner");
    if (!dismissed) {
      setIsDismissed(false);
    }

    // 2. Detect if user is running inside the Android / Capacitor App
    const detectInApp = async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (Capacitor.isNativePlatform()) {
          setIsInApp(true);
          return;
        }
      } catch (e) {}

      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;

      const isAndroidApp =
        /wv|Android.*Version\/[0-9]\.[0-9]/i.test(navigator.userAgent) ||
        navigator.userAgent.includes("in.bluebuff.games");

      if (isStandalone || isAndroidApp) {
        setIsInApp(true);
      }
    };

    detectInApp();
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDismissed(true);
    sessionStorage.setItem("dismissed_play_store_banner", "true");
  };

  const handleBannerClick = async (e: React.MouseEvent) => {
    if (isInApp) {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (Capacitor.isNativePlatform()) {
          e.preventDefault();
          const { Browser } = await import("@capacitor/browser");
          await Browser.open({ url: PLAY_STORE_URL });
        }
      } catch (err) {}
    }
  };

  if (isDismissed) return null;

  return (
    <div className="relative w-full my-3 sm:my-3.5">
      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleBannerClick}
        className="group relative w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#0B0F19] via-[#111827] to-[#1E112A] py-3 px-4 sm:py-3.5 sm:px-6 flex items-center justify-between gap-3 sm:gap-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_12px_36px_rgba(99,102,241,0.22)] border border-white/10 hover:border-violet-500/30 transition-all duration-300 transform-gpu cursor-pointer block"
      >
        {/* Ambient Top Glow & Neon Corner Accents */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/15 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-cyan-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Left Section: Tag, Text, Mascot */}
        <div className="flex items-center gap-3 sm:gap-5 min-w-0 z-10">
          <div className="flex flex-col min-w-0">
            {/* Tag Badge */}
            <div className="mb-1 self-start">
              {isInApp ? (
                <span className="inline-flex items-center gap-1.5 bg-amber-400/15 border border-amber-300/30 text-amber-300 font-bold text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
                  <Star className="w-3 h-3 text-amber-300 fill-amber-300 shrink-0" />
                  <span>SUPPORT US</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-white/[0.07] border border-white/[0.12] text-zinc-200 font-bold text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
                  <Gamepad2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>GOOGLE PLAY APP</span>
                </span>
              )}
            </div>

            {/* Headline */}
            <h3 className="text-white font-black text-xs sm:text-sm md:text-base tracking-tight leading-snug drop-shadow-sm">
              {isInApp 
                ? "Enjoying Bluebuff? Leave us a review on Google Play!" 
                : "Play 1,000+ Games on the Bluebuff Android App!"}
            </h3>

            {/* Subtitle */}
            <p className="hidden sm:block text-zinc-400 text-[11px] md:text-xs font-medium leading-normal mt-0.5">
              {isInApp 
                ? "Your 5-star rating helps us bring you more awesome games & updates." 
                : "Instant play, fullscreen mode & faster loading on your device."}
            </p>
          </div>

          {/* Peeking Cyber Gamer Bot Mascot */}
          <div className="hidden sm:flex relative shrink-0 self-end -mb-3.5 pointer-events-none select-none">
            <svg 
              className="w-16 h-12 md:w-20 md:h-15 overflow-visible transform group-hover:scale-105 group-hover:-translate-y-0.5 transition-all duration-300" 
              viewBox="0 0 120 80" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="botBodyGrad" x1="60" y1="18" x2="60" y2="80" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="50%" stopColor="#1E293B" />
                  <stop offset="100%" stopColor="#0F172A" />
                </linearGradient>

                <linearGradient id="visorGrad" x1="60" y1="28" x2="60" y2="64" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#0B0F19" />
                  <stop offset="100%" stopColor="#030712" />
                </linearGradient>

                <linearGradient id="cyanGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#67E8F9" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>

                <linearGradient id="headsetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#4338CA" />
                </linearGradient>

                <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Antenna */}
              <path d="M60 20 V8" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="60" cy="7" r="5" fill="#38BDF8" filter="url(#neonGlow)" opacity="0.6" />
              <circle cx="60" cy="7" r="3" fill="#22D3EE" />
              <circle cx="59" cy="6" r="1" fill="#FFFFFF" />

              {/* Gaming Headset Arc */}
              <path d="M26 38 C26 15, 94 15, 94 38" stroke="url(#headsetGrad)" strokeWidth="4" strokeLinecap="round" fill="none" />

              {/* Headset Ear Cups */}
              <rect x="18" y="32" width="10" height="20" rx="5" fill="#1E1B4B" stroke="#818CF8" strokeWidth="1.5" />
              <rect x="20" y="36" width="3" height="12" rx="1.5" fill="#A5B4FC" opacity="0.8" />
              <rect x="92" y="32" width="10" height="20" rx="5" fill="#1E1B4B" stroke="#818CF8" strokeWidth="1.5" />
              <rect x="97" y="36" width="3" height="12" rx="1.5" fill="#A5B4FC" opacity="0.8" />

              {/* Robot Head / Helmet */}
              <path d="M24 80 C24 30, 36 18, 60 18 C84 18, 96 30, 96 80 Z" fill="url(#botBodyGrad)" stroke="#475569" strokeWidth="1.5" />

              {/* Visor Area */}
              <path d="M32 58 C32 34, 40 28, 60 28 C80 28, 88 34, 88 58 C88 64, 80 66, 60 66 C40 66, 32 64, 32 58 Z" fill="url(#visorGrad)" stroke="#0EA5E9" strokeWidth="1" strokeOpacity="0.7" />

              {/* Visor Gloss Reflection */}
              <path d="M38 34 C44 31, 54 30, 64 30" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.25" />

              {/* Glowing LED Eyes */}
              <rect x="42" y="39" width="9" height="13" rx="4.5" fill="url(#cyanGlow)" filter="url(#neonGlow)" />
              <circle cx="45" cy="42" r="2" fill="#FFFFFF" />
              <circle cx="47.5" cy="48" r="1" fill="#FFFFFF" opacity="0.8" />

              <rect x="69" y="39" width="9" height="13" rx="4.5" fill="url(#cyanGlow)" filter="url(#neonGlow)" />
              <circle cx="72" cy="42" r="2" fill="#FFFFFF" />
              <circle cx="74.5" cy="48" r="1" fill="#FFFFFF" opacity="0.8" />

              {/* Cyber Blush */}
              <rect x="36" y="52" width="5" height="2" rx="1" fill="#F43F5E" opacity="0.7" />
              <rect x="79" y="52" width="5" height="2" rx="1" fill="#F43F5E" opacity="0.7" />

              {/* Cute LED Mouth */}
              <path d="M57 53 Q60 56 63 53" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />

              {/* Robotic Paws / Hands */}
              <rect x="33" y="73" width="16" height="8" rx="4" fill="#1E293B" stroke="#0EA5E9" strokeWidth="1.5" />
              <circle cx="38" cy="76" r="1.2" fill="#38BDF8" />
              <circle cx="44" cy="76" r="1.2" fill="#38BDF8" />

              <rect x="71" y="73" width="16" height="8" rx="4" fill="#1E293B" stroke="#0EA5E9" strokeWidth="1.5" />
              <circle cx="76" cy="76" r="1.2" fill="#38BDF8" />
              <circle cx="82" cy="76" r="1.2" fill="#38BDF8" />
            </svg>
          </div>
        </div>

        {/* Right Section: CTA Button & Dismiss */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 z-10">
          {isInApp ? (
            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 active:scale-95 text-black font-extrabold text-[11px] sm:text-xs md:text-sm px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-lg shadow-black/25 group-hover:shadow-[0_6px_20px_rgba(251,191,36,0.4)] transition-all duration-200 select-none">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-950 fill-amber-950 shrink-0" />
              <span className="whitespace-nowrap">Review on Google Play</span>
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-black/70 group-hover:translate-x-0.5 transition-transform" />
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white hover:bg-zinc-100 active:scale-95 text-black font-extrabold text-[11px] sm:text-xs md:text-sm px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-lg shadow-black/30 group-hover:shadow-[0_6px_24px_rgba(255,255,255,0.3)] transition-all duration-200 select-none">
              {/* Google Play Triangle SVG */}
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M3.6 1.7C3.2 2.1 3 2.8 3 3.7v16.6c0 .9.2 1.6.6 2l.1.1 9.6-9.6v-.3L3.7 1.6l-.1.1z"/>
                <path fill="#FBBC04" d="m16.5 15.8-3.2-3.3v-.3l3.2-3.3.1.1 3.8 2.2c1.1.6 1.1 1.6 0 2.2l-3.9 2.3z"/>
                <path fill="#EA4335" d="m13.3 12.5-9.6 9.6c.5.5 1.3.6 2.2.1l10.7-6.1-3.3-3.6z"/>
                <path fill="#34A853" d="m13.3 11.5 3.3-3.6L5.9 1.8c-.9-.5-1.7-.4-2.2.1l9.6 9.6z"/>
              </svg>
              <span className="whitespace-nowrap">Get the App</span>
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-black/70 group-hover:translate-x-0.5 transition-transform" />
            </div>
          )}

          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/[0.08] hover:bg-white/[0.18] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Dismiss"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </a>
    </div>
  );
}
