import { setRequestLocale } from "next-intl/server";
import { SearchFeature } from "@/features/discovery";
import {
  getCategoriesCached,
  getLatestVideosCached,
  getPublicVideosCached,
  getTagsCached,
  searchPublicMediaCached,
  type CategoryPublic,
  type PublicDiscoveryVideo,
  type PublicSearchChannel,
  type TagPublic,
} from "@/features/watch/services/publicMediaService";

const DEFAULT_SEARCH_LIMIT = 20;
const MAX_SEARCH_LIMIT = 50;

type SearchPageParams = {
  locale: string;
};

type SearchPageSearchParams = Record<string, string | string[] | undefined>;

type SearchFilters = {
  q: string;
  category: string;
  tags: string[];
  limit: number;
};

type SearchMode = "latest" | "media-search" | "tag-filtered";

type SearchResultState = {
  videos: PublicDiscoveryVideo[];
  channels: PublicSearchChannel[];
  errorMessage: string | null;
  mode: SearchMode;
};

function getSearchValue(searchParams: SearchPageSearchParams, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

function getSearchValues(searchParams: SearchPageSearchParams, key: string) {
  const value = searchParams[key];

  if (Array.isArray(value)) {
    return value;
  }

  return value ? [value] : [];
}

function normalizeTextParam(value: string | undefined, maxLength: number) {
  const normalized = value?.trim() || "";
  return normalized.slice(0, maxLength);
}

function parseLimit(value?: string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_SEARCH_LIMIT;
  }

  return Math.min(MAX_SEARCH_LIMIT, Math.floor(parsed));
}

function parseTags(values: string[]) {
  return Array.from(
    new Set(
      values
        .flatMap((value) => value.split(","))
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  );
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object") {
    const apiError = error as { mess?: string; message?: string; errors?: string[] };
    return apiError.mess || apiError.message || apiError.errors?.join(", ") || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function buildFilters(searchParams: SearchPageSearchParams): SearchFilters {
  return {
    q: normalizeTextParam(getSearchValue(searchParams, "q"), 200),
    category: normalizeTextParam(getSearchValue(searchParams, "category"), 100),
    tags: parseTags(getSearchValues(searchParams, "tags")),
    limit: parseLimit(getSearchValue(searchParams, "limit")),
  };
}

async function loadSearchResults(filters: SearchFilters): Promise<SearchResultState> {
  const hasQueryOrCategory = Boolean(filters.q || filters.category);
  const hasTags = filters.tags.length > 0;

  try {
    if (hasTags) {
      const videoResponse = await getPublicVideosCached({
        q: filters.q || undefined,
        category: filters.category || undefined,
        tags: filters.tags,
        limit: filters.limit,
      });
      const videos = videoResponse.success ? videoResponse.data ?? [] : [];
      let channels: PublicSearchChannel[] = [];
      let errorMessage = videoResponse.success
        ? null
        : videoResponse.mess || "Khong the tai danh sach video theo tag.";

      if (filters.q) {
        try {
          const channelResponse = await searchPublicMediaCached({
            q: filters.q,
            category: filters.category || undefined,
            limit: filters.limit,
          });

          if (channelResponse.success && channelResponse.data) {
            channels = channelResponse.data.channels ?? [];
          } else {
            errorMessage =
              errorMessage || channelResponse.mess || "Khong the tai ket qua kenh phu hop.";
          }
        } catch (error) {
          errorMessage =
            errorMessage || getApiErrorMessage(error, "Khong the tai ket qua kenh phu hop.");
        }
      }

      return {
        videos,
        channels,
        errorMessage,
        mode: "tag-filtered",
      };
    }

    if (hasQueryOrCategory) {
      const response = await searchPublicMediaCached({
        q: filters.q || undefined,
        category: filters.category || undefined,
        limit: filters.limit,
      });

      return {
        videos: response.success ? response.data?.videos ?? [] : [],
        channels: response.success ? response.data?.channels ?? [] : [],
        errorMessage: response.success
          ? null
          : response.mess || "Khong the tai ket qua tim kiem tu Media Service.",
        mode: "media-search",
      };
    }

    const latestResponse = await getLatestVideosCached(filters.limit);

    return {
      videos: latestResponse.success ? latestResponse.data ?? [] : [],
      channels: [],
      errorMessage: latestResponse.success
        ? null
        : latestResponse.mess || "Khong the tai danh sach video moi nhat.",
      mode: "latest",
    };
  } catch (error) {
    return {
      videos: [],
      channels: [],
      errorMessage: getApiErrorMessage(error, "Khong the tai du lieu tim kiem luc nay."),
      mode: hasTags ? "tag-filtered" : hasQueryOrCategory ? "media-search" : "latest",
    };
  }
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<SearchPageParams>;
  searchParams: Promise<SearchPageSearchParams>;
}) {
  const [{ locale }, resolvedSearchParams] = await Promise.all([params, searchParams]);

  setRequestLocale(locale);

  const filters = buildFilters(resolvedSearchParams);
  const [categoriesResponse, tagsResponse, resultState] = await Promise.all([
    getCategoriesCached().catch(() => null),
    getTagsCached().catch(() => null),
    loadSearchResults(filters),
  ]);

  const categories: CategoryPublic[] = categoriesResponse?.success
    ? categoriesResponse.data ?? []
    : [];
  const tags: TagPublic[] = tagsResponse?.success ? tagsResponse.data ?? [] : [];
  const metaErrors = [
    categoriesResponse && !categoriesResponse.success
      ? categoriesResponse.mess || "Khong the tai danh sach the loai."
      : null,
    tagsResponse && !tagsResponse.success
      ? tagsResponse.mess || "Khong the tai danh sach tag."
      : null,
  ].filter(Boolean);
  const errorMessage = [resultState.errorMessage, ...metaErrors].filter(Boolean).join(" ") || null;

  return (
    <SearchFeature
      filters={filters}
      videos={resultState.videos}
      channels={resultState.channels}
      categories={categories}
      tags={tags}
      errorMessage={errorMessage}
      formAction={`/${locale}/search`}
      mode={resultState.mode}
    />
  );
}
