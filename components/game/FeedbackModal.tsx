"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { MessageSquareWarning, X, Loader2 } from "lucide-react";
import axios from "axios";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameTitle: string;
  gameSlug: string;
}

export default function FeedbackModal({
  isOpen,
  onClose,
  gameTitle,
  gameSlug,
}: FeedbackModalProps) {
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || typeof document === "undefined") return null;

  const handleSubmit = async () => {
    if (!feedbackText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await axios.post(`/api/games/${gameSlug}/interact`, {
        action: "feedback",
        message: feedbackText.trim(),
      });
      alert("Feedback submitted successfully!");
      setFeedbackText("");
      onClose();
    } catch (error: any) {
      if (error.response?.status === 401) {
        alert("Please log in to submit feedback.");
      } else {
        alert("Failed to submit feedback.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0c0c0e] border-t sm:border border-white/[0.1] rounded-t-[28px] sm:rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-2xl flex flex-col animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Bar */}
        <div className="sm:hidden flex justify-center -mt-2 pb-2.5">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white shrink-0">
              <MessageSquareWarning className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">Game Feedback</h3>
              <p className="text-[11px] text-zinc-400">Help us improve Bluebuff Games</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] active:scale-95 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-zinc-400 text-xs mb-3.5 leading-relaxed">
          Let us know what you think about <strong className="text-white font-semibold">{gameTitle}</strong>, or report an issue.
        </p>

        <textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="Write your feedback or issue description here..."
          className="w-full bg-[#050507] border border-white/[0.09] focus:border-white/30 rounded-2xl p-3.5 text-zinc-100 placeholder-zinc-500 text-xs sm:text-sm min-h-[110px] outline-none transition-all mb-4 focus:ring-1 focus:ring-white/10"
        />

        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full text-zinc-400 hover:text-white text-xs font-semibold hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !feedbackText.trim()}
            className="px-5 py-2.5 bg-white hover:bg-zinc-200 active:scale-95 text-black text-xs font-bold rounded-full transition-all shadow-md shadow-white/10 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            <span>Submit Feedback</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
