"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { mediaService } from "@/features/watch/services/mediaService";
import { EarningsService } from "@/features/studio-wallet/services/earningsService";
import { StudioWalletService } from "@/features/studio-wallet/services/studioWalletService";
import { getErrorMessage } from "@/shared/api/client";
import { StatCards } from "./StatCards";
import { EarningsGraph } from "./EarningsGraph";
import { RecentActivities } from "./RecentActivities";
import { TopVideos } from "./TopVideos";
import { LatestComments } from "./LatestComments";
import type { StudioDashboardData, StudioDashboardRange } from "../types/studio-dashboard.types";
import {
  buildActivities,
  buildDashboardStats,
  buildEarningsTrend,
  buildTopVideos,
  getEarningsPeriod,
} from "../utils/studio-dashboard.utils";

const initialDashboardData: StudioDashboardData = {
  videos: [],
  studioWallet: null,
  walletStats: null,
  earningsSummary: null,
  monthlyEarnings: null,
  topEarningVideos: [],
};

export function StudioDashboardFeature() {
  const [dateRange, setDateRange] = useState<StudioDashboardRange>("30D");
  const [dashboardData, setDashboardData] = useState<StudioDashboardData>(initialDashboardData);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    setError(null);

    try {
      const now = new Date();
      const [videosRes, studioWalletRes, walletStatsRes, earningsSummaryRes, monthlyEarningsRes, topEarningVideosRes] = await Promise.allSettled([
        mediaService.getOwnerVideos({ limit: 20 }),
        StudioWalletService.getStudioWallet(),
        StudioWalletService.getWalletStats(),
        EarningsService.getEarningsSummary({ period: getEarningsPeriod(dateRange) }),
        EarningsService.getMonthlyEarnings(now.getFullYear(), now.getMonth() + 1),
        EarningsService.getTopEarningVideos({ period: getEarningsPeriod(dateRange), limit: 3 }),
      ]);

      const videos = videosRes.status === "fulfilled" && videosRes.value.success && videosRes.value.data
        ? videosRes.value.data
        : [];
      const studioWallet = studioWalletRes.status === "fulfilled" ? studioWalletRes.value : null;
      const walletStats = walletStatsRes.status === "fulfilled" ? walletStatsRes.value : null;
      const earningsSummary = earningsSummaryRes.status === "fulfilled" ? earningsSummaryRes.value : null;
      const monthlyEarnings = monthlyEarningsRes.status === "fulfilled" ? monthlyEarningsRes.value : null;
      const topEarningVideos = topEarningVideosRes.status === "fulfilled" ? topEarningVideosRes.value : [];

      const hasAnyData = videos.length > 0 || studioWallet || walletStats || earningsSummary || monthlyEarnings || topEarningVideos.length > 0;
      if (!hasAnyData) {
        const firstRejected = [videosRes, studioWalletRes, walletStatsRes, earningsSummaryRes, monthlyEarningsRes, topEarningVideosRes]
          .find(result => result.status === "rejected");
        setError(firstRejected?.status === "rejected" ? getErrorMessage(firstRejected.reason, "Không thể tải dashboard studio.") : null);
      }

      setDashboardData({
        videos,
        studioWallet,
        walletStats,
        earningsSummary,
        monthlyEarnings,
        topEarningVideos,
      });
    } catch (err) {
      setDashboardData(initialDashboardData);
      setError(getErrorMessage(err, "Không thể tải dashboard studio."));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [dateRange]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const stats = useMemo(
    () => buildDashboardStats(
      dashboardData.videos,
      dashboardData.studioWallet,
      dashboardData.walletStats,
      dashboardData.earningsSummary,
      dashboardData.monthlyEarnings
    ),
    [dashboardData]
  );
  const topVideos = useMemo(
    () => buildTopVideos(dashboardData.videos, dashboardData.topEarningVideos),
    [dashboardData]
  );
  const activities = useMemo(() => buildActivities(dashboardData.videos), [dashboardData.videos]);
  const earningsTrend = useMemo(
    () => buildEarningsTrend(dashboardData.monthlyEarnings),
    [dashboardData.monthlyEarnings]
  );

  return (
    <section className="mx-auto w-full max-w-7xl space-y-12 p-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">Creator Studio</p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">Dashboard Overview</h1>
          <p className="mt-2 font-body text-sm text-muted-foreground">Channel health, revenue, and audience signals from live Studio APIs.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex w-fit rounded-md border border-border/30 bg-card p-1">
            {(["7D", "30D"] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setDateRange(range)}
                className={`rounded px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest transition-all ${
                  dateRange === range ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Last {range === "7D" ? "7" : "30"} Days
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => void loadDashboard(false)}
            disabled={isRefreshing || isLoading}
            className="inline-flex items-center gap-2 rounded-sm border border-border/40 bg-card px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className={`material-symbols-outlined text-sm ${isRefreshing ? "animate-spin" : ""}`}>refresh</span>
            Refresh
          </button>
        </div>
      </header>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <StatCards cards={stats} isLoading={isLoading} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col lg:col-span-2">
          <EarningsGraph points={earningsTrend} isLoading={isLoading} dateRange={dateRange} />
        </div>
        <RecentActivities activities={activities} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 gap-8 pb-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TopVideos videos={topVideos} isLoading={isLoading} />
        </div>
        <LatestComments />
      </div>
    </section>
  );
}
