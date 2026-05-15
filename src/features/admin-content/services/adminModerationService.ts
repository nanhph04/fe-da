import { api } from "@/shared/api/client";
import type { ApiPagination } from "@/shared/api/types";

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

export interface AdminReportListParams {
  status?: "pending" | "rejected";
  page?: number;
  limit?: number;
}

const buildQueryString = (params: AdminReportListParams = {}) => {
  const searchParams = new URLSearchParams();

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const adminModerationService = {
  async getReports(params: AdminReportListParams = {}) {
    const response = await api.get<AdminReportListResponse>(`/api/media/admin/reports${buildQueryString(params)}`, {
      requireAuth: true,
    });

    return response.data;
  },
};
