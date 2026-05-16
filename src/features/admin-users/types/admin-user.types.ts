import type { ApiPagination } from "@/shared/api/types";

export type AdminUserStatus = "active" | "suspended";
export type AdminUserSortBy = "createdAt" | "updatedAt" | "email";
export type AdminUserSortOrder = "asc" | "desc";

export interface AdminUsersSummary {
  totalUsers: number;
  activeUsers30d: number;
  newUsers30d: number;
  growth30dPercent: number | null;
  flaggedUsers: number;
  lockedUsers: number;
}

export interface AdminUserListItem {
  userId: string;
  email: string;
  role: "user";
  status: AdminUserStatus;
  isEmailVerified: boolean;
  displayName: string;
  avatarUrl: string;
  isCreator: boolean;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string | null;
}

export interface AdminUserProfile {
  userId: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  phone: number;
  gender: "male" | "women" | "female" | null;
  birthday: string | null;
  isCreator: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserSessionSummary {
  activeSessionCount: number;
  lastActiveAt: string | null;
}

export interface AdminUserDetail {
  userId: string;
  email: string;
  role: "user";
  status: AdminUserStatus;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  profile: AdminUserProfile;
  sessions: AdminUserSessionSummary;
}

export interface AdminUserListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: AdminUserStatus;
  emailVerified?: boolean;
  isCreator?: boolean;
  createdFrom?: string;
  createdTo?: string;
  sortBy?: AdminUserSortBy;
  sortOrder?: AdminUserSortOrder;
}

export interface AdminUserListResponse {
  items: AdminUserListItem[];
  pagination: ApiPagination;
}

export interface AdminUserStatusPayload {
  status: AdminUserStatus;
  reason?: string;
}
