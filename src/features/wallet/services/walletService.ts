import { api } from "@/shared/api/client";
import { Wallet } from "../types/wallet.types";

export class WalletService {
  /**
   * Get current user's wallet information
   * API Gateway will automatically attach x-user-id header
   */
  static async getMyWallet(): Promise<Wallet> {
    const response = await api.get<Wallet>("/api/wallets/me", { requireAuth: true });
    return response.data;
  }

  /**
   * Get wallet by user ID
   */
  static async getWalletByUserId(userId: string): Promise<Wallet> {
    const response = await api.get<Wallet>(`/api/wallets/user/${userId}`, { requireAuth: true });
    return response.data;
  }
}
