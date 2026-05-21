import { api } from "@/shared/api/client";
import type { ApiPagination } from "@/shared/api/types";
import { Withdrawal, BankInfo, WithdrawalStatus } from "../types/wallet.types";
import { assertWalletCanOperate } from "../types/wallet-utils";
import { WalletService } from "./walletService";

export interface CreateWithdrawalPayload {
  coinAmount: number;
  bankInfo: BankInfo;
  description?: string;
}

export interface WithdrawalListParams {
  status?: Extract<WithdrawalStatus, "pending" | "approved" | "processing" | "completed" | "rejected" | "cancelled">;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface WithdrawalListResponse {
  items: Withdrawal[];
  pagination: ApiPagination;
}

export interface WithdrawalSummaryResponse {
  pendingCount: number;
  pendingCoinAmount: number;
  pendingMoneyAmount: number;
  approvedCount: number;
  processingCount: number;
  completedCount: number;
  completedCoinAmount: number;
  completedMoneyAmount: number;
  rejectedCount: number;
  cancelledCount: number;
}

export interface WithdrawalAmountLimits {
  minCoinAmount: number;
  maxCoinAmount: number;
  availableBalance: number;
  exchangeRate: number;
  minMoneyAmount: number;
  maxMoneyAmount: number;
  currency: "VND" | string;
}

const buildQueryString = (params: WithdrawalListParams = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export class WithdrawalService {
  static async createWithdrawal(payload: CreateWithdrawalPayload): Promise<Withdrawal> {
    const wallet = await WalletService.getMyWallet();
    assertWalletCanOperate(wallet.status, "withdraw");

    const response = await api.post<Withdrawal>("/api/withdrawals", payload, { requireAuth: true });
    return response.data;
  }

  static async getMyWithdrawals(params: WithdrawalListParams = {}): Promise<WithdrawalListResponse> {
    const response = await api.get<WithdrawalListResponse>(`/api/withdrawals/me${buildQueryString(params)}`, { requireAuth: true });
    return response.data;
  }

  static async getWithdrawalSummary(): Promise<WithdrawalSummaryResponse> {
    const response = await api.get<WithdrawalSummaryResponse>("/api/withdrawals/summary", { requireAuth: true });
    return response.data;
  }

  static async getWithdrawalAmountLimits(): Promise<WithdrawalAmountLimits> {
    const response = await api.get<WithdrawalAmountLimits>("/api/withdrawals/amount-limits", { requireAuth: true });
    return response.data;
  }

  static async getWithdrawalDetails(withdrawalId: string): Promise<Withdrawal> {
    const response = await api.get<Withdrawal>(`/api/withdrawals/${withdrawalId}`, { requireAuth: true });
    return response.data;
  }

  static async cancelWithdrawal(withdrawalId: string): Promise<Withdrawal> {
    const response = await api.post<Withdrawal>(`/api/withdrawals/${withdrawalId}/cancel`, {}, { requireAuth: true });
    return response.data;
  }
}
