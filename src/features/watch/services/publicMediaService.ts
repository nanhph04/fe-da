import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { fetchPublicApi, fetchServerApi } from "@/shared/api/server";
import type {
  ApiError as PublicApiError,
  ApiResponse as PublicApiResponse,
} from "@/shared/api/types";

export interface PublicDiscoveryVideo {
  id: string;
  channelId: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
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
  categoryId: string;
  category: string;
  tagIds: string[];
  tags: string[];
  thumbnailUrl: string | null;
  viewCount: number;
  status: string;
  visibility: string;
  errorMessage: string | null;
  jobStatus: string | null;
  jobStatusMessage: string | null;
  failureReason: string | null;
  moderationDetails: Record<string, unknown> | null;
  publishedAt: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  deleteReason: string | null;
  updatedAt: string;
}

export interface CategoryPublic {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId: string | null;
  status: "active";
  displayOrder: number;
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
