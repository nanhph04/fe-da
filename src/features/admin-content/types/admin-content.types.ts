export type AdminVideoStatus =
  | "draft"
  | "pending_moderation"
  | "processing"
  | "pending_manual_review"
  | "rejected"
  | "ready"
  | "failed";

export type AdminVideoVisibility = "public" | "private";

export type AdminVideoModerationDetails = Record<string, unknown> | null;

export interface AdminVideoItem {
  id: string;
  channelId: string;
  ownerId: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  status: AdminVideoStatus | string;
  visibility: AdminVideoVisibility | string;
  price: number;
  requiredTierLevel: number | null;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  resolutions: string[];
  errorMessage: string | null;
  jobStatus: string | null;
  jobStatusMessage: string | null;
  failureReason: string | null;
  moderationDetails: AdminVideoModerationDetails;
  viewCount: number;
  publishedAt: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  deleteReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminVideoListParams {
  page?: number;
  limit?: number;
  status?: AdminVideoStatus;
  visibility?: AdminVideoVisibility;
  channelId?: string;
  ownerId?: string;
  q?: string;
}
