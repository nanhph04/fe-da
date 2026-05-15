import type {
  StudioWallet as BaseStudioWallet,
  WalletStatus as BaseWalletStatus,
} from "../../wallet/types/base-wallet.types";
import type { VideoEarnings, MonthlyEarnings } from "./earnings.types";
import type { Withdrawal } from "./withdrawal.types";

export type StudioWalletStatus = BaseWalletStatus | "SUSPENDED";

export interface StudioWallet extends Omit<BaseStudioWallet, "status"> {
  status: StudioWalletStatus;
}

export interface VideoRevenue {
  id: string;
  videoId: string;
  title: string;
  views: number;
  watchTime: number;
  earnings: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface EarningsData {
  period: string;
  totalEarnings: number;
  videoEarnings: number;
  subscriptionEarnings: number;
  adsEarnings: number;
  otherEarnings: number;
  dailyBreakdown: DailyEarnings[];
  growth: {
    percentage: number;
    comparedToPrevious: number;
  };
}

export interface DailyEarnings {
  date: string;
  views: number;
  watchTime: number;
  earnings: number;
  videoCount: number;
}

export interface TotalRevenueData {
  lifetimeEarnings: number;
  currentMonth: number;
  previousMonth: number;
  growthPercentage: number;
  averageDailyEarnings: number;
  topPerformingVideo: VideoRevenue;
}

export interface WalletStats {
  totalBalance: number;
  availableBalance: number;
  pendingPayouts: number;
  totalWithdrawn: number;
  avgRevenuePerVideo: number;
  totalViews: number;
  totalLikes?: number;
  monthlyEarnings?: number;
  monthlyGrowth?: number;
  topPerformingVideo?: {
    videoId: string;
    title: string;
    revenue: number;
  };
}

export interface EarningsFilters {
  period?: "daily" | "weekly" | "monthly" | "yearly" | "ALL";
  startDate?: string;
  endDate?: string;
  videoId?: string;
  categoryId?: string;
  status?: "pending" | "confirmed" | "paid" | "ALL";
}

export type VideoEarning = VideoEarnings & {
  likes?: number;
  payoutStatus?: "PENDING" | "PAID" | "FAILED";
};

export type StudioWithdrawal = Withdrawal;

export type { MonthlyEarnings };

export interface WalletStatsProps {
  stats: WalletStats;
}
