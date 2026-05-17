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

export type AdminChannelStatus = "active" | "inactive" | "suspended";
export type AdminMembershipReviewStatus = "not_requested" | "pending" | "approved" | "rejected";

export interface AdminChannelsSummary {
  totalChannels: number;
  activeCreators30d: number;
  eligibleForMembership: number;
  membershipClosedByAdmin: number;
  membershipPendingReview: number;
  membershipApproved: number;
  membershipRejected: number;
  uploadingNow: number;
}

export interface AdminChannelListItem {
  id: string;
  userId: string;
  name: string;
  bio: string;
  status: AdminChannelStatus | string;
  isEligibleForMembership: boolean;
  isMembershipClosedByAdmin: boolean;
  membershipReviewStatus: AdminMembershipReviewStatus;
  membershipRejectionReason: string | null;
  membershipRequestedAt: string | null;
  membershipReviewedAt: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminChannelListParams {
  page?: number;
  limit?: number;
  status?: AdminChannelStatus;
  ownerId?: string;
  q?: string;
}

export interface AdminChannelListResponse {
  items: AdminChannelListItem[];
  pagination: ApiPagination;
}

export type AdminChannelStatusPayload =
  | { action: "lock"; reason?: string }
  | { action: "unlock" };

export type AdminChannelMembershipReviewPayload =
  | { action: "approve" }
  | { action: "reject"; reason: string };

export interface AdminChannelMembershipAvailabilityPayload {
  action: "close" | "open";
}

export interface AdminChannelActionResponse {
  id: string;
  userId: string;
  name: string;
  bio: string;
  isEligibleForMembership: boolean;
  isMembershipClosedByAdmin: boolean;
  membershipReviewStatus: AdminMembershipReviewStatus;
  membershipRejectionReason: string | null;
  membershipRequestedAt: string | null;
  membershipReviewedAt: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  status?: AdminChannelStatus | string;
  createdAt?: string;
  updatedAt?: string;
}
