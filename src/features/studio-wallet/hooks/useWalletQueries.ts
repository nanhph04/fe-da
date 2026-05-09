import { EarningsService } from "../services/earningsService";
import { PayoutService } from "../services/payoutService";
import { StudioWalletService } from "../services/studioWalletService";
import { WithdrawalService } from "../services/withdrawalService";

export const WALLET_KEYS = {
  balance: ["wallet", "balance"] as const,
  payoutHistory: (filters?: unknown) => ["wallet", "payouts", filters] as const,
  earnings: (filters?: unknown) => ["wallet", "earnings", filters] as const,
  withdrawalMethods: ["wallet", "withdrawal-methods"] as const,
} as const;

export const useWalletBalance = () => ({
  data: undefined,
  isLoading: false,
  refetch: StudioWalletService.getStudioWallet,
});

export const usePayoutHistory = () => ({
  data: undefined,
  isLoading: false,
  refetch: () => PayoutService.getPayoutHistory({ page: 1, limit: 10 }),
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

export const useWithdrawalMethods = () => ({
  data: undefined,
  isLoading: false,
  refetch: () => WithdrawalService.getWithdrawalMethods(),
});

export const useRefreshWallet = () => ({
  refresh: async () => {
    await Promise.all([
      StudioWalletService.getStudioWallet(),
      StudioWalletService.getWalletStats(),
    ]);
  },
});
