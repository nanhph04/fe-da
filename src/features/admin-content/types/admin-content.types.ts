export type AdminVideoStatus =
  | "draft"
  | "pending_moderation"
  | "processing"
  | "pending_manual_review"
  | "rejected"
  | "ready"
  | "failed";

export type AdminVideoVisibility = "public" | "private";
export type AdminThumbnailSource = "auto" | "custom" | string;
export type AdminThumbnailStatus =
  | "pending"
  | "processing"
  | "ready"
  | "failed"
  | string;

export type AdminVideoModerationDetails = Record<string, unknown> | null;

export interface AdminVideoPreview {
  videoId: string;
  previewUrl: string;
  expiresAt: string;
  evidenceTimestampSeconds: number | null;
  moderationDetails: AdminVideoModerationDetails;
}

export interface AdminVideoItem {
  id: string;
  channelId: string;
  ownerId: string;
  title: string;
  channelName?: string | null;
  channel?: { name: string } | null;
  description: string;
  category: string;
  categoryTitle?: string | null;
  tags: string[];
  status: AdminVideoStatus | string;
  visibility: AdminVideoVisibility | string;
  price: number;
  requiredTierLevel: number | null;
  thumbnailUrl: string | null;
  thumbnailSource: AdminThumbnailSource;
  thumbnailStatus: AdminThumbnailStatus;
  durationSeconds: number | null;
  resolutions: string[];
  errorMessage: string | null;
  jobStatus: string | null;
  jobStatusMessage: string | null;
  failureReason: string | null;
  moderationDetails: AdminVideoModerationDetails;
  viewCount: number;
  purchaseCount?: number;
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
  category?: string;
}

export interface AdminVideoSummary {
  period: "day" | "week" | "month" | "all";
  totalVideos: number;
  readyVideos: number;
  uploadingVideos: number;
  pendingManualReviewVideos: number;
  rejectedVideos: number;
  failedVideos: number;
  bannedVideos: number;
  totalViews: number;
  newVideos: number;
  newViews: number;
  newPurchases: number;
}

