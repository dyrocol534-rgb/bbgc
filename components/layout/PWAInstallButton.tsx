"use client";

import { useEffect, useState } from "react";

function AppInstallIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <circle cx="12" cy="18.5" r="0.8" fill="currentColor" stroke="none" />
      <line x1="12" y1="6" x2="12" y2="13" />
      <polyline points="9 10.5 12 13.5 15 10.5" />
    </svg>
  );
}

export default function PWAInstallButton({ variant = "icon", onInstall }: { variant?: "icon" | "menuItem", onInstall?: () => void }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }
    const handler = (e: any) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => { setIsInstalled(true); setDeferredPrompt(null); });
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      alert("App installation is not available on this device or browser, or it's already installed.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") { 
      setIsInstalled(true); 
      setDeferredPrompt(null); 
      if (onInstall) onInstall();
      
      try {
        const ua = navigator.userAgent;
        const deviceType = /Mobi|Android/i.test(ua) ? "Mobile" : /Tablet|iPad/i.test(ua) ? "Tablet" : "Desktop";
        await fetch("/api/pwa-install", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceType, userAgent: ua })
        });
      } catch (e) {
        console.error("Failed to track install", e);
      }
    }
  };

  if (isInstalled) return null;

  if (variant === "menuItem") {
    return (
      <button
        onClick={handleInstall}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold group text-left transition-all bg-[#12111a] border border-[#282142] hover:bg-[#161521] hover:border-[#382e5c]"
      >
        <div className="relative flex items-center justify-center w-8 h-8 shrink-0 rounded bg-[#1f1d2e] border border-[#312d4a] text-indigo-400 group-hover:text-indigo-300 transition-colors">
          <AppInstallIcon className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-zinc-100 group-hover:text-white transition-colors mb-0.5">Install Web App</span>
          <span className="text-[10px] text-[#716a93] font-medium leading-tight">Play instantly from home screen</span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={handleInstall}
      className="group relative flex items-center justify-center p-2 rounded-full bg-gradient-to-tr from-indigo-600/20 to-purple-500/20 hover:from-indigo-600/40 hover:to-purple-500/40 border border-indigo-500/30 hover:border-indigo-400/50 transition-all shadow-[0_0_15px_rgba(99,102,241,0.15)] hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]"
      title="Install App"
      aria-label="Install Bluebuff Games app"
    >
      <AppInstallIcon className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
      <span className="absolute -bottom-10 right-0 w-max opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity bg-zinc-800 text-xs text-white px-2 py-1 rounded shadow-lg hidden sm:block">
        Install App
      </span>
    </button>
  );
}
