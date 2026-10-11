"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Download, Check, Share, PlusSquare, X, Apple, ChevronRight, Globe } from "lucide-react";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=in.bluebuff.games";

export default function PWAInstallButton({
  variant = "icon",
  onInstall,
}: {
  variant?: "icon" | "menuItem" | "bottomBanner";
  onInstall?: () => void;
}) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check standalone PWA mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone || localStorage.getItem("pwa_installed") === "true") {
      setIsInstalled(true);
    }

    // Detect iOS (iPhone, iPad, iPod)
    const ua = window.navigator.userAgent;
    const iOSCheck =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(iOSCheck);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      localStorage.setItem("pwa_installed", "true");
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handlePWAInstall = async () => {
    if (isInstalled) {
      setToastMessage("App Already Installed! 🚀");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
        setDeferredPrompt(null);
        localStorage.setItem("pwa_installed", "true");
        if (onInstall) onInstall();

        try {
          const ua = navigator.userAgent;
          const deviceType = /Mobi|Android/i.test(ua)
            ? "Mobile"
            : /Tablet|iPad/i.test(ua)
            ? "Tablet"
            : "Desktop";
          await fetch("/api/pwa-install", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ deviceType, userAgent: ua }),
          });
        } catch (e) {
          // ignore tracking failure
        }
      }
      return;
    }

    // Fallback if beforeinstallprompt is unavailable
    setShowIOSModal(true);
  };

  const handlePlayStoreClick = () => {
    window.open(PLAY_STORE_URL, "_blank", "noopener,noreferrer");
    if (onInstall) onInstall();
  };

  const renderIOSModal = () => (
    <div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={() => setShowIOSModal(false)}
    >
      <div
        className="w-full max-w-[340px] bg-[#161618] border border-white/[0.1] rounded-[22px] p-4 shadow-2xl text-white relative animate-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[8px] bg-white/[0.08] border border-white/10 flex items-center justify-center p-1">
              <Image
                src="/logo.png"
                alt="Bluebuff"
                width={22}
                height={22}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-left">
              <h3 className="text-[13px] font-bold text-white leading-tight">
                {isIOS ? "Install on iOS" : "Install Web App"}
              </h3>
              <p className="text-[10px] text-zinc-400">Add to Home Screen in 3 steps</p>
            </div>
          </div>
          <button
            onClick={() => setShowIOSModal(false)}
            className="w-6 h-6 rounded-full bg-white/[0.08] hover:bg-white/[0.15] flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-1.5 py-3">
          <div className="flex items-center gap-2.5 p-2 rounded-[12px] bg-white/[0.04] border border-white/[0.06]">
            <div className="w-7 h-7 rounded-[7px] bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400">
              <Share className="w-3.5 h-3.5" />
            </div>
            <div className="text-left min-w-0 flex-1">
              <p className="text-[11.5px] font-semibold text-white leading-snug">1. Tap the Share button</p>
              <p className="text-[10px] text-zinc-400 leading-tight">
                Tap <span className="text-blue-400 font-medium">Share icon</span> in Safari’s toolbar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-[12px] bg-white/[0.04] border border-white/[0.06]">
            <div className="w-7 h-7 rounded-[7px] bg-white/[0.08] border border-white/10 flex items-center justify-center shrink-0 text-white">
              <PlusSquare className="w-3.5 h-3.5" />
            </div>
            <div className="text-left min-w-0 flex-1">
              <p className="text-[11.5px] font-semibold text-white leading-snug">
                2. Select &apos;Add to Home Screen&apos;
              </p>
              <p className="text-[10px] text-zinc-400 leading-tight">
                Scroll down and tap{" "}
                <span className="text-white font-medium">Add to Home Screen</span>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-[12px] bg-white/[0.04] border border-white/[0.06]">
            <div className="w-7 h-7 rounded-[7px] bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div className="text-left min-w-0 flex-1">
              <p className="text-[11.5px] font-semibold text-white leading-snug">3. Tap &apos;Add&apos; in top right</p>
              <p className="text-[10px] text-zinc-400 leading-tight">
                Launch instantly from home screen as full app!
              </p>
            </div>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={() => setShowIOSModal(false)}
          className="w-full py-2 bg-white hover:bg-zinc-200 active:scale-[0.98] text-black font-bold text-xs rounded-xl transition-all shadow-sm shadow-white/10 cursor-pointer"
        >
          Got it
        </button>
      </div>
    </div>
  );

  const renderPlayStoreBanner = () => (
    <button
      key="playstore-banner"
      onClick={handlePlayStoreClick}
      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#141416] hover:bg-[#1a1a1e] border border-white/[0.08] hover:border-white/[0.15] transition-all group text-left cursor-pointer active:scale-[0.98]"
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-sky-500/15 to-blue-500/15 border border-sky-500/25 flex items-center justify-center shrink-0">
          <svg className="w-3 h-3" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="#32BBFF"
              d="M396.121 229.173 34.445 19.532C25.061 14.118 14.968 13.418 6.458 17.696L261.929 256 396.121 229.173z"
            />
            <path
              fill="#32BBFF"
              d="m6.458 494.304 255.471-238.303L6.458 17.696C2.592 19.636 0 24.169 0 30.47v451.06c0 6.301 2.592 10.834 6.458 12.774z"
            />
            <path
              fill="#FFD700"
              d="M419.978 274.638 396.121 261.17 261.929 256l134.192 26.827 23.857 13.469c11.27-6.408 11.27-15.25 0-21.658z"
            />
            <path
              fill="#F3BC00"
              d="m396.121 282.827-361.676 209.64c9.084 5.203 19.018 4.66 27.547-.407L419.978 274.638 396.121 282.827z"
            />
            <path
              fill="#00F076"
              d="M261.929 256 6.458 17.696c-1.054.516-2.058 1.142-2.993 1.89L261.929 256z"
            />
            <path
              fill="#00DA65"
              d="M261.929 256 3.465 492.414c.934.748 1.939 1.374 2.993 1.89L261.929 256z"
            />
            <path
              fill="#FF3A44"
              d="M419.978 237.362 61.992 19.26C53.463 14.192 43.529 13.65 34.445 19.532L261.929 256 419.978 237.362z"
            />
            <path
              fill="#C31162"
              d="M261.929 256 34.445 492.468c9.084 5.882 19.018 5.34 27.547.272l358.986-218.103L261.929 256z"
            />
          </svg>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-semibold text-white truncate leading-none">Google Play App</span>
          <span className="text-[9px] text-zinc-400 truncate leading-tight mt-0.5">Free on Android</span>
        </div>
      </div>
      <span className="text-[9.5px] font-medium text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full shrink-0 group-hover:bg-sky-500/20 transition-colors flex items-center gap-0.5">
        Install ↗
      </span>
    </button>
  );

  const renderPWABanner = () => (
    <button
      key="pwa-banner"
      onClick={handlePWAInstall}
      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#141416] hover:bg-[#1a1a1e] border border-white/[0.08] hover:border-white/[0.15] transition-all group text-left cursor-pointer active:scale-[0.98]"
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500/15 to-purple-500/15 border border-indigo-500/25 flex items-center justify-center shrink-0">
          {isIOS ? (
            <Apple className="w-3 h-3 text-zinc-200" />
          ) : isInstalled ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <Download className="w-3 h-3 text-indigo-400" />
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-semibold text-white truncate leading-none">
            {isIOS ? "Install iOS App" : isInstalled ? "App Installed" : "Install Web App (PWA)"}
          </span>
          <span className="text-[9px] text-zinc-400 truncate leading-tight mt-0.5">
            {isIOS
              ? "Add to Home Screen"
              : isInstalled
              ? "Active on your device"
              : "iOS, Safari & Desktop"}
          </span>
        </div>
      </div>

      {isInstalled ? (
        <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-0.5">
          <Check className="w-2.5 h-2.5" />
          <span>Installed</span>
        </span>
      ) : (
        <span className="text-[9.5px] font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full shrink-0 group-hover:bg-indigo-500/20 transition-colors flex items-center gap-0.5">
          {isIOS ? "Add +" : "Install +"}
        </span>
      )}
    </button>
  );

  const renderWebsiteBanner = () => (
    <a
      key="website-banner"
      href="https://games.bluebuff.in"
      target="_blank"
      rel="noopener noreferrer"
      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#141416] hover:bg-[#1a1a1e] border border-white/[0.08] hover:border-white/[0.15] transition-all group text-left cursor-pointer active:scale-[0.98]"
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
          <Globe className="w-3 h-3 text-emerald-400" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-semibold text-white truncate leading-none">games.bluebuff.in</span>
          <span className="text-[9px] text-zinc-400 truncate leading-tight mt-0.5">Play on website</span>
        </div>
      </div>

      <span className="text-[9.5px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0 group-hover:bg-emerald-500/20 transition-colors flex items-center gap-0.5">
        Play ↗
      </span>
    </a>
  );

  if (variant === "bottomBanner") {
    return (
      <div className="w-full">
        {/* Compact Single-Row Platform Bar */}
        <div className="grid grid-cols-3 gap-1.5 w-full">
          {/* iOS / PWA Button */}
          <button
            onClick={handlePWAInstall}
            className="flex items-center justify-center gap-1.5 h-[34px] px-2 rounded-lg bg-[#141416] hover:bg-[#1a1a1e] border border-white/[0.08] hover:border-white/20 transition-all text-center group cursor-pointer active:scale-95"
            title={isIOS ? "Install iOS App" : isInstalled ? "App Installed" : "Install Web App"}
          >
            {isIOS ? (
              <svg className="w-3.5 h-3.5 fill-current text-white shrink-0" viewBox="0 0 170 170" xmlns="http://www.w3.org/2000/svg">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.7-7.94-12.04-14.58-6.19-9.49-10.9-20.47-14.13-32.96-3.23-12.49-4.85-24.16-4.85-35 0-15.69 4.16-28.84 12.49-39.46 8.32-10.61 18.88-16.03 31.68-16.24 4.8 0 10.23 1.25 16.29 3.75 6.05 2.5 10.12 3.86 12.21 4.08 1.9-.22 6.13-1.63 12.7-4.22 6.57-2.6 12.26-3.79 17.07-3.59 13.07.76 23.49 5.49 31.24 14.18-11.45 6.94-17.07 16.48-16.85 28.62.22 9.53 3.97 17.51 11.24 23.94 7.27 6.43 15.86 10.02 25.77 10.77-2.28 7.04-5.16 14.07-8.65 21.08zM119.22 31.84c0-7.39 2.66-14.47 7.99-21.24 5.33-6.77 11.95-10.6 19.86-11.5 1.08 7.39-1.42 14.42-7.49 21.08-6.07 6.67-12.86 10.55-20.36 11.66z" />
              </svg>
            ) : isInstalled ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <svg className="w-3.5 h-3.5 fill-current text-white shrink-0" viewBox="0 0 170 170" xmlns="http://www.w3.org/2000/svg">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.7-7.94-12.04-14.58-6.19-9.49-10.9-20.47-14.13-32.96-3.23-12.49-4.85-24.16-4.85-35 0-15.69 4.16-28.84 12.49-39.46 8.32-10.61 18.88-16.03 31.68-16.24 4.8 0 10.23 1.25 16.29 3.75 6.05 2.5 10.12 3.86 12.21 4.08 1.9-.22 6.13-1.63 12.7-4.22 6.57-2.6 12.26-3.79 17.07-3.59 13.07.76 23.49 5.49 31.24 14.18-11.45 6.94-17.07 16.48-16.85 28.62.22 9.53 3.97 17.51 11.24 23.94 7.27 6.43 15.86 10.02 25.77 10.77-2.28 7.04-5.16 14.07-8.65 21.08zM119.22 31.84c0-7.39 2.66-14.47 7.99-21.24 5.33-6.77 11.95-10.6 19.86-11.5 1.08 7.39-1.42 14.42-7.49 21.08-6.07 6.67-12.86 10.55-20.36 11.66z" />
              </svg>
            )}
            <span className="text-[11px] font-medium text-zinc-200 group-hover:text-white truncate">
              {isIOS ? "iOS App" : isInstalled ? "Installed" : "iOS App"}
            </span>
          </button>

          {/* Google Play Button */}
          <button
            onClick={handlePlayStoreClick}
            className="flex items-center justify-center gap-1.5 h-[34px] px-2 rounded-lg bg-[#141416] hover:bg-[#1a1a1e] border border-white/[0.08] hover:border-white/20 transition-all text-center group cursor-pointer active:scale-95"
            title="Download on Google Play Store"
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
              <path fill="#32BBFF" d="M396.121 229.173 34.445 19.532C25.061 14.118 14.968 13.418 6.458 17.696L261.929 256 396.121 229.173z" />
              <path fill="#32BBFF" d="m6.458 494.304 255.471-238.303L6.458 17.696C2.592 19.636 0 24.169 0 30.47v451.06c0 6.301 2.592 10.834 6.458 12.774z" />
              <path fill="#FFD700" d="M419.978 274.638 396.121 261.17 261.929 256l134.192 26.827 23.857 13.469c11.27-6.408 11.27-15.25 0-21.658z" />
              <path fill="#F3BC00" d="m396.121 282.827-361.676 209.64c9.084 5.203 19.018 4.66 27.547-.407L419.978 274.638 396.121 282.827z" />
              <path fill="#00F076" d="M261.929 256 6.458 17.696c-1.054.516-2.058 1.142-2.993 1.89L261.929 256z" />
              <path fill="#00DA65" d="M261.929 256 3.465 492.414c.934.748 1.939 1.374 2.993 1.89L261.929 256z" />
              <path fill="#FF3A44" d="M419.978 237.362 61.992 19.26C53.463 14.192 43.529 13.65 34.445 19.532L261.929 256 419.978 237.362z" />
              <path fill="#C31162" d="M261.929 256 34.445 492.468c9.084 5.882 19.018 5.34 27.547.272l358.986-218.103L261.929 256z" />
            </svg>
            <span className="text-[11px] font-medium text-zinc-200 group-hover:text-white truncate">
              Android
            </span>
          </button>

          {/* Website Button */}
          <a
            href="https://games.bluebuff.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 h-[34px] px-2 rounded-lg bg-[#141416] hover:bg-[#1a1a1e] border border-white/[0.08] hover:border-white/20 transition-all text-center group cursor-pointer active:scale-95"
            title="Play on games.bluebuff.in"
          >
            <Globe className="w-3.5 h-3.5 text-zinc-300 group-hover:text-white shrink-0" />
            <span className="text-[11px] font-medium text-zinc-200 group-hover:text-white truncate">
              Website
            </span>
          </a>
        </div>

        {/* Temporary toast */}
        {toastMessage && (
          <div className="text-center py-1 px-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] animate-in fade-in">
            {toastMessage}
          </div>
        )}

        {/* iOS / PWA Guide Modal */}
        {showIOSModal && renderIOSModal()}
      </div>
    );
  }

  if (variant === "menuItem") {
    return (
      <>
        <button
          onClick={handlePWAInstall}
          className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-white/[0.04] active:bg-white/[0.08] transition-colors group text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-[8px] bg-[#5856D6] text-white flex items-center justify-center shrink-0 shadow-sm">
              {isIOS ? <Apple className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[14px] font-medium text-white tracking-tight">
                {isIOS ? "Add to Home Screen" : isInstalled ? "App Installed" : "Install App"}
              </span>
              <span className="text-[11px] text-zinc-400">
                {isIOS ? "iOS Safari Web App" : "Play offline & fullscreen"}
              </span>
            </div>
          </div>
          {isInstalled ? (
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              Installed
            </span>
          ) : (
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
          )}
        </button>

        {showIOSModal && renderIOSModal()}
      </>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handlePWAInstall}
        className="group relative flex items-center justify-center w-[34px] h-[34px] sm:w-9 sm:h-9 rounded-full transition-all shrink-0 border border-dashed border-zinc-700/80 hover:border-zinc-500 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white"
        title={isIOS ? "Add to Home Screen (iOS)" : isInstalled ? "App Installed" : "Install App"}
        aria-label="Install Bluebuff Games"
      >
        {isInstalled ? (
          <Check className="w-4 h-4 text-emerald-400" />
        ) : isIOS ? (
          <Apple className="w-4 h-4 text-zinc-300 group-hover:text-white" />
        ) : (
          <Download className="w-4 h-4 text-zinc-300 group-hover:text-white transition-colors" />
        )}
      </button>

      {showIOSModal && renderIOSModal()}
    </div>
  );
}

