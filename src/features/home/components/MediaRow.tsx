"use client";

import { useRef } from "react";
import { MediaCard, MediaCardProps } from "./MediaCard";

interface MediaRowProps {
  title: string;
  items: MediaCardProps[];
}

export function MediaRow({ title, items }: MediaRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 px-8">
        <h2 className="text-xl font-bold font-headline text-white">{title}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-sm bg-[#1a1a1a] hover:bg-[#262626] text-white/50 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-sm bg-[#1a1a1a] hover:bg-[#262626] text-white/50 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide px-8 pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item, index) => (
          <MediaCard key={index} {...item} />
        ))}
      </div>
    </section>
  );
}