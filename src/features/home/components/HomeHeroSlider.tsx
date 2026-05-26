"use client";

import { Link } from "@/i18n/routing";
import { useEffect, useMemo, useState } from "react";
import { HomePageStudioCta } from "./HomePageStudioCta";

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

const AUTOPLAY_DELAY_MS = 6500;

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
  const previewSlides = heroSlides.filter((slide) => slide.id !== activeSlide.id).slice(0, 3);

  const goToPrevious = () => {
    setActiveIndex((current) => (current - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % heroSlides.length);
  };

  return (
    <section
      className="relative isolate min-h-[760px] overflow-hidden bg-background pt-24 text-foreground md:min-h-[820px]"
      aria-label="Phim nổi bật"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        key={`backdrop-${activeSlide.id}`}
        className="absolute inset-0 scale-105 bg-cover bg-center opacity-40 blur-[1px] transition-opacity duration-700"
        style={{ backgroundImage: `url(${activeSlide.imageUrl})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_32%,rgba(229,9,20,0.32),transparent_34%),linear-gradient(90deg,rgba(14,14,16,0.98)_0%,rgba(14,14,16,0.78)_46%,rgba(14,14,16,0.34)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-background via-background/88 to-transparent" />
      <div className="absolute left-0 top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute right-16 top-40 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative z-10 mx-auto grid min-h-[680px] max-w-7xl grid-cols-1 items-center gap-10 px-6 pb-16 pt-10 md:px-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,0.78fr)] lg:pt-0">
        <div className="max-w-3xl">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="rounded-sm border border-secondary/30 bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-secondary">
              {getSlideEyebrow(activeSlide, activeIndex)}
            </span>
            <span className="rounded-sm border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground">
              {getAccessLabel(activeSlide)}
            </span>
          </div>

          <div key={`copy-${activeSlide.id}`} className="animate-in fade-in slide-in-from-bottom-5 duration-700">
            <h1 className="max-w-4xl text-balance font-display text-5xl font-extrabold leading-[0.96] tracking-[-0.045em] text-foreground md:text-7xl lg:text-[5.6rem]">
              {activeSlide.title}
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-base leading-8 text-muted-foreground md:text-lg">
              {activeSlide.description || "Một lựa chọn mới từ phòng chiếu Velvet Gallery, tuyển chọn cho trải nghiệm xem đậm chất điện ảnh."}
            </p>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground">
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

          <div className="mt-10 flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
            <Link
              href={activeSlide.href}
              className="group flex w-full items-center justify-center gap-3 rounded-sm bg-primary px-8 py-4 font-semibold tracking-wide text-primary-foreground shadow-[0_22px_60px_rgba(229,9,20,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-0 sm:w-auto"
            >
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">
                play_arrow
              </span>
              <span>Xem ngay</span>
            </Link>
            <Link
              href="#discover"
              className="flex w-full items-center justify-center gap-2 rounded-sm border border-border bg-card/80 px-8 py-4 font-semibold tracking-wide text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-0 sm:w-auto"
            >
              <span>Khám phá thêm</span>
              <span className="material-symbols-outlined text-xl" aria-hidden="true">
                arrow_downward
              </span>
            </Link>
            <HomePageStudioCta />
          </div>
        </div>

        <div className="relative min-h-[430px] lg:min-h-[560px]">
          <div className="absolute -left-8 top-10 hidden h-40 w-40 rounded-full border border-secondary/20 lg:block" aria-hidden="true" />
          <div className="relative ml-auto w-full max-w-[520px]">
            <div className="absolute -inset-4 rounded-lg bg-primary/20 blur-3xl" aria-hidden="true" />
            <article className="relative overflow-hidden rounded-lg border border-border bg-card shadow-[0_36px_110px_rgba(0,0,0,0.42)]">
              <div className="relative aspect-[3/4] min-h-[420px] overflow-hidden md:aspect-[4/5]">
                <div
                  key={`poster-${activeSlide.id}`}
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                  style={{ backgroundImage: `url(${activeSlide.imageUrl})` }}
                  aria-hidden="true"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/12 to-transparent" />
                <div className="absolute left-5 top-5 rounded-sm border border-white/15 bg-black/55 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                  Now showing
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                    Spotlight {String(activeIndex + 1).padStart(2, "0")}
                  </p>
                  <h2 className="line-clamp-2 font-display text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                    {activeSlide.title}
                  </h2>
                </div>
              </div>
            </article>
          </div>

          {previewSlides.length > 0 ? (
            <div className="absolute -bottom-4 left-0 right-0 flex gap-3 overflow-x-auto pb-2 md:left-auto md:right-4 md:w-[86%]">
              {previewSlides.map((slide) => {
                const slideIndex = heroSlides.findIndex((item) => item.id === slide.id);

                return (
                  <button
                    type="button"
                    key={slide.id}
                    onClick={() => setActiveIndex(slideIndex)}
                    className="group relative h-24 min-w-40 overflow-hidden rounded-md border border-border bg-card text-left shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    aria-label={`Chuyển sang ${slide.title}`}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-70 transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundImage: `url(${slide.imageUrl})` }}
                      aria-hidden="true"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                    <span className="absolute bottom-2 left-3 right-3 line-clamp-1 text-xs font-semibold text-white">
                      {slide.title}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-20 flex w-[calc(100%-3rem)] max-w-7xl -translate-x-1/2 flex-col gap-5 px-0 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goToPrevious}
            className="flex h-11 w-11 items-center justify-center rounded-sm border border-border bg-card/85 text-muted-foreground transition-all duration-300 hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95"
            aria-label="Slide trước"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              chevron_left
            </span>
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="flex h-11 w-11 items-center justify-center rounded-sm border border-border bg-card/85 text-muted-foreground transition-all duration-300 hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95"
            aria-label="Slide tiếp theo"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              chevron_right
            </span>
          </button>
        </div>

        <div className="flex flex-1 items-center gap-3 md:max-w-md">
          {heroSlides.map((slide, index) => (
            <button
              type="button"
              key={slide.id}
              onClick={() => setActiveIndex(index)}
              className="group h-7 flex-1 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={`Đến slide ${index + 1}: ${slide.title}`}
              aria-current={index === activeIndex ? "true" : undefined}
            >
              <span className="block h-1 overflow-hidden rounded-full bg-border">
                <span
                  className={`block h-full rounded-full transition-all duration-500 ${
                    index === activeIndex ? "w-full bg-primary" : "w-0 bg-primary/60 group-hover:w-full"
                  }`}
                />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
