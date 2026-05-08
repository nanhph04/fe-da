import { api } from "@/shared/utils/apiClient";
import { Withdrawal } from "@/features/wallet/types/wallet.types";

export class AdminWithdrawalService {
  /**
   * Approve a withdrawal
   */
  static async approveWithdrawal(withdrawalId: string, adminNote: string): Promise<Withdrawal> {
    const response = await api.post<Withdrawal>(`/api/withdrawals/${withdrawalId}/approve`, { adminNote }, { requireAuth: true });
    return response.data;
  }

  /**
   * Reject a withdrawal
   */
  static async rejectWithdrawal(withdrawalId: string, reason: string, adminNote: string): Promise<Withdrawal> {
    const response = await api.post<Withdrawal>(`/api/withdrawals/${withdrawalId}/reject`, { reason, adminNote }, { requireAuth: true });
    return response.data;
  }

  /**
   * Complete a withdrawal
   */
  static async completeWithdrawal(withdrawalId: string, transferReference: string, adminNote: string): Promise<Withdrawal> {
    const response = await api.post<Withdrawal>(`/api/withdrawals/${withdrawalId}/complete`, { transferReference, adminNote }, { requireAuth: true });
    return response.data;
  }
}
