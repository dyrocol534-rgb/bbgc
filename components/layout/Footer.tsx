"use client";
import Link from "next/link";
import { useState } from "react";
import { Gamepad2, Globe, Mail, CheckCircle, XCircle, Loader2, ExternalLink, ShoppingBag, ShieldCheck, HelpCircle } from "lucide-react";

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
    
    // Clear message after 3 seconds
    setTimeout(() => setStatus("idle"), 3000);
  };

  return (
    <footer className="bg-surface border-t border-border-main mt-auto">
      <div className="container mx-auto px-4 py-10 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          
          {/* Column 1: Brand & Socials */}
          <div className="flex flex-col justify-between">
            <div>
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors mb-3 group" 
                title={`${siteName} Home`}
              >
                <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 group-hover:border-indigo-500/40 transition-colors">
                  <Gamepad2 className="w-5 h-5 text-indigo-400" />
                </div>
                <span className="text-lg font-bold tracking-tight text-white">{siteName}</span>
              </Link>
              <p className="text-zinc-400 text-xs leading-relaxed mb-4">
                Discover and play free online HTML5 and WebGL games directly in your browser with instant access and zero downloads required.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <a 
                href="https://whatsapp.com/channel/0029Vb7zuwD0VycLqwDcE53y" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-green-400 hover:border-green-500/40 transition-colors" 
                aria-label="WhatsApp Channel"
                title="Join WhatsApp Channel"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.031 21.054c-1.845 0-3.623-.473-5.221-1.372l-.375-.213-3.87.102 1.041-3.771-.233-.37c-.985-1.573-1.503-3.39-1.503-5.26 0-5.465 4.453-9.914 9.932-9.914 2.65 0 5.143 1.033 7.018 2.909 1.874 1.877 2.908 4.368 2.908 7.022 0 5.466-4.453 9.914-9.931 9.914h.202zm5.728-7.795c-.314-.158-1.859-.918-2.146-1.023-.287-.105-.497-.158-.707.158-.21.314-.808 1.023-1.002 1.231-.194.208-.388.234-.702.076-2.023-1.008-3.32-2.142-4.135-4.264-.105-.285.105-.436.26-.59.139-.14.314-.367.472-.55.158-.184.21-.314.314-.525.105-.21.052-.394-.026-.552-.079-.158-.707-1.705-.968-2.336-.254-.616-.511-.532-.707-.542-.184-.01-.394-.01-.604-.01-.21 0-.551.079-.84.394-.288.315-1.101 1.076-1.101 2.624 0 1.549 1.127 3.045 1.285 3.255.158.21 2.217 3.385 5.372 4.747 3.155 1.362 3.155.918 3.731.866.577-.052 1.859-.761 2.121-1.496.262-.735.262-1.365.184-1.496-.078-.131-.288-.21-.603-.368z" />
                </svg>
              </a>
              <a 
                href="https://instagram.com/mlbbtopup.in" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-pink-400 hover:border-pink-500/40 transition-colors" 
                aria-label="Instagram"
                title="Follow on Instagram"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <a 
                href="https://www.linkedin.com/company/bluebuffesports/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-blue-400 hover:border-blue-500/40 transition-colors" 
                aria-label="LinkedIn"
                title="Follow Bluebuff Esports on LinkedIn"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.74a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
                </svg>
              </a>
              <a 
                href={`mailto:${supportEmail}`}
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-indigo-400 hover:border-indigo-500/40 transition-colors"
                aria-label="Email Support"
                title="Contact Support"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Products Ecosystem */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />
              <span>Bluebuff Network</span>
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a 
                  href="https://games.bluebuff.in" 
                  className="text-zinc-300 hover:text-indigo-400 transition-colors flex items-center gap-1.5 group font-medium"
                >
                  <span>Bluebuff Games</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:border-indigo-500/40 transition-colors">Games</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://mlbbtopup.in" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-zinc-400 hover:text-indigo-400 transition-colors flex items-center gap-1 group"
                >
                  <span>Bluebuff Store (mlbbtopup.in)</span>
                  <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.linkedin.com/company/bluebuffesports/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-zinc-400 hover:text-indigo-400 transition-colors flex items-center gap-1 group"
                >
                  <span>Bluebuff Esports</span>
                  <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                </a>
              </li>
              <li>
                <Link href="/leaderboard" className="text-zinc-400 hover:text-indigo-400 transition-colors">
                  Leaderboard & XP
                </Link>
              </li>
              <li>
                <Link href="/rewards" className="text-zinc-400 hover:text-indigo-400 transition-colors">
                  Rewards & Daily Quests
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Support */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Legal & Support</span>
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/terms" className="text-zinc-400 hover:text-indigo-400 transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link href="/privacy" className="text-zinc-400 hover:text-indigo-400 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/dmca" className="text-zinc-400 hover:text-indigo-400 transition-colors">DMCA Copyright</Link>
              </li>
              <li>
                <Link href="/contact" className="text-zinc-400 hover:text-indigo-400 transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link href="/faq" className="text-zinc-400 hover:text-indigo-400 transition-colors">FAQ</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter / Stay Updated */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Stay Updated</h3>
            <p className="text-zinc-400 text-xs mb-3 leading-relaxed">
              Get the latest browser games and updates delivered right to your inbox.
            </p>
            <form className="flex flex-col gap-2 relative" onSubmit={handleSubscribe}>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email" 
                  className="bg-black/50 border border-zinc-800 rounded-lg px-3 py-2 text-xs w-full focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-zinc-500"
                  disabled={status === "loading"}
                  required
                />
                <button 
                  type="submit" 
                  disabled={status === "loading" || status === "success"}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center min-w-[84px] shadow-lg shadow-indigo-500/20 shrink-0"
                >
                  {status === "loading" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Subscribe"}
                </button>
              </div>
              
              {/* Status Message */}
              {status === "success" && (
                <div className="flex items-center gap-1.5 text-green-400 text-[11px] mt-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{message}</span>
                </div>
              )}
              {status === "error" && (
                <div className="flex items-center gap-1.5 text-red-400 text-[11px] mt-1">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{message}</span>
                </div>
              )}
            </form>
          </div>

        </div>

        {/* Bottom copyright bar */}
        <div className="mt-10 pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <p className="font-medium text-center sm:text-left">
            &copy; {currentYear} <span className="text-zinc-300 font-semibold">{siteName}</span>. A product of <a href="https://bluebuff.in" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">bluebuff.in</a>. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms</Link>
            <span>&bull;</span>
            <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy</Link>
            <span>&bull;</span>
            <a href="https://bluebuff.in" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
              <span>bluebuff.in</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
