import { Link } from "@/i18n/routing";
import { MediaRow } from "./MediaRow";
import type { MediaCardProps } from "./MediaCard";
import { formatDuration, formatViewCount } from "../utils/format";
import {
  getReadyPublicThumbnailUrl,
  type CategoryPublic,
  type PublicDiscoveryVideo,
} from "@/features/watch/services/publicMediaService";

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

function getCategoryIcon(category: CategoryPublic) {
  const target = `${category.slug} ${category.name}`;
  return CATEGORY_ICON_RULES.find((rule) => rule.pattern.test(target))?.icon ?? "category";
}

function isVisibleHomeCategory(category: CategoryPublic) {
  const target = `${category.slug} ${category.name}`;
  return !/(^|\s|-)khac($|\s|-)|khác|other/i.test(target);
}

export interface HomeCategorySection {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  videos: PublicDiscoveryVideo[];
}

interface HomeDiscoverySectionProps {
  latestVideos: PublicDiscoveryVideo[];
  categories: CategoryPublic[];
  categorySections: HomeCategorySection[];
}

function toMediaCard(video: PublicDiscoveryVideo): MediaCardProps {
  return {
    title: video.title,
    creator: video.channel?.name ?? "Velvet Gallery",
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
  categorySections,
}: HomeDiscoverySectionProps) {
  const releaseItems = latestVideos.slice(0, 6).map(toMediaCard);
  const visibleCategorySections = categorySections
    .map((section) => ({
      ...section,
      items: section.videos.slice(0, 6).map(toMediaCard),
    }))
    .filter((section) => section.items.length > 0);
  const visibleCategories = categories.filter(isVisibleHomeCategory).slice(0, 9);

  return (
    <section id="discover" className="relative bg-background py-20">
      <div className="mx-auto max-w-7xl px-8 md:px-12">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-secondary">
              Kho nội dung đa dạng
            </p>
            <h2 className="font-headline text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              Khám phá nội dung mới nhất
            </h2>
          </div>
          <Link
            href="/search"
            className="w-fit rounded-sm border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Tìm kiếm toàn thư viện
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl">
        {releaseItems.length > 0 ? (
          <MediaRow title="Mới phát hành" items={releaseItems} viewAllHref="/category/latest" />
        ) : (
          <section className="px-8 py-8 md:px-12">
            <div className="rounded-sm border border-border bg-card p-8 text-muted-foreground">
              Chưa có nội dung mới từ Media Service. Vui lòng quay lại sau.
            </div>
          </section>
        )}

        {visibleCategorySections.map((section) => (
          <MediaRow
            key={section.categoryId}
            title={section.categoryName}
            items={section.items}
            viewAllHref={`/category/${section.categorySlug}`}
          />
        ))}

        {visibleCategories.length > 0 ? (
          <section className="px-8 py-10 md:px-8">
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[radial-gradient(circle_at_12%_15%,rgba(245,158,11,0.14),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02)_42%,rgba(229,9,20,0.08))] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.34)] md:p-6">
              <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-secondary/55 to-transparent" />
              <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-secondary">
                    Lối vào nhanh
                  </p>
                  <h3 className="font-headline text-2xl font-extrabold tracking-tight text-foreground">
                    Khám phá theo thể loại
                  </h3>
                </div>
                <p className="max-w-md text-sm leading-6 text-muted-foreground">
                  Chọn một chủ đề để mở các hàng phim, khóa học và video đang được tuyển chọn.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {visibleCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="group relative min-h-24 overflow-hidden rounded-lg border border-white/10 bg-card/70 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/55 hover:bg-card focus:outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-0"
                  >
                    <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/0 via-primary/45 to-primary/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <span className="absolute -right-6 -top-8 h-20 w-20 rounded-full bg-primary/10 blur-2xl transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
                    <span className="relative flex items-start justify-between gap-4">
                      <span>
                        <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/5 text-secondary transition-all duration-300 group-hover:border-secondary/45 group-hover:bg-secondary/10 group-hover:text-secondary">
                          <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                            {getCategoryIcon(category)}
                          </span>
                        </span>
                        <span className="block font-headline text-base font-extrabold leading-snug text-foreground">
                          {category.name}
                        </span>
                      </span>
                      <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-white/10 bg-black/20 text-white/45 transition-all duration-300 group-hover:border-primary/45 group-hover:bg-primary group-hover:text-white">
                        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                          arrow_forward
                        </span>
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </section>
  );
}
