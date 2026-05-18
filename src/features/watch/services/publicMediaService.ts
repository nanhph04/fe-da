import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { fetchPublicApi, fetchServerApi } from "@/shared/api/server";
import type {
  ApiError as PublicApiError,
  ApiResponse as PublicApiResponse,
} from "@/shared/api/types";

export type PublicThumbnailSource = "auto" | "custom" | string;
export type PublicThumbnailStatus = "pending" | "processing" | "ready" | "failed" | string;
export type PublicMembershipReviewStatus = "not_requested" | "pending" | "approved" | "rejected";

const READY_PUBLIC_THUMBNAIL_STATUS = "ready";

function encodeVideoPathId(videoId: string) {
  return encodeURIComponent(videoId);
}

function encodeCategoryPathSlug(categorySlug: string) {
  return encodeURIComponent(categorySlug.trim());
}

export function buildPublicVideoThumbnailUrl(videoId: string) {
  return `/api/media/videos/${encodeVideoPathId(videoId)}/thumbnail`;
}

export function getReadyPublicThumbnailUrl(
  thumbnailUrl?: string | null,
  thumbnailStatus?: string | null,
  videoId?: string | null
) {
  if (thumbnailStatus !== READY_PUBLIC_THUMBNAIL_STATUS) {
    return null;
  }

  return videoId ? buildPublicVideoThumbnailUrl(videoId) : thumbnailUrl || null;
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

export async function getVideosByCategoryCached(categorySlug: string, limit = 6) {
  "use cache";

  const normalizedSlug = categorySlug.trim();

  cacheLife("minutes");
  cacheTag("media:category-videos", `media:category:${normalizedSlug}`);

  const query = new URLSearchParams({ limit: String(limit) });

  try {
    return await fetchPublicApi<PublicDiscoveryVideo[]>(
      `/api/media/categories/${encodeCategoryPathSlug(normalizedSlug)}/videos?${query.toString()}`
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

export async function getChannelDetailCached(channelId: string) {
  "use cache";

  cacheLife("minutes");
  cacheTag("media:channel", `media:channel:${channelId}`);

  return fetchPublicApi<PublicChannelDetail>(`/api/media/channels/${channelId}`);
}

export type { PublicApiError };
