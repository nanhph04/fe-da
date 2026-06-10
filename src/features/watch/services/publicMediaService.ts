import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { fetchPublicApi, fetchServerApi } from "@/shared/api/server";
import type {
  ApiError as PublicApiError,
  ApiResponse as PublicApiResponse,
} from "@/shared/api/types";
import type {
  PublicDiscoveryVideo,
  CategoryPublic,
  TagPublic,
  PublicVideosQuery,
  PublicMediaSearchQuery,
  PublicMediaSearchResponse,
  PublicVideoMetadata,
  PublicChannelDetail,
} from "./publicMedia.types";

export * from "./publicMedia.types";


function normalizePositiveInteger(value: number, fallback: number) {
  if (!Number.isFinite(value) || value < 1) {
    return fallback;
  }

  return Math.floor(value);
}

function normalizePublicVideoLimit(limit: number, fallback = 20) {
  return Math.min(50, normalizePositiveInteger(limit, fallback));
}

function normalizeUniqueSlugs(values?: string[]) {
  if (!values) {
    return [];
  }

  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean))
  );
}

export async function getLatestVideosFresh(limit = 10) {
  const normalizedLimit = normalizePublicVideoLimit(limit, 20);
  const query = `?limit=${normalizedLimit}`;

  return fetchPublicApi<PublicDiscoveryVideo[]>(
    `/api/media/videos/latest${query}`,
    { cache: "no-store" }
  );
}

export async function getLatestVideosCached(limit = 10) {
  "use cache";

  cacheLife("minutes");
  cacheTag("media:latest");

  const normalizedLimit = normalizePublicVideoLimit(limit, 20);
  const query = `?limit=${normalizedLimit}`;
  try {
    return await fetchPublicApi<PublicDiscoveryVideo[]>(
      `/api/media/videos/latest${query}`
    );
  } catch (error) {
    const apiError = error as PublicApiError;

    const statusCode = apiError.statusCode ?? apiError.status ?? apiError.code ?? 503;
    const message = apiError.message || "Unable to load latest videos from the media service.";

    return {
      success: false,
      statusCode,
      code: statusCode,
      data: [],
      message,
      mess: message,
      errors: apiError.errors,
    } satisfies PublicApiResponse<PublicDiscoveryVideo[]>;
  }
}

export async function getVideosRankingFresh(
  metric: "views" | "purchases",
  period: "day" | "week" | "month" = "week",
  limit = 10
) {
  const normalizedLimit = normalizePublicVideoLimit(limit, 10);
  const query = new URLSearchParams({
    metric,
    period,
    limit: String(normalizedLimit),
  });

  return fetchPublicApi<PublicDiscoveryVideo[]>(
    `/api/media/videos/ranking?${query.toString()}`,
    { cache: "no-store" }
  );
}

export async function getVideosRankingCached(
  metric: "views" | "purchases",
  period: "day" | "week" | "month" = "week",
  limit = 10
) {
  "use cache";

  cacheLife("minutes");
  cacheTag("media:ranking", `media:ranking:${metric}:${period}`);

  const normalizedLimit = normalizePublicVideoLimit(limit, 10);
  const query = new URLSearchParams({
    metric,
    period,
    limit: String(normalizedLimit),
  });

  try {
    return await fetchPublicApi<PublicDiscoveryVideo[]>(
      `/api/media/videos/ranking?${query.toString()}`
    );
  } catch (error) {
    const apiError = error as PublicApiError;

    const statusCode = apiError.statusCode ?? apiError.status ?? apiError.code ?? 503;
    const message = apiError.message || "Unable to load ranked videos from the media service.";

    return {
      success: false,
      statusCode,
      code: statusCode,
      data: [],
      message,
      mess: message,
      errors: apiError.errors,
    } satisfies PublicApiResponse<PublicDiscoveryVideo[]>;
  }
}

export async function getCategoriesFresh() {
  return fetchPublicApi<CategoryPublic[]>("/api/media/categories", {
    cache: "no-store",
  });
}

export async function getCategoriesCached() {
  "use cache";

  cacheLife("hours");
  cacheTag("media:categories");

  try {
    return await fetchPublicApi<CategoryPublic[]>("/api/media/categories");
  } catch (error) {
    const apiError = error as PublicApiError;

    const statusCode = apiError.statusCode ?? apiError.status ?? apiError.code ?? 503;
    const message = apiError.message || "Unable to load categories from the media service.";

    return {
      success: false,
      statusCode,
      code: statusCode,
      data: [],
      message,
      mess: message,
      errors: apiError.errors,
    } satisfies PublicApiResponse<CategoryPublic[]>;
  }
}

export async function getTagsCached() {
  "use cache";

  cacheLife("hours");
  cacheTag("media:tags");

  try {
    return await fetchPublicApi<TagPublic[]>("/api/media/tags");
  } catch (error) {
    const apiError = error as PublicApiError;

    const statusCode = apiError.statusCode ?? apiError.status ?? apiError.code ?? 503;
    const message = apiError.message || "Unable to load tags from the media service.";

    return {
      success: false,
      statusCode,
      code: statusCode,
      data: [],
      message,
      mess: message,
      errors: apiError.errors,
    } satisfies PublicApiResponse<TagPublic[]>;
  }
}

export async function getPublicVideosCached(params: PublicVideosQuery = {}) {
  "use cache";

  const normalizedQuery = params.q?.trim();
  const normalizedCategory = params.category?.trim();
  const normalizedTags = normalizeUniqueSlugs(params.tags);
  const normalizedLimit = normalizePublicVideoLimit(params.limit ?? 20, 20);
  const query = new URLSearchParams({ limit: String(normalizedLimit) });

  if (normalizedQuery) {
    query.set("q", normalizedQuery);
  }

  if (normalizedCategory) {
    query.set("category", normalizedCategory);
  }

  if (normalizedTags.length > 0) {
    query.set("tags", normalizedTags.join(","));
  }

  cacheLife("minutes");
  cacheTag(
    "media:videos",
    normalizedCategory ? `media:category:${normalizedCategory}` : "media:all-categories"
  );

  return fetchPublicApi<PublicDiscoveryVideo[]>(
    `/api/media/videos?${query.toString()}`
  );
}

export async function searchPublicMediaCached(params: PublicMediaSearchQuery) {
  "use cache";

  const normalizedQuery = params.q?.trim();
  const normalizedCategory = params.category?.trim();
  const normalizedLimit = normalizePublicVideoLimit(params.limit ?? 20, 20);
  const query = new URLSearchParams({ limit: String(normalizedLimit) });

  if (normalizedQuery) {
    query.set("q", normalizedQuery);
  }

  if (normalizedCategory) {
    query.set("category", normalizedCategory);
  }

  cacheLife("minutes");
  cacheTag(
    "media:search",
    normalizedCategory ? `media:category:${normalizedCategory}` : "media:all-categories"
  );

  return fetchPublicApi<PublicMediaSearchResponse>(
    `/api/media/search?${query.toString()}`
  );
}

export async function getVideosByCategoryFresh(categorySlug: string, limit = 6) {
  const normalizedSlug = categorySlug.trim();
  const normalizedLimit = normalizePublicVideoLimit(limit, 6);
  const query = new URLSearchParams({
    category: normalizedSlug,
    limit: String(normalizedLimit),
  });

  return fetchPublicApi<PublicDiscoveryVideo[]>(
    `/api/media/videos/by-category?${query.toString()}`,
    { cache: "no-store" }
  );
}

export async function getVideosByCategoryCached(categorySlug: string, limit = 6) {
  "use cache";

  const normalizedSlug = categorySlug.trim();
  const normalizedLimit = normalizePublicVideoLimit(limit, 6);

  cacheLife("minutes");
  cacheTag("media:category-videos", `media:category:${normalizedSlug}`);

  const query = new URLSearchParams({
    category: normalizedSlug,
    limit: String(normalizedLimit),
  });

  try {
    return await fetchPublicApi<PublicDiscoveryVideo[]>(
      `/api/media/videos/by-category?${query.toString()}`
    );
  } catch (error) {
    const apiError = error as PublicApiError;

    const statusCode = apiError.statusCode ?? apiError.status ?? apiError.code ?? 503;
    const message = apiError.message || "Unable to load category videos from the media service.";

    return {
      success: false,
      statusCode,
      code: statusCode,
      data: [],
      message,
      mess: message,
      errors: apiError.errors,
    } satisfies PublicApiResponse<PublicDiscoveryVideo[]>;
  }
}

export async function getCategoryBySlugCached(categorySlug: string) {
  "use cache";

  const normalizedSlug = categorySlug.trim();

  cacheLife("hours");
  cacheTag("media:categories", `media:category:${normalizedSlug}`);

  if (!normalizedSlug) {
    return null;
  }

  const query = new URLSearchParams({ q: normalizedSlug });
  const response = await fetchPublicApi<CategoryPublic[]>(
    `/api/media/categories?${query.toString()}`
  );

  if (!response.success || !response.data) {
    return null;
  }

  return response.data.find((category) => category.slug === normalizedSlug) ?? null;
}

export async function getCategoryVideosPageCached(
  categorySlug: string,
  page = 1,
  limit = 20
) {
  "use cache";

  const normalizedSlug = categorySlug.trim();
  const normalizedPage = normalizePositiveInteger(page, 1);
  const normalizedLimit = normalizePublicVideoLimit(limit, 20);

  cacheLife("minutes");
  cacheTag(
    "media:category-videos",
    `media:category:${normalizedSlug}`,
    `media:category:${normalizedSlug}:page:${normalizedPage}:limit:${normalizedLimit}`
  );

  const query = new URLSearchParams({
    category: normalizedSlug,
    page: String(normalizedPage),
    limit: String(normalizedLimit),
  });

  return fetchPublicApi<PublicDiscoveryVideo[]>(
    `/api/media/videos/by-category?${query.toString()}`
  );
}

export async function getVideoMetadataCached(videoId: string) {
  "use cache";

  cacheLife("hours");
  cacheTag("media:video", `media:video:${videoId}`);

  return fetchPublicApi<PublicVideoMetadata>(
    `/api/media/videos/${encodeURIComponent(videoId)}/metadata`
  );
}

export async function getVideoMetadataFresh(videoId: string) {
  return fetchPublicApi<PublicVideoMetadata>(
    `/api/media/videos/${encodeURIComponent(videoId)}/metadata`,
    { cache: "no-store" }
  );
}

export async function getViewerVideoMetadata(videoId: string) {
  return fetchServerApi<PublicVideoMetadata>(
    `/api/media/videos/${encodeURIComponent(videoId)}/metadata`,
    { requireAuth: true }
  );
}

export async function getChannelDetailCached(channelId: string) {
  "use cache";

  cacheLife("minutes");
  cacheTag("media:channel", `media:channel:${channelId}`);

  return fetchPublicApi<PublicChannelDetail>(`/api/media/channels/${channelId}`);
}

export type { PublicApiError };
