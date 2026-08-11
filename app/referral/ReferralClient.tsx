"use client";

import { useState } from "react";
import { Copy, Check, MessageCircle, Share2 } from "lucide-react";

interface ReferralClientProps {
  referralCode: string;
}

export default function ReferralClient({ referralCode }: ReferralClientProps) {
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const referralLink = `${origin}/login?ref=${referralCode}`;
  const shareText = `Play thousands of free games instantly! Use my invite code ${referralCode} to get started and earn rewards!`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="rounded-2xl border border-indigo-500/25 bg-gradient-to-br from-indigo-950/50 to-purple-950/40 p-4 relative overflow-hidden shadow-[0_0_30px_rgba(99,102,241,0.1)]">
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <p className="text-[10px] font-bold text-indigo-300/70 uppercase tracking-widest mb-2 relative">Your Referral Link</p>

      {/* Link row */}
      <div className="flex items-center gap-2 relative">
        <div className="flex-1 min-w-0 bg-black/40 border border-zinc-700/60 rounded-xl px-3 py-2">
          <p className="font-mono text-xs text-zinc-300 truncate">{referralLink}</p>
        </div>
        <button
          onClick={handleCopy}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            copied
              ? "bg-green-600/20 border border-green-500/40 text-green-400"
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
          }`}
        >
          {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
        </button>
      </div>

      {/* Share buttons */}
      <div className="flex items-center gap-2 mt-3 relative">
        <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold">Share via</span>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + referralLink)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-600/10 border border-green-600/20 text-green-500 hover:bg-green-600/20 transition-colors text-[11px] font-semibold"
          title="Share on WhatsApp"
        >
          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors text-[11px] font-semibold"
          title="Share on Twitter / X"
        >
          <Share2 className="w-3.5 h-3.5" /> Twitter
        </a>
      </div>
    </div>
  );
}
