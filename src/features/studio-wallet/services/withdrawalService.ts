import { api } from "@/shared/api/client";
import { assertWalletCanOperate } from "@/features/wallet/types/wallet-utils";
import { StudioWalletService } from "./studioWalletService";
import type {
  CreateWithdrawalRequest,
  Withdrawal,
  WithdrawalAmountLimits,
  WithdrawalHistoryFilters,
  WithdrawalHistoryResponse,
  WithdrawalSummary,
} from "../types/withdrawal.types";

type WithdrawalApiListResponse = {
  items: Withdrawal[];
  pagination: WithdrawalHistoryResponse["pagination"];
};

const buildQueryString = (filters: WithdrawalHistoryFilters = {}) => {
  const searchParams = new URLSearchParams();

  if (filters.status && filters.status !== "ALL") {
    searchParams.set("status", filters.status);
  }

  if (filters.page) {
    searchParams.set("page", String(filters.page));
  }

  if (filters.limit) {
    searchParams.set("limit", String(filters.limit));
  }

  if (filters.startDate) {
    searchParams.set("startDate", filters.startDate);
  }

  if (filters.endDate) {
    searchParams.set("endDate", filters.endDate);
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export class WithdrawalService {
  static async requestWithdrawal(data: CreateWithdrawalRequest): Promise<Withdrawal> {
    const wallet = await StudioWalletService.getStudioWallet();
    assertWalletCanOperate(wallet.status, "withdraw");

    const response = await api.post<Withdrawal>("/api/withdrawals", data, {
      requireAuth: true,
    });
    return response.data;
  }

  static async getWithdrawalHistory(
    filters: WithdrawalHistoryFilters = {}
  ): Promise<WithdrawalHistoryResponse> {
    const response = await api.get<WithdrawalApiListResponse>(`/api/withdrawals/me${buildQueryString(filters)}`, {
      requireAuth: true,
    });

    return {
      withdrawals: response.data.items,
      pagination: response.data.pagination,
    };
  }

  static async getWithdrawal(withdrawalId: string): Promise<Withdrawal> {
    const response = await api.get<Withdrawal>(`/api/withdrawals/${withdrawalId}`, {
      requireAuth: true,
    });
    return response.data;
  }

  static async cancelWithdrawal(withdrawalId: string): Promise<Withdrawal> {
    const response = await api.post<Withdrawal>(
      `/api/payment/${withdrawalId}/cancel`,
      {},
      { requireAuth: true }
    );
    return response.data;
  }

  static async getWithdrawalSummary(): Promise<WithdrawalSummary> {
    const response = await api.get<WithdrawalSummary>("/api/withdrawals/summary", {
      requireAuth: true,
    });
    return response.data;
  }

  static async getWithdrawalAmountLimits(): Promise<WithdrawalAmountLimits> {
    const response = await api.get<WithdrawalAmountLimits>("/api/withdrawals/amount-limits", {
      requireAuth: true,
    });
    return response.data;
  }
}
