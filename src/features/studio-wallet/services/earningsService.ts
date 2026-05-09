import type {
  CategoryEarnings,
  CumulativeEarningsFilters,
  CumulativeEarningsPoint,
  EarningsAnalytics,
  EarningsFilters,
  EarningsHistory,
  EarningsMetrics,
  EarningsMetricsFilters,
  EarningsPredictionsFilters,
  EarningsPredictionsResponse,
  EarningsStatusSummary,
  EarningsSummary,
  ExportEarningsRequest,
  ExportEarningsResponse,
  MonthlyEarnings,
  TopEarningVideosFilters,
  VideoEarnings,
} from "../types/earnings.types";
import { buildEarningsQuery, fetchEarningsResource } from "./earningsService.utils";

export class EarningsService {
  static getVideoEarnings(videoId: string, params: EarningsFilters = {}) {
    return fetchEarningsResource<VideoEarnings>("video", params, { videoId });
  }

  static getMonthlyEarnings(
    year: number,
    month: number,
    params: EarningsFilters = {}
  ) {
    return fetchEarningsResource<MonthlyEarnings>("monthly", params, {
      year,
      month,
    });
  }

  static getEarningsByCategory(
    category: string,
    params: EarningsFilters = {}
  ) {
    return fetchEarningsResource<CategoryEarnings>("category", params, {
      category,
    });
  }

  static getEarningsHistory(params: EarningsFilters = {}) {
    return fetchEarningsResource<EarningsHistory[]>("history", params);
  }

  static getEarningsSummary(params: EarningsFilters = {}) {
    return fetchEarningsResource<EarningsSummary>("summary", params);
  }

  static getVideoEarningsList(params: EarningsFilters = {}) {
    return fetchEarningsResource<VideoEarnings[]>("videos", params);
  }

  static getAllMonthlyEarnings(params: EarningsFilters = {}) {
    return fetchEarningsResource<MonthlyEarnings[]>("monthly-all", params);
  }

  static getEarningsByStatus(params: EarningsFilters = {}) {
    return fetchEarningsResource<EarningsStatusSummary>("by-status", params);
  }

  static getEarningsMetrics(params: EarningsMetricsFilters = {}) {
    return fetchEarningsResource<EarningsMetrics>("metrics", params);
  }

  static async exportEarnings(
    params: ExportEarningsRequest
  ): Promise<ExportEarningsResponse> {
    return fetchEarningsResource<ExportEarningsResponse>(
      `export${buildEarningsQuery(params)}`
    );
  }

  static getEarningsAnalytics(params: {
    period?: "30days" | "90days" | "180days" | "365days";
    startDate?: string;
    endDate?: string;
  } = {}) {
    return fetchEarningsResource<EarningsAnalytics>("analytics", params);
  }

  static getTopEarningVideos(params: TopEarningVideosFilters = {}) {
    return fetchEarningsResource<VideoEarnings[]>("top-videos", params);
  }

  static getCumulativeEarnings(params: CumulativeEarningsFilters) {
    return fetchEarningsResource<CumulativeEarningsPoint[]>("cumulative", params);
  }

  static getEarningsPredictions(params: EarningsPredictionsFilters) {
    return fetchEarningsResource<EarningsPredictionsResponse>(
      "predictions",
      params
    );
  }
}
