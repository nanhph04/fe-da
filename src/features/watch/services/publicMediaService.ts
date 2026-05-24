import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { fetchPublicApi, fetchServerApi } from "@/shared/api/server";
import { getReadyPublicVideoThumbnailUrl } from "./mediaService.helpers";
import type {
  ApiError as PublicApiError,
  ApiResponse as PublicApiResponse,
} from "@/shared/api/types";

export type PublicThumbnailSource = "auto" | "custom" | string;
export type PublicThumbnailStatus = "pending" | "processing" | "ready" | "failed" | string;
export type PublicMembershipReviewStatus = "not_requested" | "pending" | "approved" | "rejected";

export function getReadyPublicThumbnailUrl(
  thumbnailUrl?: string | null,
  thumbnailStatus?: string | null,
  videoId?: string | null
) {
  return getReadyPublicVideoThumbnailUrl(videoId, thumbnailUrl, thumbnailStatus);
}

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
  thumbnailSource: PublicThumbnailSource;
  thumbnailStatus: PublicThumbnailStatus;
  thumbnailObjectKey?: string | null;
  thumbnailBucket?: string | null;
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

export interface PublicMembershipTier {
  id: string;
  channelId: string;
  name: string;
  level: number;
  priceCoin: number;
  isAcceptingNew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicVideoMetadata {
  id: string;
  channelId: string;
  channelName: string;
  avatarUrlChannel: string | null;
  membershipTiers: PublicMembershipTier[];
  title: string;
  description: string;
  categoryId: string;
  category: string;
  tagIds: string[];
  tags: string[];
  thumbnailUrl: string | null;
  thumbnailSource: PublicThumbnailSource;
  thumbnailStatus: PublicThumbnailStatus;
  thumbnailObjectKey?: string | null;
  thumbnailBucket?: string | null;
  resolutions?: string[];
  viewCount: number;
  status: string;
  visibility: string;
  price: number;
  priceCoin?: number | null;
  coinAmount?: number | null;
  requiredTierLevel: number | null;
  requiredTier?: number | null;
  minTierLevel?: number | null;
  requiredMembershipLevel?: number | null;
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

export interface PublicChannelMembershipEligibility {
  isEligible: boolean;
  readyVideoCount: number;
  minReadyVideoCount: number;
  totalVideoViews: number;
  minTotalVideoViews: number;
  missingRequirements: string[];
}

export interface PublicChannelVideo {
  id: string;
  title: string;
  category: string;
  tags: string[];
  status: string;
  thumbnailUrl: string | null;
  thumbnailSource: PublicThumbnailSource;
  thumbnailStatus: PublicThumbnailStatus;
  publishedAt: string | null;
}

export interface PublicChannelDetail {
  id: string;
  userId: string;
  name: string;
  bio: string;
  isEligibleForMembership: boolean;
  isMembershipClosedByAdmin: boolean;
  membershipReviewStatus: PublicMembershipReviewStatus;
  membershipRejectionReason: string | null;
  membershipRequestedAt: string | null;
  membershipReviewedAt: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  membershipEligibility: PublicChannelMembershipEligibility;
  membershipTiers: PublicMembershipTier[];
  publicVideos: PublicChannelVideo[];
  subscriberCount?: number;
  videoCount?: number;
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

export interface TagPublic {
  id: string;
  name: string;
  slug: string;
  status: "active";
  createdAt: string;
  updatedAt: string;
}

export interface PublicVideosQuery {
  q?: string;
  category?: string;
  tags?: string[];
  limit?: number;
}

export interface PublicSearchChannel {
  id: string;
  userId: string;
  name: string;
  bio: string;
  avatarUrl: string;
  bannerUrl: string;
  status: string;
  isEligibleForMembership: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicMediaSearchQuery {
  q?: string;
  category?: string;
  limit?: number;
}

export interface PublicMediaSearchResponse {
  videos: PublicDiscoveryVideo[];
  channels: PublicSearchChannel[];
  query: {
    q: string | null;
    category: string | null;
    limit: number;
  };
}

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

export async function getTagsCached() {
  "use cache";

  cacheLife("hours");
  cacheTag("media:tags");

  try {
    return await fetchPublicApi<TagPublic[]>("/api/media/tags");
  } catch (error) {
    const apiError = error as PublicApiError;

    return {
      success: false,
      code: apiError.code ?? 503,
      data: [],
      mess:
        apiError.mess ||
        apiError.message ||
        "Unable to load tags from the media service.",
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
