import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import {
  fetchPublicApi,
  fetchServerApi,
  type ApiError as PublicApiError,
  type ApiResponse as PublicApiResponse,
} from "@/shared/api";

export interface PublicDiscoveryVideo {
  id: string;
  channelId: string;
  title: string;
  description: string;
  categories: string[];
  status: string;
  price: number;
  requiredTierLevel: number | null;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  resolutions: string[];
  errorMessage: string | null;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  channel?: { name: string };
  metrics?: { viewsCount: number };
}

export interface PublicVideoMetadata {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  viewCount: number;
  status: string;
  visibility: string;
  errorMessage: string | null;
  publishedAt: string | null;
  updatedAt: string;
}

export interface CategoryPublic {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: "active";
  createdAt: string;
  updatedAt: string;
}

export async function getLatestVideosCached(limit = 10) {
  "use cache";

  cacheLife("minutes");
  cacheTag("media:latest");

  const query = limit ? `?limit=${limit}` : "";
  try {
    return await fetchPublicApi<PublicDiscoveryVideo[]>(
      `/api/media/videos/discovery/latest${query}`
    );
  } catch (error) {
    const apiError = error as PublicApiError;

    return {
      success: false,
      code: apiError.code ?? 503,
      data: [],
      mess:
        apiError.mess ||
        apiError.message ||
        "Unable to load latest videos from the media service.",
      errors: apiError.errors,
    } satisfies PublicApiResponse<PublicDiscoveryVideo[]>;
  }
}

export async function getCategoriesCached() {
  "use cache";

  cacheLife("hours");
  cacheTag("media:categories");

  try {
    return await fetchPublicApi<CategoryPublic[]>("/api/media/categories");
  } catch (error) {
    const apiError = error as PublicApiError;

    return {
      success: false,
      code: apiError.code ?? 503,
      data: [],
      mess:
        apiError.mess ||
        apiError.message ||
        "Unable to load categories from the media service.",
      errors: apiError.errors,
    } satisfies PublicApiResponse<CategoryPublic[]>;
  }
}

export async function getVideosByCategoryCached(category: string, limit = 6) {
  "use cache";

  cacheLife("minutes");
  cacheTag("media:category-videos", `media:category:${category}`);

  const query = new URLSearchParams({ category, limit: String(limit) });

  try {
    return await fetchPublicApi<PublicDiscoveryVideo[]>(
      `/api/media/videos/discovery/by-category?${query.toString()}`
    );
  } catch (error) {
    const apiError = error as PublicApiError;

    return {
      success: false,
      code: apiError.code ?? 503,
      data: [],
      mess:
        apiError.mess ||
        apiError.message ||
        "Unable to load category videos from the media service.",
      errors: apiError.errors,
    } satisfies PublicApiResponse<PublicDiscoveryVideo[]>;
  }
}

export async function getVideoMetadataCached(videoId: string) {
  "use cache";

  cacheLife("hours");
  cacheTag("media:video", `media:video:${videoId}`);

  return fetchPublicApi<PublicVideoMetadata>(
    `/api/media/videos/${videoId}/metadata`
  );
}

export async function getViewerVideoMetadata(videoId: string) {
  return fetchServerApi<PublicVideoMetadata>(
    `/api/media/videos/${videoId}/metadata`,
    { requireAuth: true }
  );
}

export type { PublicApiError };
