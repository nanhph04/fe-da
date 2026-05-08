import { api } from "@/shared/utils/apiClient";
import {
  PaymentMethod,
  Payout,
  CreatePayoutRequest,
  PayoutHistoryFilters,
  PayoutSummary,
  FeeCalculationRequest,
  FeeCalculationResponse,
  PayoutMethodConfig
} from "../types/payout.types";

export class PayoutService {
  /**
   * Get all payment methods
   */
  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await api.get<PaymentMethod[]>(
      "/api/studio/payout-methods",
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Create a new payment method
   */
  static async createPaymentMethod(method: Omit<PaymentMethod, "id" | "createdAt" | "updatedAt">): Promise<PaymentMethod> {
    const response = await api.post<PaymentMethod>(
      "/api/studio/payout-methods",
      method,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Update payment method
   */
  static async updatePaymentMethod(
    methodId: string,
    updates: Partial<PaymentMethod>
  ): Promise<PaymentMethod> {
    const response = await api.patch<PaymentMethod>(
      `/api/studio/payout-methods/${methodId}`,
      updates,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Delete payment method
   */
  static async deletePaymentMethod(methodId: string): Promise<void> {
    await api.delete(`/api/studio/payout-methods/${methodId}`, {
      requireAuth: true
    });
  }

  /**
   * Set default payment method
   */
  static async setDefaultPaymentMethod(methodId: string): Promise<void> {
    await api.post(`/api/studio/payout-methods/${methodId}/set-default`, {}, {
      requireAuth: true
    });
  }

  /**
   * Request a payout
   */
  static async requestPayout(data: CreatePayoutRequest): Promise<Payout> {
    const response = await api.post<Payout>(
      "/api/studio/payouts",
      data,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Get payout history
   */
  static async getPayoutHistory(filters: PayoutHistoryFilters = {}): Promise<{
    payouts: Payout[];
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
      payouts: Payout[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(
      `/api/studio/payouts?${params.toString()}`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Get payout by ID
   */
  static async getPayout(payoutId: string): Promise<Payout> {
    const response = await api.get<Payout>(
      `/api/studio/payouts/${payoutId}`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Cancel a pending payout
   */
  static async cancelPayout(payoutId: string, reason?: string): Promise<Payout> {
    const response = await api.post<Payout>(
      `/api/studio/payouts/${payoutId}/cancel`,
      { reason },
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Get payout summary
   */
  static async getPayoutSummary(): Promise<PayoutSummary> {
    const response = await api.get<PayoutSummary>("/api/studio/payouts/summary", {
      requireAuth: true
    });
    return response.data;
  }

  /**
   * Calculate payout fee
   */
  static async calculateFee(request: FeeCalculationRequest): Promise<FeeCalculationResponse> {
    const response = await api.get<FeeCalculationResponse>(
      `/api/studio/payouts/calculate-fee?amount=${request.amount}&methodId=${request.methodId}`,
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Get payout method configurations
   */
  static async getMethodConfig(): Promise<PayoutMethodConfig> {
    const response = await api.get<PayoutMethodConfig>("/api/studio/payout-methods/config", {
      requireAuth: true
    });
    return response.data;
  }

  /**
   * Get minimum and maximum payout amounts
   */
  static async getMinMaxAmounts(methodId?: string): Promise<{
    min: number;
    max: number;
    minNote?: string;
    maxNote?: string;
  }> {
    const url = methodId
      ? `/api/studio/payouts/amount-limits?methodId=${methodId}`
      : "/api/studio/payouts/amount-limits";

    const response = await api.get<{
      min: number;
      max: number;
      minNote?: string;
      maxNote?: string;
    }>(url, { requireAuth: true });
    return response.data;
  }

  /**
   * Get supported currencies
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
    }>>("/api/studio/payout-methods/currencies", {
      requireAuth: true
    });
    return response.data;
  }

  /**
   * Validate payout request before submission
   */
  static async validatePayoutRequest(data: CreatePayoutRequest): Promise<{
    isValid: boolean;
    errors?: string[];
    warnings?: string[];
  }> {
    const response = await api.post<{
      isValid: boolean;
      errors?: string[];
      warnings?: string[];
    }>("/api/studio/payouts/validate", data, {
      requireAuth: true
    });
    return response.data;
  }
}