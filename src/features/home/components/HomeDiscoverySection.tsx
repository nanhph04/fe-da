import { Link } from "@/i18n/routing";
import { MediaRow } from "./MediaRow";
import type { MediaCardProps } from "./MediaCard";
import { CategorySliderScroller } from "./CategorySliderScroller";
import { useTranslations } from "next-intl";
import { formatDuration, formatViewCount } from "../utils/format";
import {
  getReadyPublicThumbnailUrl,
  type CategoryPublic,
  type PublicDiscoveryVideo,
} from "@/features/watch/services/publicMedia.types";

const FALLBACK_THUMBNAIL = "/images/thumbnail.png";

const CATEGORY_ICON_RULES = [
  { pattern: /(am-nhac|âm nhạc|music|bieu-dien|biểu diễn)/i, icon: "music_note" },
  { pattern: /(cong-nghe|công nghệ|khoa-hoc|khoa học|science|tech)/i, icon: "science" },
  { pattern: /(dien-anh|điện ảnh|phim|cinema|movie)/i, icon: "movie" },
  { pattern: /(giai-tri|giải trí|hai-kich|hài kịch|comedy)/i, icon: "theater_comedy" },
  { pattern: /(giao-duc|giáo dục|ky-nang|kỹ năng|education|skill)/i, icon: "school" },
  { pattern: /(nghe-thuat|nghệ thuật|thi-giac|thị giác|art|visual)/i, icon: "palette" },
  { pattern: /(tai-lieu|tài liệu|documentary)/i, icon: "travel_explore" },
  { pattern: /(phong-cach|lifestyle|song|sống)/i, icon: "spa" },
  { pattern: /(tro-choi|trò chơi|game)/i, icon: "stadia_controller" },
] as const;

type CategoryVisualMotif =
  | "music"
  | "tech"
  | "cinema"
  | "entertainment"
  | "education"
  | "art"
  | "documentary"
  | "lifestyle"
  | "game";

const CATEGORY_VISUAL_RULES = [
  {
    pattern: /(am-nhac|âm nhạc|music|bieu-dien|biểu diễn)/i,
    subtitle: "Soundtracks, live performances, and rhythmic stories",
    label: "Live session",
    motif: "music",
    imagePath: "/images/categories/music.png",
    palette: ["rgba(229, 9, 20, 0.88)", "rgba(245, 158, 11, 0.82)", "rgba(15, 23, 42, 1)"],
  },
  {
    pattern: /(cong-nghe|công nghệ|khoa-hoc|khoa học|science|tech)/i,
    subtitle: "Future-facing ideas, systems, and breakthroughs",
    label: "Future lab",
    motif: "tech",
    imagePath: "/images/categories/technology-science.png",
    palette: ["rgba(8, 145, 178, 0.9)", "rgba(37, 99, 235, 0.78)", "rgba(8, 15, 32, 1)"],
  },
  {
    pattern: /(dien-anh|điện ảnh|phim|cinema|movie)/i,
    subtitle: "Cinematic cuts, dramatic scenes, and bold frames",
    label: "Cinema reel",
    motif: "cinema",
    imagePath: "/images/categories/cinema-film.png",
    palette: ["rgba(185, 28, 28, 0.9)", "rgba(120, 53, 15, 0.76)", "rgba(17, 24, 39, 1)"],
  },
  {
    pattern: /(giai-tri|giải trí|hai-kich|hài kịch|comedy)/i,
    subtitle: "Energy, laughter, and crowd-pleasing highlights",
    label: "Spotlight",
    motif: "entertainment",
    imagePath: "/images/categories/entertainment-comedy.png",
    palette: ["rgba(217, 119, 6, 0.92)", "rgba(234, 88, 12, 0.76)", "rgba(22, 28, 36, 1)"],
  },
  {
    pattern: /(giao-duc|giáo dục|ky-nang|kỹ năng|education|skill)/i,
    subtitle: "Practical lessons, insight, and hands-on growth",
    label: "Learning path",
    motif: "education",
    imagePath: "/images/categories/education-skills.png",
    palette: ["rgba(16, 185, 129, 0.88)", "rgba(20, 184, 166, 0.74)", "rgba(10, 20, 18, 1)"],
  },
  {
    pattern: /(nghe-thuat|nghệ thuật|thi-giac|thị giác|art|visual)/i,
    subtitle: "Form, texture, color, and visual expression",
    label: "Visual art",
    motif: "art",
    imagePath: "/images/categories/visual-art.png",
    palette: ["rgba(248, 113, 113, 0.84)", "rgba(244, 114, 182, 0.72)", "rgba(28, 13, 24, 1)"],
  },
  {
    pattern: /(tai-lieu|tài liệu|documentary)/i,
    subtitle: "Observational stories and deeper context",
    label: "Documentary",
    motif: "documentary",
    imagePath: "/images/categories/documentary.png",
    palette: ["rgba(100, 116, 139, 0.92)", "rgba(71, 85, 105, 0.76)", "rgba(11, 15, 24, 1)"],
  },
  {
    pattern: /(phong-cach|lifestyle|song|sống)/i,
    subtitle: "Daily rituals, taste, and living well",
    label: "Lifestyle",
    motif: "lifestyle",
    imagePath: "/images/categories/lifestyle.webp.png",
    palette: ["rgba(20, 184, 166, 0.74)", "rgba(59, 130, 246, 0.62)", "rgba(15, 23, 42, 1)"],
  },
  {
    pattern: /(tro-choi|trò chơi|game)/i,
    subtitle: "Play, competition, and high-score energy",
    label: "Game zone",
    motif: "game",
    imagePath: "/images/categories/entertainment-comedy.png",
    palette: ["rgba(14, 165, 233, 0.88)", "rgba(59, 130, 246, 0.72)", "rgba(10, 14, 24, 1)"],
  },
] as const;

const CATEGORY_FALLBACK_SUBTITLES = [
  "Curated picks for deeper browsing",
  "A cinematic collection worth exploring",
  "Fresh content tailored to this topic",
  "Discover related titles in one swipe",
] as const;

const CATEGORY_FALLBACK_LABELS = ["Curated", "Featured", "Collection", "Browse"] as const;
const CATEGORY_FALLBACK_MOTIFS: CategoryVisualMotif[] = [
  "cinema",
  "documentary",
  "tech",
  "music",
];

function getCategoryIcon(category: CategoryPublic) {
  const target = `${category.slug} ${category.name}`;
  return CATEGORY_ICON_RULES.find((rule) => rule.pattern.test(target))?.icon ?? "category";
}

function hashCategoryKey(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function getCategoryVisual(category: CategoryPublic) {
  const target = `${category.slug} ${category.name}`;
  const matchedRule = CATEGORY_VISUAL_RULES.find((rule) => rule.pattern.test(target));
  const fallbackIndex = hashCategoryKey(target) % CATEGORY_FALLBACK_SUBTITLES.length;
  const palette = matchedRule?.palette ?? ["rgba(229, 9, 20, 0.82)", "rgba(245, 158, 11, 0.7)", "rgba(9, 9, 11, 1)"];

  return {
    subtitle: category.description?.trim() || matchedRule?.subtitle || CATEGORY_FALLBACK_SUBTITLES[fallbackIndex],
    label: matchedRule?.label || CATEGORY_FALLBACK_LABELS[fallbackIndex % CATEGORY_FALLBACK_LABELS.length],
    motif: matchedRule?.motif || CATEGORY_FALLBACK_MOTIFS[fallbackIndex % CATEGORY_FALLBACK_MOTIFS.length],
    imagePath: matchedRule?.imagePath,
    palette,
  };
}

function getCategoryPosterMotif(motif: CategoryVisualMotif, primary: string, secondary: string) {
  switch (motif) {
    case "music":
      return `
        <g opacity="0.72">
          <path d="M58 268 C94 154 146 98 218 54" stroke="${secondary}" stroke-width="8" fill="none" stroke-linecap="round"/>
          <path d="M122 258 C160 158 202 116 282 78" stroke="${primary}" stroke-width="5" fill="none" stroke-linecap="round"/>
          <circle cx="178" cy="166" r="38" fill="${primary}" opacity="0.24"/>
          <rect x="224" y="76" width="8" height="168" rx="4" fill="${secondary}"/>
          <circle cx="214" cy="250" r="28" fill="${secondary}" opacity="0.82"/>
        </g>`;
    case "tech":
      return `
        <g opacity="0.74">
          <path d="M54 96 H278 M54 164 H278 M54 232 H278" stroke="${secondary}" stroke-width="2" opacity="0.46"/>
          <path d="M96 42 V300 M170 42 V300 M244 42 V300" stroke="${primary}" stroke-width="2" opacity="0.42"/>
          <rect x="96" y="94" width="140" height="96" rx="14" fill="${primary}" opacity="0.2" stroke="${secondary}" stroke-width="3"/>
          <circle cx="132" cy="126" r="10" fill="${secondary}"/>
          <circle cx="204" cy="158" r="14" fill="${primary}"/>
          <path d="M132 126 L204 158 L242 112" stroke="white" stroke-width="3" opacity="0.34" fill="none"/>
        </g>`;
    case "education":
      return `
        <g opacity="0.78">
          <path d="M70 128 L170 78 L270 128 L170 178 Z" fill="${secondary}" opacity="0.8"/>
          <path d="M104 156 V218 C142 244 198 244 236 218 V156" fill="${primary}" opacity="0.28" stroke="${secondary}" stroke-width="4"/>
          <path d="M270 128 V208" stroke="${secondary}" stroke-width="6" stroke-linecap="round"/>
          <circle cx="270" cy="226" r="12" fill="${secondary}"/>
          <path d="M104 260 H236" stroke="white" stroke-width="4" opacity="0.32" stroke-linecap="round"/>
        </g>`;
    case "entertainment":
      return `
        <g opacity="0.76">
          <path d="M76 112 C114 84 146 96 170 132 C194 96 226 84 264 112 V198 C264 246 224 270 170 270 C116 270 76 246 76 198 Z" fill="${primary}" opacity="0.25" stroke="${secondary}" stroke-width="5"/>
          <circle cx="128" cy="164" r="8" fill="${secondary}"/>
          <circle cx="212" cy="164" r="8" fill="${secondary}"/>
          <path d="M122 214 C144 234 196 234 218 214" stroke="white" stroke-width="5" opacity="0.52" fill="none" stroke-linecap="round"/>
          <path d="M68 72 H272" stroke="${secondary}" stroke-width="6" opacity="0.72" stroke-linecap="round"/>
        </g>`;
    case "art":
      return `
        <g opacity="0.78">
          <circle cx="134" cy="128" r="58" fill="${primary}" opacity="0.34"/>
          <circle cx="208" cy="138" r="50" fill="${secondary}" opacity="0.48"/>
          <circle cx="156" cy="218" r="46" fill="white" opacity="0.16"/>
          <path d="M82 268 C126 188 222 196 266 82" stroke="${secondary}" stroke-width="10" fill="none" stroke-linecap="round"/>
          <path d="M96 92 C150 60 204 70 252 116" stroke="white" stroke-width="3" opacity="0.32" fill="none"/>
        </g>`;
    case "documentary":
      return `
        <g opacity="0.78">
          <rect x="74" y="84" width="192" height="136" rx="10" fill="${primary}" opacity="0.22" stroke="${secondary}" stroke-width="4"/>
          <path d="M98 116 H242 M98 150 H242 M98 184 H184" stroke="white" stroke-width="5" opacity="0.38" stroke-linecap="round"/>
          <circle cx="126" cy="258" r="28" fill="${secondary}" opacity="0.7"/>
          <circle cx="214" cy="258" r="28" fill="${primary}" opacity="0.58"/>
          <path d="M154 258 H186" stroke="white" stroke-width="5" opacity="0.36"/>
        </g>`;
    case "lifestyle":
      return `
        <g opacity="0.72">
          <path d="M172 276 C118 226 92 178 98 132 C104 86 140 60 172 90 C204 60 240 86 246 132 C252 178 226 226 172 276 Z" fill="${primary}" opacity="0.28" stroke="${secondary}" stroke-width="5"/>
          <path d="M104 242 C142 214 202 214 240 242" stroke="white" stroke-width="4" opacity="0.34" fill="none" stroke-linecap="round"/>
          <circle cx="118" cy="102" r="24" fill="${secondary}" opacity="0.54"/>
        </g>`;
    case "game":
      return `
        <g opacity="0.78">
          <path d="M90 142 C100 116 124 104 154 116 H186 C216 104 240 116 250 142 L270 220 C278 252 242 270 220 244 L194 214 H146 L120 244 C98 270 62 252 70 220 Z" fill="${primary}" opacity="0.28" stroke="${secondary}" stroke-width="5"/>
          <path d="M116 174 H154 M135 155 V193" stroke="white" stroke-width="6" opacity="0.58" stroke-linecap="round"/>
          <circle cx="210" cy="166" r="8" fill="${secondary}"/>
          <circle cx="232" cy="188" r="8" fill="${secondary}"/>
        </g>`;
    case "cinema":
    default:
      return `
        <g opacity="0.78">
          <rect x="72" y="80" width="196" height="128" rx="10" fill="${primary}" opacity="0.24" stroke="${secondary}" stroke-width="4"/>
          <path d="M98 84 L126 206 M154 84 L182 206 M210 84 L238 206" stroke="white" stroke-width="4" opacity="0.28"/>
          <path d="M84 248 H256" stroke="${secondary}" stroke-width="8" stroke-linecap="round"/>
          <path d="M116 268 H224" stroke="white" stroke-width="4" opacity="0.28" stroke-linecap="round"/>
        </g>`;
  }
}

function getCategoryPosterDataUrl(category: CategoryPublic, visual: ReturnType<typeof getCategoryVisual>) {
  const [primary, secondary, base] = visual.palette;
  const title = category.name.slice(0, 32);
  const safeTitle = title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="360" height="480" viewBox="0 0 360 480">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${base}"/>
          <stop offset="0.48" stop-color="#12151c"/>
          <stop offset="1" stop-color="#050507"/>
        </linearGradient>
        <radialGradient id="glowA" cx="25%" cy="20%" r="55%">
          <stop offset="0" stop-color="${primary}" stop-opacity="0.7"/>
          <stop offset="1" stop-color="${primary}" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="glowB" cx="78%" cy="22%" r="48%">
          <stop offset="0" stop-color="${secondary}" stop-opacity="0.58"/>
          <stop offset="1" stop-color="${secondary}" stop-opacity="0"/>
        </radialGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="12"/>
        </filter>
      </defs>
      <rect width="360" height="480" fill="url(#bg)"/>
      <rect width="360" height="480" fill="url(#glowA)"/>
      <rect width="360" height="480" fill="url(#glowB)"/>
      <path d="M0 366 C84 318 132 398 214 348 C278 310 320 338 360 310 V480 H0 Z" fill="${primary}" opacity="0.16"/>
      <path d="M-40 108 C48 70 92 152 170 112 C248 72 288 100 400 48" stroke="white" stroke-width="2" opacity="0.12" fill="none"/>
      <g filter="url(#soft)">
        <circle cx="110" cy="208" r="76" fill="${primary}" opacity="0.22"/>
        <circle cx="254" cy="126" r="58" fill="${secondary}" opacity="0.18"/>
      </g>
      ${getCategoryPosterMotif(visual.motif, primary, secondary)}
      <rect x="24" y="26" width="86" height="4" rx="2" fill="${secondary}" opacity="0.82"/>
      <text x="24" y="54" fill="white" opacity="0.4" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="700" letter-spacing="3">VELVET</text>
      <text x="24" y="430" fill="white" opacity="0.62" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="700" letter-spacing="2">${safeTitle}</text>
    </svg>`;

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function isVisibleHomeCategory(category: CategoryPublic) {
  const target = `${category.slug} ${category.name}`;
  return !/(^|\s|-)khac($|\s|-)|khác|other/i.test(target);
}

interface HomeDiscoverySectionProps {
  latestVideos: PublicDiscoveryVideo[];
  categories: CategoryPublic[];
  topViewsVideos?: PublicDiscoveryVideo[];
  topPurchasesVideos?: PublicDiscoveryVideo[];
}

function toMediaCard(video: PublicDiscoveryVideo): MediaCardProps {
  return {
    id: video.id,
    title: video.title,
    creator: video.channelName ?? video.channel?.name ?? "Velvet Gallery",
    channelId: video.channelId,
    views: formatViewCount(video.viewCount),
    imageUrl:
      getReadyPublicThumbnailUrl(video.thumbnailUrl, video.thumbnailStatus, video.id) ??
      FALLBACK_THUMBNAIL,
    duration: formatDuration(video.durationSeconds),
    href: `/watch/${video.id}`,
  };
}

export function HomeDiscoverySection({
  latestVideos,
  categories,
  topViewsVideos = [],
  topPurchasesVideos = [],
}: HomeDiscoverySectionProps) {
  const t = useTranslations("Home");
  const releaseItems = latestVideos.slice(0, 6).map(toMediaCard);
  const topViewsItems = topViewsVideos.slice(0, 6).map(toMediaCard);
  const topPurchasesItems = topPurchasesVideos.slice(0, 6).map(toMediaCard);

  const visibleCategories = categories.filter(isVisibleHomeCategory).slice(0, 8);

  return (
    <section id="discover" className="relative bg-background py-20">
      <div className="mx-auto max-w-7xl px-8 md:px-12">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-secondary">
              {t("diverseContentLibrary")}
            </p>
            <h2 className="font-headline text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              {t("exploreLatestContent")}
            </h2>
          </div>
          <Link
            href="/search"
            className="w-fit rounded-sm border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {t("searchLibrary")}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl">
        {releaseItems.length > 0 ? (
          <MediaRow title={t("newReleases")} items={releaseItems} viewAllHref="/category/latest" />
        ) : (
          <section className="px-8 py-8 md:px-12">
            <div className="rounded-sm border border-border bg-card p-8 text-muted-foreground">
              {t("noContent")}
            </div>
          </section>
        )}

        {visibleCategories.length > 0 ? (
          <section className="px-8 py-10">
            <div className="rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02)_42%,rgba(229,9,20,0.06))] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.34)] md:p-6">
              <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-secondary">
                    {t("quickAccess")}
                  </p>
                  <h3 className="font-headline text-2xl font-extrabold tracking-tight text-foreground">
                    {t("exploreByCategory")}
                  </h3>
                </div>
                <p className="max-w-md text-sm leading-6 text-muted-foreground">
                  {t("exploreByCategoryDesc")}
                </p>
              </div>

              <CategorySliderScroller>
                  {visibleCategories.map((category) => {
                    const visual = getCategoryVisual(category);
                    const icon = getCategoryIcon(category);
                    const generatedPosterImage = getCategoryPosterDataUrl(category, visual);
                    const categoryImage = visual.imagePath
                      ? `url("${visual.imagePath}"), ${generatedPosterImage}`
                      : generatedPosterImage;

                    return (
                      <Link
                        key={category.id}
                        href={`/category/${category.slug}`}
                        className="group relative w-[220px] shrink-0 snap-start overflow-hidden rounded-lg border border-white/10 bg-card/80 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/45 hover:shadow-[0_18px_50px_rgba(0,0,0,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-0 sm:w-[240px] lg:w-[280px]"
                      >
                        <div className="relative aspect-[3/4] overflow-hidden">
                          <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
                            style={{ backgroundImage: categoryImage }}
                            aria-hidden="true"
                          />
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.18),transparent_26%),linear-gradient(180deg,rgba(2,6,23,0.05)_0%,rgba(2,6,23,0.08)_35%,rgba(2,6,23,0.88)_100%)]" aria-hidden="true" />
                          <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" aria-hidden="true" />
                          <span className="absolute -left-6 top-8 h-28 w-28 rounded-full bg-white/10 blur-3xl transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
                          <span className="absolute -right-4 bottom-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
                          <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/60 to-transparent" aria-hidden="true" />

                          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80 backdrop-blur-sm">
                            <span className="material-symbols-outlined text-[16px] text-secondary" aria-hidden="true">
                              {icon}
                            </span>
                            <span>{visual.label}</span>
                          </div>

                          <div className="absolute inset-x-0 bottom-0 flex h-[13rem] flex-col p-4">
                            <h4 className="line-clamp-2 h-14 font-headline text-xl font-extrabold leading-7 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]">
                              {category.name}
                            </h4>
                            <p className="mt-2 line-clamp-3 h-[4.5rem] text-sm leading-6 text-white/70">
                              {visual.subtitle}
                            </p>

                            <div className="mt-auto flex h-10 items-center justify-between gap-3 text-xs font-medium text-white/60">
                              <span className="line-clamp-2 leading-5">{category.description?.trim() || "Curated category"}</span>
                              <span className="flex items-center gap-1 text-white/80 transition-transform duration-300 group-hover:translate-x-0.5">
                                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                                  arrow_forward
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
              </CategorySliderScroller>
            </div>
          </section>
        ) : null}

        {topViewsItems.length > 0 && (
          <MediaRow title="Xem nhiều nhất tuần" items={topViewsItems} />
        )}

        {topPurchasesItems.length > 0 && (
          <MediaRow title="Mua nhiều nhất tuần" items={topPurchasesItems} />
        )}
      </div>
    </section>
  );
}
