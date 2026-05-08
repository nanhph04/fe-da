import { api } from "@/shared/api/client";
import {
  VideoEarnings,
  MonthlyEarnings,
  CategoryEarnings,
  EarningsHistory,
  EarningsSummary,
  EarningsFilters,
  ExportEarningsRequest,
  ExportEarningsResponse
} from "../types/earnings.types";

export class EarningsService {
  /**
   * Get video earnings data
   */
  static async getVideoEarnings(videoId: string, params: EarningsFilters = {}): Promise<VideoEarnings> {
    const searchParams = new URLSearchParams();
    searchParams.append("videoId", videoId);

    if (params.period) searchParams.append("period", params.period);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);
    if (params.status) searchParams.append("status", params.status);

    const response = await api.get<VideoEarnings>(
      `/api/studio/earnings/video?${searchParams.toString()}`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Get monthly earnings data
   */
  static async getMonthlyEarnings(year: number, month: number, params: EarningsFilters = {}): Promise<MonthlyEarnings> {
    const searchParams = new URLSearchParams();
    searchParams.append("year", year.toString());
    searchParams.append("month", month.toString());

    if (params.status) searchParams.append("status", params.status);

    const response = await api.get<MonthlyEarnings>(
      `/api/studio/earnings/monthly?${searchParams.toString()}`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Get earnings by category
   */
  static async getEarningsByCategory(category: string, params: EarningsFilters = {}): Promise<CategoryEarnings> {
    const searchParams = new URLSearchParams();
    searchParams.append("category", category);

    if (params.period) searchParams.append("period", params.period);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);

    const response = await api.get<CategoryEarnings>(
      `/api/studio/earnings/category?${searchParams.toString()}`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Get earnings history with filters
   */
  static async getEarningsHistory(params: EarningsFilters = {}): Promise<EarningsHistory[]> {
    const searchParams = new URLSearchParams();

    if (params.period) searchParams.append("period", params.period);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);
    if (params.videoId) searchParams.append("videoId", params.videoId);
    if (params.status) searchParams.append("status", params.status);

    const response = await api.get<EarningsHistory[]>(
      `/api/studio/earnings/history?${searchParams.toString()}`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Get earnings summary
   */
  static async getEarningsSummary(params: EarningsFilters = {}): Promise<EarningsSummary> {
    const searchParams = new URLSearchParams();

    if (params.period) searchParams.append("period", params.period);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);

    const response = await api.get<EarningsSummary>(
      `/api/studio/earnings/summary?${searchParams.toString()}`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Get video earnings list (for dashboard)
   */
  static async getVideoEarningsList(params: EarningsFilters = {}): Promise<VideoEarnings[]> {
    const searchParams = new URLSearchParams();

    if (params.period) searchParams.append("period", params.period);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);
    if (params.status) searchParams.append("status", params.status);

    const response = await api.get<VideoEarnings[]>(
      `/api/studio/earnings/videos?${searchParams.toString()}`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Get all monthly earnings
   */
  static async getAllMonthlyEarnings(params: EarningsFilters = {}): Promise<MonthlyEarnings[]> {
    const searchParams = new URLSearchParams();

    if (params.period) searchParams.append("period", params.period);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);
    if (params.status) searchParams.append("status", params.status);

    const response = await api.get<MonthlyEarnings[]>(
      `/api/studio/earnings/monthly-all?${searchParams.toString()}`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Get earnings by status
   */
  static async getEarningsByStatus(params: EarningsFilters = {}): Promise<{
    pending: number;
    confirmed: number;
    paid: number;
  }> {
    const searchParams = new URLSearchParams();

    if (params.period) searchParams.append("period", params.period);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);

    const response = await api.get<{
      pending: number;
      confirmed: number;
      paid: number;
    }>(
      `/api/studio/earnings/by-status?${searchParams.toString()}`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Get earnings metrics
   */
  static async getEarningsMetrics(params: {
    period?: "monthly" | "quarterly" | "yearly";
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    earnings: {
      currentPeriod: number;
      previousPeriod: number;
      growth: number;
      pendingAmount: number;
      confirmedAmount: number;
      paidAmount: number;
    };
    views: {
      currentPeriod: number;
      previousPeriod: number;
      growth: number;
      averageViewDuration: number;
    };
    engagement: {
      completionRate: number;
      likesPerView: number;
      commentsPerView: number;
      sharesPerView: number;
    };
    payout: {
      nextPayoutDate?: string;
      lastPayoutDate?: string;
      totalPaidToDate: number;
      averagePayoutAmount: number;
      pendingCount: number;
      confirmedCount: number;
      paidCount: number;
    };
  }> {
    const searchParams = new URLSearchParams();

    if (params.period) searchParams.append("period", params.period);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);

    const response = await api.get<{
      earnings: {
        currentPeriod: number;
        previousPeriod: number;
        growth: number;
        pendingAmount: number;
        confirmedAmount: number;
        paidAmount: number;
      };
      views: {
        currentPeriod: number;
        previousPeriod: number;
        growth: number;
        averageViewDuration: number;
      };
      engagement: {
        completionRate: number;
        likesPerView: number;
        commentsPerView: number;
        sharesPerView: number;
      };
      payout: {
        nextPayoutDate?: string;
        lastPayoutDate?: string;
        totalPaidToDate: number;
        averagePayoutAmount: number;
        pendingCount: number;
        confirmedCount: number;
        paidCount: number;
      };
    }>(
      `/api/studio/earnings/metrics?${searchParams.toString()}`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Export earnings data
   */
  static async exportEarnings(params: ExportEarningsRequest): Promise<ExportEarningsResponse> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await api.get<ExportEarningsResponse>(
      `/api/studio/earnings/export?${searchParams.toString()}`,
      {
        requireAuth: true,
        responseType: "blob"
      }
    );
    return response.data;
  }

  /**
   * Get earnings analytics
   */
  static async getEarningsAnalytics(params: {
    period?: "30days" | "90days" | "180days" | "365days";
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    earningsTrend: Array<{
      date: string;
      earnings: number;
      views: number;
    }>;
    topCategories: CategoryEarnings[];
    bestPerformingDayOfWeek: string;
    bestPerformingHour: number;
    earningsPerSubscriber: number;
    payoutRate: number;
    estimatedMonthlyPayout: number;
  }> {
    const searchParams = new URLSearchParams();

    if (params.period) searchParams.append("period", params.period);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);

    const response = await api.get<{
      earningsTrend: Array<{
        date: string;
        earnings: number;
        views: number;
      }>;
      topCategories: CategoryEarnings[];
      bestPerformingDayOfWeek: string;
      bestPerformingHour: number;
      earningsPerSubscriber: number;
      payoutRate: number;
      estimatedMonthlyPayout: number;
    }>(
      `/api/studio/earnings/analytics?${searchParams.toString()}`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Get top earning videos
   */
  static async getTopEarningVideos(params: {
    period?: "daily" | "weekly" | "monthly" | "yearly";
    limit?: number;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<VideoEarnings[]> {
    const searchParams = new URLSearchParams();

    if (params.period) searchParams.append("period", params.period);
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);

    const response = await api.get<VideoEarnings[]>(
      `/api/studio/earnings/top-videos?${searchParams.toString()}`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Get cumulative earnings over time
   */
  static async getCumulativeEarnings(params: {
    interval: "daily" | "weekly" | "monthly";
    points?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<Array<{
    date: string;
    cumulativeEarnings: number;
    periodEarnings: number;
    views: number;
  }>> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await api.get<Array<{
      date: string;
      cumulativeEarnings: number;
      periodEarnings: number;
      views: number;
    }>>(
      `/api/studio/earnings/cumulative?${searchParams.toString()}`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Get earnings predictions
   */
  static async getEarningsPredictions(params: {
    period: "7days" | "30days" | "90days";
    confidence?: "low" | "medium" | "high";
  }): Promise<{
    predictions: Array<{
      date: string;
      predictedEarnings: number;
      confidence: number;
    }>;
    totalPredicted: number;
    method: string;
    modelVersion: string;
  }> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await api.get<{
      predictions: Array<{
        date: string;
        predictedEarnings: number;
        confidence: number;
      }>;
      totalPredicted: number;
      method: string;
      modelVersion: string;
    }>(
      `/api/studio/earnings/predictions?${searchParams.toString()}`,
      { requireAuth: true }
    );
    return response.data;
  }
}
