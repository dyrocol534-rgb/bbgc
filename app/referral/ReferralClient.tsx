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
    <div className="relative overflow-hidden rounded-[24px] bg-[#141416] border border-white/[0.08] p-5 sm:p-6 shadow-xl space-y-5">
      {/* Ambient background glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Code Display Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-md">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Your Personal Invite Code
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-xl sm:text-2xl font-extrabold text-white tracking-wider">
                {referralCode}
              </span>
            </div>
          </div>
        </div>

        {/* Copy Code Button */}
        <button
          onClick={handleCopyCode}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-zinc-100 active:bg-zinc-200 text-black text-xs font-semibold shadow-sm active:scale-[0.98] transition-all cursor-pointer shrink-0"
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
        <span className="text-[11px] font-medium text-zinc-400">Shareable Invite Link</span>
        <div className="flex items-center gap-2 bg-[#101012] border border-white/[0.08] rounded-[16px] p-1.5 pl-3.5">
          <p className="font-mono text-xs text-zinc-300 truncate flex-1 min-w-0">
            {referralLink}
          </p>
          <button
            onClick={handleCopyLink}
            className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] active:bg-white/[0.14] text-zinc-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-zinc-400" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Social Share Buttons Row */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/[0.05]">
        <span className="text-[11px] text-zinc-400 font-medium mr-1">Share via:</span>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + referralLink)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/25 text-[#25D366] text-xs font-semibold transition-all"
          title="Share on WhatsApp"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/25 text-sky-400 text-xs font-semibold transition-all"
          title="Share on Twitter / X"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Twitter / X</span>
        </a>
        <button
          onClick={handleNativeShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer ml-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          <span>More Apps</span>
        </button>
      </div>
    </div>
  );
}
