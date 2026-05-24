import { api } from "@/shared/api/client";
import { buildQueryString, toCommaSeparated } from "./mediaService.helpers";
import { createUploadResumableVideoFile, uploadPresignedFile } from "./mediaService.upload";
import type {
  AutoRenewMembershipResponse,
  CategoryResponse,
  ChannelDetailResponse,
  ChannelResponse,
  CompletePartBody,
  CompletePartResponse,
  CompleteUploadResponse,
  ContinueWatchingVideoResponse,
  DiscoveryVideoResponse,
  GetPartUrlsResponse,
  InitUploadBody,
  InitUploadResponse,
  MembershipPurchaseResponse,
  MembershipStatusResponse,
  MembershipTierResponse,
  MyChannelResponse,
  OwnerVideoDetailResponse,
  OwnerVideoResponse,
  OwnerVideosParams,
  PaginationParams,
  PlaybackInfoResponse,
  PublicVideosParams,
  PurchaseRequestOptions,
  PurchasedVideoResponse,
  RefreshPlaybackTokenResponse,
  SaveVideoProgressBody,
  SaveVideoProgressResponse,
  SearchMediaParams,
  SearchMediaResponse,
  SubmitUploadBody,
  SubmitUploadResponse,
  TagResponse,
  UpdateVideoMetadataBody,
  UploadStatusResponse,
  UserMembershipResponse,
  VideoMetadataResponse,
  VideoPurchaseResponse,
} from "./mediaService.types";

export type * from "./mediaService.types";
export {
  getReadyOwnerVideoThumbnailUrl,
  getReadyPublicVideoThumbnailUrl,
  getReadyThumbnailUrl,
} from "./mediaService.helpers";

const getPartUrls = async (videoId: string, uploadId: string, partNumbers: number[]) => {
  return api.post<GetPartUrlsResponse>(
    `/api/media/studio/videos/${encodeURIComponent(videoId)}/uploads/${encodeURIComponent(uploadId)}/part-urls`,
    { partNumbers },
    { requireAuth: true }
  );
};

const completePart = async (videoId: string, uploadId: string, partNumber: number, data: CompletePartBody) => {
  return api.post<CompletePartResponse>(
    `/api/media/studio/videos/${encodeURIComponent(videoId)}/uploads/${encodeURIComponent(uploadId)}/parts/${partNumber}/completed`,
    data,
    { requireAuth: true }
  );
};

const getUploadStatus = async (videoId: string, uploadId: string) => {
  return api.get<UploadStatusResponse>(
    `/api/media/studio/videos/${encodeURIComponent(videoId)}/uploads/${encodeURIComponent(uploadId)}/status`,
    { requireAuth: true }
  );
};

const completeUpload = async (videoId: string, uploadId: string) => {
  return api.post<CompleteUploadResponse>(
    `/api/media/studio/videos/${encodeURIComponent(videoId)}/uploads/${encodeURIComponent(uploadId)}/complete`,
    undefined,
    { requireAuth: true }
  );
};

const uploadResumableVideoFile = createUploadResumableVideoFile({
  getUploadStatus,
  getPartUrls,
  completePart,
  completeUpload,
});

function buildPurchaseHeaders(options: PurchaseRequestOptions) {
  const headers: Record<string, string> = {
    "idempotency-key": options.idempotencyKey,
  };

  if (options.requestId) {
    headers["x-request-id"] = options.requestId;
  }

  return headers;
}

export const mediaService = {
  // 1. HEALTH CHECK
  healthCheck: async () => {
    return api.get<string>("/api/media/");
  },

  // 2. CHANNEL
  createChannel: async (data: { name: string; bio: string }) => {
    return api.post<ChannelResponse>("/api/media/me/channel", data, { requireAuth: true });
  },
  updateChannel: async (
    id: string,
    data: { name?: string; bio?: string; avatarUrl?: string; bannerUrl?: string }
  ) => {
    void id;
    return api.patch<ChannelResponse>("/api/media/me/channel", data, { requireAuth: true });
  },
  uploadAvatarChannel: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<ChannelResponse>("/api/media/me/channel/avatar", formData, { requireAuth: true });
  },
  uploadBannerChannel: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<ChannelResponse>("/api/media/me/channel/banner", formData, { requireAuth: true });
  },
  getChannel: async (id: string) => {
    return api.get<ChannelDetailResponse>(`/api/media/channels/${id}`);
  },
  getMyChannel: async () => {
    return api.get<MyChannelResponse>("/api/media/me/channel", { requireAuth: true });
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
      `/api/media/admin/channels/${id}/membership`,
      { action },
      { requireAuth: true }
    );
  },
  requestChannelMembershipReview: async (id: string) => {
    return api.post<ChannelResponse>(
      `/api/media/channels/${id}/membership-review-requests`,
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
  purchaseMembership: async (channelId: string, tierId: string, options: PurchaseRequestOptions) => {
    return api.post<MembershipPurchaseResponse>(
      `/api/media/channels/${encodeURIComponent(channelId)}/memberships/${encodeURIComponent(tierId)}/purchase`,
      undefined,
      { requireAuth: true, headers: buildPurchaseHeaders(options) }
    );
  },

  // 4. VIDEO
  initUpload: async (data: InitUploadBody) => {
    return api.post<InitUploadResponse>("/api/media/studio/videos/uploads", data, { requireAuth: true });
  },
  getPartUrls,
  completePart,
  getUploadStatus,
  completeUpload,
  submitUpload: async (videoId: string, uploadId: string, data: SubmitUploadBody) => {
    return api.post<SubmitUploadResponse>(
      `/api/media/studio/videos/${encodeURIComponent(videoId)}/uploads/${encodeURIComponent(uploadId)}/submit`,
      data,
      { requireAuth: true }
    );
  },
  cancelUpload: async (videoId: string, uploadId: string) => {
    return api.delete<{ videoId: string; cancelled: boolean }>(
      `/api/media/studio/videos/${encodeURIComponent(videoId)}/uploads/${encodeURIComponent(uploadId)}`,
      { requireAuth: true }
    );
  },
  deleteFailedUpload: async (id: string) => {
    return api.delete<{ videoId: string; deleted: boolean }>(
      `/api/media/studio/videos/${encodeURIComponent(id)}/failed-upload`,
      { requireAuth: true }
    );
  },
  deleteVideo: async (id: string) => {
    return api.delete<{ videoId: string; unpublished: boolean }>(
      `/api/media/studio/videos/${encodeURIComponent(id)}`,
      { requireAuth: true }
    );
  },
  uploadPresignedFile,
  uploadResumableVideoFile,
  getPlaybackInfo: async (id: string) => {
    return api.get<PlaybackInfoResponse>(`/api/media/me/videos/${encodeURIComponent(id)}/play`, {
      requireAuth: true,
    });
  },
  saveVideoProgress: async (id: string, data: SaveVideoProgressBody) => {
    return api.post<SaveVideoProgressResponse>(
      `/api/media/me/videos/${encodeURIComponent(id)}/progress`,
      data,
      { requireAuth: true }
    );
  },
  refreshPlaybackToken: async (id: string) => {
    return api.post<RefreshPlaybackTokenResponse>(
      `/api/media/me/videos/${encodeURIComponent(id)}/playback-token/refresh`,
      {},
      { requireAuth: true }
    );
  },
  purchaseVideo: async (id: string, options: PurchaseRequestOptions) => {
    return api.post<VideoPurchaseResponse>(
      `/api/media/videos/${encodeURIComponent(id)}/purchase`,
      undefined,
      { requireAuth: true, headers: buildPurchaseHeaders(options) }
    );
  },
  getContinueWatching: async (params?: Pick<PaginationParams, "limit">) => {
    const qs = buildQueryString({ limit: params?.limit });
    return api.get<ContinueWatchingVideoResponse[]>(`/api/media/me/videos/continue-watching${qs}`, {
      requireAuth: true,
    });
  },
  getPurchasedVideos: async (params?: PaginationParams) => {
    const qs = buildQueryString({ page: params?.page, limit: params?.limit });
    return api.get<PurchasedVideoResponse[]>(`/api/media/me/videos/purchased${qs}`, {
      requireAuth: true,
    });
  },
  getVideoMetadata: async (id: string) => {
    return api.get<VideoMetadataResponse>(`/api/media/videos/${encodeURIComponent(id)}/metadata`);
  },
  updateVideoMetadata: async (id: string, data: UpdateVideoMetadataBody) => {
    return api.patch<VideoMetadataResponse>(
      `/api/media/studio/videos/${encodeURIComponent(id)}/metadata`,
      data,
      { requireAuth: true }
    );
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
    return api.get<DiscoveryVideoResponse[]>(`/api/media/videos/latest${qs}`);
  },
  getVideosByCategory: async (categorySlug: string, params?: PaginationParams) => {
    const qs = buildQueryString({ category: categorySlug.trim(), page: params?.page, limit: params?.limit });
    return api.get<DiscoveryVideoResponse[]>(`/api/media/videos/by-category${qs}`);
  },
  getVideosByCategorySlug: async (slug: string, params?: PaginationParams) => {
    const qs = buildQueryString({ category: slug.trim(), page: params?.page, limit: params?.limit });
    return api.get<DiscoveryVideoResponse[]>(`/api/media/videos/by-category${qs}`);
  },
  getSubscribedVideos: async (params?: Pick<PaginationParams, "limit">) => {
    const qs = buildQueryString({ limit: params?.limit });
    return api.get<DiscoveryVideoResponse[]>(`/api/media/me/videos/subscribed${qs}`, {
      requireAuth: true,
    });
  },
  getOwnerVideos: async (params?: OwnerVideosParams) => {
    const qs = buildQueryString({
      limit: params?.limit,
      status: toCommaSeparated(params?.status),
      visibility: toCommaSeparated(params?.visibility),
    });
    return api.get<OwnerVideoResponse[]>(`/api/media/studio/videos${qs}`, { requireAuth: true });
  },
  getOwnerVideoDetail: async (id: string) => {
    return api.get<OwnerVideoDetailResponse>(`/api/media/studio/videos/${encodeURIComponent(id)}`, {
      requireAuth: true,
    });
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
