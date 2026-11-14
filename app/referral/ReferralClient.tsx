"use client";

import { useState } from "react";
import { Copy, Check, Share2, Send, Gift } from "lucide-react";

interface ReferralClientProps {
  referralCode: string;
}

export default function ReferralClient({ referralCode }: ReferralClientProps) {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const referralLink = `${origin}/login?ref=${referralCode}`;
  const shareText = `Play 1000+ free online games on Bluebuff! Use my invite code ${referralCode} to claim your bonus XP!`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {}
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Play Free Games on Bluebuff",
          text: shareText,
          url: referralLink,
        });
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-zinc-950 border border-zinc-900 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Code Display Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Gift className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Your Personal Invite Code
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-lg sm:text-xl font-black text-white tracking-wider">
                {referralCode}
              </span>
            </div>
          </div>
        </div>

        {/* Copy Code Button */}
        <button
          onClick={handleCopyCode}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 active:bg-zinc-300 text-black text-xs font-bold transition-all cursor-pointer shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Code Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-black" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Link Row */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-medium text-zinc-400">Shareable Invite Link</span>
        <div className="flex items-center gap-2 bg-black border border-zinc-900 rounded-lg p-1 pl-3">
          <p className="font-mono text-xs text-zinc-300 truncate flex-1 min-w-0">
            {referralLink}
          </p>
          <button
            onClick={handleCopyLink}
            className="shrink-0 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Social Share Icons Row (Single Line, Official Icons) */}
      <div className="flex items-center gap-2.5 pt-2 border-t border-zinc-900">
        <span className="text-xs text-zinc-500 font-medium shrink-0">Share via:</span>
        <div className="flex items-center gap-2">
          {/* WhatsApp */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + referralLink)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/25 text-[#25D366] flex items-center justify-center transition-colors active:scale-95"
            title="Share on WhatsApp"
            aria-label="Share on WhatsApp"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.067-2.222-.563-1.637-.676-2.684-2.347-2.766-2.457-.082-.11-1.02-1.357-1.02-2.589 0-1.231.644-1.838.873-2.091.229-.253.5-.316.666-.316.166 0 .333.002.478.009.155.008.363-.059.57.437.214.512.729 1.776.792 1.905.063.13.104.281.021.447-.083.167-.125.27-.25.416-.124.146-.263.327-.375.438-.124.125-.254.261-.109.511.145.25.645 1.066 1.385 1.724.954.848 1.758 1.11 2.008 1.234.25.125.395.104.541-.062.146-.167.624-.728.79-1.019.166-.291.332-.249.562-.166.229.083 1.456.687 1.706.812.25.125.416.187.478.291.062.104.062.604-.082 1.009z" />
            </svg>
          </a>

          {/* Twitter / X */}
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-colors active:scale-95"
            title="Share on X"
            aria-label="Share on X"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>

          {/* Telegram */}
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg bg-[#2AABEE]/10 hover:bg-[#2AABEE]/20 border border-[#2AABEE]/25 text-[#2AABEE] flex items-center justify-center transition-colors active:scale-95"
            title="Share on Telegram"
            aria-label="Share on Telegram"
          >
            <Send className="w-3.5 h-3.5 translate-x-[-0.5px]" />
          </a>

          {/* More Apps / Native Share */}
          <button
            onClick={handleNativeShare}
            className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            title="More Options"
            aria-label="More Options"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
