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
  channelName?: string | null;
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
  viewerAccess?: {
    isOwner: boolean;
    hasPurchased: boolean;
    activeMembershipTierLevel: number | null;
    canWatch: boolean;
    needsMembershipUpgrade: boolean;
  };
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

export type { PublicApiError, PublicApiResponse };
