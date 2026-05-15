import { EarningsService } from "../services/earningsService";
import { StudioWalletService } from "../services/studioWalletService";
import { WithdrawalService } from "../services/withdrawalService";

export const WALLET_KEYS = {
  balance: ["wallet", "balance"] as const,
  withdrawalHistory: (filters?: unknown) => ["wallet", "withdrawals", filters] as const,
  earnings: (filters?: unknown) => ["wallet", "earnings", filters] as const,
} as const;

export const useWalletBalance = () => ({
  data: undefined,
  isLoading: false,
  refetch: StudioWalletService.getStudioWallet,
});

export const useWithdrawalHistory = () => ({
  data: undefined,
  isLoading: false,
  refetch: () => WithdrawalService.getWithdrawalHistory({ page: 1, limit: 10 }),
});

export const useEarningsData = () => ({
  data: undefined,
  isLoading: false,
  refetch: () => EarningsService.getEarningsSummary(),
});

export const useVideoEarnings = () => ({
  data: undefined,
  isLoading: false,
});

export const useRefreshWallet = () => ({
  refresh: async () => {
    await Promise.all([
      StudioWalletService.getStudioWallet(),
      StudioWalletService.getWalletStats(),
    ]);
  },
});
