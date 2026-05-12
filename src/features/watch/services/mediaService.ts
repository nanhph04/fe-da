import { api } from "@/shared/api/client";

export interface PaginationParams {
  limit?: number;
  page?: number;
}

export interface ChannelResponse {
  id: string;
  userId: string;
  name: string;
  bio: string;
  isEligibleForMembership: boolean;
  isMembershipClosedByAdmin: boolean;
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
  categories: string[];
  status: string;
  thumbnailUrl: string | null;
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
  categories: string[];
  description?: string;
  visibility?: "public" | "private";
  price?: number;
  requiredTierLevel?: number | null;
}

export interface ConfirmUploadBody {
  resolutions: Array<"480p" | "720p" | "1080p">;
}

export interface InitUploadResponse {
  videoId: string;
  status: string;
  rawFileKey: string;
  bucket: string;
  uploadUrl: string;
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
  streamUrl?: string;
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

export interface VideoProgressResponse {
  videoId: string;
  stage: string;
  percent: number;
  message: string;
  terminal: boolean;
  updatedAt: string;
  detail: Record<string, unknown> | null;
  errorCode: string | null;
}

export interface VideoMetadataResponse {
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

export interface DiscoveryVideoResponse {
  id: string;
  channelId: string;
  title: string;
  description: string;
  categories: string[];
  status: string;
  visibility: string;
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

export interface OwnerVideoResponse extends DiscoveryVideoResponse {
  visibility: string;
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
  channelName: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  categories: string[];
  priceCoin: number;
  purchasedAt: string;
  lastWatchedAt: string | null;
  resumePositionSeconds: number | null;
  accessStatus: "ACTIVE" | "EXPIRED" | "REVOKED" | string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: "active" | "inactive" | "deleted" | string;
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
    return api.post<InitUploadResponse>("/api/media/videos/init-upload", data, { requireAuth: true });
  },
  confirmUpload: async (id: string, data: ConfirmUploadBody) => {
    return api.post<{ status: string; message: string }>(
      `/api/media/videos/${id}/confirm-upload`,
      data,
      { requireAuth: true }
    );
  },
  getPlaybackInfo: async (id: string) => {
    return api.get<PlaybackInfoResponse>(`/api/media/videos/${id}/play`, { requireAuth: true });
  },
  saveVideoProgress: async (id: string, data: SaveVideoProgressBody) => {
    return api.post<SaveVideoProgressResponse>(`/api/media/videos/${id}/progress`, data, {
      requireAuth: true,
    });
  },
  getVideoProgress: async (id: string) => {
    return api.get<VideoProgressResponse>(`/api/media/videos/${id}/progress`, { requireAuth: true });
  },
  getVideoProgressStreamUrl: (id: string) => {
    return `/api/media/videos/${id}/progress/stream`;
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
  updateVideoMetadata: async (
    id: string,
    data: { title?: string; description?: string; thumbnailUrl?: string | null }
  ) => {
    return api.patch<VideoMetadataResponse>(`/api/media/videos/${id}/metadata`, data, {
      requireAuth: true,
    });
  },

  // 5. DISCOVERY & SEARCH
  getLatestVideos: async (params?: Pick<PaginationParams, "limit">) => {
    const qs = buildQueryString({ limit: params?.limit });
    return api.get<DiscoveryVideoResponse[]>(`/api/media/videos/discovery/latest${qs}`);
  },
  getVideosByCategory: async (category: string, params?: PaginationParams) => {
    const qs = buildQueryString({ category, page: params?.page, limit: params?.limit });
    return api.get<DiscoveryVideoResponse[]>(`/api/media/videos/discovery/by-category${qs}`);
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
  searchMedia: async (params: SearchMediaParams) => {
    const qs = buildQueryString({ q: params.q, category: params.category, limit: params.limit });
    return api.get<SearchMediaResponse>(`/api/media/search${qs}`);
  },

  // 6. CATEGORIES
  getCategories: async () => {
    return api.get<CategoryResponse[]>("/api/media/categories");
  },
  getAllCategoriesAdmin: async () => {
    return api.get<CategoryResponse[]>("/api/media/categories/admin/all", { requireAuth: true });
  },
  createCategoryAdmin: async (data: { name: string; description?: string }) => {
    return api.post<CategoryResponse>("/api/media/categories", data, { requireAuth: true });
  },
  updateCategoryAdmin: async (id: string, data: { name?: string; description?: string }) => {
    return api.patch<CategoryResponse>(`/api/media/categories/${id}`, data, { requireAuth: true });
  },
};
