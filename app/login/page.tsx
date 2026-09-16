"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, Gift, Mail, ArrowRight, KeyRound, Check, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [logoError, setLogoError] = useState(false);
  const [isLoggingInGoogle, setIsLoggingInGoogle] = useState(false);
  
  // OTP state
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

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

  // Resend cooldown timer countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    setErrorMessage(null);
    setIsSendingOtp(true);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to send verification code");
      } else {
        setStep("otp");
        setResendCooldown(60);
      }
    } catch (err: any) {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 6) {
      setErrorMessage("Please enter the 6-digit code");
      return;
    }

    setErrorMessage(null);
    setIsVerifyingOtp(true);

    try {
      const res = await signIn("email-otp", {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        setErrorMessage(res.error);
        setIsVerifyingOtp(false);
      } else if (res?.ok) {
        router.push(callbackUrl);
      }
    } catch (err: any) {
      setErrorMessage("Verification failed. Please check your code.");
      setIsVerifyingOtp(false);
    }
  };

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

      {/* Login Form Container */}
      <div className="relative w-full max-w-[340px] sm:max-w-[360px] flex flex-col items-center text-center">
        {/* Brand App Icon Squircle */}
        <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-[20px] bg-gradient-to-b from-[#1f1f24] to-[#141417] border border-white/[0.12] p-2.5 flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.5)] mb-4 relative group">
          {logoError ? (
            <div className="w-full h-full rounded-[16px] bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-black text-white text-2xl select-none">
              B
            </div>
          ) : (
            <Image 
              src="/logo.png" 
              alt="Bluebuff Games" 
              width={96}
              height={96}
              priority
              className="w-full h-full object-contain rounded-[16px]" 
              onError={() => setLogoError(true)}
            />
          )}
        </div>
        
        {/* Title & Tagline */}
        <h1 className="text-2xl sm:text-[25px] font-bold tracking-tight text-white mb-1">
          Welcome to Bluebuff
        </h1>
        <p className="text-xs text-zinc-400 font-normal leading-relaxed mb-5 max-w-[280px]">
          Play instantly, sync progress &amp; earn daily rewards.
        </p>

        {/* Active Referral Invite Bonus Badge */}
        {ref && (
          <div className="w-full mb-4 py-2 px-3 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center gap-2.5 text-left">
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

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="w-full mb-4 py-2 px-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs text-left animate-in fade-in duration-150 flex items-center justify-between">
            <span className="truncate pr-1">{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-white text-xs shrink-0 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── EMAIL OTP LOGIN FLOW ── */}
        {step === "email" ? (
          <form onSubmit={handleSendOtp} className="w-full flex flex-col gap-2.5">
            <div className="relative w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email..."
                autoComplete="email"
                required
                disabled={isSendingOtp}
                className="w-full h-11 sm:h-12 bg-white/[0.05] border border-white/[0.1] focus:border-orange-500/80 rounded-full px-4 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSendingOtp || !email}
              className="w-full h-11 sm:h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] text-white font-semibold rounded-full shadow-md shadow-orange-500/20 transition-all text-xs sm:text-sm cursor-pointer disabled:opacity-60"
            >
              {isSendingOtp ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Code...</span>
                </>
              ) : (
                <>
                  <span>Continue with Email</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="w-full flex flex-col gap-3">
            <div className="flex items-center justify-between text-[11px] px-1 text-zinc-400">
              <span className="truncate max-w-[200px]">Code sent to <b className="text-zinc-200">{email}</b></span>
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setOtp("");
                  setErrorMessage(null);
                }}
                className="text-orange-400 hover:underline font-medium cursor-pointer shrink-0 ml-2"
              >
                Change
              </button>
            </div>

            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="••••••"
              autoFocus
              required
              disabled={isVerifyingOtp}
              className="w-full h-12 bg-white/[0.05] border border-white/[0.12] focus:border-orange-500/80 rounded-xl px-4 text-center font-mono text-xl sm:text-2xl font-bold tracking-[0.3em] text-white placeholder-zinc-600 outline-none transition-all"
            />

            <button
              type="submit"
              disabled={isVerifyingOtp || otp.length < 6}
              className="w-full h-11 sm:h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] text-white font-semibold rounded-full shadow-md shadow-orange-500/20 transition-all text-xs sm:text-sm cursor-pointer disabled:opacity-60"
            >
              {isVerifyingOtp ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Verify &amp; Sign In</span>
                </>
              )}
            </button>

            {/* Resend Code Link */}
            <div className="text-center mt-0.5">
              {resendCooldown > 0 ? (
                <span className="text-[11px] text-zinc-500">
                  Resend code in <b className="text-zinc-400">{resendCooldown}s</b>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={isSendingOtp}
                  className="text-[11px] text-orange-400 hover:underline font-medium cursor-pointer inline-flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend Code</span>
                </button>
              )}
            </div>
          </form>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 w-full my-4">
          <div className="h-px bg-white/[0.08] flex-1" />
          <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-widest">or</span>
          <div className="h-px bg-white/[0.08] flex-1" />
        </div>

        {/* Premium Google Button - iOS Pill */}
        <button
          onClick={() => {
            setIsLoggingInGoogle(true);
            signIn("google", { callbackUrl });
          }}
          disabled={isLoggingInGoogle}
          className="w-full h-11 sm:h-12 flex items-center justify-center gap-2.5 bg-white hover:bg-zinc-100 active:bg-zinc-200 text-black font-semibold rounded-full shadow-[0_4px_20px_rgba(255,255,255,0.12)] transition-all duration-150 active:scale-[0.98] text-xs sm:text-sm group touch-manipulation cursor-pointer disabled:opacity-70"
        >
          {isLoggingInGoogle ? (
            <>
              <Loader2 className="w-4 h-4 text-zinc-700 animate-spin" />
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
        <div className="flex items-center gap-1.5 text-[10.5px] text-zinc-500 mt-3.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted 1-tap sign-in</span>
        </div>
        
        {/* Terms microcopy */}
        <p className="text-[11px] text-zinc-500 mt-3.5 leading-relaxed">
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
