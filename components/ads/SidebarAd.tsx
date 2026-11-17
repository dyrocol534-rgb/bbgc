"use client";

import { useState } from "react";
import { SITE_CONFIG } from "@/lib/config";

interface SidebarAdProps {
  unitId?: string;
  className?: string;
  fallbackText?: string;
  fallbackUrl?: string;
}

export default function SidebarAd({
  unitId = SITE_CONFIG.ads.aadsSidebarUnitId,
  className = "",
  fallbackText = SITE_CONFIG.ads.fallbackText,
  fallbackUrl = SITE_CONFIG.ads.fallbackUrl,
}: SidebarAdProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // If ads are disabled in configuration
  if (!SITE_CONFIG.ads.enabled) {
    return null;
  }

  return (
    <div className={`w-full select-none ${className}`}>
      {/* Ad Attribution Tag - Positioned outside at the top */}
      <div className="flex items-center justify-end gap-1 mb-1 text-[9px] font-semibold text-zinc-400 tracking-wider select-none pr-1">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
        <span>AD</span>
      </div>

      {/* Ad Box Container - Halved height (compact & slim 56px) */}
      <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0c0e]/95 hover:border-white/[0.14] transition-all h-[56px] max-h-[56px] flex flex-col justify-center group shadow-sm">
        {/* Frame / Creative Container - Starts at the very top */}
        <div className="relative h-full w-full flex items-start justify-center overflow-hidden">
          {/* House Ad / Fallback (Visible before load or when blocked) */}
          <div
            className={`w-full h-full flex items-center justify-center px-2 text-center transition-opacity duration-300 ${
              isLoaded && !hasError ? "opacity-0 pointer-events-none absolute inset-0" : "opacity-100"
            }`}
          >
            <a
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono text-zinc-400 hover:text-white transition-colors tracking-tight flex items-center gap-1.5"
            >
              <span>{fallbackText}</span>
              <span className="text-blue-400 font-semibold underline decoration-blue-500/40 hover:decoration-blue-400">
                bluebuff.in
              </span>
            </a>
          </div>

          {/* BEGIN AADS AD UNIT 2462468 */}
          <div
            id="frame"
            className={`w-full h-full relative z-10 transition-opacity duration-300 ${
              isLoaded && !hasError ? "opacity-100" : "opacity-0 absolute inset-0 pointer-events-none"
            }`}
            style={{ width: "100%", height: "54px", margin: "0 auto", position: "relative" }}
          >
            <iframe
              data-aa={unitId}
              src={`//acceptable.a-ads.com/${unitId}/?size=Adaptive`}
              style={{
                border: 0,
                padding: 0,
                width: "100%",
                height: "54px",
                maxHeight: "54px",
                overflow: "hidden",
                display: "block",
                margin: "0 auto",
              }}
              title="Advertisement"
              loading="lazy"
              onLoad={() => setIsLoaded(true)}
              onError={() => setHasError(true)}
            />
          </div>
          {/* END AADS AD UNIT 2462468 */}
        </div>
      </div>
    </div>
  );
}
