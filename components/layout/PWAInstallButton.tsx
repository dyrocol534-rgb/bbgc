"use client";

import { useEffect, useState } from "react";
import { Download, Check, CheckCircle2 } from "lucide-react";

export default function PWAInstallButton({ variant = "icon", onInstall }: { variant?: "icon" | "menuItem", onInstall?: () => void }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if launched as standalone PWA
      if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone) {
        setIsInstalled(true);
      }
      
      // Also check localStorage in case it was installed in this browser before
      if (localStorage.getItem("pwa_installed") === "true") {
        setIsInstalled(true);
      }
    }

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

  const handleInstall = async () => {
    if (isInstalled) {
      setStatusMessage("App Already Installed! 🚀");
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    if (!deferredPrompt) {
      if (/iPhone|iPad/i.test(navigator.userAgent)) {
        alert("To install on iOS: tap the Share button in Safari and select 'Add to Home Screen'.");
        return;
      }
      setStatusMessage("Already installed on this device!");
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") { 
      setIsInstalled(true); 
      setDeferredPrompt(null); 
      localStorage.setItem("pwa_installed", "true");
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

  if (variant === "menuItem") {
    return (
      <button
        onClick={handleInstall}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold group text-left transition-all bg-[#12111a] border border-[#282142] hover:bg-[#161521] hover:border-[#382e5c]"
      >
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 shrink-0 rounded bg-[#1f1d2e] border border-[#312d4a] text-blue-400 group-hover:text-blue-300 transition-colors">
            {isInstalled ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-zinc-100 group-hover:text-white transition-colors mb-0.5">
              {isInstalled ? "App Installed" : "Install Web App"}
            </span>
            <span className="text-[10px] text-[#716a93] font-medium leading-tight">
              {isInstalled ? "Active on your device" : "Play instantly from home screen"}
            </span>
          </div>
        </div>

        {isInstalled && (
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            Installed
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleInstall}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`group relative flex items-center justify-center w-[34px] h-[34px] sm:w-9 sm:h-9 rounded-full transition-all shrink-0 ${
          isInstalled
            ? "border border-blue-500/50 bg-blue-500/15 text-blue-300 hover:border-blue-400 hover:bg-blue-500/25"
            : "border border-dashed border-zinc-700/80 hover:border-zinc-500 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white"
        }`}
        title={isInstalled ? "App Already Installed" : "Install App"}
        aria-label={isInstalled ? "App Installed" : "Install Bluebuff Games app"}
      >
        {isInstalled ? (
          <Check className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
        ) : (
          <Download className="w-4 h-4 text-zinc-300 group-hover:text-white transition-colors" />
        )}

        {/* Tooltip */}
        {(showTooltip || statusMessage) && (
          <div className="absolute -bottom-9 right-0 w-max z-50 pointer-events-none bg-zinc-900 border border-zinc-700 text-xs text-white px-2.5 py-1 rounded hidden sm:block whitespace-nowrap">
            {statusMessage || (isInstalled ? "App Already Installed ✅" : "Install Web App 📥")}
          </div>
        )}
      </button>
    </div>
  );
}
