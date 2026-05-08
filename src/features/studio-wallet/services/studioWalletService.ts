import { api } from "@/shared/utils/apiClient";
import { StudioWallet, WalletStats, EarningsData, TotalRevenueData } from "../types/studio-wallet.types";

export class StudioWalletService {
  /**
   * Get studio wallet information
   */
  static async getStudioWallet(): Promise<StudioWallet> {
    const response = await api.get<StudioWallet>("/api/studio/wallet/me", {
      requireAuth: true
    });
    return response.data;
  }

  /**
   * Get wallet statistics
   */
  static async getWalletStats(): Promise<WalletStats> {
    const response = await api.get<WalletStats>("/api/studio/wallet/stats", {
      requireAuth: true
    });
    return response.data;
  }

  /**
   * Get earnings data for a specific period
   */
  static async getStudioEarnings(params: {
    period?: "daily" | "weekly" | "monthly" | "yearly";
    startDate?: string;
    endDate?: string;
  } = {}): Promise<EarningsData> {
    const searchParams = new URLSearchParams();

    if (params.period) searchParams.append("period", params.period);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);

    const response = await api.get<EarningsData>(
      `/api/studio/earnings?${searchParams.toString()}`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Get total revenue summary
   */
  static async getTotalRevenue(params: {
    period?: "daily" | "weekly" | "monthly" | "yearly";
    startDate?: string;
    endDate?: string;
  } = {}): Promise<TotalRevenueData> {
    const searchParams = new URLSearchParams();

    if (params.period) searchParams.append("period", params.period);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);

    const response = await api.get<TotalRevenueData>(
      `/api/studio/revenue/total?${searchParams.toString()}`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Update wallet settings
   */
  static async updateWalletSettings(settings: {
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    notifications?: boolean;
    currency?: "AC" | "VND";
  }): Promise<StudioWallet> {
    const response = await api.patch<StudioWallet>(
      "/api/studio/wallet/settings",
      settings,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Get wallet activity summary
   */
  static async getActivitySummary(): Promise<{
    totalDeposits: number;
    totalWithdrawals: number;
    totalPayments: number;
    netCashFlow: number;
    activityCount: number;
  }> {
    const response = await api.get<{
      totalDeposits: number;
      totalWithdrawals: number;
      totalPayments: number;
      netCashFlow: number;
      activityCount: number;
    }>("/api/studio/wallet/activity-summary", {
      requireAuth: true
    });
    return response.data;
  }

  /**
   * Get tax information
   */
  static async getTaxInformation(): Promise<{
    hasTaxInfo: boolean;
    taxId?: string;
    taxType?: string;
    taxPercentage?: number;
    lastUpdated: string;
  }> {
    const response = await api.get<{
      hasTaxInfo: boolean;
      taxId?: string;
      taxType?: string;
      taxPercentage?: number;
      lastUpdated: string;
    }>("/api/studio/wallet/tax-info", {
      requireAuth: true
    });
    return response.data;
  }

  /**
   * Update tax information
   */
  static async updateTaxInformation(taxInfo: {
    taxId: string;
    taxType: string;
    taxPercentage: number;
  }): Promise<{
    hasTaxInfo: boolean;
    taxId?: string;
    taxType?: string;
    taxPercentage?: number;
    lastUpdated: string;
  }> {
    const response = await api.patch<{
      hasTaxInfo: boolean;
      taxId?: string;
      taxType?: string;
      taxPercentage?: number;
      lastUpdated: string;
    }>("/api/studio/wallet/tax-info", taxInfo, {
      requireAuth: true
    });
    return response.data;
  }
}