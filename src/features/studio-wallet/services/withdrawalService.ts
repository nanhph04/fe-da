import { api } from "@/shared/utils/apiClient";
import {
  BankInfo,
  Withdrawal,
  CreateWithdrawalRequest,
  WithdrawalHistoryFilters,
  WithdrawalSummary,
  WithdrawalStatus,
  WithdrawalMethod,
  FeeCalculationRequest,
  FeeCalculationResponse,
  WithdrawalMethodConfig,
  WithdrawalValidationResponse
} from "../types/withdrawal.types";

export class WithdrawalService {
  /**
   * Get available withdrawal methods
   */
  static async getWithdrawalMethods(): Promise<WithdrawalMethod[]> {
    const response = await api.get<WithdrawalMethod[]>(
      "/api/studio/withdrawal-methods",
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Create a new withdrawal method
   */
  static async createWithdrawalMethod(method: Omit<WithdrawalMethod, "id" | "createdAt" | "updatedAt">): Promise<WithdrawalMethod> {
    const response = await api.post<WithdrawalMethod>(
      "/api/studio/withdrawal-methods",
      method,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Update withdrawal method
   */
  static async updateWithdrawalMethod(
    methodId: string,
    updates: Partial<WithdrawalMethod>
  ): Promise<WithdrawalMethod> {
    const response = await api.patch<WithdrawalMethod>(
      `/api/studio/withdrawal-methods/${methodId}`,
      updates,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Delete withdrawal method
   */
  static async deleteWithdrawalMethod(methodId: string): Promise<void> {
    await api.delete(`/api/studio/withdrawal-methods/${methodId}`, {
      requireAuth: true
    });
  }

  /**
   * Set default withdrawal method
   */
  static async setDefaultWithdrawalMethod(methodId: string): Promise<void> {
    await api.post(`/api/studio/withdrawal-methods/${methodId}/set-default`, {}, {
      requireAuth: true
    });
  }

  /**
   * Request a withdrawal
   */
  static async requestWithdrawal(data: CreateWithdrawalRequest): Promise<Withdrawal> {
    const response = await api.post<Withdrawal>(
      "/api/studio/withdrawals",
      data,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Get withdrawal history with filters
   */
  static async getWithdrawalHistory(filters: WithdrawalHistoryFilters = {}): Promise<{
    withdrawals: Withdrawal[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const params = new URLSearchParams();

    if (filters.status && filters.status !== "ALL") {
      params.append("status", filters.status);
    }
    if (filters.methodType) {
      params.append("methodType", filters.methodType);
    }
    if (filters.startDate) {
      params.append("startDate", filters.startDate);
    }
    if (filters.endDate) {
      params.append("endDate", filters.endDate);
    }
    if (filters.page) {
      params.append("page", filters.page.toString());
    }
    if (filters.limit) {
      params.append("limit", filters.limit.toString());
    }

    const response = await api.get<{
      withdrawals: Withdrawal[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(
      `/api/studio/withdrawals?${params.toString()}`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Get withdrawal by ID
   */
  static async getWithdrawal(withdrawalId: string): Promise<Withdrawal> {
    const response = await api.get<Withdrawal>(
      `/api/studio/withdrawals/${withdrawalId}`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Get withdrawal status
   */
  static async getWithdrawalStatus(withdrawalId: string): Promise<WithdrawalStatus> {
    const response = await api.get<WithdrawalStatus>(
      `/api/studio/withdrawals/${withdrawalId}/status`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Cancel a pending withdrawal
   */
  static async cancelWithdrawal(withdrawalId: string, reason?: string): Promise<Withdrawal> {
    const response = await api.post<Withdrawal>(
      `/api/studio/withdrawals/${withdrawalId}/cancel`,
      { reason },
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Get withdrawal summary
   */
  static async getWithdrawalSummary(): Promise<WithdrawalSummary> {
    const response = await api.get<WithdrawalSummary>("/api/studio/withdrawals/summary", {
      requireAuth: true
    });
    return response.data;
  }

  /**
   * Calculate withdrawal fee
   */
  static async calculateWithdrawalFee(request: FeeCalculationRequest): Promise<FeeCalculationResponse> {
    const params = new URLSearchParams();
    params.append("amount", request.amount.toString());
    params.append("methodType", request.methodType);

    const response = await api.get<FeeCalculationResponse>(
      `/api/studio/withdrawals/calculate-fee?${params.toString()}`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Validate withdrawal request before submission
   */
  static async validateWithdrawalRequest(amount: number, methodType: string): Promise<WithdrawalValidationResponse> {
    const response = await api.post<WithdrawalValidationResponse>(
      "/api/studio/withdrawals/validate",
      { amount, methodType },
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Get withdrawal method configurations
   */
  static async getWithdrawalMethodConfig(): Promise<WithdrawalMethodConfig> {
    const response = await api.get<WithdrawalMethodConfig>("/api/studio/withdrawal-methods/config", {
      requireAuth: true
    });
    return response.data;
  }

  /**
   * Get minimum and maximum withdrawal amounts for a method
   */
  static async getWithdrawalAmountLimits(methodType?: string): Promise<{
    min: number;
    max: number;
    minNote?: string;
    maxNote?: string;
  }> {
    const url = methodType
      ? `/api/studio/withdrawals/amount-limits?methodType=${methodType}`
      : "/api/studio/withdrawals/amount-limits";

    const response = await api.get<{
      min: number;
      max: number;
      minNote?: string;
      maxNote?: string;
    }>(url, { requireAuth: true });
    return response.data;
  }

  /**
   * Get supported currencies for withdrawal
   */
  static async getSupportedCurrencies(): Promise<Array<{
    code: string;
    name: string;
    symbol: string;
    decimalDigits: number;
  }>> {
    const response = await api.get<Array<{
      code: string;
      name: string;
      symbol: string;
      decimalDigits: number;
    }>>("/api/studio/withdrawals/currencies", {
      requireAuth: true
    });
    return response.data;
  }

  /**
   * Get processing time estimates for withdrawal method
   */
  static async getProcessingTime(methodType: string): Promise<{
    methodType: string;
    estimatedTime: string;
    description: string;
  }> {
    const response = await api.get<{
      methodType: string;
      estimatedTime: string;
      description: string;
    }>(`/api/studio/withdrawals/processing-time?methodType=${methodType}`, {
      requireAuth: true
    });
    return response.data;
  }

  /**
   * Resubmit a rejected withdrawal
   */
  static async resubmitWithdrawal(withdrawalId: string, updatedData: Partial<CreateWithdrawalRequest>): Promise<Withdrawal> {
    const response = await api.post<Withdrawal>(
      `/api/studio/withdrawals/${withdrawalId}/resubmit`,
      updatedData,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Get withdrawal statistics for analytics
   */
  static async getWithdrawalStats(params: {
    period?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    totalWithdrawals: number;
    totalAmount: number;
    avgAmount: number;
    successRate: number;
    processingTime: {
      average: string;
      min: string;
      max: string;
    };
    byStatus: {
      pending: number;
      approved: number;
      completed: number;
      rejected: number;
      cancelled: number;
    };
    byMethod: Record<string, number>;
  }> {
    const searchParams = new URLSearchParams();

    if (params.period) searchParams.append("period", params.period);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);

    const response = await api.get<{
      totalWithdrawals: number;
      totalAmount: number;
      avgAmount: number;
      successRate: number;
      processingTime: {
        average: string;
        min: string;
        max: string;
      };
      byStatus: {
        pending: number;
        approved: number;
        completed: number;
        rejected: number;
        cancelled: number;
      };
      byMethod: Record<string, number>;
    }>(
      `/api/studio/withdrawals/stats?${searchParams.toString()}`,
      { requireAuth: true }
    );
    return response.data;
  }
}
