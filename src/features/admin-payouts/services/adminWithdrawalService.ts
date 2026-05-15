import { api } from "@/shared/api/client";
import type { ApiPagination } from "@/shared/api/types";
import type { Withdrawal } from "@/features/wallet/types/wallet.types";

export interface AdminWithdrawalSummary {
  pendingCount: number;
  pendingCoinAmount: number;
  pendingMoneyAmount: number;
  approvedCount: number;
  processingCount: number;
  completed30dMoneyAmount: number;
}

export interface AdminWithdrawalListResponse {
  items: Withdrawal[];
  pagination: ApiPagination;
}

export interface AdminWithdrawalListParams {
  status?: "pending" | "approved" | "processing" | "completed" | "rejected" | "cancelled";
  page?: number;
  limit?: number;
}

const buildQueryString = (params: AdminWithdrawalListParams = {}) => {
  const searchParams = new URLSearchParams();

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export class AdminWithdrawalService {
  static async getSummary(): Promise<AdminWithdrawalSummary> {
    const response = await api.get<AdminWithdrawalSummary>("/api/withdrawals/admin/summary", { requireAuth: true });
    return response.data;
  }

  static async getWithdrawals(params: AdminWithdrawalListParams = {}): Promise<AdminWithdrawalListResponse> {
    const response = await api.get<AdminWithdrawalListResponse>(`/api/withdrawals/admin${buildQueryString(params)}`, {
      requireAuth: true,
    });
    return response.data;
  }

  static async approveWithdrawal(withdrawalId: string, adminNote: string): Promise<Withdrawal> {
    const response = await api.post<Withdrawal>(`/api/withdrawals/${withdrawalId}/approve`, { adminNote }, { requireAuth: true });
    return response.data;
  }

  static async rejectWithdrawal(withdrawalId: string, reason: string, adminNote: string): Promise<Withdrawal> {
    const response = await api.post<Withdrawal>(`/api/withdrawals/${withdrawalId}/reject`, { reason, adminNote }, { requireAuth: true });
    return response.data;
  }

  static async completeWithdrawal(withdrawalId: string, transferReference: string, adminNote: string): Promise<Withdrawal> {
    const response = await api.post<Withdrawal>(`/api/withdrawals/${withdrawalId}/complete`, { transferReference, adminNote }, { requireAuth: true });
    return response.data;
  }
}
