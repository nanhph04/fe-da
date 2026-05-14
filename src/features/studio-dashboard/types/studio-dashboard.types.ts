import type { OwnerVideoResponse } from "@/features/watch/services/mediaService";
import type { EarningsAnalytics, EarningsSummary, VideoEarnings } from "@/features/studio-wallet/types/earnings.types";
import type { WalletStats } from "@/features/studio-wallet/types/studio-wallet.types";

export type StudioDashboardRange = "7D" | "30D";

export type StudioDashboardData = {
  videos: OwnerVideoResponse[];
  walletStats: WalletStats | null;
  earningsSummary: EarningsSummary | null;
  earningsAnalytics: EarningsAnalytics | null;
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
