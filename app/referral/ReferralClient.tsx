"use client";

import { useState } from "react";
import { Copy, Check, MessageCircle, Share2, Sparkles, Gift } from "lucide-react";

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

      {/* Social Share Buttons Row */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-900">
        <span className="text-xs text-zinc-500 font-medium mr-1">Share via:</span>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + referralLink)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/15 border border-[#25D366]/20 text-[#25D366] text-xs font-medium transition-colors"
          title="Share on WhatsApp"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/15 border border-sky-500/20 text-sky-400 text-xs font-medium transition-colors"
          title="Share on Twitter / X"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Twitter / X</span>
        </a>
        <button
          onClick={handleNativeShare}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-colors cursor-pointer sm:ml-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>More Apps</span>
        </button>
      </div>
    </div>
  );
}
