"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { Info as InfoIcon, X } from "lucide-react";
import clsx from "clsx";

export interface InfoTooltipProps {
  /** Text or rich content displayed inside the tooltip/popover */
  content: ReactNode;
  /** Optional title for the tooltip */
  title?: string;
  /** Size variant of the info icon: 'sm' (default), 'md', or 'xs' */
  size?: "xs" | "sm" | "md";
  /** Alignment of the popover box: 'top', 'bottom', 'left', or 'right' */
  align?: "top" | "bottom" | "left" | "right";
  /** Optional custom class for the trigger button */
  className?: string;
  /** Optional custom class for the popover content box */
  popoverClassName?: string;
}

export default function InfoTooltip({
  content,
  title,
  size = "sm",
  align = "top",
  className,
  popoverClassName,
}: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
  };

  const buttonSizes = {
    xs: "w-4 h-4",
    sm: "w-5 h-5",
    md: "w-6 h-6",
  };

  // Alignment classes for desktop & mobile positioning
  const alignClasses = {
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  };

  return (
    <div
      ref={containerRef}
      className={clsx("relative inline-flex items-center", className)}
    >
      {/* ── Trigger Info Button ── */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        aria-label="Information tooltip"
        aria-expanded={isOpen}
        className={clsx(
          "rounded-full flex items-center justify-center transition-all duration-150 active:scale-90 focus:outline-none",
          isOpen
            ? "bg-amber-400/20 text-amber-400 ring-2 ring-amber-400/30"
            : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60",
          buttonSizes[size]
        )}
      >
        <InfoIcon className={iconSizes[size]} />
      </button>

      {/* ── Tooltip / Popover Content Box ── */}
      {isOpen && (
        <div
          role="tooltip"
          onClick={(e) => e.stopPropagation()}
          className={clsx(
            "absolute z-50 w-64 sm:w-72 p-3 rounded-xl bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 text-zinc-300 shadow-2xl animate-in fade-in zoom-in-95 duration-150",
            alignClasses[align],
            popoverClassName
          )}
        >
          {/* Header Row if Title is supplied */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            {title ? (
              <h4 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                <InfoIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{title}</span>
              </h4>
            ) : (
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Information
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-0.5 -mr-1 -mt-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors"
              aria-label="Close tooltip"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="text-[11px] leading-relaxed text-zinc-300">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}
