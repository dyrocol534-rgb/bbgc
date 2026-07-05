"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, Sparkles, UserPlus } from "lucide-react";

export default function WelcomeModal() {
  const { data: session, update } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if user is logged in but hasn't completed their profile
    // We can use a local storage flag or check if phone/referral is already set
    // For simplicity, we check if they just signed up (we can use a query param or session check)
    // In a real app, you might want a 'profileCompleted' boolean on the user model.
    // For this implementation, we will show it if they have no phone number and we haven't shown it yet this session.
    
    if (session?.user && !(session.user as any).phone) {
      const hasSeenModal = sessionStorage.getItem("hasSeenWelcomeModal");
      if (!hasSeenModal) {
        setIsOpen(true);
        
        // Auto-fill referral code from URL if present
        const refFromUrl = searchParams.get("ref");
        if (refFromUrl) {
          setReferralCode(refFromUrl);
        }
      }
    }
  }, [session, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/user/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, referralCode }),
      });

      if (res.ok) {
        sessionStorage.setItem("hasSeenWelcomeModal", "true");
        await update(); // refresh session data
        setIsOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to complete profile", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    sessionStorage.setItem("hasSeenWelcomeModal", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-surface border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        
        <div className="relative h-32 bg-gradient-to-br from-indigo-600 to-purple-600 p-6 flex flex-col justify-end">
          <button 
            onClick={handleSkip}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 relative z-10">
            <Sparkles className="w-6 h-6 text-amber-400" />
            Welcome to Bluebuff!
          </h2>
          <p className="text-indigo-100 text-sm relative z-10">Complete your profile to earn rewards</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              Phone Number <span className="text-zinc-500 text-xs font-normal">(Optional)</span>
            </label>
            <input 
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-indigo-400" />
              Referral Code <span className="text-zinc-500 text-xs font-normal">(Optional)</span>
            </label>
            <input 
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              placeholder="Enter code (e.g. A1B2C3)"
              className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all uppercase"
            />
            <p className="text-xs text-zinc-500">
              Got invited? Enter their code to both get <span className="text-amber-400 font-bold">50 XP</span> when you play 10 games!
            </p>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 py-3 px-4 rounded-xl font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save & Continue"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
