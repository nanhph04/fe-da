export type RevenuePeriod = "daily" | "weekly" | "monthly" | "yearly";

export interface RevenueFilters {
  period: RevenuePeriod;
  startDate?: string;
  endDate?: string;
  videoId?: string;
  channelId?: string;
  includeTaxes?: boolean;
}

export interface VideoRevenue {
  id: string;
  videoId: string;
  videoTitle: string;
  videoThumbnail?: string;
  channelId: string;
  channelTitle: string;
  views: number;
  watchTime: number; // in minutes
  revenue: number;
  estimatedRevenue: number;
  currency: string;
  period: {
    startDate: string;
    endDate: string;
  };
  metrics: {
    completionRate: number;
    engagementRate: number;
    averageViewDuration: number; // in seconds
  };
}

export interface RevenueSummary {
  totalRevenue: number;
  totalViews: number;
  totalWatchTime: number;
  totalVideos: number;
  averageRevenuePerVideo: number;
  averageRevenuePerView: number;
  topPerformingVideo?: VideoRevenue;
  growth: {
    percentage: number;
    comparedToPrevious: number;
    absoluteDifference: number;
  };
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  views: number;
  watchTime: number;
  videoCount: number;
  dayOfWeek: string;
}

export interface MonthlyRevenue {
  month: string;
  year: number;
  revenue: number;
  views: number;
  watchTime: number;
  videoCount: number;
  growth: number;
}

export interface RevenueBreakdown {
  byVideoType: {
    shorts: number;
    longVideos: number;
    liveStreams: number;
    shortsPercentage: number;
    longVideosPercentage: number;
    liveStreamsPercentage: number;
  };
  bySource: {
    views: number;
    subscriptions: number;
    ads: number;
    other: number;
    viewsPercentage: number;
    subscriptionsPercentage: number;
    adsPercentage: number;
    otherPercentage: number;
  };
  byRegion: Array<{
    region: string;
    revenue: number;
    percentage: number;
  }>;
}

export interface ExportRevenueRequest extends RevenueFilters {
  format: "csv" | "xlsx" | "json";
  includeVideoDetails: boolean;
  includeMetrics: boolean;
}

export interface ExportRevenueResponse {
  downloadUrl: string;
  fileName: string;
  fileSize: number;
  recordCount: number;
  format: string;
  expiresAt: string;
}

export interface RevenueAnalytics {
  revenueTrend: Array<{
    date: string;
    revenue: number;
    views: number;
  }>;
  topVideos: VideoRevenue[];
  bestPerformingDayOfWeek: string;
  bestPerformingHour: number;
  revenuePerSubscriber: number;
  churnRate: number;
  retentionRate: number;
}

export interface PerformanceMetrics {
  views: {
    currentPeriod: number;
    previousPeriod: number;
    growth: number;
    rank: number;
    totalVideos: number;
  };
  engagement: {
    averageViewDuration: number;
    completionRate: number;
    likesPerView: number;
    commentsPerView: number;
    sharesPerView: number;
  };
  revenue: {
    currentPeriod: number;
    previousPeriod: number;
    growth: number;
    ecpm: number; // Effective cost per mille
    rpm: number;  // Revenue per mille
  };
  subscriber: {
    currentCount: number;
    growth: number;
    churn: number;
    retention: number;
  };
}