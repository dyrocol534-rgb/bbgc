"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [logoError, setLogoError] = useState(false);
  let callbackUrl = searchParams.get("callbackUrl") || "/";
  const ref = searchParams.get("ref");
  
  // Preserve the referral code through the login flow
  if (ref && !callbackUrl.includes("ref=")) {
    callbackUrl += (callbackUrl.includes("?") ? "&" : "?") + `ref=${ref}`;
  }

  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  if (status === "loading") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      {/* Ambient background glow */}
      <div className="relative w-full max-w-sm">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl blur-2xl opacity-50 pointer-events-none" />

        {/* Premium Obsidian Card */}
        <div className="relative bg-[#0d0d11]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 sm:p-8 text-center shadow-2xl">
          
          {/* Logo / Brand Icon */}
          <div className="flex justify-center mb-5">
            <div className="relative w-14 h-14 rounded-2xl bg-zinc-900/90 border border-white/10 flex items-center justify-center shadow-inner p-2.5 group">
              {logoError ? (
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-orange-500 via-primary to-amber-500 flex items-center justify-center font-black text-white text-2xl shadow-[0_0_15px_rgba(255,107,0,0.4)] select-none">
                  B
                </div>
              ) : (
                <Image 
                  src="/logo.png" 
                  alt="Bluebuff Games" 
                  width={40} 
                  height={40} 
                  className="object-contain drop-shadow-[0_0_8px_rgba(255,107,0,0.5)] group-hover:scale-105 transition-transform" 
                  onError={() => setLogoError(true)}
                />
              )}
            </div>
          </div>
          
          {/* Title & Subtitle */}
          <h1 className="text-xl font-bold tracking-tight text-white mb-1.5">
            Welcome to Bluebuff Games
          </h1>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
            Sign in to track highscores, earn XP & claim daily rewards.
          </p>

          {/* Premium Google Button */}
          <button
            onClick={() => signIn("google", { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow active:scale-[0.99] text-sm group"
          >
            {/* Crisp Official Google Multicolor SVG */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span className="font-medium tracking-tight">Continue with Google</span>
          </button>
          
          {/* Terms microcopy */}
          <p className="text-[11px] text-zinc-500 mt-6 leading-relaxed">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-zinc-400 hover:text-white underline underline-offset-2 transition-colors">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-zinc-400 hover:text-white underline underline-offset-2 transition-colors">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
