import { api } from "@/shared/api/client";
import type {
  EarningsFilters,
  EarningsSummary,
  MonthlyEarnings,
  TopEarningVideosFilters,
  VideoEarnings,
} from "../types/earnings.types";
import { buildEarningsQuery } from "./earningsService.utils";

type MonthlyEarningsFilters = Pick<EarningsFilters, "period">;

export class EarningsService {
  /**
   * Real finance-service contract: GET /api/studio/earnings/summary
   * Finance currently accepts period but does not use it for filtering.
   */
  static async getEarningsSummary(params: Pick<EarningsFilters, "period"> = {}) {
    const response = await api.get<EarningsSummary>(
      `/api/studio/earnings/summary${buildEarningsQuery(params)}`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Real finance-service contract: GET /api/studio/earnings/monthly?year=YYYY&month=M
   */
  static async getMonthlyEarnings(
    year: number,
    month: number,
    params: MonthlyEarningsFilters = {}
  ) {
    const response = await api.get<MonthlyEarnings>(
      `/api/studio/earnings/monthly${buildEarningsQuery({ year, month }, params)}`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Real finance-service contract: GET /api/studio/earnings/top-videos?period=monthly&limit=3
   */
  static async getTopEarningVideos(params: TopEarningVideosFilters = {}) {
    const response = await api.get<VideoEarnings[]>(
      `/api/studio/earnings/top-videos${buildEarningsQuery(params)}`,
      { requireAuth: true }
    );
    return response.data;
  }
}
