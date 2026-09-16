"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, Gift } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [logoError, setLogoError] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
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
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Apple Inset Card */}
      <div className="relative w-full max-w-[380px] bg-[#141416]/85 backdrop-blur-2xl border border-white/[0.09] rounded-[28px] p-6 sm:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.8)] flex flex-col items-center text-center overflow-hidden">
        {/* Top hairline highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Brand App Icon Squircle */}
        <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-[22px] bg-gradient-to-b from-[#1f1f24] to-[#141417] border border-white/[0.12] p-3 flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.5)] mb-5 relative group">
          {logoError ? (
            <div className="w-full h-full rounded-[18px] bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-black text-white text-3xl select-none">
              B
            </div>
          ) : (
            <Image 
              src="/logo.png" 
              alt="Bluebuff Games" 
              width={96}
              height={96}
              priority
              className="w-full h-full object-contain rounded-[18px]" 
              onError={() => setLogoError(true)}
            />
          )}
        </div>
        
        {/* Title & Tagline */}
        <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-white mb-1.5">
          Welcome to Bluebuff
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed mb-6 max-w-[280px]">
          Play instantly, sync progress &amp; earn daily rewards.
        </p>

        {/* Active Referral Invite Bonus Badge */}
        {ref && (
          <div className="w-full mb-6 py-2 px-3 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center gap-2.5 text-left">
            <Gift className="w-4 h-4 text-orange-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-orange-200 truncate">
                Referral: <span className="font-mono tracking-wider text-orange-400">{ref}</span>
              </p>
              <p className="text-[10px] text-zinc-400">
                +50 bonus XP on sign in!
              </p>
            </div>
          </div>
        )}

        {/* Premium Google Button - iOS Pill */}
        <button
          onClick={() => {
            setIsLoggingIn(true);
            signIn("google", { callbackUrl });
          }}
          disabled={isLoggingIn}
          className="w-full h-12 flex items-center justify-center gap-3 bg-white hover:bg-zinc-100 active:bg-zinc-200 text-black font-semibold rounded-full shadow-[0_4px_20px_rgba(255,255,255,0.15)] transition-all duration-150 active:scale-[0.98] text-sm group touch-manipulation cursor-pointer disabled:opacity-70"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="w-4.5 h-4.5 text-zinc-700 animate-spin" />
              <span className="font-semibold tracking-tight">Connecting to Google...</span>
            </>
          ) : (
            <>
              {/* Crisp Official Google Multicolor SVG */}
              <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
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
              <span className="font-semibold tracking-tight">Continue with Google</span>
            </>
          )}
        </button>

        {/* Trust microcopy */}
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-4">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Fast, encrypted 1-tap sign-in</span>
        </div>
        
        {/* Terms microcopy */}
        <p className="text-[11px] text-zinc-500 mt-4 leading-relaxed">
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
  );
}
