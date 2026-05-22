import { getReadyOwnerVideoThumbnailUrl, type OwnerVideoResponse } from "@/features/watch/services/mediaService";
import type { EarningsSummary, MonthlyEarnings, VideoEarnings } from "@/features/studio-wallet/types/earnings.types";
import type { StudioWallet, WalletStats } from "@/features/studio-wallet/types/studio-wallet.types";
import type {
  DashboardActivity,
  DashboardStatCard,
  DashboardTopVideo,
  EarningsTrendPoint,
  StudioDashboardRange,
} from "../types/studio-dashboard.types";

const DEFAULT_THUMBNAIL = "/images/thumbnail.png";

function compactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en").format(value);
}

function formatCoins(value: number) {
  return `${formatNumber(Math.round(value))} AC`;
}

function formatPercent(value?: number | null) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "No comparison data";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function formatDateLabel(value?: string | null) {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
  }).format(date);
}

function normalizeStatus(status?: string | null) {
  return status?.toLowerCase() || "unknown";
}

function countVideosByStatus(videos: OwnerVideoResponse[], status: string) {
  return videos.filter(video => normalizeStatus(video.status) === status).length;
}

function getTotalViews(videos: OwnerVideoResponse[]) {
  return videos.reduce((total, video) => total + (video.viewCount ?? video.metrics?.viewsCount ?? 0), 0);
}

export function buildDashboardStats(
  videos: OwnerVideoResponse[],
  studioWallet: StudioWallet | null,
  walletStats: WalletStats | null,
  earningsSummary: EarningsSummary | null,
  monthlyEarnings: MonthlyEarnings | null
): DashboardStatCard[] {
  const mediaTotalViews = getTotalViews(videos);
  const totalViews = mediaTotalViews || walletStats?.totalViews || studioWallet?.totalViews || earningsSummary?.totalViews || 0;
  const readyVideos = countVideosByStatus(videos, "ready");
  const totalUploads = videos.length || studioWallet?.videoCount || earningsSummary?.totalVideos || 0;
  const totalEarnings = studioWallet?.revenueThisMonth ?? walletStats?.monthlyEarnings ?? monthlyEarnings?.earnings ?? earningsSummary?.totalEarnings ?? studioWallet?.totalEarnings ?? 0;
  const frozenCoins = earningsSummary?.pendingEarnings ?? studioWallet?.frozenBalance ?? 0;
  const growth = monthlyEarnings?.growth ?? walletStats?.monthlyGrowth ?? earningsSummary?.growth?.percentage ?? null;

  return [
    {
      label: "Total Views",
      value: formatNumber(totalViews),
      icon: "visibility",
      trend: totalViews > 0 ? "Live data" : "No views yet",
      trendIcon: totalViews > 0 ? "visibility" : "visibility_off",
      tone: totalViews > 0 ? "primary" : "muted",
    },
    {
      label: "Ready Videos",
      value: formatNumber(readyVideos),
      icon: "video_library",
      trend: `${formatNumber(totalUploads)} total uploads`,
      trendIcon: "movie",
      tone: readyVideos > 0 ? "primary" : "muted",
    },
    {
      label: "Earnings (Aura Coins)",
      value: formatCoins(totalEarnings),
      icon: "monetization_on",
      trend: formatPercent(growth),
      trendIcon: growth !== null && growth < 0 ? "trending_down" : "payments",
      tone: "secondary",
    },
    {
      label: "Frozen Coins",
      value: formatCoins(frozenCoins),
      icon: "lock_clock",
      trend: frozenCoins > 0 ? "Pending release" : "No frozen coins",
      trendIcon: frozenCoins > 0 ? "ac_unit" : "lock_open",
      tone: frozenCoins > 0 ? "secondary" : "muted",
    },
  ];
}

export function buildTopVideos(
  videos: OwnerVideoResponse[],
  topEarningVideos: VideoEarnings[]
): DashboardTopVideo[] {
  if (topEarningVideos.length > 0) {
    return topEarningVideos.slice(0, 3).map((earningVideo, index) => {
      const mediaVideo = videos.find(video => video.id === earningVideo.videoId);
      const mediaViews = mediaVideo?.viewCount ?? mediaVideo?.metrics?.viewsCount;
      const financeTitleIsPlaceholder = !earningVideo.videoTitle || earningVideo.videoTitle.toLowerCase() === "video";

      return {
        id: earningVideo.videoId,
        title: mediaVideo?.title || (financeTitleIsPlaceholder ? `Video ${earningVideo.videoId.slice(0, 8)}` : earningVideo.videoTitle),
        thumbnailUrl: getReadyOwnerVideoThumbnailUrl(mediaVideo?.id, mediaVideo?.thumbnailUrl, mediaVideo?.thumbnailStatus) || DEFAULT_THUMBNAIL,
        views: compactNumber(mediaViews ?? earningVideo.views),
        likes: "No API",
        earnings: formatCoins(earningVideo.revenue || earningVideo.estimatedRevenue),
        badgeLabel: index === 0 ? "Top earning" : earningVideo.status,
        badgeTone: index === 0 ? "secondary" : "muted",
      };
    });
  }

  return [...videos]
    .sort((a, b) => (b.viewCount ?? b.metrics?.viewsCount ?? 0) - (a.viewCount ?? a.metrics?.viewsCount ?? 0))
    .slice(0, 3)
    .map((video, index) => ({
      id: video.id,
      title: video.title,
      thumbnailUrl: getReadyOwnerVideoThumbnailUrl(video.id, video.thumbnailUrl, video.thumbnailStatus) || DEFAULT_THUMBNAIL,
      views: compactNumber(video.viewCount ?? video.metrics?.viewsCount ?? 0),
      likes: "No API",
      earnings: video.price ? formatCoins(video.price) : "0 AC",
      badgeLabel: index === 0 ? "Most viewed" : normalizeStatus(video.status),
      badgeTone: index === 0 ? "primary" : "muted",
    }));
}

export function buildActivities(videos: OwnerVideoResponse[]): DashboardActivity[] {
  return [...videos]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 4)
    .map(video => {
      const status = normalizeStatus(video.status);
      const isRejected = status === "rejected";
      const isReady = status === "ready";

      return {
        id: video.id,
        title: isRejected ? "Video rejected" : isReady ? "Video ready" : "Video updated",
        description: `${video.title} is ${status.replaceAll("_", " ")}.`,
        timeLabel: formatDateLabel(video.updatedAt || video.createdAt),
        tone: isRejected ? "danger" : isReady ? "secondary" : "muted",
      };
    });
}

export function buildEarningsTrend(monthlyEarnings: MonthlyEarnings | null): EarningsTrendPoint[] {
  if (!monthlyEarnings) {
    return [];
  }

  return [
    {
      label: `${monthlyEarnings.month}/${monthlyEarnings.year}`,
      value: monthlyEarnings.earnings,
    },
  ];
}

export function getEarningsPeriod(range: StudioDashboardRange) {
  return range === "7D" ? "weekly" : "monthly";
}
