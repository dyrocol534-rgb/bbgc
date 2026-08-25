"use client";

import Link from "next/link";
import { useState } from "react";
import { Gamepad2, Mail, CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Bluebuff Games";
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "crew.bluebuffofficial@gmail.com";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setStatus("success");
        setMessage(data.message);
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to subscribe");
      }
    } catch (err) {
      setStatus("error");
      setMessage("An unexpected error occurred");
    }
    
    setTimeout(() => setStatus("idle"), 3000);
  };

  return (
    <footer className="bg-[#09090b] border-t border-zinc-800/80 mt-auto">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-6 border-b border-zinc-800/60">
          
          {/* Brand & Subtitle */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3">
            <div className="inline-flex items-center gap-2.5">
              <Link 
                href="/" 
                className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 hover:border-orange-500/40 transition-colors shadow-sm text-orange-400 group" 
                title={`${siteName} Home`}
              >
                <Gamepad2 className="w-5 h-5 text-orange-400 group-hover:scale-105 transition-transform" />
              </Link>
              <div className="flex flex-col text-left">
                <Link 
                  href="/" 
                  className="text-base font-bold tracking-tight text-white hover:text-orange-400 transition-colors"
                >
                  {siteName}
                </Link>
                <span className="text-[11px] text-zinc-400">
                  A product from{" "}
                  <a 
                    href="https://bluebuff.in" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-orange-400 hover:underline font-medium inline-flex items-center gap-0.5"
                  >
                    bluebuff.in
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </span>
              </div>
            </div>
          </div>

          {/* Compact Newsletter Bar */}
          <form className="flex items-center gap-2 w-full max-w-sm" onSubmit={handleSubscribe}>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email for game updates..." 
              className="bg-zinc-900/90 border border-zinc-800 focus:border-indigo-500 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 flex-1 outline-none transition-colors"
              disabled={status === "loading"}
              required
            />
            <button 
              type="submit" 
              disabled={status === "loading" || status === "success"}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center min-w-[76px] shadow-sm shrink-0"
            >
              {status === "loading" ? <Loader2 className="w-3 h-3 animate-spin" /> : "Subscribe"}
            </button>
          </form>

          {/* Social Icons */}
          <div className="flex items-center gap-2">
            <a 
              href="https://whatsapp.com/channel/0029Vb7zuwD0VycLqwDcE53y" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-green-400 hover:border-green-500/40 transition-colors" 
              aria-label="WhatsApp Channel"
              title="WhatsApp Channel"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.031 21.054c-1.845 0-3.623-.473-5.221-1.372l-.375-.213-3.87.102 1.041-3.771-.233-.37c-.985-1.573-1.503-3.39-1.503-5.26 0-5.465 4.453-9.914 9.932-9.914 2.65 0 5.143 1.033 7.018 2.909 1.874 1.877 2.908 4.368 2.908 7.022 0 5.466-4.453 9.914-9.931 9.914h.202zm5.728-7.795c-.314-.158-1.859-.918-2.146-1.023-.287-.105-.497-.158-.707.158-.21.314-.808 1.023-1.002 1.231-.194.208-.388.234-.702.076-2.023-1.008-3.32-2.142-4.135-4.264-.105-.285.105-.436.26-.59.139-.14.314-.367.472-.55.158-.184.21-.314.314-.525.105-.21.052-.394-.026-.552-.079-.158-.707-1.705-.968-2.336-.254-.616-.511-.532-.707-.542-.184-.01-.394-.01-.604-.01-.21 0-.551.079-.84.394-.288.315-1.101 1.076-1.101 2.624 0 1.549 1.127 3.045 1.285 3.255.158.21 2.217 3.385 5.372 4.747 3.155 1.362 3.155.918 3.731.866.577-.052 1.859-.761 2.121-1.496.262-.735.262-1.365.184-1.496-.078-.131-.288-.21-.603-.368z" />
              </svg>
            </a>
            <a 
              href="https://instagram.com/mlbbtopup.in" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-pink-400 hover:border-pink-500/40 transition-colors" 
              aria-label="Instagram"
              title="Instagram"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
            </a>
            <a 
              href="https://www.linkedin.com/company/bluebuffesports/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-blue-400 hover:border-blue-500/40 transition-colors" 
              aria-label="LinkedIn"
              title="LinkedIn"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.74a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
              </svg>
            </a>
            <a 
              href={`mailto:${supportEmail}`}
              className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-indigo-400 hover:border-indigo-500/40 transition-colors"
              aria-label="Email Support"
              title="Email Support"
            >
              <Mail className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Links & Copyright Bar */}
        <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px]">
            <Link href="/" className="hover:text-zinc-300 transition-colors">Games</Link>
            <Link href="/leaderboard" className="hover:text-zinc-300 transition-colors">Leaderboard</Link>
            <Link href="/rewards" className="hover:text-zinc-300 transition-colors">Rewards</Link>
            <Link href="/contact" className="hover:text-zinc-300 transition-colors">Contact</Link>
            <Link href="/faq" className="hover:text-zinc-300 transition-colors">FAQ</Link>
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
            <Link href="/dmca" className="hover:text-zinc-300 transition-colors">DMCA</Link>
          </div>

          <p className="text-[11px] text-zinc-500 text-center">
            &copy; {currentYear} {siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
