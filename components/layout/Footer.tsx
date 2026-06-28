"use client";
import Link from "next/link";
import { useState } from "react";
import { Gamepad2, Globe, Mail, MessageSquare, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Bluebuff Games";
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@bluebuff.in";
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
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Section */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary-light transition-colors mb-4" title={`${siteName} Home`}>
              <Gamepad2 className="w-8 h-8" />
              <span className="text-xl font-bold tracking-tight text-white">{siteName}</span>
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Play the best free online HTML5 and Unity WebGL games directly in your browser. No downloads, instant play!
            </p>
            <div className="flex gap-4">
              <a href="https://twitter.com/bluebuffgames" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href={`mailto:${supportEmail}`} className="text-zinc-500 hover:text-white transition-colors" aria-label="Email">
                <Mail className="w-5 h-5" />
              </a>
              <a href="/contact" className="text-zinc-500 hover:text-white transition-colors" aria-label="Contact">
                <MessageSquare className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-2 gap-8">
            {/* Games Links */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Games</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/category/action" className="text-zinc-400 hover:text-primary-light transition-colors">Action Games</Link>
                </li>
                <li>
                  <Link href="/category/puzzle" className="text-zinc-400 hover:text-primary-light transition-colors">Puzzle Games</Link>
                </li>
                <li>
                  <Link href="/category/arcade" className="text-zinc-400 hover:text-primary-light transition-colors">Arcade Games</Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Legal</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/terms" className="text-zinc-400 hover:text-primary-light transition-colors">Terms of Service</Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-zinc-400 hover:text-primary-light transition-colors">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="/dmca" className="text-zinc-400 hover:text-primary-light transition-colors">DMCA Copyright</Link>
                </li>
                <li>
                  <Link href="/contact" className="text-zinc-400 hover:text-primary-light transition-colors">Contact Us</Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter / CTA */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Stay Updated</h3>
            <p className="text-zinc-400 text-sm mb-4">Get the latest games delivered right to your inbox.</p>
            <form className="flex flex-col gap-2 relative" onSubmit={handleSubscribe}>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email" 
                  className="bg-background border border-border-strong rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white"
                  disabled={status === "loading"}
                />
                <button 
                  type="submit" 
                  disabled={status === "loading" || status === "success"}
                  className="bg-primary hover:bg-primary-hover disabled:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center min-w-[90px]"
                >
                  {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
                </button>
              </div>
              
              {/* Status Message */}
              {status === "success" && (
                <div className="flex items-center gap-1.5 text-green-400 text-xs mt-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{message}</span>
                </div>
              )}
              {status === "error" && (
                <div className="flex items-center gap-1.5 text-red-400 text-xs mt-1">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{message}</span>
                </div>
              )}
            </form>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-border-main flex justify-center">
          <p className="text-zinc-500 text-sm text-center">
            &copy; {currentYear} {siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
