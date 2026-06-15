"use client";

import { type ReactNode, useRef } from "react";

interface CategorySliderScrollerProps {
  children: ReactNode;
}

export function CategorySliderScroller({ children }: CategorySliderScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;

    container.scrollBy({
      left: direction === "left" ? -container.clientWidth * 0.82 : container.clientWidth * 0.82,
      behavior: "smooth",
    });
  };

  return (
    <div className="group/slider relative -mx-5 px-5 pb-2 md:-mx-6 md:px-6">
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ msOverflowStyle: "none" }}
      >
        {children}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-[#151515] via-[#151515]/70 to-transparent opacity-0 transition-opacity duration-300 group-hover/slider:opacity-100 md:block" />
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-24 bg-gradient-to-l from-[#151515] via-[#151515]/70 to-transparent opacity-0 transition-opacity duration-300 group-hover/slider:opacity-100 md:block" />

      <button
        type="button"
        aria-label="Trượt thể loại sang trái"
        onClick={() => scroll("left")}
        className="absolute left-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/70 text-white/70 opacity-0 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-all duration-300 hover:border-primary/45 hover:bg-primary hover:text-white group-hover/slider:opacity-100 md:flex"
      >
        <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
          chevron_left
        </span>
      </button>

      <button
        type="button"
        aria-label="Trượt thể loại sang phải"
        onClick={() => scroll("right")}
        className="absolute right-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/70 text-white/70 opacity-0 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-all duration-300 hover:border-primary/45 hover:bg-primary hover:text-white group-hover/slider:opacity-100 md:flex"
      >
        <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
          chevron_right
        </span>
      </button>
    </div>
  );
}
