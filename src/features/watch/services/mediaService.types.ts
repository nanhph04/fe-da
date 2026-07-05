import type { ApiPagination } from "@/shared/api/types";

export interface PaginationParams {
  limit?: number;
  page?: number;
}

export type MembershipReviewStatus = "not_requested" | "pending" | "approved" | "rejected";
export type ThumbnailSource = "auto" | "custom" | string;
export type ThumbnailStatus = "pending" | "processing" | "ready" | "failed" | string;
export type MembershipRenewalStatus = "idle" | "pending" | "retrying" | "disabled";
export type MembershipRecordStatus = "active" | "cancelled";

export interface ChannelResponse {
  id: string;
  userId: string;
  name: string;
  bio: string;
  isEligibleForMembership: boolean;
  isMembershipClosedByAdmin: boolean;
  membershipReviewStatus: MembershipReviewStatus;
  membershipRejectionReason: string | null;
  membershipRequestedAt: string | null;
  membershipReviewedAt: string | null;
  avatarUrl: string;
  bannerUrl: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface MyChannelResponse {
  channelId: string;
  userId: string;
  status: string;
  isEligibleForMembership: boolean;
  isMembershipClosedByAdmin: boolean;
  membershipReviewStatus: MembershipReviewStatus;
  membershipRejectionReason: string | null;
  membershipRequestedAt: string | null;
  membershipReviewedAt: string | null;
}

export interface MembershipEligibilityResponse {
  isEligible: boolean;
  readyVideoCount: number;
  minReadyVideoCount: number;
  totalVideoViews: number;
  minTotalVideoViews: number;
  missingRequirements: string[];
}

export interface ChannelPublicVideoResponse {
  id: string;
  title: string;
  category: string;
  tags: string[];
  status: string;
  thumbnailUrl: string | null;
  thumbnailSource: ThumbnailSource;
  thumbnailStatus: ThumbnailStatus;
  publishedAt: string | null;
}

export interface ChannelDetailResponse extends ChannelResponse {
  membershipEligibility: MembershipEligibilityResponse;
  membershipTiers: MembershipTierResponse[];
  publicVideos: ChannelPublicVideoResponse[];
  subscriberCount?: number;
  videoCount?: number;
}

export interface MembershipStatusResponse {
  isActive: boolean;
  membershipId: string | null;
  expiryDate: string | null;
  canRenew: boolean;
  canUpgrade: boolean;
  membershipBlockedReason: string | null;
  isMembershipClosedByAdmin: boolean;
}

export interface ViewerVideoMetadataAccessResponse {
  isOwner: boolean;
  hasPurchased: boolean;
  activeMembershipTierLevel: number | null;
  canWatch: boolean;
  needsMembershipUpgrade: boolean;
}

export interface MembershipTierResponse {
  id: string;
  channelId: string;
  name: string;
  level: number;
  priceCoin: number;
  isAcceptingNew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InitUploadBody {
  title: string;
  description?: string;
  categoryId: string;
  tagIds?: string[];
  visibility?: "public" | "private";
  price?: number;
  requiredTierLevel?: number | null;
  fileName: string;
  fileSize: number;
  fileLastModified: string;
  thumbnailExtension?: "jpg" | "jpeg" | "png" | "webp";
}

export interface InitUploadResponse {
  videoId: string;
  status: string;
  rawFileKey: string;
  bucket: string;
  uploadId: string;
  partSizeBytes: number;
  expiresAt: string;
  thumbnailObjectKey: string | null;
  thumbnailBucket: string | null;
  thumbnailUploadUrl: string | null;
}

export interface GetPartUrlsResponse {
  parts: Array<{
    partNumber: number;
    uploadUrl: string;
    expiresAt: string;
  }>;
}

export interface CompletePartBody {
  etag: string;
  sizeBytes: number;
}

export interface CompletePartResponse {
  videoId: string;
  uploadId: string;
  partNumber: number;
  completed: boolean;
}

export interface UploadPartStatus {
  partNumber: number;
  etag: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface UploadStatusResponse {
  videoId: string;
  uploadId: string;
  rawFileKey: string;
  partSizeBytes: number;
  fileName: string;
  fileSize: number;
  fileLastModified: string;
  status: string;
  expiresAt: string;
  parts: UploadPartStatus[];
}

export interface CompleteUploadResponse {
  videoId: string;
  uploadId: string;
  rawFileKey: string;
  completed: boolean;
}

export interface RenewUploadSessionResponse {
  videoId: string;
  uploadId: string;
  expiresAt: string;
}

export interface SubmitUploadBody {
  resolutions: Array<"480p" | "720p" | "1080p">;
  thumbnailObjectKey?: string;
}

export interface SubmitUploadResponse {
  status: string;
  message: string;
}

export interface UploadRawVideoFileRequest {
  uploadUrl: string;
  file: File;
  onProgress?: (progress: number) => void;
}

export interface UploadResumableParams {
  videoId: string;
  uploadId: string;
  file: File;
  partSizeBytes: number;
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
  renewBeforeExpiryMs?: number;
}

export interface PlaybackInfoResponse {
  videoId: string;
  title: string;
  description: string;
  playbackToken: string;
  playbackUrl: string;
  resumePositionSeconds: number;
  isResumeAvailable: boolean;
  resolutions?: string[];
}

export interface RefreshPlaybackTokenResponse {
  videoId: string;
  playbackToken: string;
  playbackUrl: string;
}

export interface SaveVideoProgressBody {
  positionSeconds: number;
  durationSeconds?: number | null;
  state?: "watching" | "paused" | "completed";
}

export interface SaveVideoProgressResponse {
  videoId: string;
  positionSeconds: number;
  completed: boolean;
}

export interface PurchaseRequestOptions {
  idempotencyKey: string;
  requestId?: string;
}

export interface VideoPurchaseResponse {
  videoId: string;
  channelId: string;
  priceCoin: number;
  unlocked: boolean;
  paymentTransactionId: string;
}

export interface MembershipPurchaseResponse {
  membership: AutoRenewMembershipResponse;
  chargedCoinAmount: number;
  paymentTransactionId: string;
}

export type ModerationDetails = Record<string, unknown>;

export interface VideoMetadataResponse {
  id: string;
  channelId: string;
  channelName: string;
  avatarUrlChannel: string | null;
  membershipTiers: MembershipTierResponse[];
  title: string;
  description: string;
  categoryId: string;
  category: string;
  tagIds: string[];
  tags: string[];
  thumbnailUrl: string | null;
  thumbnailSource: ThumbnailSource;
  thumbnailStatus: ThumbnailStatus;
  resolutions?: string[];
  thumbnailObjectKey?: string | null;
  thumbnailBucket?: string | null;
  viewCount: number;
  status: string;
  visibility: string;
  viewerAccess?: ViewerVideoMetadataAccessResponse;
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
  moderationDetails: ModerationDetails | null;
  publishedAt: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  deleteReason: string | null;
  uploadId?: string | null;
  partSizeBytes?: number | null;
  uploadSessionStatus?: string | null;
  uploadExpiresAt?: string | null;
  uploadFileName?: string | null;
  uploadFileSize?: number | null;
  updatedAt: string;
}

export interface UpdateVideoMetadataBody {
  title?: string;
  description?: string;
  thumbnailUrl?: string | null;
  categoryId?: string;
  tagIds?: string[];
  visibility?: "public" | "private";
  price?: number;
  requiredTierLevel?: number | null;
}

export interface DiscoveryVideoResponse {
  id: string;
  channelId: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  status: string;
  visibility?: string;
  price: number;
  requiredTierLevel: number | null;
  thumbnailUrl: string | null;
  thumbnailSource: ThumbnailSource;
  thumbnailStatus: ThumbnailStatus;
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

export interface OwnerVideoResponse extends DiscoveryVideoResponse {
  visibility: string;
  jobStatus: string | null;
  jobStatusMessage: string | null;
  failureReason: string | null;
  moderationDetails: ModerationDetails | null;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  deleteReason: string | null;
  uploadId?: string | null;
  partSizeBytes?: number | null;
  uploadSessionStatus?: string | null;
  uploadExpiresAt?: string | null;
  uploadFileName?: string | null;
  uploadFileSize?: number | null;
}

export interface OwnerVideoDetailResponse extends OwnerVideoResponse {
  categoryId?: string | null;
  tagIds?: string[] | null;
}

export interface ContinueWatchingVideoResponse {
  videoId: string;
  channelId: string;
  title: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  resumePositionSeconds: number;
  remainingSeconds: number | null;
  lastWatchedAt: string;
  viewCount: number;
}

export interface UserMembershipResponse {
  membershipId: string;
  channelId: string;
  channelName: string;
  channelAvatarUrl: string | null;
  tierId: string;
  tierName: string;
  tierLevel: number;
  priceCoin: number;
  startedAt: string;
  expiryDate: string | null;
  isActive: boolean;
  canRenew: boolean;
  canUpgrade: boolean;
  isMembershipClosedByAdmin: boolean;
  membershipBlockedReason: string | null;
}

export interface PurchasedVideoResponse {
  videoId: string;
  channelId: string;
  channelName: string | null;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  categories: string[];
  tags: string[];
  priceCoin: number;
  purchasedAt: string;
  publishedAt: string | null;
  viewCount: number;
  accessStatus: "ACTIVE" | string;
}

export interface AutoRenewMembershipResponse {
  id: string;
  userId: string;
  channelId: string;
  membershipId: string;
  expiryDate: string | null;
  retryCount: number;
  status: MembershipRecordStatus;
  autoRenewEnabled: boolean;
  renewalStatus: MembershipRenewalStatus;
  renewalReminderSentAt: string | null;
  lastRenewalAttemptAt: string | null;
  nextRenewalAttemptAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId: string | null;
  status: "active" | "inactive" | "deleted" | string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TagResponse {
  id: string;
  name: string;
  slug: string;
  status: "active" | "inactive" | "pending" | "deleted" | string;
  createdAt: string;
  updatedAt: string;
}

export interface TaxonomyListParams extends PaginationParams {
  q?: string;
}

export interface TaxonomyListResponse<T> {
  items: T[];
  pagination: ApiPagination;
}

export interface SearchChannelResponse {
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

export interface SearchMediaResponse {
  videos: DiscoveryVideoResponse[];
  channels: SearchChannelResponse[];
  query: {
    q: string | null;
    category: string | null;
    limit: number;
  };
}

export interface SearchMediaParams {
  q?: string;
  category?: string;
  limit?: number;
}

export interface PublicVideosParams extends SearchMediaParams {
  tags?: string | string[];
}

export interface MetadataSuggestionsBody {
  title: string;
  description?: string;
  categoryId: string;
  tagIds?: string[];
  language?: "vi" | "en";
  tone?: "natural" | "professional" | "seo";
  maxDescriptionLength?: number;
}

export interface MetadataSuggestionsResponse {
  title: string;
  description: string;
  hashtags: string[];
  suggestedTags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  provider: string;
  model: string;
}export interface OwnerVideosParams extends PaginationParams {
  status?: string | string[];
  visibility?: string | string[];
}
