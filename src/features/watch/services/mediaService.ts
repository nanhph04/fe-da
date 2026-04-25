import { api } from "@/shared/utils/apiClient";

// Common Pagination
export interface PaginationParams {
  limit?: number;
  page?: number;
}

// Channel Interfaces
export interface ChannelResponse {
  id: string;
  userId: string;
  name: string;
  bio: string;
  isEligibleForMembership: boolean;
  avatarUrl: string;
  bannerUrl: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Membership Tier
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

// Video Interfaces
export interface InitUploadBody {
  title: string;
  description?: string;
  categories?: string[];
  visibility?: "public" | "private";
  price?: number;
  requiredTierLevel?: number | null;
}

export interface ConfirmUploadBody {
  resolutions: string[];
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
  playbackUrl: string; // The URL to the stream /api/media/stream/:id/master.m3u8?token=
  streamUrl?: string; // Fallback
}

export interface VideoMetadataResponse {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  status: string;
  visibility: string;
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
  price: number;
  requiredTierLevel: number | null;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  resolutions: string[];
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  channel?: { name: string };
  metrics?: { viewsCount: number };
}

// Category Interface
export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const mediaService = {
  // 1. HEALTH CHECK
  healthCheck: async () => {
    return api.get<string>("/api/media/");
  },

  // 2. CHANNEL
  createChannel: async (data: { name: string; bio: string }) => {
    return api.post<ChannelResponse>("/api/media/channels", data, { requireAuth: true });
  },
  updateChannel: async (id: string, data: { name?: string; bio?: string; avatarUrl?: string; bannerUrl?: string }) => {
    return api.patch<ChannelResponse>(`/api/media/channels/${id}`, data, { requireAuth: true });
  },
  getChannel: async (id: string) => {
    return api.get<any>(`/api/media/channels/${id}`);
  },
  getMembershipStatus: async (id: string) => {
    return api.get<{ isActive: boolean; membershipId: string | null; expiryDate: string | null }>(`/api/media/channels/${id}/membership-status`, { requireAuth: true });
  },

  // 3. MEMBERSHIP TIERS
  getMembershipTiers: async (channelId: string) => {
    return api.get<MembershipTierResponse[]>(`/api/media/channels/${channelId}/membership-tiers`);
  },
  createMembershipTier: async (channelId: string, data: { level: number; name: string; priceCoin: number }) => {
    return api.post<MembershipTierResponse>(`/api/media/channels/${channelId}/membership-tiers`, data, { requireAuth: true });
  },
  updateMembershipTier: async (channelId: string, tierId: string, data: { name?: string; priceCoin?: number; isAcceptingNew?: boolean }) => {
    return api.patch<MembershipTierResponse>(`/api/media/channels/${channelId}/membership-tiers/${tierId}`, data, { requireAuth: true });
  },
  disableMembershipTier: async (channelId: string, tierId: string) => {
    return api.delete<MembershipTierResponse>(`/api/media/channels/${channelId}/membership-tiers/${tierId}`, { requireAuth: true });
  },

  // 4. VIDEO
  initUpload: async (data: InitUploadBody) => {
    return api.post<InitUploadResponse>("/api/media/videos/init-upload", data, { requireAuth: true });
  },
  confirmUpload: async (id: string, data: ConfirmUploadBody) => {
    return api.post<{ status: string; message: string }>(`/api/media/videos/${id}/confirm-upload`, data, { requireAuth: true });
  },
  getPlaybackInfo: async (id: string) => {
    return api.get<PlaybackInfoResponse>(`/api/media/videos/${id}/play`, { requireAuth: true });
  },
  refreshPlaybackToken: async (id: string) => {
    return api.post<{ videoId: string; playbackToken: string; playbackUrl: string }>(`/api/media/videos/${id}/playback-token/refresh`, {}, { requireAuth: true });
  },
  getVideoMetadata: async (id: string) => {
    return api.get<VideoMetadataResponse>(`/api/media/videos/${id}/metadata`);
  },
  updateVideoMetadata: async (id: string, data: { title?: string; description?: string; thumbnailUrl?: string | null }) => {
    return api.patch<VideoMetadataResponse>(`/api/media/videos/${id}/metadata`, data, { requireAuth: true });
  },

  // 5. DISCOVERY
  getLatestVideos: async (params?: PaginationParams) => {
    const qs = params?.limit ? `?limit=${params.limit}` : "";
    return api.get<DiscoveryVideoResponse[]>(`/api/media/videos/discovery/latest${qs}`);
  },
  getVideosByCategory: async (category: string, params?: PaginationParams) => {
    const limitQs = params?.limit ? `&limit=${params.limit}` : "";
    return api.get<DiscoveryVideoResponse[]>(`/api/media/videos/discovery/by-category?category=${category}${limitQs}`);
  },
  getSubscribedVideos: async (params?: PaginationParams) => {
    const qs = params?.limit ? `?limit=${params.limit}` : "";
    return api.get<DiscoveryVideoResponse[]>(`/api/media/videos/discovery/subscribed${qs}`, { requireAuth: true });
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
