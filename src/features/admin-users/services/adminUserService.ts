import { api } from "@/shared/api/client";
import type { ApiPagination, ApiResponse } from "@/shared/api/types";

import type {
  AdminUserDetail,
  AdminUserListParams,
  AdminUserListResponse,
  AdminUsersSummary,
  AdminUserStatusPayload,
} from "../types/admin-user.types";

const buildUserListQuery = (params: AdminUserListParams = {}) => {
  const searchParams = new URLSearchParams();

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }

  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (typeof params.emailVerified === "boolean") {
    searchParams.set("emailVerified", String(params.emailVerified));
  }

  if (typeof params.isCreator === "boolean") {
    searchParams.set("isCreator", String(params.isCreator));
  }

  if (params.createdFrom) {
    searchParams.set("createdFrom", params.createdFrom);
  }

  if (params.createdTo) {
    searchParams.set("createdTo", params.createdTo);
  }

  if (params.sortBy) {
    searchParams.set("sortBy", params.sortBy);
  }

  if (params.sortOrder) {
    searchParams.set("sortOrder", params.sortOrder);
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

const normalizeUserListResponse = (response: ApiResponse<AdminUserListItemFromApi[]>): AdminUserListResponse => ({
  items: response.data,
  pagination: response.pagination ?? emptyPagination,
});

const emptyPagination: ApiPagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

type AdminUserListItemFromApi = AdminUserListResponse["items"][number];

export const adminUserService = {
  async getSummary() {
    const response = await api.get<AdminUsersSummary>("/api/user/admin/users/summary", { requireAuth: true });
    return response.data;
  },

  async getUsers(params: AdminUserListParams = {}) {
    const response = await api.get<AdminUserListItemFromApi[]>(
      `/api/user/admin/users${buildUserListQuery(params)}`,
      { requireAuth: true }
    );

    return normalizeUserListResponse(response);
  },

  async getUserDetail(userId: string) {
    const response = await api.get<AdminUserDetail>(`/api/user/admin/users/${userId}`, { requireAuth: true });
    return response.data;
  },

  async updateUserStatus(userId: string, payload: AdminUserStatusPayload) {
    const response = await api.patch<AdminUserDetail>(`/api/user/admin/users/${userId}/status`, payload, {
      requireAuth: true,
    });

    return response.data;
  },
};
