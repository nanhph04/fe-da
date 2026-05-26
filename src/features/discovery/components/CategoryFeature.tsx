import Form from "next/form";
import { VideoThumbnail } from "@/shared/components/VideoThumbnail";
import { Link } from "@/i18n/routing";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Coins,
  Film,
  ListVideo,
  Lock,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { formatDuration, formatViewCount } from "@/features/home/utils/format";
import {
  getReadyPublicThumbnailUrl,
  type CategoryPublic,
  type PublicDiscoveryVideo,
  type TagPublic,
} from "@/features/watch/services/publicMediaService";
import type { ApiPagination } from "@/shared/api/types";

const FALLBACK_THUMBNAIL = "/images/thumbnail.png";

type CategoryFilters = {
  q: string;
  tags: string[];
};

type CategoryFeatureProps = {
  slug: string;
  category: CategoryPublic | null;
  videos: PublicDiscoveryVideo[];
  tags: TagPublic[];
  pagination: ApiPagination | null;
  filters: CategoryFilters;
  errorMessage: string | null;
  formAction: string;
  isLatest?: boolean;
};

function titleFromSlug(slug: string) {
  if (!slug.trim()) {
    return "Category";
  }

  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getCategoryTitle(slug: string, category: CategoryPublic | null, isLatest?: boolean) {
  if (isLatest) {
    return "Mới phát hành";
  }

  return category?.name || titleFromSlug(slug);
}

function getCategoryDescription(category: CategoryPublic | null, isLatest?: boolean) {
  if (isLatest) {
    return "Các video công khai mới nhất trong Velvet Gallery, được sắp xếp theo thời điểm phát hành.";
  }

  return (
    category?.description ||
    "Khám phá các video công khai đã sẵn sàng phát trong thể loại này."
  );
}

function getHeroImageUrl(videos: PublicDiscoveryVideo[]) {
  const featuredVideo = videos.find((video) =>
    getReadyPublicThumbnailUrl(video.thumbnailUrl, video.thumbnailStatus, video.id)
  );

  if (!featuredVideo) {
    return FALLBACK_THUMBNAIL;
  }

  return (
    getReadyPublicThumbnailUrl(
      featuredVideo.thumbnailUrl,
      featuredVideo.thumbnailStatus,
      featuredVideo.id
    ) || FALLBACK_THUMBNAIL
  );
}

function getPrimaryResolution(resolutions: string[]) {
  return (
    [...resolutions].sort(
      (left, right) => Number.parseInt(right, 10) - Number.parseInt(left, 10)
    )[0] || "HD"
  );
}

function getDisplayTitle(video: PublicDiscoveryVideo) {
  return video.title.trim() || "Kỹ thuật kể chuyện hình ảnh chuyên sâu";
}

function getChannelLabel(video: PublicDiscoveryVideo) {
  if (video.channel?.name) {
    return video.channel.name;
  }

  return `Kênh ${video.channelId.slice(0, 8)}`;
}

function getChannelInitial(video: PublicDiscoveryVideo) {
  return getChannelLabel(video).trim().charAt(0).toUpperCase() || "V";
}

function formatPublishedAt(value: string | null) {
  if (!value) {
    return "Chưa công bố";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Chưa công bố";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function buildCategoryHref(slug: string, params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && String(value).trim()) {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  return `/category/${slug}${queryString ? `?${queryString}` : ""}`;
}

function buildTagHref(slug: string, filters: CategoryFilters, tagSlug: string) {
  const currentTags = new Set(filters.tags);

  if (currentTags.has(tagSlug)) {
    currentTags.delete(tagSlug);
  } else {
    currentTags.add(tagSlug);
  }

  return buildCategoryHref(slug, {
    q: filters.q || undefined,
    tags: Array.from(currentTags).join(",") || undefined,
  });
}

function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-5 text-sm text-foreground">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" aria-hidden="true" />
        <div>
          <p className="font-headline font-bold">Không thể tải đầy đủ dữ liệu</p>
          <p className="mt-1 text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ hasFilters, slug }: { hasFilters: boolean; slug: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg border border-border bg-muted">
        <Film className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
      </div>
      <h2 className="mt-6 font-headline text-2xl font-extrabold tracking-tight text-foreground">
        {hasFilters ? "Không có video khớp bộ lọc" : "Chưa có video công khai"}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
        {hasFilters
          ? "Thử bỏ bớt tag hoặc đổi từ khóa để mở rộng kết quả trong thể loại này."
          : "Thể loại này chưa có video ready + public từ Media Service. Vui lòng quay lại sau."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {hasFilters ? (
          <Link
            href={`/category/${slug}`}
            className="rounded-sm border border-border bg-muted px-4 py-2 text-sm font-bold text-foreground transition-colors hover:border-primary/50 hover:bg-accent"
          >
            Xóa bộ lọc
          </Link>
        ) : null}
        <Link
          href="/search"
          className="rounded-sm bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Tìm kiếm thư viện
        </Link>
      </div>
    </div>
  );
}

function VideoCard({ video }: { video: PublicDiscoveryVideo }) {
  const displayTitle = getDisplayTitle(video);
  const thumbnailUrl =
    getReadyPublicThumbnailUrl(video.thumbnailUrl, video.thumbnailStatus, video.id) ||
    FALLBACK_THUMBNAIL;
  const hasCoinPrice = video.price > 0;
  const hasTierGate = video.requiredTierLevel !== null;

  return (
    <Link href={`/watch/${video.id}`} className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <article className="h-full rounded-lg transition-colors hover:bg-foreground/[0.04]">
        <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
          <VideoThumbnail
            src={thumbnailUrl}
            alt={displayTitle}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/65 via-transparent to-transparent opacity-70" />
          <div className="absolute bottom-2 right-2 rounded-sm bg-background/95 px-1.5 py-0.5 text-[11px] font-bold text-foreground">
            {formatDuration(video.durationSeconds)}
          </div>
          <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
            <span className="rounded-sm bg-background/90 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              {getPrimaryResolution(video.resolutions)}
            </span>
            {hasTierGate ? (
              <span className="inline-flex items-center gap-1 rounded-sm bg-secondary px-2 py-1 text-[10px] font-black uppercase tracking-wider text-secondary-foreground">
                <Lock className="h-3 w-3" aria-hidden="true" />
                Lv{video.requiredTierLevel}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex gap-3 px-1 pt-3">
          <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-muted text-sm font-black text-foreground">
            {getChannelInitial(video)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-[15px] font-bold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary">
              {displayTitle}
            </h3>
            <p className="mt-1 truncate text-sm font-medium text-muted-foreground">
              {getChannelLabel(video)}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span>{formatViewCount(video.viewCount)} lượt xem</span>
              <span aria-hidden="true">-</span>
              <span>{formatPublishedAt(video.publishedAt || video.createdAt)}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {hasCoinPrice ? (
                <span className="inline-flex items-center gap-1 rounded-sm bg-secondary/15 px-2 py-1 text-[11px] font-bold text-secondary">
                  <Coins className="h-3 w-3" aria-hidden="true" />
                  {video.price} Coin
                </span>
              ) : (
                <span className="rounded-sm bg-foreground/10 px-2 py-1 text-[11px] font-bold text-foreground">
                  Free
                </span>
              )}
              {video.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-sm bg-foreground/5 px-2 py-1 text-[11px] font-medium text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

function FilterPanel({
  slug,
  filters,
  tags,
  formAction,
}: {
  slug: string;
  filters: CategoryFilters;
  tags: TagPublic[];
  formAction: string;
}) {
  const selectedTagSet = new Set(filters.tags);
  const hasActiveFilters = Boolean(filters.q || filters.tags.length > 0);
  const visibleTags = tags.slice(0, 18);

  return (
    <section className="space-y-3">
      <details className="group rounded-lg border border-border/80 bg-card" open={Boolean(filters.q) || undefined}>
        <summary className="flex cursor-pointer list-none flex-col gap-3 px-4 py-3 outline-none transition-colors hover:bg-foreground/[0.03] focus-visible:ring-2 focus-visible:ring-ring/70 sm:flex-row sm:items-center sm:justify-between [&::-webkit-details-marker]:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-foreground/10 text-foreground">
              <Search className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="font-headline text-lg font-extrabold tracking-tight text-foreground">
                Tìm trong danh mục
              </h2>
              <p className="truncate text-sm text-muted-foreground">
                {hasActiveFilters ? "Đang áp dụng bộ lọc" : "Bấm để mở ô tìm kiếm"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            {hasActiveFilters ? (
              <span className="rounded-full bg-foreground/10 px-3 py-2 font-bold text-foreground">
                {filters.tags.length + (filters.q ? 1 : 0)} bộ lọc
              </span>
            ) : null}
            <span className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-4 font-bold text-background transition-transform group-open:scale-[0.98]">
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              <span className="group-open:hidden">Mở</span>
              <span className="hidden group-open:inline">Ẩn</span>
            </span>
          </div>
        </summary>

        <div className="border-t border-border px-4 py-4">
          <Form action={formAction} className="grid gap-3 lg:grid-cols-[1fr_auto]">
            <label className="sr-only" htmlFor="category-query">
              Từ khóa tìm kiếm video
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                id="category-query"
                name="q"
                defaultValue={filters.q}
                placeholder="Tìm theo tiêu đề hoặc tên video"
                className="h-11 w-full rounded-full border border-border bg-input pl-11 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
            </div>
            {filters.tags.length > 0 ? (
              <input type="hidden" name="tags" value={filters.tags.join(",")} />
            ) : null}
            <button
              type="submit"
              className="h-11 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground transition hover:brightness-110 active:scale-[0.98]"
            >
              Tìm kiếm
            </button>
          </Form>

          {hasActiveFilters ? (
            <div className="mt-3 flex flex-col gap-3 rounded-lg bg-foreground/[0.04] p-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>
                Đang lọc{filters.q ? ` theo "${filters.q}"` : ""}
                {filters.tags.length > 0 ? ` với ${filters.tags.length} tag` : ""}.
              </span>
              <Link
                href={`/category/${slug}`}
                className="inline-flex items-center gap-2 font-bold text-primary transition-colors hover:text-primary/80"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Xóa lọc
              </Link>
            </div>
          ) : null}
        </div>
      </details>

      {visibleTags.length > 0 ? (
        <nav
          aria-label="Lọc video theo tag"
          className="-mx-6 overflow-x-auto px-6 [-ms-overflow-style:none] [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex min-w-max items-center gap-2">
            <Link
              href={buildCategoryHref(slug, { q: filters.q || undefined })}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                filters.tags.length === 0
                  ? "bg-foreground text-background"
                  : "bg-foreground/10 text-foreground hover:bg-foreground/15"
              }`}
            >
              Tất cả
            </Link>
            {visibleTags.map((tag) => {
              const isSelected = selectedTagSet.has(tag.slug);

              return (
                <Link
                  key={tag.id}
                  href={buildTagHref(slug, filters, tag.slug)}
                  className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                    isSelected
                      ? "bg-foreground text-background"
                      : "bg-foreground/10 text-foreground hover:bg-foreground/15"
                  }`}
                >
                  {tag.name}
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </section>
  );
}

function PaginationControls({ slug, pagination }: { slug: string; pagination: ApiPagination }) {
  const hasPrevious = pagination.page > 1;
  const hasNext = pagination.page < pagination.totalPages;

  return (
    <nav className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <span>
        Trang <strong className="text-foreground">{pagination.page}</strong> / {pagination.totalPages}
      </span>
      <div className="flex gap-2">
        {hasPrevious ? (
          <Link
            href={buildCategoryHref(slug, { page: pagination.page - 1 })}
            className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-border px-4 font-bold text-foreground transition-colors hover:border-primary/50 hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Trang trước
          </Link>
        ) : (
          <span className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-border px-4 font-bold text-muted-foreground/50">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Trang trước
          </span>
        )}
        {hasNext ? (
          <Link
            href={buildCategoryHref(slug, { page: pagination.page + 1 })}
            className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-primary px-4 font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Trang sau
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : (
          <span className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-border px-4 font-bold text-muted-foreground/50">
            Trang sau
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>
    </nav>
  );
}

export function CategoryFeature({
  slug,
  category,
  videos,
  tags,
  pagination,
  filters,
  errorMessage,
  formAction,
  isLatest = false,
}: CategoryFeatureProps) {
  const title = getCategoryTitle(slug, category, isLatest);
  const description = getCategoryDescription(category, isLatest);
  const heroImageUrl = getHeroImageUrl(videos);
  const hasFilters = Boolean(filters.q || filters.tags.length > 0);
  const totalVideos = pagination?.total ?? videos.length;

  return (
    <main className="min-h-screen bg-background pb-16 pt-20 md:pl-64">
      <section className="relative overflow-hidden border-b border-border bg-card">
        <div className="absolute inset-0">
          <VideoThumbnail
            src={heroImageUrl}
            alt="Ảnh nền thể loại"
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
        </div>

        <div className="relative mx-auto flex min-h-[340px] max-w-7xl items-end px-6 py-10 md:px-10 lg:px-12">
          <div className="flex w-full flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-foreground px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-background">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  Public Collection
                </span>
                <span className="rounded-full bg-background/70 px-3 py-1.5 text-xs font-bold text-muted-foreground">
                  /category/{slug || "unknown"}
                </span>
              </div>

              <h1 className="font-headline text-3xl font-black uppercase leading-none tracking-tight text-foreground md:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                {description}
              </p>
            </div>

            <dl className="grid w-full max-w-sm grid-cols-3 overflow-hidden rounded-lg border border-border bg-background/80 text-center text-sm sm:flex-shrink-0">
              <div className="p-3">
                <dt className="text-xs font-bold text-muted-foreground">Tổng</dt>
                <dd className="mt-1 font-headline text-xl font-black text-foreground">{totalVideos}</dd>
              </div>
              <div className="border-x border-border p-3">
                <dt className="text-xs font-bold text-muted-foreground">Hiển thị</dt>
                <dd className="mt-1 font-headline text-xl font-black text-foreground">{videos.length}</dd>
              </div>
              <div className="p-3">
                <dt className="text-xs font-bold text-muted-foreground">Public</dt>
                <dd className="mt-1 font-headline text-xl font-black text-secondary">Ready</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-6 px-6 py-6 md:px-10 lg:px-12">
        <FilterPanel slug={slug} filters={filters} tags={tags} formAction={formAction} />

        {errorMessage ? <ErrorNotice message={errorMessage} /> : null}

        <section>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <ListVideo className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <h2 className="font-headline text-2xl font-extrabold tracking-tight text-foreground">
                {hasFilters ? "Kết quả phù hợp" : "Tất cả video"}
              </h2>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {videos.length} video
            </p>
          </div>

          {videos.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <EmptyState hasFilters={hasFilters} slug={slug} />
          )}
        </section>

        {!hasFilters && !isLatest && pagination && pagination.totalPages > 1 ? (
          <PaginationControls slug={slug} pagination={pagination} />
        ) : null}
      </div>
    </main>
  );
}
