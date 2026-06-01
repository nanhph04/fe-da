import Form from "next/form";
import { VideoThumbnail } from "@/shared/components/VideoThumbnail";
import { Link } from "@/i18n/routing";
import {
  AlertTriangle,
  Coins,
  Lock,
  Search,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  Video,
  X,
} from "lucide-react";
import { formatDuration, formatViewCount } from "@/features/home/utils/format";
import {
  getReadyPublicThumbnailUrl,
  type CategoryPublic,
  type PublicDiscoveryVideo,
  type PublicSearchChannel,
  type TagPublic,
} from "@/features/watch/services/publicMedia.types";

const FALLBACK_THUMBNAIL = "/images/thumbnail.png";
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const LIMIT_OPTIONS = [12, 20, 32, 50] as const;

type SearchFilters = {
  q: string;
  category: string;
  tags: string[];
  limit: number;
};

export type SearchMode = "latest" | "media-search" | "tag-filtered";

type SearchFeatureProps = {
  filters: SearchFilters;
  videos: PublicDiscoveryVideo[];
  channels: PublicSearchChannel[];
  categories: CategoryPublic[];
  tags: TagPublic[];
  errorMessage: string | null;
  formAction: string;
  mode: SearchMode;
};

type SearchHrefOverrides = Partial<SearchFilters>;

function hasActiveFilters(filters: SearchFilters) {
  return Boolean(filters.q || filters.category || filters.tags.length > 0);
}

function getActiveFilterCount(filters: SearchFilters) {
  return [filters.q, filters.category, filters.tags.length > 0 ? "tags" : ""].filter(Boolean)
    .length;
}

function buildSearchHref(filters: SearchFilters, overrides: SearchHrefOverrides = {}) {
  const nextFilters: SearchFilters = {
    q: overrides.q ?? filters.q,
    category: overrides.category ?? filters.category,
    tags: overrides.tags ?? filters.tags,
    limit: overrides.limit ?? filters.limit,
  };
  const query = new URLSearchParams();

  if (nextFilters.q.trim()) {
    query.set("q", nextFilters.q.trim());
  }

  if (nextFilters.category.trim()) {
    query.set("category", nextFilters.category.trim());
  }

  if (nextFilters.tags.length > 0) {
    query.set("tags", nextFilters.tags.join(","));
  }

  if (nextFilters.limit !== DEFAULT_LIMIT) {
    query.set("limit", String(nextFilters.limit));
  }

  const queryString = query.toString();
  return `/search${queryString ? `?${queryString}` : ""}`;
}

function buildTagHref(filters: SearchFilters, tagSlug: string) {
  const selectedTags = new Set(filters.tags);

  if (selectedTags.has(tagSlug)) {
    selectedTags.delete(tagSlug);
  } else {
    selectedTags.add(tagSlug);
  }

  return buildSearchHref(filters, {
    tags: Array.from(selectedTags),
    limit: DEFAULT_LIMIT,
  });
}

function formatPublishedAt(value: string | null) {
  if (!value) {
    return "Chua cong bo";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Chua cong bo";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function getPrimaryResolution(resolutions: string[]) {
  return (
    [...resolutions].sort(
      (left, right) => Number.parseInt(right, 10) - Number.parseInt(left, 10)
    )[0] || "HD"
  );
}

function getDisplayTitle(video: PublicDiscoveryVideo) {
  return video.title.trim() || "Video public trong Velvet Gallery";
}

function getChannelLabel(video: PublicDiscoveryVideo) {
  if (video.channelName) {
    return video.channelName;
  }
  if (video.channel?.name) {
    return video.channel.name;
  }

  return `Kenh ${video.channelId.slice(0, 8)}`;
}

function getChannelInitial(video: PublicDiscoveryVideo) {
  return getChannelLabel(video).trim().charAt(0).toUpperCase() || "V";
}

function getCategoryLabel(filters: SearchFilters, categories: CategoryPublic[]) {
  if (!filters.category) {
    return "Tat ca the loai";
  }

  return categories.find((category) => category.slug === filters.category)?.name || filters.category;
}

function getResultHeading(mode: SearchMode, filters: SearchFilters) {
  if (mode === "latest") {
    return "Video moi nhat";
  }

  if (filters.tags.length > 0) {
    return "Video khop bo loc tag";
  }

  if (filters.category && !filters.q) {
    return "Video trong the loai";
  }

  return "Ket qua tim kiem";
}

function getResultDescription(mode: SearchMode, filters: SearchFilters, categories: CategoryPublic[]) {
  if (mode === "latest") {
    return "Chua co tu khoa, he thong hien thi video ready + public moi nhat tu Media Service.";
  }

  const parts: string[] = [];

  if (filters.q) {
    parts.push(`tu khoa "${filters.q}"`);
  }

  if (filters.category) {
    parts.push(`the loai ${getCategoryLabel(filters, categories)}`);
  }

  if (filters.tags.length > 0) {
    parts.push(`${filters.tags.length} tag da chon`);
  }

  return parts.length > 0
    ? `Dang loc theo ${parts.join(", ")}.`
    : "Nhap tu khoa hoac chon the loai de tim kiem video va kenh public.";
}

function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-5 text-sm text-foreground">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" aria-hidden="true" />
        <div>
          <p className="font-headline font-bold">Khong the tai day du du lieu</p>
          <p className="mt-1 leading-6 text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
}

function SearchHero({
  filters,
  videosCount,
  channelsCount,
  categories,
  mode,
}: {
  filters: SearchFilters;
  videosCount: number;
  channelsCount: number;
  categories: CategoryPublic[];
  mode: SearchMode;
}) {
  const activeFilterCount = getActiveFilterCount(filters);

  return (
    <section className="relative overflow-hidden border-b border-border bg-card">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--primary),transparent_32%)] opacity-10" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-5 px-6 py-10 md:px-10 lg:px-12 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-foreground px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-background">
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            Search
          </div>
          <h1 className="font-headline text-3xl font-black tracking-tight text-foreground md:text-5xl">
            Tim noi dung tren Velvet Gallery
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
            Tim video, kenh public, the loai va tag trong mot trang ket qua gon nhu feed video.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
            <span className="rounded-full bg-background/80 px-3 py-2">{mode === "latest" ? "Moi nhat" : "Tim kiem public"}</span>
            <span className="rounded-full bg-background/80 px-3 py-2">{getCategoryLabel(filters, categories)}</span>
            <span className="rounded-full bg-background/80 px-3 py-2">Limit {filters.limit}</span>
          </div>
        </div>

        <dl className="grid w-full max-w-sm grid-cols-3 overflow-hidden rounded-lg border border-border bg-background/80 text-center text-sm xl:flex-shrink-0">
          <div className="p-3">
            <dt className="text-xs font-bold text-muted-foreground">Video</dt>
            <dd className="mt-1 font-headline text-xl font-black text-foreground">{videosCount}</dd>
          </div>
          <div className="border-x border-border p-3">
            <dt className="text-xs font-bold text-muted-foreground">Kenh</dt>
            <dd className="mt-1 font-headline text-xl font-black text-foreground">{channelsCount}</dd>
          </div>
          <div className="p-3">
            <dt className="text-xs font-bold text-muted-foreground">Bo loc</dt>
            <dd className="mt-1 font-headline text-xl font-black text-secondary">{activeFilterCount}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

function FilterPanel({
  filters,
  categories,
  tags,
  formAction,
}: {
  filters: SearchFilters;
  categories: CategoryPublic[];
  tags: TagPublic[];
  formAction: string;
}) {
  const selectedTagSet = new Set(filters.tags);
  const visibleTags = tags.slice(0, 18);
  const visibleCategories = categories.slice(0, 12);
  const activeFilters = hasActiveFilters(filters);

  return (
    <section className="space-y-3">
      <details className="group rounded-lg border border-border/80 bg-card" open={activeFilters || undefined}>
        <summary className="flex cursor-pointer list-none flex-col gap-3 px-4 py-3 outline-none transition-colors hover:bg-foreground/[0.03] focus-visible:ring-2 focus-visible:ring-ring/70 sm:flex-row sm:items-center sm:justify-between [&::-webkit-details-marker]:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-foreground/10 text-foreground">
              <Search className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="font-headline text-lg font-extrabold tracking-tight text-foreground">
                Tim kiem va bo loc
              </h2>
              <p className="truncate text-sm text-muted-foreground">
                {activeFilters ? "Dang ap dung bo loc" : "Bam de mo bo loc tim kiem"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            {activeFilters ? (
              <span className="rounded-full bg-foreground/10 px-3 py-2 font-bold text-foreground">
                {getActiveFilterCount(filters)} bo loc
              </span>
            ) : null}
            <span className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-4 font-bold text-background transition-transform group-open:scale-[0.98]">
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              <span className="group-open:hidden">Mo</span>
              <span className="hidden group-open:inline">An</span>
            </span>
          </div>
        </summary>

        <div className="border-t border-border px-4 py-4">
          <Form action={formAction} className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(180px,0.65fr)_140px_auto]">
            <div>
              <label className="sr-only" htmlFor="global-search-query">
                Tu khoa tim kiem
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input
                  id="global-search-query"
                  name="q"
                  type="search"
                  defaultValue={filters.q}
                  maxLength={200}
                  placeholder="Tim theo tieu de, mo ta video hoac ten kenh"
                  className="h-11 w-full rounded-full border border-border bg-input pl-11 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>

            <div>
              <label className="sr-only" htmlFor="global-search-category">
                The loai
              </label>
              <select
                id="global-search-category"
                name="category"
                defaultValue={filters.category}
                className="h-11 w-full rounded-full border border-border bg-input px-4 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/30"
              >
                <option value="">Tat ca the loai</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="sr-only" htmlFor="global-search-limit">
                So luong ket qua
              </label>
              <select
                id="global-search-limit"
                name="limit"
                defaultValue={String(filters.limit)}
                className="h-11 w-full rounded-full border border-border bg-input px-4 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/30"
              >
                {LIMIT_OPTIONS.map((limit) => (
                  <option key={limit} value={limit}>
                    {limit} ket qua
                  </option>
                ))}
              </select>
            </div>

            {filters.tags.map((tag) => (
              <input key={tag} type="hidden" name="tags" value={tag} />
            ))}

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-black text-primary-foreground transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Tim kiem
            </button>
          </Form>

          {activeFilters ? (
            <div className="mt-3 flex flex-col gap-3 rounded-lg bg-foreground/[0.04] p-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>{getResultDescription("media-search", filters, categories)}</span>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 font-bold text-primary transition-colors hover:text-primary/80"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Xoa bo loc
              </Link>
            </div>
          ) : null}
        </div>
      </details>

      {visibleCategories.length > 0 ? (
        <nav
          aria-label="Loc video theo the loai"
          className="-mx-6 overflow-x-auto px-6 [-ms-overflow-style:none] [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex min-w-max items-center gap-2">
            <Link
              href={buildSearchHref(filters, { category: "", limit: DEFAULT_LIMIT })}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                filters.category === ""
                  ? "bg-foreground text-background"
                  : "bg-foreground/10 text-foreground hover:bg-foreground/15"
              }`}
            >
              Tat ca
            </Link>
            {visibleCategories.map((category) => {
              const isSelected = filters.category === category.slug;

              return (
                <Link
                  key={category.id}
                  href={buildSearchHref(filters, {
                    category: isSelected ? "" : category.slug,
                    limit: DEFAULT_LIMIT,
                  })}
                  className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                    isSelected
                      ? "bg-foreground text-background"
                      : "bg-foreground/10 text-foreground hover:bg-foreground/15"
                  }`}
                >
                  {category.name}
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}

      {visibleTags.length > 0 ? (
        <nav
          aria-label="Loc video theo tag"
          className="-mx-6 overflow-x-auto px-6 [-ms-overflow-style:none] [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex min-w-max items-center gap-2">
            {visibleTags.map((tag) => {
              const isSelected = selectedTagSet.has(tag.slug);

              return (
                <Link
                  key={tag.id}
                  href={buildTagHref(filters, tag.slug)}
                  className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                    isSelected
                      ? "bg-foreground text-background"
                      : "bg-foreground/10 text-foreground hover:bg-foreground/15"
                  }`}
                >
                  #{tag.name}
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </section>
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
    <article className="group h-full rounded-lg transition-colors hover:bg-foreground/[0.04]">
      {/* Thumbnail Link */}
      <Link href={`/watch/${video.id}`} aria-label={`Watch ${displayTitle}`} className="block focus:outline-none">
        <div className="relative aspect-video overflow-hidden rounded-lg bg-muted cursor-pointer">
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
      </Link>

      <div className="flex gap-3 px-1 pt-3">
        {/* Channel Avatar Link */}
        <Link href={`/channel/${video.channelId}`} className="block focus:outline-none">
          <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-muted text-sm font-black text-foreground hover:bg-muted/80 transition-colors">
            {getChannelInitial(video)}
          </div>
        </Link>
        <div className="min-w-0 flex-1">
          {/* Title Link */}
          <Link href={`/watch/${video.id}`} className="block group-hover:text-primary transition-colors">
            <h3 className="line-clamp-2 text-[15px] font-bold leading-snug tracking-tight text-foreground">
              {displayTitle}
            </h3>
          </Link>
          {/* Channel Name Link */}
          <Link href={`/channel/${video.channelId}`} className="inline-block mt-1 truncate text-sm font-medium text-muted-foreground hover:text-primary transition-colors max-w-full">
            {getChannelLabel(video)}
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span>{formatViewCount(video.viewCount)} luot xem</span>
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
  );
}

function ChannelCard({ channel }: { channel: PublicSearchChannel }) {
  const avatarUrl = channel.avatarUrl?.trim() || FALLBACK_THUMBNAIL;
  const bio = channel.bio?.trim() || "Kenh creator dang hoat dong tren Velvet Gallery.";

  return (
    <Link href={`/channel/${channel.id}`} className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <article className="h-full rounded-lg border border-border bg-card p-5 transition-transform duration-300 hover:-translate-y-0.5 hover:border-primary/50">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border border-border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt={channel.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-1 font-headline text-lg font-bold text-foreground transition-colors group-hover:text-primary">
              {channel.name}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{bio}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="inline-flex items-center gap-1 rounded-sm bg-foreground/10 px-2.5 py-1.5 text-muted-foreground">
            <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
            {channel.status}
          </span>
          {channel.isEligibleForMembership ? (
            <span className="rounded-sm bg-secondary px-2.5 py-1.5 text-secondary-foreground">
              Membership
            </span>
          ) : null}
        </div>
      </article>
    </Link>
  );
}

function EmptyState({ mode, filters }: { mode: SearchMode; filters: SearchFilters }) {
  const activeFilters = hasActiveFilters(filters);

  return (
    <div className="rounded-lg border border-border bg-card p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-sm bg-muted text-muted-foreground">
        {mode === "latest" ? <Sparkles className="h-7 w-7" aria-hidden="true" /> : <Search className="h-7 w-7" aria-hidden="true" />}
      </div>
      <h3 className="mt-6 font-headline text-2xl font-extrabold tracking-tight text-foreground">
        {activeFilters ? "Khong co ket qua phu hop" : "Chua co video public moi"}
      </h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
        {activeFilters
          ? "Thu rut gon tu khoa, bo bot tag hoac chon the loai khac de mo rong ket qua."
          : "Media Service chua tra ve video ready + public cho man hinh tim kiem."}
      </p>
      {activeFilters ? (
        <Link
          href="/search"
          className="mt-6 inline-flex min-h-11 items-center rounded-sm bg-primary px-5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Xoa bo loc
        </Link>
      ) : null}
    </div>
  );
}

function ChannelEmptyState() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
      Khong co kenh public nao khop tu khoa nay. Ket qua video van duoc loc theo bo loc hien tai.
    </div>
  );
}

function LoadMoreLink({ filters }: { filters: SearchFilters }) {
  if (filters.limit >= MAX_LIMIT) {
    return null;
  }

  const nextLimit = Math.min(MAX_LIMIT, filters.limit + 20);

  return (
    <div className="mt-10 text-center">
      <Link
        href={buildSearchHref(filters, { limit: nextLimit })}
        className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-border bg-card px-6 text-sm font-bold text-foreground transition-colors hover:border-primary/50 hover:bg-muted"
      >
        Tai them den {nextLimit} ket qua
      </Link>
    </div>
  );
}

export function SearchFeature({
  filters,
  videos,
  channels,
  categories,
  tags,
  errorMessage,
  formAction,
  mode,
}: SearchFeatureProps) {
  const shouldShowChannels = Boolean(filters.q);
  const canLoadMore = videos.length >= filters.limit && filters.limit < MAX_LIMIT;

  return (
    <main className="min-h-screen bg-background pt-24 md:pl-64">
      <SearchHero
        filters={filters}
        videosCount={videos.length}
        channelsCount={channels.length}
        categories={categories}
        mode={mode}
      />

      <div className="mx-auto max-w-7xl space-y-6 px-6 py-6 md:px-10 lg:px-12">
        <FilterPanel
          filters={filters}
          categories={categories}
          tags={tags}
          formAction={formAction}
        />

        {errorMessage ? <ErrorNotice message={errorMessage} /> : null}

        {shouldShowChannels ? (
          <section className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <UserRound className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <h2 className="font-headline text-2xl font-extrabold tracking-tight text-foreground">
                  Kenh khop tu khoa
                </h2>
              </div>
              <p className="text-sm font-medium text-muted-foreground">{channels.length} kenh</p>
            </div>

            {channels.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {channels.map((channel) => (
                  <ChannelCard key={channel.id} channel={channel} />
                ))}
              </div>
            ) : (
              <ChannelEmptyState />
            )}
          </section>
        ) : null}

        <section>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <h2 className="font-headline text-2xl font-extrabold tracking-tight text-foreground">
                  {getResultHeading(mode, filters)}
                </h2>
              </div>
              <p className="mt-1 max-w-2xl truncate text-sm text-muted-foreground">
                {getResultDescription(mode, filters, categories)}
              </p>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {videos.length} video
            </p>
          </div>

          {videos.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {videos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
              {canLoadMore ? <LoadMoreLink filters={filters} /> : null}
            </>
          ) : (
            <EmptyState mode={mode} filters={filters} />
          )}
        </section>
      </div>
    </main>
  );
}
