"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, Gamepad2, Gift, UserPlus, Loader2 } from "lucide-react";
import { XP_CONFIG } from "@/lib/xp-config";

export default function WelcomeModal() {
  const { data: session, update } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user && !(session.user as { profileCompleted?: boolean }).profileCompleted) {
      const hasSeenModal = sessionStorage.getItem("hasSeenWelcomeModal");
      if (!hasSeenModal) {
        setIsOpen(true);

        const refFromUrl = searchParams.get("ref");
        if (refFromUrl) {
          setReferralCode(refFromUrl);
        }
      }
    }
  }, [session, searchParams]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        sessionStorage.setItem("hasSeenWelcomeModal", "true");
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleSkip = () => {
    sessionStorage.setItem("hasSeenWelcomeModal", "true");
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/user/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, referralCode }),
      });

      if (res.ok) {
        sessionStorage.setItem("hasSeenWelcomeModal", "true");
        await update();
        setIsOpen(false);
        router.refresh();
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Unable to save right now. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
    >
      <div
        className="bg-[#121216] border border-white/[0.08] sm:rounded-2xl rounded-t-2xl shadow-2xl w-full max-w-[390px] max-h-[92dvh] sm:max-h-[min(90dvh,580px)] overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative shrink-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 px-4 py-3.5 sm:px-5 sm:py-4 overflow-hidden">
          <button
            type="button"
            onClick={handleSkip}
            aria-label="Close welcome dialog"
            className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 text-white/80 hover:text-white bg-black/25 hover:bg-black/40 rounded-full p-1.5 transition-colors cursor-pointer z-20"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/15 rounded-full blur-2xl pointer-events-none" />

          <h2
            id="welcome-modal-title"
            className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 relative z-10 pr-8 tracking-tight"
          >
            <Gamepad2 className="w-5 h-5 text-amber-300 shrink-0" />
            Welcome to Bluebuff!
          </h2>
          <p className="text-blue-100/90 text-xs mt-0.5 relative z-10">
            Complete your profile to earn rewards
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3 sm:space-y-3.5 bg-[#0f0f13]"
        >
          <div className="space-y-1.5">
            <label htmlFor="welcome-phone" className="text-xs font-medium text-zinc-300">
              Phone Number{" "}
              <span className="text-zinc-500 text-[11px] font-normal">(Optional)</span>
            </label>
            <input
              id="welcome-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full bg-white/[0.04] border border-white/[0.1] hover:border-white/[0.18] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="welcome-referral" className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              Referral Code{" "}
              <span className="text-zinc-500 text-[11px] font-normal">(Optional)</span>
            </label>
            <input
              id="welcome-referral"
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              placeholder="Enter code (e.g. A1B2C3)"
              className="w-full bg-white/[0.04] border border-white/[0.1] hover:border-white/[0.18] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all uppercase tracking-wider font-mono"
            />
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 text-[11px] sm:text-xs text-zinc-300 leading-relaxed">
              <Gift className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Got invited? Enter their code to both get{" "}
                <span className="text-amber-400 font-bold">{XP_CONFIG.REFERRAL_REWARD} XP</span> when you play {XP_CONFIG.GAMES_REQUIRED_FOR_REFERRAL} games!
              </span>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-2.5">
              {error}
            </p>
          )}

          <div className="pt-1 flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSkip}
              className="w-full sm:flex-1 py-2 px-3 rounded-xl font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer text-xs text-center"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl font-bold text-black bg-white hover:bg-zinc-200 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-white/10 cursor-pointer text-xs sm:text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                  Saving...
                </>
              ) : (
                "Save & Continue"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
