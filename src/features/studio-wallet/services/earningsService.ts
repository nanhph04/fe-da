import { api } from "@/shared/api/client";
import type { ApiRequestInit } from "@/shared/api/types";
import type {
  EarningsFilters,
  EarningsHistoryResponse,
  EarningsSummary,
  MonthlyEarnings,
  TopEarningVideosFilters,
  VideoEarnings,
} from "../types/earnings.types";
import { buildEarningsQuery } from "./earningsService.utils";

type MonthlyEarningsFilters = Pick<EarningsFilters, "period">;
type EarningsHistoryFilters = Pick<EarningsFilters, "startDate" | "endDate" | "status"> & {
  page?: number;
  limit?: number;
};

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
    params: MonthlyEarningsFilters = {},
    options: ApiRequestInit = {}
  ) {
    const response = await api.get<MonthlyEarnings>(
      `/api/studio/earnings/monthly${buildEarningsQuery({ year, month }, params)}`,
      { ...options, requireAuth: true }
    );
    return response.data;
  }

  static async getMonthlyEarningsRange(months: number, options: ApiRequestInit = {}) {
    const now = new Date();
    const requests = Array.from({ length: months }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (months - 1 - index), 1);
      return EarningsService.getMonthlyEarnings(
        date.getFullYear(),
        date.getMonth() + 1,
        { period: "monthly" },
        options
      );
    });

    return Promise.all(requests);
  }

  /**
   * Real finance-service contract: GET /api/studio/earnings/history
   */
  static async getEarningsHistory(params: EarningsHistoryFilters = {}, options: ApiRequestInit = {}) {
    const response = await api.get<EarningsHistoryResponse>(
      `/api/studio/earnings/history${buildEarningsQuery(params)}`,
      { ...options, requireAuth: true }
    );
    return response.data;
  }

  static async getEarningsHistoryRange(params: EarningsHistoryFilters = {}, options: ApiRequestInit = {}) {
    const limit = 100;
    const firstPage = await EarningsService.getEarningsHistory({ ...params, page: 1, limit }, options);
    const items = [...firstPage.items];

    for (let page = 2; page <= firstPage.pagination.totalPages; page += 1) {
      const nextPage = await EarningsService.getEarningsHistory({ ...params, page, limit }, options);
      items.push(...nextPage.items);
    }

    return items;
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
