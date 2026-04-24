import { api } from "@/shared/utils/apiClient";

export interface PaginationParams {
  limit?: number;
  page?: number;
}

export interface InitUploadBody {
  channelId: string;
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

export const mediaService = {
  // 1. HEALTH CHECK
  healthCheck: async () => {
    return api.get<string>("/api/media/");
  },

  // 2. CHANNEL
  createChannel: async (data: { name: string; bio: string }) => {
    return api.post<any>("/api/media/channels", data, { requireAuth: true });
  },
  updateChannel: async (id: string, data: { name?: string; bio?: string; avatarUrl?: string; bannerUrl?: string }) => {
    return api.patch<any>(`/api/media/channels/${id}`, data, { requireAuth: true });
  },
  getChannel: async (id: string) => {
    return api.get<any>(`/api/media/channels/${id}`);
  },
  getMembershipStatus: async (id: string) => {
    return api.get<any>(`/api/media/channels/${id}/membership-status`, { requireAuth: true });
  },

  // 3. MEMBERSHIP TIERS
  getMembershipTiers: async (channelId: string) => {
    return api.get<any[]>(`/api/media/channels/${channelId}/membership-tiers`);
  },
  createMembershipTier: async (channelId: string, data: { level: number; name: string; priceCoin: number }) => {
    return api.post<any>(`/api/media/channels/${channelId}/membership-tiers`, data, { requireAuth: true });
  },
  updateMembershipTier: async (channelId: string, tierId: string, data: { name?: string; priceCoin?: number; isAcceptingNew?: boolean }) => {
    return api.patch<any>(`/api/media/channels/${channelId}/membership-tiers/${tierId}`, data, { requireAuth: true });
  },
  disableMembershipTier: async (channelId: string, tierId: string) => {
    return api.delete<any>(`/api/media/channels/${channelId}/membership-tiers/${tierId}`, { requireAuth: true });
  },

  // 4. VIDEO
  initUpload: async (data: InitUploadBody) => {
    return api.post<any>("/api/media/videos/init-upload", data, { requireAuth: true });
  },
  confirmUpload: async (id: string, data: ConfirmUploadBody) => {
    return api.post<any>(`/api/media/videos/${id}/confirm-upload`, data, { requireAuth: true });
  },
  getPlaybackInfo: async (id: string) => {
    return api.get<any>(`/api/media/videos/${id}/play`, { requireAuth: true });
  },
  refreshPlaybackToken: async (id: string) => {
    return api.post<any>(`/api/media/videos/${id}/playback-token/refresh`, {}, { requireAuth: true });
  },
  getVideoMetadata: async (id: string) => {
    return api.get<any>(`/api/media/videos/${id}/metadata`);
  },
  updateVideoMetadata: async (id: string, data: { title?: string; description?: string; thumbnailUrl?: string | null }) => {
    return api.patch<any>(`/api/media/videos/${id}/metadata`, data, { requireAuth: true });
  },

  // DISCOVERY
  getLatestVideos: async (params?: PaginationParams) => {
    const qs = params?.limit ? `?limit=${params.limit}` : "";
    return api.get<any[]>(`/api/media/videos/discovery/latest${qs}`);
  },
  getVideosByCategory: async (category: string, params?: PaginationParams) => {
    const limitQs = params?.limit ? `&limit=${params.limit}` : "";
    return api.get<any[]>(`/api/media/videos/discovery/by-category?category=${category}${limitQs}`);
  },
  getSubscribedVideos: async (params?: PaginationParams) => {
    const qs = params?.limit ? `?limit=${params.limit}` : "";
    return api.get<any[]>(`/api/media/videos/discovery/subscribed${qs}`, { requireAuth: true });
  },

  // 6. CATEGORIES
  getCategories: async () => {
    return api.get<any[]>("/api/media/categories");
  },
  getAllCategoriesAdmin: async () => {
    return api.get<any[]>("/api/media/categories/admin/all", { requireAuth: true });
  },
  createCategoryAdmin: async (data: { name: string; description?: string }) => {
    return api.post<any>("/api/media/categories", data, { requireAuth: true });
  },
  updateCategoryAdmin: async (id: string, data: { name?: string; description?: string }) => {
    return api.patch<any>(`/api/media/categories/${id}`, data, { requireAuth: true });
  },
};
