"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  X, Copy, Check, Share2, Send, ExternalLink 
} from "lucide-react";
import GameImage from "./GameImage";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug?: string;
  title?: string;
  thumbnailUrl?: string;
  category?: string;
  url?: string;
}

function getInitialGameInfo(initialTitle?: string, initialThumbnail?: string, initialCategory?: string) {
  let resolvedTitle = initialTitle || "";
  let resolvedThumb = initialThumbnail || "";
  let resolvedCat = initialCategory || "";

  if (typeof document !== "undefined") {
    if (!resolvedTitle) {
      const h1 = document.querySelector("h1");
      if (h1?.textContent) {
        resolvedTitle = h1.textContent.trim();
      } else {
        const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute("content");
        resolvedTitle = ogTitle 
          ? ogTitle.split("–")[0].replace(/^Play\s+/i, "").trim() 
          : document.title.split("–")[0].replace(/^Play\s+/i, "").trim();
      }
    }

    if (!resolvedThumb) {
      resolvedThumb = document.querySelector('meta[property="og:image"]')?.getAttribute("content") || "";
    }

    if (!resolvedCat) {
      const breadcrumbLinks = document.querySelectorAll('nav[aria-label="Breadcrumb"] a');
      if (breadcrumbLinks.length > 1) {
        resolvedCat = breadcrumbLinks[1].textContent?.trim() || "";
      }
    }
  }

  return {
    title: resolvedTitle,
    thumbnailUrl: resolvedThumb,
    category: resolvedCat,
  };
}

export default function ShareModal({
  isOpen,
  onClose,
  slug,
  title: initialTitle,
  thumbnailUrl: initialThumbnail,
  category: initialCategory,
  url: initialUrl,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedPlayStore, setCopiedPlayStore] = useState(false);
  const playStoreUrl = process.env.NEXT_PUBLIC_PLAY_STORE_URL || "https://play.google.com/store/apps/details?id=in.bluebuff.games";
  const [canNativeShare] = useState(() => 
    typeof navigator !== "undefined" && typeof navigator.share === "function"
  );

  const [gameInfo, setGameInfo] = useState(() =>
    getInitialGameInfo(initialTitle, initialThumbnail, initialCategory)
  );

  // Calculate the share URL
  const shareUrl = useMemo(() => {
    if (initialUrl) return initialUrl;
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    return "";
  }, [initialUrl]);

  // Keep state updated when modal opens or slug changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    // Refresh from DOM or props if needed
    const fresh = getInitialGameInfo(initialTitle, initialThumbnail, initialCategory);
    if (fresh.title || fresh.thumbnailUrl) {
      queueMicrotask(() => {
        if (isMounted) {
          setGameInfo((prev) => {
            if (prev.title && prev.thumbnailUrl) return prev;
            return {
              title: fresh.title || prev.title,
              thumbnailUrl: fresh.thumbnailUrl || prev.thumbnailUrl,
              category: fresh.category || prev.category,
            };
          });
        }
      });
    }

    // Query API if slug exists to guarantee high resolution artwork
    if (slug) {
      fetch(`/api/games/${slug}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!isMounted) return;
          if (data?.game) {
            setGameInfo((prev) => ({
              title: data.game.title || prev.title,
              thumbnailUrl: data.game.thumbnailUrl || prev.thumbnailUrl,
              category: Array.isArray(data.game.category) && data.game.category.length > 0 
                ? data.game.category[0] 
                : prev.category,
            }));
          }
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, slug, initialTitle, initialThumbnail, initialCategory]);

  // Handle ESC key and scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    if (!shareUrl) return;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  }, [shareUrl]);

  // Copy Play Store link to clipboard
  const handleCopyPlayStore = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!playStoreUrl) return;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(playStoreUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = playStoreUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopiedPlayStore(true);
      setTimeout(() => setCopiedPlayStore(false), 2000);
    } catch (err) {
      console.error("Failed to copy Play Store link:", err);
    }
  }, [playStoreUrl]);

  // Native share handler
  const handleNativeShare = useCallback(async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: gameInfo.title || "Play Free Game on Bluebuff",
        text: `Play ${gameInfo.title || "this game"} free online on Bluebuff! No installation or download needed:`,
        url: shareUrl,
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Share failed:", err);
      }
    }
  }, [gameInfo.title, shareUrl]);

  if (!isOpen) return null;

  const displayTitle = gameInfo.title || "Free Online Game";
  const displayCategory = gameInfo.category || "Online Game";
  const shareMessage = `Play ${displayTitle} free online on Bluebuff! No download needed.`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm transition-all animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm sm:max-w-[420px] bg-[#121215] border border-white/[0.08] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 flex flex-col p-4 sm:p-5 space-y-3.5 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Bar */}
        <div className="sm:hidden flex justify-center -mt-1 pb-1">
          <div className="w-8 h-1 rounded-full bg-white/20" />
        </div>

        {/* ── 1. COMPACT GAME IDENTITY & CLOSE ROW ── */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07]">
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-zinc-800 shrink-0 border border-white/10 shadow-sm">
            <GameImage
              src={gameInfo.thumbnailUrl}
              alt={displayTitle}
              sizes="48px"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-300 capitalize">
                {displayCategory}
              </span>
              <span className="text-[10px] text-zinc-600">•</span>
              <span className="text-[10px] font-medium text-emerald-400">
                Free Instant Play
              </span>
            </div>
            <h3 id="share-modal-title" className="text-xs sm:text-sm font-semibold text-white truncate mt-0.5">
              {displayTitle}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] active:scale-95 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── 2. QUICK 1-TAP SOCIAL & NATIVE SHARE ICONS ── */}
        <div className="flex items-center justify-between px-1 pt-1">
          {/* WhatsApp */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${shareMessage} ${shareUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
            title="Share on WhatsApp"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#25D366] text-white flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-active:scale-95 shadow-md shadow-[#25D366]/25">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.067-2.222-.563-1.637-.676-2.684-2.347-2.766-2.457-.082-.11-1.02-1.357-1.02-2.589 0-1.231.644-1.838.873-2.091.229-.253.5-.316.666-.316.166 0 .333.002.478.009.155.008.363-.059.57.437.214.512.729 1.776.792 1.905.063.13.104.281.021.447-.083.167-.125.27-.25.416-.124.146-.263.327-.375.438-.124.125-.254.261-.109.511.145.25.645 1.066 1.385 1.724.954.848 1.758 1.11 2.008 1.234.25.125.395.104.541-.062.146-.167.624-.728.79-1.019.166-.291.332-.249.562-.166.229.083 1.456.687 1.706.812.25.125.416.187.478.291.062.104.062.604-.082 1.009z" />
              </svg>
            </div>
            <span className="text-[10px] font-medium text-zinc-300 group-hover:text-white transition-colors">
              WhatsApp
            </span>
          </a>

          {/* X / Twitter */}
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
            title="Share on X"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-black border border-white/20 text-white flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-active:scale-95 shadow-md shadow-white/5">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
            <span className="text-[10px] font-medium text-zinc-300 group-hover:text-white transition-colors">
              X
            </span>
          </a>

          {/* Telegram */}
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
            title="Share on Telegram"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#24A1DE] text-white flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-active:scale-95 shadow-md shadow-[#24A1DE]/25">
              <svg className="w-4.5 h-4.5 fill-current translate-x-[-1px] translate-y-[1px]" viewBox="0 0 24 24">
                <path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l-.313 4.693c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z" />
              </svg>
            </div>
            <span className="text-[10px] font-medium text-zinc-300 group-hover:text-white transition-colors">
              Telegram
            </span>
          </a>

          {/* Facebook */}
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
            title="Share on Facebook"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-active:scale-95 shadow-md shadow-[#1877F2]/25">
              <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <span className="text-[10px] font-medium text-zinc-300 group-hover:text-white transition-colors">
              Facebook
            </span>
          </a>

          {/* Native OS Share Button if available */}
          {canNativeShare && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
              title="More Share Options"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/[0.1] hover:bg-white/[0.18] text-white flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-active:scale-95 border border-white/[0.1] shadow-md">
                <Share2 className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-medium text-zinc-300 group-hover:text-white transition-colors">
                More
              </span>
            </button>
          )}
        </div>

        {/* ── 3. COMPACT COPY LINK BAR ── */}
        <div className="flex items-center gap-2 bg-[#09090b] border border-white/[0.08] rounded-xl p-1 pl-3 shadow-inner">
          <span className="text-xs text-zinc-400 font-mono truncate flex-1 min-w-0 select-all">
            {shareUrl}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 active:scale-95 shadow-sm ${
              copied
                ? "bg-emerald-500 text-white"
                : "bg-white hover:bg-zinc-200 text-black"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* ── 4. COMPACT GOOGLE PLAY CHIP ── */}
        <div className="flex items-center justify-between p-2 px-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs">
          <a
            href={playStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0"
            title="Download on Google Play Store"
          >
            {/* Google Play colored icon */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
              <path fill="#32BBFF" d="M396.121 229.173 34.445 19.532C25.061 14.118 14.968 13.418 6.458 17.696L261.929 256 396.121 229.173z" />
              <path fill="#32BBFF" d="m6.458 494.304 255.471-238.303L6.458 17.696C2.592 19.636 0 24.169 0 30.47v451.06c0 6.301 2.592 10.834 6.458 12.774z" />
              <path fill="#FFD700" d="M419.978 274.638 396.121 261.17 261.929 256l134.192 26.827 23.857 13.469c11.27-6.408 11.27-15.25 0-21.658z" />
              <path fill="#F3BC00" d="m396.121 282.827-361.676 209.64c9.084 5.203 19.018 4.66 27.547-.407L419.978 274.638 396.121 282.827z" />
              <path fill="#00F076" d="M261.929 256 6.458 17.696c-1.054.516-2.058 1.142-2.993 1.89L261.929 256z" />
              <path fill="#00DA65" d="M261.929 256 3.465 492.414c.934.748 1.939 1.374 2.993 1.89L261.929 256z" />
              <path fill="#FF3A44" d="M419.978 237.362 61.992 19.26C53.463 14.192 43.529 13.65 34.445 19.532L261.929 256 419.978 237.362z" />
            </svg>
            <span className="text-[11.5px] text-zinc-300 font-medium truncate">
              Get App on <span className="text-white font-semibold">Google Play</span>
            </span>
            <ExternalLink className="w-3 h-3 text-zinc-500" />
          </a>

          <button
            type="button"
            onClick={handleCopyPlayStore}
            className="text-[11px] text-zinc-400 hover:text-white shrink-0 pl-2 font-medium cursor-pointer transition-colors"
          >
            {copiedPlayStore ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" /> Copied
              </span>
            ) : (
              <span>Copy Link</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
