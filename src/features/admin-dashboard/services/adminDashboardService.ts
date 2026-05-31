import { AdminDepositService } from "@/features/admin-finance/services/adminDepositService";
import { mediaService } from "@/features/watch/services/mediaService";
import { api, getErrorMessage } from "@/shared/api/client";

import type {
  AdminChannelsSummary,
  AdminDashboardData,
  AdminDashboardDataSource,
  AdminReportListResponse,
  AdminReportsSummary,
  AdminUsersSummary,
  AdminVideoSummary,
  AdminWithdrawalListResponse,
  AdminWithdrawalSummary,
  FinanceOverviewData,
  ServiceHealthStatus,
} from "../types/admin-dashboard.types";

type SettledSource<T> = {
  data: T;
  source: AdminDashboardDataSource;
};

function isFulfilled<T>(result: PromiseSettledResult<T>): result is PromiseFulfilledResult<T> {
  return result.status === "fulfilled";
}

function buildSource<T>(
  key: AdminDashboardDataSource["key"],
  label: string,
  result: PromiseSettledResult<T>,
  successMessage: string,
  fallbackMessage: string,
  fallbackData: T
): SettledSource<T> {
  if (isFulfilled(result)) {
    return {
      data: result.value,
      source: {
        key,
        label,
        status: "ready",
        message: successMessage,
      },
    };
  }

  return {
    data: fallbackData,
    source: {
      key,
      label,
      status: "unavailable",
      message: getErrorMessage(result.reason, fallbackMessage),
    },
  };
}

async function getUsersSummary() {
  const response = await api.get<AdminUsersSummary>("/api/identity/user/admin/users/summary", { requireAuth: true });
  return response.data;
}

async function getChannelsSummary() {
  const response = await api.get<AdminChannelsSummary>("/api/media/admin/channels/summary", { requireAuth: true });
  return response.data;
}

async function getReportsSummary() {
  const response = await api.get<AdminReportsSummary>("/api/media/admin/reports/summary", { requireAuth: true });
  return response.data;
}

export async function getVideoSummary(period: string = "all") {
  const response = await api.get<AdminVideoSummary>(`/api/media/admin/videos/summary?period=${period}`, {
    requireAuth: true,
  });
  return response.data;
}

async function getReports() {
  const response = await api.get<AdminReportListResponse>("/api/media/admin/reports?status=pending&page=1&limit=5", {
    requireAuth: true,
  });
  return response.data;
}

async function getWithdrawalSummary() {
  const response = await api.get<AdminWithdrawalSummary>("/api/withdrawals/admin/summary", { requireAuth: true });
  return response.data;
}

async function getWithdrawals() {
  const response = await api.get<AdminWithdrawalListResponse>("/api/withdrawals/admin?status=pending&page=1&limit=5", {
    requireAuth: true,
  });
  return response.data;
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [
    usersResult,
    channelsResult,
    reportsSummaryResult,
    videoSummaryResult,
    reportsResult,
    withdrawalSummaryResult,
    withdrawalsResult,
    packagesResult,
    categoriesResult,
    tagsResult,
  ] = await Promise.allSettled([
    getUsersSummary(),
    getChannelsSummary(),
    getReportsSummary(),
    getVideoSummary(),
    getReports(),
    getWithdrawalSummary(),
    getWithdrawals(),
    AdminDepositService.getAdminPackages(),
    mediaService.getAllCategoriesAdmin({ page: 1, limit: 50 }).then(response => response.data.items),
    mediaService.getAllTagsAdmin({ page: 1, limit: 50 }).then(response => response.data.items),
  ]);

  const users = buildSource(
    "users",
    "Users Summary",
    usersResult,
    "User growth summary loaded from identity service.",
    "Không thể tải tổng quan người dùng.",
    null
  );
  const channels = buildSource(
    "creators",
    "Creator Summary",
    channelsResult,
    "Creator/channel summary loaded from media service.",
    "Không thể tải tổng quan creator/channel.",
    null
  );
  const reportsSummary = buildSource(
    "moderation",
    "Moderation Summary",
    reportsSummaryResult,
    "Moderation queue summary loaded from media service.",
    "Không thể tải tổng quan moderation.",
    null
  );
  const videosSummary = buildSource(
    "videos",
    "Video Summary",
    videoSummaryResult,
    "Video summary loaded from media service.",
    "Không thể tải tổng quan video.",
    null
  );
  const reports = buildSource(
    "moderation",
    "Moderation Queue",
    reportsResult,
    "Pending moderation queue loaded from media service.",
    "Không thể tải danh sách report cần duyệt.",
    { items: [], pagination: { page: 1, limit: 5, total: 0, totalPages: 0 } }
  );
  const withdrawalSummary = buildSource(
    "payouts",
    "Withdrawal Summary",
    withdrawalSummaryResult,
    "Withdrawal summary loaded from finance service.",
    "Không thể tải tổng quan payout.",
    null
  );
  const withdrawals = buildSource(
    "payouts",
    "Pending Withdrawals",
    withdrawalsResult,
    "Pending withdrawal list loaded from finance service.",
    "Không thể tải danh sách payout chờ duyệt.",
    { items: [], pagination: { page: 1, limit: 5, total: 0, totalPages: 0 } }
  );
  const packages = buildSource(
    "finance",
    "Deposit Packages",
    packagesResult,
    "Coin package configuration loaded from finance service.",
    "Không thể tải cấu hình gói nạp coin.",
    []
  );
  const categories = buildSource(
    "taxonomy",
    "Categories",
    categoriesResult,
    "Category taxonomy loaded from media service.",
    "Không thể tải danh mục nội dung.",
    []
  );
  const tags = buildSource(
    "taxonomy",
    "Tags",
    tagsResult,
    "Tag taxonomy loaded from media service.",
    "Không thể tải tag nội dung.",
    []
  );

  return {
    usersSummary: users.data,
    channelsSummary: channels.data,
    reportsSummary: reportsSummary.data,
    videoSummary: videosSummary.data,
    reports: reports.data.items,
    withdrawalSummary: withdrawalSummary.data,
    withdrawals: withdrawals.data.items,
    depositPackages: packages.data,
    categories: categories.data,
    tags: tags.data,
    dataSources: [
      users.source,
      channels.source,
      reportsSummary.source,
      videosSummary.source,
      reports.source,
      withdrawalSummary.source,
      withdrawals.source,
      packages.source,
      categories.source,
      tags.source,
    ],
    loadedAt: new Date().toISOString(),
  };
}

export async function getFinanceOverview(startDate?: string, endDate?: string): Promise<FinanceOverviewData> {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);

  const queryString = params.toString();
  const url = `/api/admin/dashboard/overview${queryString ? `?${queryString}` : ""}`;

  const response = await api.get<FinanceOverviewData>(url, { requireAuth: true });
  return response.data;
}

export async function checkServiceHealth(serviceName: string, endpoint: string): Promise<ServiceHealthStatus> {
  const startTime = Date.now();
  try {
    await api.get(endpoint, {
      requireAuth: false,
      suppressAuthRedirect: true,
    });
    const latency = Date.now() - startTime;
    return {
      service: serviceName,
      endpoint,
      status: "healthy",
      latency,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const latency = Date.now() - startTime;
    return {
      service: serviceName,
      endpoint,
      status: "unhealthy",
      latency,
      timestamp: new Date().toISOString(),
      error: getErrorMessage(err, "Offline or Unreachable"),
    };
  }
}

