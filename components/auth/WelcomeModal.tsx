"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, Sparkles, UserPlus, Loader2 } from "lucide-react";
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
        className="bg-surface border border-zinc-800 sm:rounded-3xl rounded-t-3xl shadow-2xl w-full max-w-md max-h-[92dvh] sm:max-h-[min(92dvh,640px)] overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative shrink-0 bg-gradient-to-br from-primary via-indigo-600 to-purple-600 px-4 py-5 sm:px-6 sm:py-6">
          <button
            type="button"
            onClick={handleSkip}
            aria-label="Close welcome dialog"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1.5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <h2
            id="welcome-modal-title"
            className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 relative z-10 pr-10"
          >
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0" />
            Welcome to Bluebuff!
          </h2>
          <p className="text-indigo-100 text-sm mt-1 relative z-10">
            Complete your profile to earn rewards
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5"
        >
          <div className="space-y-2">
            <label htmlFor="welcome-phone" className="text-sm font-medium text-zinc-300">
              Phone Number{" "}
              <span className="text-zinc-500 text-xs font-normal">(Optional)</span>
            </label>
            <input
              id="welcome-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-base sm:text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="welcome-referral" className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-primary-light shrink-0" />
              Referral Code{" "}
              <span className="text-zinc-500 text-xs font-normal">(Optional)</span>
            </label>
            <input
              id="welcome-referral"
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              placeholder="Enter code (e.g. A1B2C3)"
              className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-base sm:text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all uppercase tracking-wide"
            />
            <p className="text-xs text-zinc-500 leading-relaxed">
              Got invited? Enter their code to both get{" "}
              <span className="text-amber-400 font-bold">{XP_CONFIG.REFERRAL_REWARD} XP</span> when you play {XP_CONFIG.GAMES_REQUIRED_FOR_REFERRAL} games!
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <div className="pt-1 sm:pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={handleSkip}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl font-bold text-white bg-primary hover:bg-primary-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
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
