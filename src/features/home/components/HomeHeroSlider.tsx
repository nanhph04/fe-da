"use client";

import { Link } from "@/i18n/routing";
import type { MouseEvent, PointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

export interface HomeHeroSlide {
  id: string;
  title: string;
  description: string;
  category: string;
  creator: string;
  views: string;
  duration: string;
  imageUrl: string;
  href: string;
  price: number;
  requiredTierLevel: number | null;
}

interface HomeHeroSliderProps {
  slides: HomeHeroSlide[];
}

const FALLBACK_SLIDE: HomeHeroSlide = {
  id: "velvet-gallery-featured",
  title: "The Velvet Gallery",
  description:
    "Bước vào phòng chiếu số với nội dung chất lượng cao, phân phối phi tập trung và vận hành bằng nền kinh tế Aura Coin.",
  category: "Featured Premiere",
  creator: "Velvet Gallery",
  views: "0",
  duration: "--:--",
  imageUrl: "/images/hero-bg.jpg",
  href: "#discover",
  price: 0,
  requiredTierLevel: null,
};

const AUTOPLAY_DELAY_MS = 8000;

function getAccessLabel(slide: HomeHeroSlide) {
  if (slide.requiredTierLevel) {
    return `Lv${slide.requiredTierLevel} member`;
  }

  if (slide.price > 0) {
    return `${slide.price} AC`;
  }

  return "Free access";
}

function getSlideEyebrow(slide: HomeHeroSlide, index: number) {
  if (index === 0) {
    return "Featured premiere";
  }

  return slide.category || "Velvet selection";
}

export function HomeHeroSlider({ slides }: HomeHeroSliderProps) {
  const heroSlides = useMemo(
    () => (slides.length > 0 ? slides.slice(0, 6) : [FALLBACK_SLIDE]),
    [slides],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const previewScrollerRef = useRef<HTMLDivElement>(null);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const hasDraggedPreviewRef = useRef(false);
  const previewTargetIndexRef = useRef<number | null>(null);

  useEffect(() => {
    if (heroSlides.length <= 1 || isPaused) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroSlides.length);
    }, AUTOPLAY_DELAY_MS);

    return () => window.clearInterval(timer);
  }, [heroSlides.length, isPaused]);

  const activeSlide = heroSlides[activeIndex] ?? heroSlides[0];
  const previewSlides = heroSlides;

  const handlePreviewPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    hasDraggedPreviewRef.current = false;
    dragStartXRef.current = event.clientX;
    dragStartScrollLeftRef.current = previewScrollerRef.current?.scrollLeft ?? 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePreviewPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const scroller = previewScrollerRef.current;

    if (!scroller || !event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }

    const dragDistance = event.clientX - dragStartXRef.current;

    if (Math.abs(dragDistance) > 6) {
      hasDraggedPreviewRef.current = true;
    }

    scroller.scrollLeft = dragStartScrollLeftRef.current - dragDistance;
  };

  const handlePreviewPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handlePreviewPress = (slideIndex: number) => {
    previewTargetIndexRef.current = slideIndex;
  };

  const handlePreviewSelect = (event: MouseEvent<HTMLButtonElement>, slideIndex: number) => {
    if (hasDraggedPreviewRef.current) {
      event.preventDefault();
      hasDraggedPreviewRef.current = false;
      return;
    }

    setActiveIndex(previewTargetIndexRef.current ?? slideIndex);
    previewTargetIndexRef.current = null;
  };

  return (
    <section
      className="relative isolate h-[760px] overflow-hidden bg-background bg-cover bg-center bg-no-repeat pt-24 text-foreground md:h-[820px]"
      style={{ backgroundImage: `url(${activeSlide.imageUrl})` }}
      aria-label="Phim nổi bật"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_74%_32%,rgba(229,9,20,0.2),transparent_32%),linear-gradient(90deg,rgba(14,14,16,0.94)_0%,rgba(14,14,16,0.76)_48%,rgba(14,14,16,0.4)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-background via-background/86 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background/70 to-transparent" />
      <div className="pointer-events-none absolute left-0 top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute right-16 top-40 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative z-10 mx-auto grid h-[680px] max-w-7xl grid-cols-1 items-center gap-10 px-6 pb-16 pt-10 md:px-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.56fr)] lg:pt-0">
        <div className="max-w-3xl overflow-hidden">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="rounded-sm border border-secondary/30 bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-secondary">
              {getSlideEyebrow(activeSlide, activeIndex)}
            </span>
            <span className="rounded-sm border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground">
              {getAccessLabel(activeSlide)}
            </span>
          </div>

          <div key={`copy-${activeSlide.id}`} className="animate-in fade-in slide-in-from-bottom-5 duration-700">
            <h1 className="line-clamp-3 h-[8.75rem] max-w-4xl text-balance font-display text-5xl font-extrabold leading-[0.96] tracking-[-0.045em] text-foreground md:h-[13rem] md:text-7xl lg:h-[16.25rem] lg:text-[5.6rem]">
              {activeSlide.title}
            </h1>
            <p className="mt-6 line-clamp-2 h-16 max-w-2xl text-pretty text-base leading-8 text-muted-foreground md:text-lg">
              {activeSlide.description || "Một lựa chọn mới từ phòng chiếu Velvet Gallery, tuyển chọn cho trải nghiệm xem đậm chất điện ảnh."}
            </p>
          </div>

          <div className="mt-7 flex min-h-9 flex-wrap items-center gap-x-5 gap-y-3 overflow-hidden text-sm text-muted-foreground">
            <span className="flex items-center gap-2 text-foreground">
              <span className="material-symbols-outlined text-base text-primary" aria-hidden="true">
                movie
              </span>
              {activeSlide.category || "Cinematic"}
            </span>
            <span>{activeSlide.creator}</span>
            <span>{activeSlide.views} views</span>
            <span>{activeSlide.duration}</span>
          </div>

          <div className="mt-10 flex h-16 w-full sm:w-auto">
            <Link
              href={activeSlide.href}
              className="group relative flex w-full items-center justify-center overflow-hidden rounded-md border border-primary/60 bg-primary px-9 py-4 font-display text-base font-extrabold uppercase tracking-[0.14em] text-primary-foreground shadow-[0_22px_70px_rgba(229,9,20,0.38)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:bg-primary/95 hover:shadow-[0_28px_90px_rgba(229,9,20,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-0 sm:w-auto"
            >
              <span className="absolute inset-y-0 left-0 w-1/3 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-[260%]" aria-hidden="true" />
              <span className="relative flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/14 ring-1 ring-white/30 transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_arrow
                  </span>
                </span>
                <span>Xem ngay</span>
              </span>
            </Link>
          </div>
        </div>

      </div>

      <div className="pointer-events-none absolute bottom-8 left-1/2 z-20 w-[calc(100%-3rem)] max-w-7xl -translate-x-1/2 px-0 md:px-6">
        <div className="pointer-events-auto ml-auto flex w-full flex-col gap-3 rounded-xl border border-white/5 bg-background/18 p-3 shadow-[0_18px_54px_rgba(0,0,0,0.26)] backdrop-blur-sm md:max-w-3xl">
          {previewSlides.length > 0 ? (
            <div
              ref={previewScrollerRef}
              onPointerDown={handlePreviewPointerDown}
              onPointerMove={handlePreviewPointerMove}
              onPointerUp={handlePreviewPointerUp}
              onPointerCancel={handlePreviewPointerUp}
              className="flex cursor-grab touch-pan-x select-none gap-3 overflow-x-auto scroll-smooth pb-1 active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label="Danh sách slide nổi bật có thể kéo ngang"
            >
              {previewSlides.map((slide, slideIndex) => {
                const isActivePreview = slideIndex === activeIndex;

                return (
                  <button
                    type="button"
                    key={slide.id}
                    onPointerDown={() => handlePreviewPress(slideIndex)}
                    onClick={(event) => handlePreviewSelect(event, slideIndex)}
                    className={`group relative h-24 w-[15rem] shrink-0 overflow-hidden rounded-lg border bg-card text-left shadow-[0_18px_40px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                      isActivePreview ? "border-primary/80 ring-1 ring-primary/35" : "border-white/12"
                    }`}
                    aria-label={`Chuyển sang ${slide.title}`}
                    aria-current={isActivePreview ? "true" : undefined}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-78 transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url(${slide.imageUrl})` }}
                      aria-hidden="true"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/28 to-transparent" />
                    <span className={`absolute left-3 top-3 rounded-sm border px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] ${
                      isActivePreview ? "border-primary/45 bg-primary/80 text-white" : "border-white/15 bg-black/40 text-white/75"
                    }`}>
                      {isActivePreview ? "Đang xem" : "Next"}
                    </span>
                    <span className="absolute bottom-3 left-3 right-3 line-clamp-2 font-display text-sm font-extrabold leading-tight text-white drop-shadow">
                      {slide.title}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="flex items-center gap-2 px-1">
            {heroSlides.map((slide, index) => (
              <button
                type="button"
                key={slide.id}
                onClick={() => setActiveIndex(index)}
                className="group h-8 flex-1 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label={`Đến slide ${index + 1}: ${slide.title}`}
                aria-current={index === activeIndex ? "true" : undefined}
              >
                <span className="block h-1 overflow-hidden rounded-full bg-white/18">
                  <span
                    className={`block h-full rounded-full transition-all duration-500 ${
                      index === activeIndex ? "w-full bg-primary shadow-[0_0_14px_rgba(229,9,20,0.68)]" : "w-0 bg-primary/50 group-hover:w-full"
                    }`}
                  />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
