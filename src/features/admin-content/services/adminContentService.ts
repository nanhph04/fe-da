import { api } from "@/shared/api/client";
import type { ApiPagination } from "@/shared/api/types";

import type {
  AdminVideoItem,
  AdminVideoListParams,
  AdminVideoPreview,
} from "../types/admin-content.types";

export interface AdminVideoListResponse {
  items: AdminVideoItem[];
  pagination: ApiPagination;
}

const buildQueryString = (params: AdminVideoListParams = {}) => {
  const searchParams = new URLSearchParams();

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.visibility) {
    searchParams.set("visibility", params.visibility);
  }

  if (params.channelId?.trim()) {
    searchParams.set("channelId", params.channelId.trim());
  }

  if (params.ownerId?.trim()) {
    searchParams.set("ownerId", params.ownerId.trim());
  }

  if (params.q?.trim()) {
    searchParams.set("q", params.q.trim());
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const adminContentService = {
  async getVideos(params: AdminVideoListParams = {}) {
    const response = await api.get<AdminVideoListResponse>(
      `/api/media/admin/videos${buildQueryString(params)}`,
      {
        requireAuth: true,
      },
    );

    return response.data;
  },

  async getVideo(id: string) {
    const response = await api.get<AdminVideoItem>(
      `/api/media/admin/videos/${id}`,
      {
        requireAuth: true,
      },
    );

    return response.data;
  },

  async getVideoPreview(id: string) {
    const response = await api.get<AdminVideoPreview>(
      `/api/media/admin/videos/${id}/preview`,
      {
        requireAuth: true,
      },
    );

    return response.data;
  },

  async moderateVideo(
    id: string,
    payload: { action: "approve" } | { action: "reject"; reason: string },
  ) {
    const response = await api.patch<AdminVideoItem>(
      `/api/media/admin/videos/${id}/moderation`,
      payload,
      {
        requireAuth: true,
      },
    );

    return response.data;
  },
};
