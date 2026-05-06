import { apiClient } from "@/shared/utils/apiClient";

export interface WalletResponse {
  success: boolean;
  code: number;
  data: {
    id: string;
    userId: string;
    type: "USER";
    balance: number;
    frozenBalance: number;
    status: "ACTIVE" | "INACTIVE" | "FROZEN";
    createdAt: string;
    updatedAt: string;
  };
  mess?: string;
}

export class WalletService {
  /**
   * Get current user's wallet information
   * Requires authentication and x-user-id header
   */
  static async getMyWallet(): Promise<WalletResponse> {
    return apiClient.get<WalletResponse>("/api/wallets/me", {
      headers: {
        "x-user-id": "current_user_id", // This should be replaced with actual user ID from auth context
      },
    });
  }
}

export default WalletService;