"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { unlockAdmin } from "@/app/admin/actions";
import { ShieldCheck, Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function AdminUnlockForm() {
  const PIN_LENGTH = 6;
  const [pin, setPin] = useState<string[]>(Array(PIN_LENGTH).fill(""));
  const [showCharacters, setShowCharacters] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleUnlock = async (submittedPin: string) => {
    if (!submittedPin) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await unlockAdmin(submittedPin);
      if (res.success) {
        router.refresh();
      } else {
        setError(res.error || "Incorrect PIN");
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        setPin(Array(PIN_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError("Authentication error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBoxChange = (index: number, value: string) => {
    // Handle paste of whole PIN
    if (value.length > 1) {
      const pastedChars = value.slice(0, PIN_LENGTH).split("");
      const newPin = [...pin];
      pastedChars.forEach((char, i) => {
        newPin[i] = char;
      });
      setPin(newPin);

      const nextFocus = Math.min(pastedChars.length, PIN_LENGTH - 1);
      inputRefs.current[nextFocus]?.focus();

      if (pastedChars.length >= PIN_LENGTH) {
        handleUnlock(newPin.join(""));
      }
      return;
    }

    const char = value.slice(-1);
    const newPin = [...pin];
    newPin[index] = char;
    setPin(newPin);

    // Auto-advance
    if (char && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit on 6th digit
    if (char && index === PIN_LENGTH - 1) {
      const fullCode = newPin.join("");
      if (fullCode.length === PIN_LENGTH) {
        handleUnlock(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!pin[index] && index > 0) {
        const newPin = [...pin];
        newPin[index - 1] = "";
        setPin(newPin);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newPin = [...pin];
        newPin[index] = "";
        setPin(newPin);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleUnlock(pin.join(""));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      {/* Compact Obsidian Modal */}
      <div
        className={`w-full max-w-xs sm:max-w-sm bg-[#0e0e12] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 text-center shadow-2xl shadow-black transition-transform duration-200 ${
          isShaking ? "animate-shake" : ""
        }`}
      >
        {/* Compact Icon */}
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3 text-indigo-400">
          <ShieldCheck className="w-5 h-5" />
        </div>

        {/* Title & Subtitle */}
        <h2 className="text-base sm:text-lg font-bold text-white mb-0.5">Admin Security</h2>
        <p className="text-[11px] text-zinc-400 mb-4">Enter 6-digit PIN to access</p>

        {/* 6-PIN Compact Box Row */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3">
          {pin.map((char, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type={showCharacters ? "text" : "password"}
              inputMode="text"
              maxLength={1}
              value={char}
              disabled={isLoading}
              onChange={(e) => handleBoxChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onFocus={(e) => e.target.select()}
              className={`w-9 h-11 sm:w-10 sm:h-12 text-center text-lg sm:text-xl font-mono font-bold rounded-xl bg-zinc-900 border transition-all outline-none ${
                char
                  ? "border-indigo-500 text-white bg-indigo-500/10"
                  : "border-zinc-700/80 text-zinc-200 focus:border-indigo-400 focus:bg-zinc-800"
              }`}
            />
          ))}
        </div>

        {/* Subtle Toggle */}
        <div className="flex items-center justify-between px-1 mb-4 text-[11px] text-zinc-400">
          <button
            type="button"
            onClick={() => setShowCharacters(!showCharacters)}
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            {showCharacters ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-indigo-400" />
                <span>Hide</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Show</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setPin(Array(PIN_LENGTH).fill(""));
              inputRefs.current[0]?.focus();
            }}
            className="hover:text-white text-zinc-500 transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="text-red-400 text-[11px] font-medium bg-red-500/10 py-1.5 px-3 rounded-lg border border-red-500/20 mb-3">
            {error}
          </div>
        )}

        {/* Compact Action Button */}
        <button
          onClick={() => handleUnlock(pin.join(""))}
          disabled={isLoading || pin.join("").length === 0}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs shadow-md shadow-indigo-600/25 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <span>Unlock</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
