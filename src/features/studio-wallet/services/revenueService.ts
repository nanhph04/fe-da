// @ts-nocheck
import { api } from "@/shared/utils/apiClient";
import {
  RevenueFilters,
  VideoRevenue,
  RevenueSummary,
  DailyRevenue,
  MonthlyRevenue,
  RevenueBreakdown,
  ExportRevenueRequest,
  ExportRevenueResponse,
  RevenueAnalytics,
  PerformanceMetrics
} from "../types/revenue.types";

export class RevenueService {
  /**
   * Get video revenue data
   */
  static async getVideoRevenue(params: RevenueFilters): Promise<VideoRevenue[]> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, item.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    const response = await api.get<VideoRevenue[]>(
      `/api/studio/revenue/videos?${searchParams.toString()}`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Get revenue summary
   */
  static async getRevenueSummary(params: RevenueFilters = {}): Promise<RevenueSummary> {
    const searchParams = new URLSearchParams();

    if (params.period) searchParams.append("period", params.period);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);
    if (params.videoId) searchParams.append("videoId", params.videoId);

    const response = await api.get<RevenueSummary>(
      `/api/studio/revenue/summary?${searchParams.toString()}`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Get daily revenue data
   */
  static async getDailyRevenue(params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<DailyRevenue[]> {
    const searchParams = new URLSearchParams();

    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);

    const response = await api.get<DailyRevenue[]>(
      `/api/studio/revenue/daily?${searchParams.toString()}`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Get monthly revenue data
   */
  static async getMonthlyRevenue(params: {
    year?: number;
    months?: number[];
  } = {}): Promise<MonthlyRevenue[]> {
    const searchParams = new URLSearchParams();

    if (params.year) searchParams.append("year", params.year.toString());
    if (params.months) {
      params.months.forEach(month => searchParams.append("months", month.toString()));
    }

    const response = await api.get<MonthlyRevenue[]>(
      `/api/studio/revenue/monthly?${searchParams.toString()}`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Get revenue breakdown by category
   */
  static async getRevenueBreakdown(params: RevenueFilters = {}): Promise<RevenueBreakdown> {
    const searchParams = new URLSearchParams();

    if (params.period) searchParams.append("period", params.period);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);

    const response = await api.get<RevenueBreakdown>(
      `/api/studio/revenue/breakdown?${searchParams.toString()}`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Export revenue data
   */
  static async exportRevenue(params: ExportRevenueRequest): Promise<ExportRevenueResponse> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await api.get<ExportRevenueResponse>(
      `/api/studio/revenue/export?${searchParams.toString()}`,
      {
        requireAuth: true,
        responseType: "blob"
      }
    );
    return response.data;
  }

  /**
   * Get revenue analytics
   */
  static async getRevenueAnalytics(params: {
    period?: "30days" | "90days" | "180days" | "365days";
    startDate?: string;
    endDate?: string;
  } = {}): Promise<RevenueAnalytics> {
    const searchParams = new URLSearchParams();

    if (params.period) searchParams.append("period", params.period);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);

    const response = await api.get<RevenueAnalytics>(
      `/api/studio/revenue/analytics?${searchParams.toString()}`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Get performance metrics
   */
  static async getPerformanceMetrics(params: {
    period?: "monthly" | "quarterly" | "yearly";
    startDate?: string;
    endDate?: string;
  } = {}): Promise<PerformanceMetrics> {
    const searchParams = new URLSearchParams();

    if (params.period) searchParams.append("period", params.period);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);

    const response = await api.get<PerformanceMetrics>(
      `/api/studio/revenue/performance?${searchParams.toString()}`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Get top performing videos
   */
  static async getTopVideos(params: {
    period?: "daily" | "weekly" | "monthly" | "yearly";
    limit?: number;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<VideoRevenue[]> {
    const searchParams = new URLSearchParams();

    if (params.period) searchParams.append("period", params.period);
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);

    const response = await api.get<VideoRevenue[]>(
      `/api/studio/revenue/top-videos?${searchParams.toString()}`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Get revenue growth comparison
   */
  static async getGrowthComparison(params: {
    period: "monthly" | "quarterly" | "yearly";
    compareWith: "previous" | "same_period_previous_year";
  }): Promise<{
    current: number;
    comparison: number;
    growth: number;
    absoluteDifference: number;
  }> {
    const searchParams = new URLSearchParams();
    searchParams.append("period", params.period);
    searchParams.append("compareWith", params.compareWith);

    const response = await api.get<{
      current: number;
      comparison: number;
      growth: number;
      absoluteDifference: number;
    }>(
      `/api/studio/revenue/growth?${searchParams.toString()}`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Get historical revenue trends
   */
  static async getHistoricalTrends(params: {
    interval: "daily" | "weekly" | "monthly";
    points?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<Array<{
    date: string;
    revenue: number;
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
      revenue: number;
      views: number;
    }>>(
      `/api/studio/revenue/trends?${searchParams.toString()}`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Get revenue predictions
   */
  static async getRevenuePredictions(params: {
    period: "7days" | "30days" | "90days";
    confidence?: "low" | "medium" | "high";
  }): Promise<{
    predictions: Array<{
      date: string;
      predictedRevenue: number;
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
        predictedRevenue: number;
        confidence: number;
      }>;
      totalPredicted: number;
      method: string;
      modelVersion: string;
    }>(
      `/api/studio/revenue/predictions?${searchParams.toString()}`,
      { requireAuth: true }
    );
    return response.data;
  }
}
