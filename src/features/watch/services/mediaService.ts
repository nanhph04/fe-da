import { api } from "@/shared/api/client";

export interface PaginationParams {
  limit?: number;
  page?: number;
}

export type MembershipReviewStatus = "not_requested" | "pending" | "approved" | "rejected";
export type ThumbnailSource = "auto" | "custom" | string;
export type ThumbnailStatus = "pending" | "processing" | "ready" | "failed" | string;
export type MembershipRenewalStatus = "idle" | "pending" | "retrying" | "disabled";
export type MembershipRecordStatus = "active" | "cancelled";

const READY_THUMBNAIL_STATUS = "ready";

function encodeVideoPathId(videoId: string) {
  return encodeURIComponent(videoId);
}

function encodeCategoryPathSlug(categorySlug: string) {
  return encodeURIComponent(categorySlug.trim());
}

export function buildPublicVideoThumbnailUrl(videoId: string) {
  return `/api/media/videos/${encodeVideoPathId(videoId)}/thumbnail`;
}

export function buildOwnerVideoThumbnailUrl(videoId: string) {
  return `/api/media/videos/me/${encodeVideoPathId(videoId)}/thumbnail`;
}

export function getReadyThumbnailUrl(thumbnailUrl?: string | null, thumbnailStatus?: string | null) {
  return thumbnailUrl && thumbnailStatus === READY_THUMBNAIL_STATUS ? thumbnailUrl : null;
}

export function getReadyPublicVideoThumbnailUrl(
  videoId?: string | null,
  thumbnailUrl?: string | null,
  thumbnailStatus?: string | null
) {
  if (thumbnailStatus !== READY_THUMBNAIL_STATUS) {
    return null;
  }

  return videoId ? buildPublicVideoThumbnailUrl(videoId) : thumbnailUrl || null;
}

export function getReadyOwnerVideoThumbnailUrl(
  videoId?: string | null,
  thumbnailUrl?: string | null,
  thumbnailStatus?: string | null
) {
  if (thumbnailStatus !== READY_THUMBNAIL_STATUS) {
    return null;
  }

  return videoId ? buildOwnerVideoThumbnailUrl(videoId) : thumbnailUrl || null;
}

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
}

export interface PlaybackInfoResponse {
  videoId: string;
  title: string;
  description: string;
  playbackToken: string;
  playbackUrl: string;
  resumePositionSeconds: number;
  isResumeAvailable: boolean;
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
  moderationDetails: ModerationDetails | null;
  publishedAt: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  deleteReason: string | null;
  uploadId?: string | null;
  partSizeBytes?: number | null;
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

export interface OwnerVideosParams {
  limit?: number;
  status?: string | string[];
  visibility?: string | string[];
}

const buildQueryString = (params?: Record<string, string | number | undefined>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

const toCommaSeparated = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(",");
  }

  return value;
};

const uploadPresignedFile = ({ uploadUrl, file, onProgress }: UploadRawVideoFileRequest) => {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

    xhr.upload.onprogress = event => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
        return;
      }

      reject(new Error(`File upload failed: ${xhr.status}`));
    };

    xhr.onerror = () => reject(new Error("File upload failed. Check your connection and try again."));
    xhr.onabort = () => reject(new Error("File upload was cancelled."));
    xhr.send(file);
  });
};

const uploadResumableVideoFile = async ({
  videoId,
  uploadId,
  file,
  partSizeBytes,
  onProgress,
  signal,
}: UploadResumableParams): Promise<void> => {
  const fileSize = file.size;
  const totalParts = Math.ceil(fileSize / partSizeBytes);

  // 1. Fetch current status of upload to see if there are already completed parts
  let completedParts: number[] = [];
  try {
    const statusRes = await mediaService.getUploadStatus(videoId, uploadId);
    if (statusRes.success && statusRes.data) {
      const { fileName: dbFileName, fileSize: dbFileSize } = statusRes.data;
      if (dbFileName && dbFileSize) {
        if (file.name !== dbFileName || file.size !== dbFileSize) {
          throw new Error(
            `Tệp tin được chọn không khớp với video ban đầu của phiên upload này. Bản nháp này yêu cầu tệp "${dbFileName}" (${(dbFileSize / (1024 * 1024)).toFixed(2)} MB), nhưng bạn đã chọn tệp "${file.name}" (${(file.size / (1024 * 1024)).toFixed(2)} MB).`
          );
        }
      }
      if (statusRes.data.parts) {
        completedParts = statusRes.data.parts.map(p => p.partNumber);
      }
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes("không khớp với video ban đầu")) {
      throw err;
    }
    console.warn("Failed to fetch upload status, starting from scratch:", err);
  }

  // 2. Identify which parts need to be uploaded
  const partsToUpload: number[] = [];
  for (let i = 1; i <= totalParts; i++) {
    if (!completedParts.includes(i)) {
      partsToUpload.push(i);
    }
  }

  // Track loaded bytes across all parts for progress calculation
  let uploadedBytes = completedParts.reduce((acc, partNum) => {
    const isLastPart = partNum === totalParts;
    const size = isLastPart ? (fileSize - (totalParts - 1) * partSizeBytes) : partSizeBytes;
    return acc + size;
  }, 0);

  const updateProgress = () => {
    if (onProgress) {
      const percentage = Math.round((uploadedBytes / fileSize) * 100);
      onProgress(Math.min(percentage, 100));
    }
  };

  updateProgress();

  if (partsToUpload.length === 0) {
    // All parts are already uploaded, call complete
    const completeRes = await mediaService.completeUpload(videoId, uploadId);
    if (!completeRes.success) {
      throw new Error(completeRes.mess || "Failed to complete upload session");
    }
    return;
  }

  // 3. Upload parts in sequence
  for (const partNumber of partsToUpload) {
    if (signal?.aborted) {
      throw new DOMException("Upload aborted", "AbortError");
    }

    const startByte = (partNumber - 1) * partSizeBytes;
    const endByte = Math.min(partNumber * partSizeBytes, fileSize);
    const chunk = file.slice(startByte, endByte);
    const chunkSize = chunk.size;

    // A. Get presigned URL for this part
    const urlRes = await mediaService.getPartUrls(videoId, uploadId, [partNumber]);
    if (!urlRes.success || !urlRes.data || !urlRes.data.parts || urlRes.data.parts.length === 0) {
      throw new Error(urlRes.mess || `Failed to get upload URL for part ${partNumber}`);
    }

    const partInfo = urlRes.data.parts.find(p => p.partNumber === partNumber);
    if (!partInfo) {
      throw new Error(`Upload URL for part ${partNumber} not found in response`);
    }

    const uploadUrl = partInfo.uploadUrl;

    // B. Upload chunk to MinIO/S3 using XMLHttpRequest
    let lastLoadedBytes = 0;
    const etag = await new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", "application/octet-stream");

      if (signal) {
        const handleAbort = () => {
          xhr.abort();
          reject(new DOMException("Upload aborted", "AbortError"));
        };
        signal.addEventListener("abort", handleAbort);
      }

      xhr.upload.onprogress = event => {
        if (event.lengthComputable) {
          const newLoaded = event.loaded;
          const delta = newLoaded - lastLoadedBytes;
          lastLoadedBytes = newLoaded;
          uploadedBytes += delta;
          updateProgress();
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const etagHeader = xhr.getResponseHeader("ETag");
          if (!etagHeader) {
            reject(new Error(`No ETag header returned for part ${partNumber}`));
          } else {
            resolve(etagHeader.replace(/"/g, ""));
          }
        } else {
          reject(new Error(`Failed to upload part ${partNumber}: status ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error(`Failed to upload part ${partNumber} due to network error`));
      };

      xhr.send(chunk);
    });

    // C. Register chunk completion
    const completedRes = await mediaService.completePart(videoId, uploadId, partNumber, {
      etag,
      sizeBytes: chunkSize,
    });

    if (!completedRes.success) {
      throw new Error(completedRes.mess || `Failed to register completion of part ${partNumber}`);
    }
  }

  // 4. Finalize the multipart upload session
  if (signal?.aborted) {
    throw new DOMException("Upload aborted", "AbortError");
  }

  const completeRes = await mediaService.completeUpload(videoId, uploadId);
  if (!completeRes.success) {
    throw new Error(completeRes.mess || "Failed to complete upload session");
  }
};

export const mediaService = {
  // 1. HEALTH CHECK
  healthCheck: async () => {
    return api.get<string>("/api/media/");
  },

  // 2. CHANNEL
  createChannel: async (data: { name: string; bio: string }) => {
    return api.post<ChannelResponse>("/api/media/channels", data, { requireAuth: true });
  },
  updateChannel: async (
    id: string,
    data: { name?: string; bio?: string; avatarUrl?: string; bannerUrl?: string }
  ) => {
    return api.patch<ChannelResponse>(`/api/media/channels/${id}`, data, { requireAuth: true });
  },
  getChannel: async (id: string) => {
    return api.get<ChannelDetailResponse>(`/api/media/channels/${id}`);
  },
  getMyChannel: async () => {
    return api.get<MyChannelResponse>("/api/media/channels/me", { requireAuth: true });
  },
  getMembershipStatus: async (id: string) => {
    return api.get<MembershipStatusResponse>(`/api/media/channels/${id}/membership-status`, {
      requireAuth: true,
    });
  },
  getMyMemberships: async (params?: PaginationParams) => {
    const qs = buildQueryString({ page: params?.page, limit: params?.limit });
    return api.get<UserMembershipResponse[]>(`/api/media/memberships/me${qs}`, { requireAuth: true });
  },
  updateChannelAdminMembership: async (id: string, action: "close" | "open") => {
    return api.patch<ChannelResponse>(
      `/api/media/channels/${id}/admin/membership`,
      { action },
      { requireAuth: true }
    );
  },
  requestChannelMembershipReview: async (id: string) => {
    return api.post<ChannelResponse>(
      `/api/media/channels/${id}/membership-review/request`,
      undefined,
      { requireAuth: true }
    );
  },
  updateMembershipAutoRenew: async (membershipId: string, enabled: boolean) => {
    return api.patch<AutoRenewMembershipResponse>(
      `/api/media/memberships/${membershipId}/auto-renew`,
      { enabled },
      { requireAuth: true }
    );
  },

  // 3. MEMBERSHIP TIERS
  getMembershipTiers: async (channelId: string) => {
    return api.get<MembershipTierResponse[]>(`/api/media/channels/${channelId}/membership-tiers`);
  },
  getMembershipTier: async (channelId: string, tierId: string) => {
    return api.get<MembershipTierResponse>(
      `/api/media/channels/${channelId}/membership-tiers/${tierId}`
    );
  },
  createMembershipTier: async (
    channelId: string,
    data: { level: 1 | 2 | 3; name: string; priceCoin: number }
  ) => {
    return api.post<MembershipTierResponse>(
      `/api/media/channels/${channelId}/membership-tiers`,
      data,
      { requireAuth: true }
    );
  },
  updateMembershipTier: async (
    channelId: string,
    tierId: string,
    data: { name?: string; priceCoin?: number; isAcceptingNew?: boolean }
  ) => {
    return api.patch<MembershipTierResponse>(
      `/api/media/channels/${channelId}/membership-tiers/${tierId}`,
      data,
      { requireAuth: true }
    );
  },
  disableMembershipTier: async (channelId: string, tierId: string) => {
    return api.delete<MembershipTierResponse>(
      `/api/media/channels/${channelId}/membership-tiers/${tierId}`,
      { requireAuth: true }
    );
  },

  // 4. VIDEO
  initUpload: async (data: InitUploadBody) => {
    return api.post<InitUploadResponse>("/api/media/videos/uploads", data, { requireAuth: true });
  },
  getPartUrls: async (videoId: string, uploadId: string, partNumbers: number[]) => {
    return api.post<GetPartUrlsResponse>(
      `/api/media/videos/${encodeURIComponent(videoId)}/uploads/${encodeURIComponent(uploadId)}/part-urls`,
      { partNumbers },
      { requireAuth: true }
    );
  },
  completePart: async (videoId: string, uploadId: string, partNumber: number, data: CompletePartBody) => {
    return api.post<CompletePartResponse>(
      `/api/media/videos/${encodeURIComponent(videoId)}/uploads/${encodeURIComponent(uploadId)}/parts/${partNumber}/completed`,
      data,
      { requireAuth: true }
    );
  },
  getUploadStatus: async (videoId: string, uploadId: string) => {
    return api.get<UploadStatusResponse>(
      `/api/media/videos/${encodeURIComponent(videoId)}/uploads/${encodeURIComponent(uploadId)}/status`,
      { requireAuth: true }
    );
  },
  completeUpload: async (videoId: string, uploadId: string) => {
    return api.post<CompleteUploadResponse>(
      `/api/media/videos/${encodeURIComponent(videoId)}/uploads/${encodeURIComponent(uploadId)}/complete`,
      undefined,
      { requireAuth: true }
    );
  },
  submitUpload: async (videoId: string, uploadId: string, data: SubmitUploadBody) => {
    return api.post<SubmitUploadResponse>(
      `/api/media/videos/${encodeURIComponent(videoId)}/uploads/${encodeURIComponent(uploadId)}/submit`,
      data,
      { requireAuth: true }
    );
  },
  cancelUpload: async (videoId: string, uploadId: string) => {
    return api.delete<{ videoId: string; cancelled: boolean }>(
      `/api/media/videos/${encodeURIComponent(videoId)}/uploads/${encodeURIComponent(uploadId)}`,
      { requireAuth: true }
    );
  },
  deleteFailedUpload: async (id: string) => {
    return api.delete<{ videoId: string; deleted: boolean }>(
      `/api/media/videos/${id}/failed-upload`,
      { requireAuth: true }
    );
  },
  deleteVideo: async (id: string) => {
    return api.delete<{ videoId: string; unpublished: boolean }>(`/api/media/videos/${id}`, {
      requireAuth: true,
    });
  },
  uploadPresignedFile,
  uploadResumableVideoFile,
  getPlaybackInfo: async (id: string) => {
    return api.get<PlaybackInfoResponse>(`/api/media/videos/${id}/play`, { requireAuth: true });
  },
  saveVideoProgress: async (id: string, data: SaveVideoProgressBody) => {
    return api.post<SaveVideoProgressResponse>(`/api/media/videos/${id}/progress`, data, {
      requireAuth: true,
    });
  },
  refreshPlaybackToken: async (id: string) => {
    return api.post<RefreshPlaybackTokenResponse>(
      `/api/media/videos/${id}/playback-token/refresh`,
      {},
      { requireAuth: true }
    );
  },
  getContinueWatching: async (params?: Pick<PaginationParams, "limit">) => {
    const qs = buildQueryString({ limit: params?.limit });
    return api.get<ContinueWatchingVideoResponse[]>(`/api/media/videos/continue-watching${qs}`, {
      requireAuth: true,
    });
  },
  getPurchasedVideos: async (params?: PaginationParams) => {
    const qs = buildQueryString({ page: params?.page, limit: params?.limit });
    return api.get<PurchasedVideoResponse[]>(`/api/media/videos/library/purchased${qs}`, {
      requireAuth: true,
    });
  },
  getVideoMetadata: async (id: string) => {
    return api.get<VideoMetadataResponse>(`/api/media/videos/${id}/metadata`);
  },
  updateVideoMetadata: async (id: string, data: UpdateVideoMetadataBody) => {
    return api.patch<VideoMetadataResponse>(`/api/media/videos/${id}/metadata`, data, {
      requireAuth: true,
    });
  },

  // 5. DISCOVERY & SEARCH
  getPublicVideos: async (params?: PublicVideosParams) => {
    const qs = buildQueryString({
      q: params?.q,
      category: params?.category,
      tags: toCommaSeparated(params?.tags),
      limit: params?.limit,
    });
    return api.get<DiscoveryVideoResponse[]>(`/api/media/videos${qs}`);
  },
  getLatestVideos: async (params?: Pick<PaginationParams, "limit">) => {
    const qs = buildQueryString({ limit: params?.limit });
    return api.get<DiscoveryVideoResponse[]>(`/api/media/videos/discovery/latest${qs}`);
  },
  getVideosByCategory: async (categorySlug: string, params?: PaginationParams) => {
    const qs = buildQueryString({ page: params?.page, limit: params?.limit });
    return api.get<DiscoveryVideoResponse[]>(
      `/api/media/categories/${encodeCategoryPathSlug(categorySlug)}/videos${qs}`
    );
  },
  getVideosByCategorySlug: async (slug: string, params?: PaginationParams) => {
    const qs = buildQueryString({ page: params?.page, limit: params?.limit });
    return api.get<DiscoveryVideoResponse[]>(
      `/api/media/categories/${encodeCategoryPathSlug(slug)}/videos${qs}`
    );
  },
  getSubscribedVideos: async (params?: Pick<PaginationParams, "limit">) => {
    const qs = buildQueryString({ limit: params?.limit });
    return api.get<DiscoveryVideoResponse[]>(`/api/media/videos/discovery/subscribed${qs}`, {
      requireAuth: true,
    });
  },
  getOwnerVideos: async (params?: OwnerVideosParams) => {
    const qs = buildQueryString({
      limit: params?.limit,
      status: toCommaSeparated(params?.status),
      visibility: toCommaSeparated(params?.visibility),
    });
    return api.get<OwnerVideoResponse[]>(`/api/media/videos/me${qs}`, { requireAuth: true });
  },
  getOwnerVideoDetail: async (id: string) => {
    return api.get<OwnerVideoDetailResponse>(`/api/media/videos/me/${id}/detail`, { requireAuth: true });
  },
  searchMedia: async (params: SearchMediaParams) => {
    const qs = buildQueryString({ q: params.q, category: params.category, limit: params.limit });
    return api.get<SearchMediaResponse>(`/api/media/search${qs}`);
  },

  // 6. CATEGORIES & TAGS
  getCategories: async (params?: { q?: string }) => {
    const qs = buildQueryString({ q: params?.q });
    return api.get<CategoryResponse[]>(`/api/media/categories${qs}`);
  },
  getAllCategoriesAdmin: async (params?: { q?: string }) => {
    const qs = buildQueryString({ q: params?.q });
    return api.get<CategoryResponse[]>(`/api/media/admin/categories${qs}`, { requireAuth: true });
  },
  createCategoryAdmin: async (data: {
    name: string;
    description?: string;
    parentId?: string | null;
    displayOrder?: number;
  }) => {
    return api.post<CategoryResponse>("/api/media/admin/categories", data, { requireAuth: true });
  },
  updateCategoryAdmin: async (
    id: string,
    data: {
      name?: string;
      description?: string;
      parentId?: string | null;
      status?: "active" | "inactive" | "deleted";
      displayOrder?: number;
    }
  ) => {
    return api.patch<CategoryResponse>(`/api/media/admin/categories/${id}`, data, { requireAuth: true });
  },
  deleteCategoryAdmin: async (id: string) => {
    return api.delete<CategoryResponse>(`/api/media/admin/categories/${id}`, { requireAuth: true });
  },
  getTags: async (params?: { q?: string }) => {
    const qs = buildQueryString({ q: params?.q });
    return api.get<TagResponse[]>(`/api/media/tags${qs}`);
  },
  getAllTagsAdmin: async (params?: { q?: string }) => {
    const qs = buildQueryString({ q: params?.q });
    return api.get<TagResponse[]>(`/api/media/admin/tags${qs}`, { requireAuth: true });
  },
  createTagAdmin: async (data: { name: string }) => {
    return api.post<TagResponse>("/api/media/admin/tags", data, { requireAuth: true });
  },
  updateTagAdmin: async (
    id: string,
    data: { name?: string; status?: "active" | "inactive" | "pending" | "deleted" }
  ) => {
    return api.patch<TagResponse>(`/api/media/admin/tags/${id}`, data, { requireAuth: true });
  },
  deleteTagAdmin: async (id: string) => {
    return api.delete<TagResponse>(`/api/media/admin/tags/${id}`, { requireAuth: true });
  },
};
