"use client";

import { Link } from "@/i18n/routing";
import { type ReactNode, useRef } from "react";
import { useTranslations } from "next-intl";

interface MediaRowScrollerProps {
  title: string;
  viewAllHref?: string;
  children: ReactNode;
}

export function MediaRowScroller({
  title,
  viewAllHref,
  children,
}: MediaRowScrollerProps) {
  const t = useTranslations("Home");
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-8 [contain-intrinsic-size:1px_260px] [content-visibility:auto]">
      <div className="mb-6 flex items-center justify-between px-8">
        <h2 className="font-headline text-xl font-bold text-foreground">{title}</h2>
        <div className="flex items-center gap-2">
          {viewAllHref ? (
            <Link
              href={viewAllHref}
              className="mr-2 text-xs font-medium text-white/50 transition-colors hover:text-foreground"
            >
              {t("viewAll")}
            </Link>
          ) : null}
          <button
            type="button"
            aria-label={`Scroll ${title} left`}
            onClick={() => scroll("left")}
            className="rounded-sm bg-card p-2 text-white/50 transition-colors hover:bg-[#262626] hover:text-foreground"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            type="button"
            aria-label={`Scroll ${title} right`}
            onClick={() => scroll("right")}
            className="rounded-sm bg-card p-2 text-white/50 transition-colors hover:bg-[#262626] hover:text-foreground"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-6 overflow-x-auto px-8 pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>
    </section>
  );
}
