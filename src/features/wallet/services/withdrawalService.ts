import { api } from "@/shared/api/client";
import { Withdrawal, BankInfo } from "../types/wallet.types";

export interface CreateWithdrawalPayload {
  coinAmount: number;
  bankInfo: BankInfo;
  description?: string;
}

export class WithdrawalService {
  /**
   * Create a new withdrawal request
   */
  static async createWithdrawal(payload: CreateWithdrawalPayload): Promise<Withdrawal> {
    const response = await api.post<Withdrawal>("/api/withdrawals", payload, { requireAuth: true });
    return response.data;
  }

  /**
   * Get current user's withdrawals
   */
  static async getMyWithdrawals(): Promise<Withdrawal[]> {
    const response = await api.get<Withdrawal[]>("/api/withdrawals/me", { requireAuth: true });
    return response.data;
  }

  /**
   * Get detail of a withdrawal
   */
  static async getWithdrawalDetails(withdrawalId: string): Promise<Withdrawal> {
    const response = await api.get<Withdrawal>(`/api/withdrawals/${withdrawalId}`, { requireAuth: true });
    return response.data;
  }

  /**
   * Cancel a pending withdrawal
   */
  static async cancelWithdrawal(withdrawalId: string): Promise<Withdrawal> {
    const response = await api.post<Withdrawal>(`/api/withdrawals/${withdrawalId}/cancel`, {}, { requireAuth: true });
    return response.data;
  }
}
