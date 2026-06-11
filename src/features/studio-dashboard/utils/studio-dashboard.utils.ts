import { getReadyOwnerVideoThumbnailUrl, type OwnerVideoResponse } from "@/features/watch/services/mediaService";
import type { EarningsSummary, MonthlyEarnings, VideoEarnings } from "@/features/studio-wallet/types/earnings.types";
import type { StudioWallet, WalletStats } from "@/features/studio-wallet/types/studio-wallet.types";
import { useTranslations } from "next-intl";
import type {
  DashboardActivity,
  DashboardStatCard,
  DashboardTopVideo,
  EarningsTrendPoint,
  StudioDashboardRange,
} from "../types/studio-dashboard.types";

type TFunction = ReturnType<typeof useTranslations>;

const DEFAULT_THUMBNAIL = "/images/thumbnail.png";

function compactNumber(value: number, locale = "en") {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatNumber(value: number, locale = "en") {
  return new Intl.NumberFormat(locale).format(value);
}

function formatCoins(value: number, locale = "en") {
  return `${formatNumber(Math.round(value), locale)} AC`;
}

function formatPercent(t: TFunction, value?: number | null) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return t("dashboard.stats.noComparisonData");
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function formatDateLabel(t: TFunction, locale: string, value?: string | null) {
  if (!value) {
    return t("dashboard.recentActivities.recently");
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return t("dashboard.recentActivities.recently");
  }

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "2-digit",
  }).format(date);
}

function normalizeStatus(status?: string | null) {
  return status?.toLowerCase() || "unknown";
}

function translateStatus(t: TFunction, status: string) {
  const normalized = status.toLowerCase();
  const knownStatuses = ["ready", "pending", "failed", "processing", "rejected"];
  if (knownStatuses.includes(normalized)) {
    return t(`dashboard.topVideos.status.${normalized}`);
  }
  return status;
}

function countVideosByStatus(videos: OwnerVideoResponse[], status: string) {
  return videos.filter(video => normalizeStatus(video.status) === status).length;
}

function getVideoViews(video?: OwnerVideoResponse | null) {
  return video?.viewCount ?? video?.metrics?.viewsCount ?? 0;
}

function getVideoEarnings(earningVideo: VideoEarnings) {
  return earningVideo.revenue || earningVideo.estimatedRevenue || 0;
}

function getTotalViews(videos: OwnerVideoResponse[]) {
  return videos.reduce((total, video) => total + getVideoViews(video), 0);
}

export function buildDashboardStats(
  videos: OwnerVideoResponse[],
  studioWallet: StudioWallet | null,
  walletStats: WalletStats | null,
  earningsSummary: EarningsSummary | null,
  monthlyEarnings: MonthlyEarnings | null,
  t: TFunction,
  locale: string
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
      label: t("dashboard.stats.totalViews"),
      value: formatNumber(totalViews, locale),
      icon: "visibility",
      trend: totalViews > 0 ? t("dashboard.stats.liveData") : t("dashboard.stats.noViewsYet"),
      trendIcon: totalViews > 0 ? "visibility" : "visibility_off",
      tone: totalViews > 0 ? "primary" : "muted",
    },
    {
      label: t("dashboard.stats.readyVideos"),
      value: formatNumber(readyVideos, locale),
      icon: "video_library",
      trend: t("dashboard.stats.totalUploads", { count: totalUploads }),
      trendIcon: "movie",
      tone: readyVideos > 0 ? "primary" : "muted",
    },
    {
      label: t("dashboard.stats.earnings"),
      value: formatCoins(totalEarnings, locale),
      icon: "monetization_on",
      trend: formatPercent(t, growth),
      trendIcon: growth !== null && growth < 0 ? "trending_down" : "payments",
      tone: "secondary",
    },
    {
      label: t("dashboard.stats.frozenCoins"),
      value: formatCoins(frozenCoins, locale),
      icon: "lock_clock",
      trend: frozenCoins > 0 ? t("dashboard.stats.pendingRelease") : t("dashboard.stats.noFrozenCoins"),
      trendIcon: frozenCoins > 0 ? "ac_unit" : "lock_open",
      tone: frozenCoins > 0 ? "secondary" : "muted",
    },
  ];
}

export function buildTopVideos(
  videos: OwnerVideoResponse[],
  topEarningVideos: VideoEarnings[],
  t: TFunction,
  locale: string
): DashboardTopVideo[] {
  const videosById = new Map(videos.map(video => [video.id, video]));
  const earningRows = topEarningVideos
    .filter(earningVideo => getVideoEarnings(earningVideo) > 0 || earningVideo.views > 0)
    .map((earningVideo) => {
      const mediaVideo = videosById.get(earningVideo.videoId);
      const mediaViews = getVideoViews(mediaVideo);

      return {
        earningVideo,
        mediaVideo,
        views: mediaViews || earningVideo.views || 0,
        earnings: getVideoEarnings(earningVideo),
      };
    })
    .filter(row => row.earnings > 0 || row.views > 0);

  if (earningRows.length > 0) {
    return earningRows.slice(0, 3).map(({ earningVideo, mediaVideo, views, earnings }, index) => {
      const financeTitleIsPlaceholder = !earningVideo.videoTitle || earningVideo.videoTitle.toLowerCase() === "video";

      return {
        id: earningVideo.videoId,
        title: mediaVideo?.title || (financeTitleIsPlaceholder ? `Video ${earningVideo.videoId.slice(0, 8)}` : earningVideo.videoTitle),
        thumbnailUrl: getReadyOwnerVideoThumbnailUrl(mediaVideo?.id, mediaVideo?.thumbnailUrl, mediaVideo?.thumbnailStatus) || DEFAULT_THUMBNAIL,
        views: compactNumber(views, locale),
        likes: t("dashboard.topVideos.noApi"),
        earnings: formatCoins(earnings, locale),
        badgeLabel: index === 0 ? t("dashboard.topVideos.topEarning") : translateStatus(t, earningVideo.status),
        badgeTone: index === 0 ? "secondary" : "muted",
      };
    });
  }

  return [...videos]
    .filter(video => getVideoViews(video) > 0)
    .sort((a, b) => getVideoViews(b) - getVideoViews(a))
    .slice(0, 3)
    .map((video, index) => ({
      id: video.id,
      title: video.title,
      thumbnailUrl: getReadyOwnerVideoThumbnailUrl(video.id, video.thumbnailUrl, video.thumbnailStatus) || DEFAULT_THUMBNAIL,
      views: compactNumber(getVideoViews(video), locale),
      likes: t("dashboard.topVideos.noApi"),
      earnings: "0 AC",
      badgeLabel: index === 0 ? t("dashboard.topVideos.mostViewed") : translateStatus(t, normalizeStatus(video.status)),
      badgeTone: index === 0 ? "primary" : "muted",
    }));
}

export function buildActivities(videos: OwnerVideoResponse[], t: TFunction, locale: string): DashboardActivity[] {
  return [...videos]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 4)
    .map(video => {
      const status = normalizeStatus(video.status);
      const isRejected = status === "rejected";
      const isReady = status === "ready";

      return {
        id: video.id,
        title: isRejected ? t("dashboard.recentActivities.videoRejected") : isReady ? t("dashboard.recentActivities.videoReady") : t("dashboard.recentActivities.videoUpdated"),
        description: t("dashboard.recentActivities.videoStatusDescription", { title: video.title, status: translateStatus(t, status) }),
        timeLabel: formatDateLabel(t, locale, video.updatedAt || video.createdAt),
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
