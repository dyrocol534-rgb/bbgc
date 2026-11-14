"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface GameDescriptionProps {
  description: string;
}

export default function GameDescription({ description }: GameDescriptionProps) {
  const isLikelyLong = Boolean(
    description && (description.length > 220 || (description.match(/\n/g) || []).length >= 4)
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(isLikelyLong);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textRef.current) {
      setCanExpand(textRef.current.scrollHeight > textRef.current.clientHeight + 2);
    }
  }, [description]);

  if (!description) return null;

  return (
    <div className="space-y-1.5">
      <p
        ref={textRef}
        className={`text-xs sm:text-[13px] text-zinc-400 leading-relaxed whitespace-pre-line transition-all duration-200 ${
          !isExpanded ? "line-clamp-3 overflow-hidden" : ""
        }`}
        style={
          !isExpanded
            ? {
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
            : undefined
        }
      >
        {description}
      </p>

      {canExpand && (
        <div className="flex justify-end pt-0.5">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors py-0.5 cursor-pointer select-none active:scale-95"
            aria-expanded={isExpanded}
          >
            <span>{isExpanded ? "Show less" : "Show more"}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
