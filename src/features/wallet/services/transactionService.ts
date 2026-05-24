import { api } from "@/shared/api/client";
import type { ApiRequestInit } from "@/shared/api/types";
import { Transaction } from "../types/wallet.types";

export class TransactionService {
  /**
   * Get transactions initiated by the current user
   */
  static async getMyTransactions(options: ApiRequestInit = {}): Promise<Transaction[]> {
    const response = await api.get<Transaction[]>("/api/transactions/me", { ...options, requireAuth: true });
    return response.data;
  }

  /**
   * Get transactions related to a reference ID
   */
  static async getTransactionsByReference(referenceId: string): Promise<Transaction[]> {
    const response = await api.get<Transaction[]>(`/api/transactions/reference/${referenceId}`, { requireAuth: true });
    return response.data;
  }

  /**
   * Get detail of a transaction
   */
  static async getTransactionDetails(transactionId: string): Promise<Transaction> {
    const response = await api.get<Transaction>(`/api/transactions/${transactionId}`, { requireAuth: true });
    return response.data;
  }
}
