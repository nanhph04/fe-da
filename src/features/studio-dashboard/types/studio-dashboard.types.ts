import type { OwnerVideoResponse } from "@/features/watch/services/mediaService";
import type { EarningsSummary, MonthlyEarnings, VideoEarnings } from "@/features/studio-wallet/types/earnings.types";
import type { StudioWallet, WalletStats } from "@/features/studio-wallet/types/studio-wallet.types";

export type StudioDashboardRange = "7D" | "30D";

export type StudioDashboardData = {
  videos: OwnerVideoResponse[];
  studioWallet: StudioWallet | null;
  walletStats: WalletStats | null;
  earningsSummary: EarningsSummary | null;
  monthlyEarnings: MonthlyEarnings | null;
  topEarningVideos: VideoEarnings[];
};

export type DashboardStatCard = {
  label: string;
  value: string;
  icon: string;
  trend: string;
  trendIcon: string;
  tone: "primary" | "secondary" | "danger" | "muted";
};

export type DashboardTopVideo = {
  id: string;
  title: string;
  thumbnailUrl: string;
  views: string;
  likes: string;
  earnings: string;
  badgeLabel: string;
  badgeTone: "primary" | "secondary" | "muted";
};

export type DashboardActivity = {
  id: string;
  title: string;
  description: string;
  timeLabel: string;
  tone: "primary" | "secondary" | "danger" | "muted";
};

export type EarningsTrendPoint = {
  label: string;
  value: number;
};
