import Form from "next/form";
import { VideoThumbnail } from "@/shared/components/VideoThumbnail";
import { Link } from "@/i18n/routing";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coins,
  Eye,
  Film,
  ListVideo,
  Lock,
  Search,
  Sparkles,
  Tag,
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
      <article className="h-full overflow-hidden rounded-lg bg-card transition-transform duration-300 hover:-translate-y-0.5">
        <div className="relative aspect-video overflow-hidden bg-muted">
          <VideoThumbnail
            src={thumbnailUrl}
            alt={displayTitle}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent opacity-80" />
          <div className="absolute bottom-3 right-3 rounded-sm bg-background/90 px-2 py-1 text-[11px] font-bold text-foreground">
            {formatDuration(video.durationSeconds)}
          </div>
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
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

        <div className="space-y-5 p-5 pt-6">
          <div>
            <h3 className="line-clamp-2 font-headline text-xl font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary">
              {displayTitle}
            </h3>
            <p className="mt-3 line-clamp-2 text-sm leading-7 text-muted-foreground">
              {video.description || "Video công khai trong Velvet Gallery."}
            </p>
          </div>

          <div className="space-y-2 text-xs leading-6 text-muted-foreground">
            <p className="font-medium">{getChannelLabel(video)}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                {formatViewCount(video.viewCount)} lượt xem
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {formatPublishedAt(video.publishedAt || video.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {hasCoinPrice ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/25 px-3 py-1.5 text-xs font-bold text-secondary">
                <Coins className="h-3.5 w-3.5" aria-hidden="true" />
                {video.price} Coin
              </span>
            ) : (
              <span className="rounded-full bg-emerald-600/80 px-3 py-1.5 text-xs font-bold text-white">
                Free
              </span>
            )}
            {video.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-foreground/5 px-3 py-1.5 text-xs font-medium text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
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

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-secondary">
            <Search className="h-4 w-4" aria-hidden="true" />
            Bộ lọc public videos
          </div>
          <h2 className="mt-2 font-headline text-2xl font-extrabold tracking-tight text-foreground">
            Tìm trong thể loại này
          </h2>
        </div>

        <Form action={formAction} className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-xl">
          <label className="sr-only" htmlFor="category-query">
            Từ khóa tìm kiếm video
          </label>
          <input
            id="category-query"
            name="q"
            defaultValue={filters.q}
            placeholder="Tìm theo tiêu đề hoặc mô tả"
            className="h-12 flex-1 rounded-sm border border-border bg-input px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30"
          />
          {filters.tags.length > 0 ? (
            <input type="hidden" name="tags" value={filters.tags.join(",")} />
          ) : null}
          <button
            type="submit"
            className="h-12 rounded-sm bg-primary/80 px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/70 active:bg-primary/60"
          >
            Tìm kiếm
          </button>
        </Form>
      </div>

      {tags.length > 0 ? (
        <div className="mt-5 border-t border-border pt-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
            <Tag className="h-4 w-4 text-secondary" aria-hidden="true" />
            Lọc theo tag
          </div>
          <div className="flex flex-wrap gap-3">
            {tags.slice(0, 18).map((tag) => {
              const isSelected = selectedTagSet.has(tag.slug);

              return (
                <Link
                  key={tag.id}
                  href={buildTagHref(slug, filters, tag.slug)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                    isSelected
                      ? "bg-primary/85 text-primary-foreground hover:bg-primary/75"
                      : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                  }`}
                >
                  #{tag.name}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      {filters.q || filters.tags.length > 0 ? (
        <div className="mt-5 flex items-center justify-between rounded-sm border border-border bg-muted p-3 text-sm text-muted-foreground">
          <span>
            Đang lọc{filters.q ? ` theo "${filters.q}"` : ""}
            {filters.tags.length > 0 ? ` với ${filters.tags.length} tag` : ""}.
          </span>
          <Link href={`/category/${slug}`} className="font-bold text-primary hover:text-primary/80">
            Xóa lọc
          </Link>
        </div>
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

        <div className="relative mx-auto flex min-h-[520px] max-w-7xl items-end px-6 py-14 md:px-10 lg:px-12">
          <div className="max-w-4xl">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-sm bg-secondary px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-secondary-foreground">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Public Collection
              </span>
              <span className="rounded-sm border border-border bg-card px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                /category/{slug || "unknown"}
              </span>
            </div>

            <h1 className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text font-headline text-4xl font-black uppercase leading-[0.96] tracking-tight text-transparent md:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              {description}
            </p>

            <div className="mt-8 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-foreground/5 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Tổng video</p>
                <p className="mt-2 font-headline text-3xl font-black text-foreground">{totalVideos}</p>
              </div>
              <div className="rounded-lg bg-foreground/5 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Đang hiển thị</p>
                <p className="mt-2 font-headline text-3xl font-black text-foreground">{videos.length}</p>
              </div>
              <div className="rounded-lg bg-foreground/5 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Trạng thái</p>
                <p className="mt-2 font-headline text-lg font-black text-secondary">Ready + Public</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-8 px-6 py-10 md:px-10 lg:px-12">
        <FilterPanel slug={slug} filters={filters} tags={tags} formAction={formAction} />

        {errorMessage ? <ErrorNotice message={errorMessage} /> : null}

        <section>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                <ListVideo className="h-4 w-4" aria-hidden="true" />
                {hasFilters ? "Kết quả lọc" : "Category videos"}
              </div>
              <h2 className="mt-2 font-headline text-3xl font-extrabold tracking-tight text-foreground">
                {hasFilters ? "Video phù hợp" : "Video trong bộ sưu tập"}
              </h2>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {videos.length} video đang hiển thị
            </p>
          </div>

          {videos.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
