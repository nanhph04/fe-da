import type { ApiPagination } from "@/shared/api/types";
import { RevenuePeriod } from "./revenue.types";

export interface EarningsFilters {
  period?: RevenuePeriod;
  startDate?: string;
  endDate?: string;
  videoId?: string;
  categoryId?: string;
  status?: "pending" | "confirmed" | "paid";
}

export interface VideoEarnings {
  id: string;
  videoId: string;
  videoTitle: string;
  videoThumbnail?: string;
  categoryId: string;
  categoryName: string;
  views: number;
  watchTime: number; // in minutes
  revenue: number;
  estimatedRevenue: number;
  currency: string;
  status: "pending" | "confirmed" | "paid";
  payoutDate?: string;
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

export interface MonthlyEarnings {
  month: string;
  year: number;
  earnings: number;
  views: number;
  watchTime: number;
  videoCount: number;
  payoutAmount: number;
  status: "pending" | "confirmed" | "paid";
  growth: number;
}

export interface CategoryEarnings {
  id: string;
  name: string;
  totalEarnings: number;
  videoCount: number;
  averageEarningsPerVideo: number;
  percentage: number;
  videos: Array<{
    videoId: string;
    videoTitle: string;
    earnings: number;
  }>;
}

export interface EarningsHistory {
  id: string;
  videoId?: string;
  videoTitle?: string;
  referenceId?: string;
  amount: number;
  currency?: string;
  status: "pending" | "confirmed" | "paid";
  createdAt: string;
  updatedAt?: string;
  payoutDate?: string;
  description?: string;
  category?: {
    id: string;
    name: string;
  };
}

export interface EarningsHistoryResponse {
  items: EarningsHistory[];
  pagination: ApiPagination;
}

export interface EarningsSummary {
  totalEarnings: number;
  totalViews: number;
  totalWatchTime: number;
  totalVideos: number;
  pendingEarnings: number;
  confirmedEarnings: number;
  paidEarnings: number;
  averageEarningsPerVideo: number;
  averageEarningsPerView: number;
  growth: {
    percentage: number;
    comparedToPrevious: number;
    absoluteDifference: number;
  };
  nextPayoutDate?: string;
  minimumPayoutThreshold: number;
}

export interface EarningsAnalytics {
  earningsTrend: Array<{
    date: string;
    earnings: number;
    views: number;
  }>;
  topCategories: CategoryEarnings[];
  bestPerformingDayOfWeek: string;
  bestPerformingHour: number;
  earningsPerSubscriber: number;
  payoutRate: number;
  estimatedMonthlyPayout: number;
}

export interface EarningsStatusSummary {
  pending: number;
  confirmed: number;
  paid: number;
}

export interface EarningsMetrics {
  earnings: {
    currentPeriod: number;
    previousPeriod: number;
    growth: number;
    pendingAmount: number;
    confirmedAmount: number;
    paidAmount: number;
  };
  views: {
    currentPeriod: number;
    previousPeriod: number;
    growth: number;
    averageViewDuration: number;
  };
  engagement: {
    completionRate: number;
    likesPerView: number;
    commentsPerView: number;
    sharesPerView: number;
  };
  payout: {
    nextPayoutDate?: string;
    lastPayoutDate?: string;
    totalPaidToDate: number;
    averagePayoutAmount: number;
    pendingCount: number;
    confirmedCount: number;
    paidCount: number;
  };
}

export interface EarningsMetricsFilters {
  period?: "monthly" | "quarterly" | "yearly";
  startDate?: string;
  endDate?: string;
}

export interface ExportEarningsRequest extends EarningsFilters {
  format: "csv" | "xlsx" | "json";
  includeVideoDetails: boolean;
  includeMetrics: boolean;
}

export interface ExportEarningsResponse {
  downloadUrl: string;
  fileName: string;
  fileSize: number;
  recordCount: number;
  format: string;
  expiresAt: string;
}

export interface TopEarningVideosFilters {
  period?: "daily" | "weekly" | "monthly" | "yearly";
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface CumulativeEarningsFilters {
  interval: "daily" | "weekly" | "monthly";
  points?: number;
  startDate?: string;
  endDate?: string;
}

export interface CumulativeEarningsPoint {
  date: string;
  cumulativeEarnings: number;
  periodEarnings: number;
  views: number;
}

export interface EarningsPredictionsFilters {
  period: "7days" | "30days" | "90days";
  confidence?: "low" | "medium" | "high";
}

export interface EarningsPredictionPoint {
  date: string;
  predictedEarnings: number;
  confidence: number;
}

export interface EarningsPredictionsResponse {
  predictions: EarningsPredictionPoint[];
  totalPredicted: number;
  method: string;
  modelVersion: string;
}
