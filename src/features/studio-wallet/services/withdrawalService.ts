import { api } from "@/shared/api/client";
import type {
  CreateWithdrawalRequest,
  Withdrawal,
  WithdrawalHistoryFilters,
  WithdrawalHistoryResponse,
  WithdrawalSummary,
} from "../types/withdrawal.types";

function paginateWithdrawals(
  withdrawals: Withdrawal[],
  filters: WithdrawalHistoryFilters = {}
): WithdrawalHistoryResponse {
  const status = filters.status ?? "ALL";
  const page = filters.page ?? 1;
  const limit = filters.limit ?? (withdrawals.length || 10);
  const filtered = status === "ALL"
    ? withdrawals
    : withdrawals.filter(withdrawal => withdrawal.status === status);
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);

  return {
    withdrawals: items,
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
    },
  };
}

function summarizeWithdrawals(withdrawals: Withdrawal[]): WithdrawalSummary {
  const completed = withdrawals.filter(withdrawal => withdrawal.status === "completed");
  const lastWithdrawal = [...withdrawals].sort(
    (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
  )[0];

  return {
    totalRequested: withdrawals.reduce((total, withdrawal) => total + withdrawal.coinAmount, 0),
    totalApproved: withdrawals
      .filter(withdrawal => withdrawal.status === "approved")
      .reduce((total, withdrawal) => total + withdrawal.coinAmount, 0),
    totalCompleted: completed.reduce((total, withdrawal) => total + withdrawal.coinAmount, 0),
    totalRejected: withdrawals
      .filter(withdrawal => withdrawal.status === "rejected")
      .reduce((total, withdrawal) => total + withdrawal.coinAmount, 0),
    pendingCount: withdrawals.filter(withdrawal => withdrawal.status === "pending").length,
    avgProcessingTime: 0,
    lastWithdrawalDate: lastWithdrawal?.requestedAt,
  };
}

export class WithdrawalService {
  /**
   * Real finance-service contract: POST /api/withdrawals
   */
  static async requestWithdrawal(data: CreateWithdrawalRequest): Promise<Withdrawal> {
    const response = await api.post<Withdrawal>("/api/withdrawals", data, {
      requireAuth: true,
    });
    return response.data;
  }

  /**
   * Real finance-service contract: GET /api/withdrawals/me
   * Filtering and pagination are handled client-side until backend exposes query params.
   */
  static async getWithdrawalHistory(
    filters: WithdrawalHistoryFilters = {}
  ): Promise<WithdrawalHistoryResponse> {
    const response = await api.get<Withdrawal[]>("/api/withdrawals/me", {
      requireAuth: true,
    });
    return paginateWithdrawals(response.data, filters);
  }

  /**
   * Real finance-service contract: GET /api/withdrawals/:withdrawalId
   */
  static async getWithdrawal(withdrawalId: string): Promise<Withdrawal> {
    const response = await api.get<Withdrawal>(`/api/withdrawals/${withdrawalId}`, {
      requireAuth: true,
    });
    return response.data;
  }

  /**
   * Real finance-service contract: POST /api/withdrawals/:withdrawalId/cancel
   */
  static async cancelWithdrawal(withdrawalId: string): Promise<Withdrawal> {
    const response = await api.post<Withdrawal>(
      `/api/withdrawals/${withdrawalId}/cancel`,
      {},
      { requireAuth: true }
    );
    return response.data;
  }

  /**
   * Derived client summary from GET /api/withdrawals/me.
   */
  static async getWithdrawalSummary(): Promise<WithdrawalSummary> {
    const response = await api.get<Withdrawal[]>("/api/withdrawals/me", {
      requireAuth: true,
    });
    return summarizeWithdrawals(response.data);
  }
}
