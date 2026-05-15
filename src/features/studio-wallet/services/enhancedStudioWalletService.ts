import { WithdrawalService } from "./withdrawalService";
import { StudioWalletService } from "./studioWalletService";
import type { StudioWallet, WalletStats } from "../types/studio-wallet.types";

export const enhancedStudioWalletService = {
  getWalletBalance: () => StudioWalletService.getStudioWallet(),
  getWalletStats: () => StudioWalletService.getWalletStats(),
  async getWalletOverview() {
    const [wallet, stats] = await Promise.all([
      StudioWalletService.getStudioWallet(),
      StudioWalletService.getWalletStats(),
    ]);

    return { wallet, stats };
  },
  getTransactionHistory: () => WithdrawalService.getWithdrawalHistory({ page: 1, limit: 20 }),
  async refreshWallet() {
    await Promise.all([
      StudioWalletService.getStudioWallet(),
      StudioWalletService.getWalletStats(),
    ]);
  },
  validateWalletData(data: unknown): data is StudioWallet | WalletStats {
    return typeof data === "object" && data !== null;
  },
};
