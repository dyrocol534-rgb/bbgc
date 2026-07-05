"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, Check, X } from "lucide-react";

export default function GenerateReferralCode() {
  const { data: session, update } = useSession();
  const router = useRouter();
  
  const currentCode = (session?.user as any)?.referralCode;
  
  const [isEditing, setIsEditing] = useState(false);
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (currentCode) {
    return (
      <span className="font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded text-xs tracking-wider">
        {currentCode}
      </span>
    );
  }

  if (!isEditing) {
    return (
      <button 
        onClick={() => setIsEditing(true)}
        className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded transition-colors"
      >
        Create Code
      </button>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/user/referral-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Failed to save code");
        return;
      }
      
      await update(); // Refresh session
      setIsEditing(false);
      router.refresh();
      
    } catch (err) {
      setError("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input 
          type="text" 
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. GAMER99"
          className="w-24 sm:w-32 bg-black border border-zinc-700 rounded px-2 py-1 text-xs text-white uppercase focus:outline-none focus:border-indigo-500"
          disabled={isSubmitting}
        />
        <div className="flex items-center gap-1">
          <button 
            type="submit" 
            disabled={isSubmitting || !code}
            className="p-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          </button>
          <button 
            type="button" 
            onClick={() => { setIsEditing(false); setError(""); }}
            disabled={isSubmitting}
            className="p-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded disabled:opacity-50 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </form>
      {error && <span className="text-[10px] text-red-400">{error}</span>}
    </div>
  );
}
