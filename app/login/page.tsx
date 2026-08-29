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
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center flex flex-col items-center">
        {/* Logo / Brand Icon - Fixed explicit sizing */}
        <div className="mb-6 flex justify-center">
          {logoError ? (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-black text-white text-3xl select-none">
              B
            </div>
          ) : (
            <Image 
              src="/logo.png" 
              alt="Bluebuff Games" 
              width={96}
              height={96}
              priority
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-2xl" 
              onError={() => setLogoError(true)}
            />
          )}
        </div>
        
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-8">
          Welcome to Bluebuff
        </h1>

        {/* Premium Google Button - Flat, crisp, no shadow */}
        <button
          onClick={() => {
            setIsLoggingIn(true);
            signIn("google", { callbackUrl });
          }}
          disabled={isLoggingIn}
          className="w-full min-h-[50px] sm:min-h-[54px] flex items-center justify-center gap-3 bg-white hover:bg-zinc-100 active:bg-zinc-200 text-zinc-900 font-semibold py-3.5 px-5 rounded-2xl transition-all duration-150 active:scale-[0.98] text-sm group touch-manipulation cursor-pointer disabled:opacity-70"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="w-5 h-5 text-zinc-700 animate-spin" />
              <span className="font-semibold tracking-tight">Connecting to Google...</span>
            </>
          ) : (
            <>
              {/* Crisp Official Google Multicolor SVG */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
        
        {/* Terms microcopy */}
        <p className="text-xs text-zinc-500 mt-6 leading-relaxed">
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
