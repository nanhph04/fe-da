import Form from "next/form";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import {
  AlertTriangle,
  CalendarDays,
  Clock3,
  Coins,
  Compass,
  Eye,
  Filter,
  Hash,
  Lock,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tag,
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
} from "@/features/watch/services/publicMediaService";

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
  if (video.channel?.name) {
    return video.channel.name;
  }

  return `Kenh ${video.channelId.slice(0, 8)}`;
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--primary),transparent_34%)] opacity-10" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
      <div className="relative mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-12">
        <div className="max-w-4xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-sm border border-border bg-background/80 px-3 py-2 text-xs font-bold uppercase tracking-[0.22em] text-secondary">
            <Compass className="h-4 w-4" aria-hidden="true" />
            Search & Discovery
          </div>
          <h1 className="font-headline text-4xl font-black tracking-tight text-foreground md:text-6xl">
            Tim noi dung tren Velvet Gallery
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
            Tim video theo tieu de, mo ta, the loai, tag; khi co tu khoa, he thong dong thoi tra ve kenh public phu hop.
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3 lg:max-w-3xl">
          <div className="rounded-lg border border-border bg-background/70 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Video</p>
            <p className="mt-2 font-headline text-3xl font-black text-foreground">{videosCount}</p>
          </div>
          <div className="rounded-lg border border-border bg-background/70 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Kenh</p>
            <p className="mt-2 font-headline text-3xl font-black text-foreground">{channelsCount}</p>
          </div>
          <div className="rounded-lg border border-border bg-background/70 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Bo loc</p>
            <p className="mt-2 font-headline text-3xl font-black text-foreground">{activeFilterCount}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
          <span className="rounded-sm bg-background/80 px-3 py-2">Che do: {mode === "latest" ? "Moi nhat" : "Tim kiem public"}</span>
          <span className="rounded-sm bg-background/80 px-3 py-2">{getCategoryLabel(filters, categories)}</span>
          <span className="rounded-sm bg-background/80 px-3 py-2">Limit {filters.limit}</span>
        </div>
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
  const visibleTags = tags.slice(0, 24);
  const visibleCategories = categories.slice(0, 10);
  const activeFilters = hasActiveFilters(filters);

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-secondary">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Bo loc media public
          </div>
          <h2 className="mt-2 font-headline text-2xl font-extrabold tracking-tight text-foreground">
            Tim kiem thong minh
          </h2>
        </div>
        {activeFilters ? (
          <Link
            href="/search"
            className="inline-flex min-h-11 w-fit items-center gap-2 rounded-sm border border-border px-4 text-sm font-bold text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Xoa bo loc
          </Link>
        ) : null}
      </div>

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
              className="h-12 w-full rounded-sm border border-border bg-input pl-11 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30"
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
            className="h-12 w-full rounded-sm border border-border bg-input px-4 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/30"
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
            className="h-12 w-full rounded-sm border border-border bg-input px-4 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/30"
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
          className="inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-primary px-6 text-sm font-black text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          Tim kiem
        </button>
      </Form>

      {visibleCategories.length > 0 ? (
        <div className="mt-6 border-t border-border pt-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
            <Filter className="h-4 w-4 text-secondary" aria-hidden="true" />
            The loai noi bat
          </div>
          <div className="flex flex-wrap gap-2">
            {visibleCategories.map((category) => {
              const isSelected = filters.category === category.slug;

              return (
                <Link
                  key={category.id}
                  href={buildSearchHref(filters, {
                    category: isSelected ? "" : category.slug,
                    limit: DEFAULT_LIMIT,
                  })}
                  className={`rounded-sm border px-3 py-2 text-xs font-bold transition-colors ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-foreground/5 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {category.name}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      {visibleTags.length > 0 ? (
        <div className="mt-6 border-t border-border pt-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
            <Tag className="h-4 w-4 text-secondary" aria-hidden="true" />
            Tag public
          </div>
          <div className="flex flex-wrap gap-2">
            {visibleTags.map((tag) => {
              const isSelected = selectedTagSet.has(tag.slug);

              return (
                <Link
                  key={tag.id}
                  href={buildTagHref(filters, tag.slug)}
                  className={`inline-flex items-center gap-1 rounded-sm border px-3 py-2 text-xs font-bold transition-colors ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-foreground/5 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  <Hash className="h-3 w-3" aria-hidden="true" />
                  {tag.name}
                </Link>
              );
            })}
          </div>
        </div>
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
    <Link href={`/watch/${video.id}`} className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <article className="h-full overflow-hidden rounded-lg border border-border bg-card transition-transform duration-300 hover:-translate-y-0.5">
        <div className="relative aspect-video overflow-hidden bg-muted">
          <Image
            src={thumbnailUrl}
            alt={displayTitle}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/15 to-transparent" />
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

        <div className="space-y-5 p-5">
          <div>
            <h3 className="line-clamp-2 font-headline text-xl font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary">
              {displayTitle}
            </h3>
            <p className="mt-3 line-clamp-2 text-sm leading-7 text-muted-foreground">
              {video.description || "Video public trong Velvet Gallery."}
            </p>
          </div>

          <div className="space-y-2 text-xs leading-6 text-muted-foreground">
            <p className="font-medium text-foreground/80">{getChannelLabel(video)}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                {formatViewCount(video.viewCount)} luot xem
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                {formatPublishedAt(video.publishedAt || video.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {hasCoinPrice ? (
              <span className="inline-flex items-center gap-1.5 rounded-sm bg-secondary px-2.5 py-1.5 text-xs font-bold text-secondary-foreground">
                <Coins className="h-3.5 w-3.5" aria-hidden="true" />
                {video.price} Coin
              </span>
            ) : (
              <span className="rounded-sm bg-foreground/10 px-2.5 py-1.5 text-xs font-bold text-foreground">
                Free
              </span>
            )}
            {video.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-sm bg-muted px-2.5 py-1.5 text-xs font-medium text-muted-foreground"
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

      <div className="mx-auto max-w-7xl space-y-8 px-6 py-10 md:px-10 lg:px-12">
        <FilterPanel
          filters={filters}
          categories={categories}
          tags={tags}
          formAction={formAction}
        />

        {errorMessage ? <ErrorNotice message={errorMessage} /> : null}

        {shouldShowChannels ? (
          <section className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                  Kenh public
                </div>
                <h2 className="mt-2 font-headline text-2xl font-extrabold tracking-tight text-foreground">
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
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                <Video className="h-4 w-4" aria-hidden="true" />
                {mode === "latest" ? "Discovery latest" : "Public videos"}
              </div>
              <h2 className="mt-2 font-headline text-3xl font-extrabold tracking-tight text-foreground">
                {getResultHeading(mode, filters)}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {getResultDescription(mode, filters, categories)}
              </p>
            </div>
            <p className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock3 className="h-4 w-4" aria-hidden="true" />
              {videos.length} video dang hien thi
            </p>
          </div>

          {videos.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
