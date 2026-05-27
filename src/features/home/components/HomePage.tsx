import { Link } from "@/i18n/routing";
import Image from "next/image";
import { PublicHeader } from "@/components/layout/public/PublicHeader";
import { useTranslations } from "next-intl";
import { HomeDiscoverySection, type HomeCategorySection } from "./HomeDiscoverySection";
import { HomeHeroSlider, type HomeHeroSlide } from "./HomeHeroSlider";
import { HomePageAccountCta } from "./HomePageAccountCta";
import { formatDuration, formatViewCount } from "../utils/format";
import {
  getReadyPublicThumbnailUrl,
  type CategoryPublic,
  type PublicDiscoveryVideo,
} from "@/features/watch/services/publicMediaService";

const HERO_FALLBACK_IMAGE = "/images/hero-bg.jpg";

function toHomeHeroSlide(video: PublicDiscoveryVideo): HomeHeroSlide {
  return {
    id: video.id,
    title: video.title,
    description:
      video.description?.trim() ||
      "Một lựa chọn mới từ phòng chiếu Velvet Gallery, tuyển chọn cho trải nghiệm xem đậm chất điện ảnh.",
    category: video.category || "Cinematic",
    creator: video.channel?.name ?? "Velvet Gallery",
    views: formatViewCount(video.metrics?.viewsCount ?? video.viewCount),
    duration: formatDuration(video.durationSeconds),
    imageUrl:
      getReadyPublicThumbnailUrl(video.thumbnailUrl, video.thumbnailStatus, video.id) ??
      HERO_FALLBACK_IMAGE,
    href: `/watch/${video.id}`,
    price: video.price,
    requiredTierLevel: video.requiredTierLevel,
  };
}

interface HomePageProps {
  latestVideos: PublicDiscoveryVideo[];
  categories: CategoryPublic[];
  categorySections: HomeCategorySection[];
}

export function HomePage({
  latestVideos,
  categories,
  categorySections,
}: HomePageProps) {
  const t = useTranslations("Home");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader currentPath="/" />

      <HomeHeroSlider slides={latestVideos.map(toHomeHeroSlide)} />

      <HomeDiscoverySection
        latestVideos={latestVideos}
        categories={categories}
        categorySections={categorySections}
      />

      {/* Features Section */}
      <section className="relative overflow-hidden bg-background py-24">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute left-1/2 top-16 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative z-10 mx-auto max-w-7xl px-8 md:px-12">
          <div className="mb-10 flex max-w-3xl flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary">
              {t("whyChooseVelvet")}
            </p>
            <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl">
              {t("featuresTitle")}
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {t("featuresDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <article className="group relative overflow-hidden rounded-lg border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-secondary/50 hover:bg-muted/60 lg:col-span-4">
              <div className="absolute right-5 top-5 opacity-10 transition-opacity duration-300 group-hover:opacity-20">
                <span className="material-symbols-outlined text-7xl text-secondary">local_activity</span>
              </div>
              <div className="relative z-10 flex h-full min-h-[240px] flex-col justify-between gap-10">
                <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-secondary/10 text-secondary ring-1 ring-secondary/20">
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    local_activity
                  </span>
                </div>
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                    {t("membershipLevelsEyebrow")}
                  </p>
                  <h3 className="mb-4 font-display text-2xl font-bold tracking-tight text-foreground">
                    {t("membershipLevelsTitle")}
                  </h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    {t("membershipLevelsDesc")}
                  </p>
                </div>
              </div>
            </article>

            <article className="group relative overflow-hidden rounded-lg border border-secondary/30 bg-gradient-to-br from-card via-card to-secondary/10 p-7 shadow-[0_24px_80px_rgba(245,158,11,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-secondary/60 lg:col-span-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.18)_0%,transparent_62%)]" />
              <div className="relative z-10 flex h-full min-h-[240px] flex-col justify-between gap-10">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-secondary/15 text-secondary ring-1 ring-secondary/25">
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      monetization_on
                    </span>
                  </div>
                  <span className="rounded-sm border border-secondary/30 bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
                    Aura Coin
                  </span>
                </div>
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                    {t("creatorEconomyEyebrow")}
                  </p>
                  <h3 className="mb-4 font-display text-3xl font-extrabold tracking-tight text-secondary">
                    {t("creatorEconomyTitle")}
                  </h3>
                  <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
                    {t("creatorEconomyDesc")}
                  </p>
                </div>
              </div>
            </article>

            <article className="group relative overflow-hidden rounded-lg border border-border bg-muted/70 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-muted lg:col-span-3">
              <div className="absolute right-5 top-5 opacity-10 transition-opacity duration-300 group-hover:opacity-20">
                <span className="material-symbols-outlined text-7xl text-primary">movie</span>
              </div>
              <div className="relative z-10 flex h-full min-h-[240px] flex-col justify-between gap-10">
                <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-primary/10 text-primary ring-1 ring-primary/20">
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    movie
                  </span>
                </div>
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    {t("creatorToolsEyebrow")}
                  </p>
                  <h3 className="mb-4 font-display text-2xl font-bold tracking-tight text-foreground">
                    {t("creatorToolsTitle")}
                  </h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    {t("creatorToolsDesc")}
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            alt="CTA Background"
            src="/images/cta-bg.jpg"
            fill
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-8 text-center flex flex-col items-center">
          <h2 className="font-display text-4xl md:text-6xl font-extrabold tracking-[-0.02em] mb-6">
            {t("ctaTitle")}
          </h2>
          <p className="mb-12 max-w-2xl font-body text-lg text-muted-foreground">
            {t("ctaDesc")}
          </p>
          <HomePageAccountCta />
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-neutral-950/80 px-8 py-16 shadow-inner shadow-black">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {/* Logo & Copyright */}
          <div className="flex flex-col space-y-4 col-span-1 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-white">
                <span className="material-symbols-outlined text-black text-xl">play_arrow</span>
              </div>
              <span className="text-lg font-bold text-neutral-200 font-headline uppercase tracking-tighter">
                Velvet Gallery
              </span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-neutral-500">
              {t("footerDesc")}
            </p>
          </div>

          {/* Platform Links */}
          <div className="flex flex-col space-y-3">
            <span className="mb-2 font-semibold text-foreground">{t("footerNavPlatform")}</span>
            <Link href="/" className="w-fit text-sm text-neutral-500 transition-colors hover:text-primary">
              {t("footerNavAbout")}
            </Link>
            <Link href="/onboarding" className="w-fit text-sm text-neutral-500 transition-colors hover:text-primary">
              {t("footerNavCreators")}
            </Link>
            <Link href="/login" className="w-fit text-sm text-neutral-500 transition-colors hover:text-primary">
              {t("footerNavHelp")}
            </Link>
          </div>

          {/* Account Links */}
          <div className="flex flex-col space-y-3">
            <span className="mb-2 font-semibold text-foreground">{t("footerNavAccount")}</span>
            <Link href="/login" className="w-fit text-sm text-neutral-500 transition-colors hover:text-primary">
              {t("footerNavPrivacy")}
            </Link>
            <Link href="/register" className="w-fit text-sm text-neutral-500 transition-colors hover:text-primary">
              {t("footerNavTerms")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
