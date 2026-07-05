"use client";

import { useState } from "react";
import { Copy, Check, Share2, MessageCircle } from "lucide-react";

interface ReferralClientProps {
  referralCode: string;
}

export default function ReferralClient({ referralCode }: ReferralClientProps) {
  const [copied, setCopied] = useState(false);
  
  // Ensure we have a valid origin for the link, fallback to empty string if SSR
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const referralLink = `${origin}/login?ref=${referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const shareText = `Play thousands of free games instantly on Bluebuff! Use my invite code ${referralCode} to get started and earn rewards!`;

  return (
    <div className="w-full">
      {/* Code Display Card */}
      <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-5 mb-8 relative overflow-hidden shadow-[0_0_40px_rgba(99,102,241,0.15)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="flex-1 w-full relative z-10">
          <p className="text-indigo-200 font-medium mb-2 text-xs uppercase tracking-wider">Your Unique Referral Link</p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="bg-black/50 border border-zinc-700 rounded-xl px-4 py-2.5 w-full font-mono text-sm text-zinc-300 font-medium truncate shadow-inner flex-1 text-left">
              {referralLink}
            </div>
            <button 
              onClick={handleCopy}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 whitespace-nowrap text-sm"
            >
              {copied ? (
                <><Check className="w-4 h-4" /> Copied!</>
              ) : (
                <><Copy className="w-4 h-4" /> Copy Link</>
              )}
            </button>
          </div>
        </div>

        {/* Share Buttons aligned to the right on desktop */}
        <div className="flex items-center gap-3 w-full md:w-auto relative z-10 pt-5 md:pt-0 border-t border-indigo-500/20 md:border-t-0 md:border-l md:border-indigo-500/30 md:pl-6 justify-center md:justify-start">
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider hidden md:block mr-1">Share</span>
          
          <a 
            href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + referralLink)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-green-600/20 text-green-500 hover:bg-green-600 hover:text-white rounded-xl transition-colors border border-green-600/30 hover:border-green-600 flex-1 md:flex-none flex justify-center"
            title="Share on WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
          
          <a 
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white rounded-xl transition-colors border border-blue-500/30 hover:border-blue-500 flex-1 md:flex-none flex justify-center"
            title="Share on Twitter"
          >
            <Share2 className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
