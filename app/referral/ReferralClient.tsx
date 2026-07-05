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
  const referralLink = `${origin}/?ref=${referralCode}`;

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
    <div className="w-full max-w-2xl mx-auto">
      {/* Code Display Card */}
      <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-3xl p-8 mb-8 text-center relative overflow-hidden shadow-[0_0_40px_rgba(99,102,241,0.15)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <p className="text-indigo-200 font-medium mb-3 relative z-10">Your Unique Referral Link</p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10 mb-6">
          <div className="bg-black/50 border border-zinc-700 rounded-xl px-6 py-4 w-full sm:w-auto font-mono text-xl md:text-2xl text-white font-black tracking-wider break-all flex-1">
            {referralLink}
          </div>
          <button 
            onClick={handleCopy}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 whitespace-nowrap"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copy Link
              </>
            )}
          </button>
        </div>

        <div className="flex items-center justify-center gap-4 relative z-10">
          <span className="text-sm text-zinc-400">Share via:</span>
          
          <a 
            href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + referralLink)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-green-600/20 text-green-500 hover:bg-green-600 hover:text-white rounded-full transition-colors border border-green-600/30 hover:border-green-600"
            title="Share on WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
          
          <a 
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-sky-500/20 text-sky-400 hover:bg-sky-500 hover:text-white rounded-full transition-colors border border-sky-500/30 hover:border-sky-500"
            title="Share on Twitter"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
