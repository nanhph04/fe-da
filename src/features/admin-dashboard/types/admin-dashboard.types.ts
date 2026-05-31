import type { DepositPackage, Withdrawal } from "@/features/wallet/types/wallet.types";
import type { CategoryResponse, TagResponse } from "@/features/watch/services/mediaService";
import type { ApiPagination } from "@/shared/api/types";

export type AdminDashboardSourceStatus = "ready" | "unavailable";

export interface AdminDashboardDataSource {
  key: "finance" | "taxonomy" | "users" | "creators" | "moderation" | "payouts" | "verifications" | "activity" | "videos";
  label: string;
  status: AdminDashboardSourceStatus;
  message: string;
}

export interface AdminUsersSummary {
  totalUsers: number;
  activeUsers30d: number;
  newUsers30d: number;
  growth30dPercent: number | null;
  flaggedUsers: number;
  lockedUsers: number;
}

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

export interface AdminReportsSummary {
  pendingReports: number;
  pendingManualReviewVideos: number;
  autoFlaggedVideos: number;
  rejectedLast30d: number;
  averageResolutionHours: number | null;
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

export interface AdminReportItem {
  id: string;
  targetVideoId: string;
  title: string;
  reporterLabel: string;
  reason: string;
  confidencePercent: number | null;
  createdAt: string;
  priority: "low" | "medium" | "high" | "critical";
}

export interface AdminReportListResponse {
  items: AdminReportItem[];
  pagination: ApiPagination;
}

export interface AdminWithdrawalSummary {
  pendingCount: number;
  pendingCoinAmount: number;
  pendingMoneyAmount: number;
  approvedCount: number;
  processingCount: number;
  completed30dMoneyAmount: number;
}

export interface AdminWithdrawalListResponse {
  items: Withdrawal[];
  pagination: ApiPagination;
}

export interface AdminDashboardData {
  usersSummary: AdminUsersSummary | null;
  channelsSummary: AdminChannelsSummary | null;
  reportsSummary: AdminReportsSummary | null;
  videoSummary: AdminVideoSummary | null;
  reports: AdminReportItem[];
  withdrawalSummary: AdminWithdrawalSummary | null;
  withdrawals: Withdrawal[];
  depositPackages: DepositPackage[];
  categories: CategoryResponse[];
  tags: TagResponse[];
  dataSources: AdminDashboardDataSource[];
  loadedAt: string;
}

export interface AdminStatCard {
  id: string;
  label: string;
  value: string;
  detail: string;
  icon: string;
  tone: "default" | "primary" | "secondary" | "warning";
  href?: string;
  unavailable?: boolean;
}

export interface AdminPriorityAction {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: string;
  tone: "primary" | "secondary" | "muted";
  countLabel: string;
  unavailable?: boolean;
}

export interface FinanceOverviewData {
  generatedAt: string;
  range: {
    startDate: string;
    endDate: string;
  };
  deposits: {
    totalCount: number;
    pendingCount: number;
    processingCount: number;
    completedCount: number;
    failedCount: number;
    cancelledCount: number;
    completedMoneyAmount: number;
    completedCoinAmount: number;
  };
  withdrawals: {
    totalCount: number;
    pendingCount: number;
    completedCount: number;
    rejectedCount: number;
    cancelledCount: number;
    pendingMoneyAmount: number;
    completedMoneyAmount: number;
    totalFeeAmount: number;
    pendingFeeAmount: number;
    completedFeeAmount: number;
  };
  revenue: {
    totalPaymentCoins: number;
    creatorRevenueCoins: number;
    systemRevenueCoins: number;
    videoSystemRevenueCoins: number;
    membershipSystemRevenueCoins: number;
    pendingSystemRevenueCoins: number;
    releasedSystemRevenueCoins: number;
  };
  wallets: {
    userWalletCount: number;
    activeUserWalletCount: number;
    totalUserAvailableBalance: number;
    totalUserFrozenBalance: number;
    systemRevenueAvailableBalance: number;
    systemRevenueFrozenBalance: number;
  };
  transactions: {
    totalCount: number;
    pendingCount: number;
    completedCount: number;
    failedCount: number;
    cancelledCount: number;
    depositCoinAmount: number;
    withdrawalCoinAmount: number;
    videoPurchaseCoins: number;
    membershipCoins: number;
  };
}

export interface ServiceHealthStatus {
  service: string;
  endpoint: string;
  status: "healthy" | "unhealthy" | "checking";
  latency?: number;
  timestamp?: string;
  error?: string;
}

export interface DashboardWidgetConfig {
  id: "health" | "stats" | "financeOverview" | "priorityActions" | "dataSources";
  title: string;
  visible: boolean;
}

