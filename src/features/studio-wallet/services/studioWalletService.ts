import { api } from "@/shared/api/client";
import type { StudioWallet, WalletStats } from "../types/studio-wallet.types";

export class StudioWalletService {
  /**
   * Get studio wallet information.
   * Real finance-service contract: GET /api/studio/wallet/me
   */
  static async getStudioWallet(): Promise<StudioWallet> {
    const response = await api.get<StudioWallet>("/api/studio/wallet/me", {
      requireAuth: true,
    });
    return response.data;
  }

  /**
   * Get studio wallet aggregate statistics.
   * Real finance-service contract: GET /api/studio/wallet/stats
   */
  static async getWalletStats(): Promise<WalletStats> {
    const response = await api.get<WalletStats>("/api/studio/wallet/stats", {
      requireAuth: true,
    });
    return response.data;
  }
}
