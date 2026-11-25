"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

interface HorizontalScrollContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function HorizontalScrollContainer({
  children,
  className,
}: HorizontalScrollContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const offset = direction === "left" ? -340 : 340;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  // Mouse drag-to-scroll support without interfering with card clicks
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || !scrollRef.current) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !scrollRef.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.2;
    if (Math.abs(walk) > 4) {
      hasMovedRef.current = true;
    }
    scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    // If the user dragged more than 4px, prevent the click on the game card link
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      hasMovedRef.current = false;
    }
  };

  return (
    <div className="relative group/carousel">
      {/* Navigation Buttons (Desktop) */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          className="hidden sm:flex absolute -left-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/85 hover:bg-black text-white border border-white/20 items-center justify-center shadow-lg transition-all active:scale-90 cursor-pointer backdrop-blur-md opacity-0 group-hover/carousel:opacity-100 focus:opacity-100"
          aria-label="Scroll left"
          title="Previous games"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          className="hidden sm:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/85 hover:bg-black text-white border border-white/20 items-center justify-center shadow-lg transition-all active:scale-90 cursor-pointer backdrop-blur-md opacity-0 group-hover/carousel:opacity-100 focus:opacity-100"
          aria-label="Scroll right"
          title="More games"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Main scroll track: Allows both horizontal browsing and natural vertical page scroll */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onClickCapture={handleClickCapture}
        className={clsx(
          "grid grid-rows-2 [grid-auto-flow:column_dense] auto-cols-[64px] sm:auto-cols-[72px] md:auto-cols-[80px] auto-rows-[66px] sm:auto-rows-[76px] md:auto-rows-[84px] gap-2 sm:gap-2.5 overflow-x-auto pb-1.5 pt-0.5 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-none snap-x snap-proximity scroll-smooth touch-auto cursor-grab active:cursor-grabbing select-none",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
