"use client";
import Link from "next/link";
import { useState } from "react";
import { Gamepad2, Globe, Mail, MessageSquare, CheckCircle, XCircle, Loader2 } from "lucide-react";

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
              <a href="https://whatsapp.com/channel/0029Vb7zuwD0VycLqwDcE53y" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors" aria-label="WhatsApp">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.031 21.054c-1.845 0-3.623-.473-5.221-1.372l-.375-.213-3.87.102 1.041-3.771-.233-.37c-.985-1.573-1.503-3.39-1.503-5.26 0-5.465 4.453-9.914 9.932-9.914 2.65 0 5.143 1.033 7.018 2.909 1.874 1.877 2.908 4.368 2.908 7.022 0 5.466-4.453 9.914-9.931 9.914h.202zm5.728-7.795c-.314-.158-1.859-.918-2.146-1.023-.287-.105-.497-.158-.707.158-.21.314-.808 1.023-1.002 1.231-.194.208-.388.234-.702.076-2.023-1.008-3.32-2.142-4.135-4.264-.105-.285.105-.436.26-.59.139-.14.314-.367.472-.55.158-.184.21-.314.314-.525.105-.21.052-.394-.026-.552-.079-.158-.707-1.705-.968-2.336-.254-.616-.511-.532-.707-.542-.184-.01-.394-.01-.604-.01-.21 0-.551.079-.84.394-.288.315-1.101 1.076-1.101 2.624 0 1.549 1.127 3.045 1.285 3.255.158.21 2.217 3.385 5.372 4.747 3.155 1.362 3.155.918 3.731.866.577-.052 1.859-.761 2.121-1.496.262-.735.262-1.365.184-1.496-.078-.131-.288-.21-.603-.368z" />
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
