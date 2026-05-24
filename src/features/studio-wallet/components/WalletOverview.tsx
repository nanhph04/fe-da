"use client";

import { useEffect, useMemo, useState } from "react";
import { getErrorMessage } from "@/shared/api/client";
import { EarningsService } from "../services/earningsService";
import type { EarningsHistory } from "../types/earnings.types";
import type { StudioWallet, WalletStats } from "../types/studio-wallet.types";

interface WalletOverviewProps {
  wallet: StudioWallet;
  stats: WalletStats;
  onWithdraw: () => void;
  isLoading: boolean;
}

type ChartRange = "day" | "week" | "month";

type ChartPoint = {
  label: string;
  value: number;
};

type ChartBucket = {
  label: string;
  start: Date;
  end: Date;
};

type ChartWindow = {
  startDate: string;
  endDate: string;
  buckets: ChartBucket[];
};

const summaryCards = [
  { label: "Total Earned AC", icon: "stars", key: "total" },
  { label: "Available for Payout", icon: "account_balance_wallet", key: "available" },
  { label: "Frozen Coins", icon: "lock", key: "frozen" },
  { label: "Pending Payouts", icon: "schedule", key: "pending" },
] as const;

const chartRangeOptions: Array<{ value: ChartRange; label: string }> = [
  { value: "day", label: "1 Day" },
  { value: "week", label: "1 Week" },
  { value: "month", label: "1 Month" },
];

const chartHeight = 40;
const chartBaseline = 36;
const chartTopPadding = 4;
const hourInMs = 60 * 60 * 1000;
const dayInMs = 24 * hourInMs;
const coinFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 2,
});

function formatAcValue(value: number) {
  return coinFormatter.format(value);
}

function getRangeLabel(range: ChartRange) {
  return chartRangeOptions.find((option) => option.value === range)?.label ?? "1 Day";
}

function formatHourLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    hour12: false,
  }).format(date);
}

function formatDayLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function startOfHour(date: Date) {
  const nextDate = new Date(date);
  nextDate.setMinutes(0, 0, 0);
  return nextDate;
}

function startOfDay(date: Date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function createChartWindow(range: ChartRange): ChartWindow {
  const now = new Date();

  if (range === "day") {
    const start = new Date(startOfHour(now).getTime() - 23 * hourInMs);
    const buckets = Array.from({ length: 24 }, (_, index) => {
      const bucketStart = new Date(start.getTime() + index * hourInMs);
      const bucketEnd = new Date(bucketStart.getTime() + hourInMs);

      return {
        label: formatHourLabel(bucketStart),
        start: bucketStart,
        end: bucketEnd,
      };
    });

    return {
      startDate: start.toISOString(),
      endDate: now.toISOString(),
      buckets,
    };
  }

  const bucketCount = range === "week" ? 7 : 30;
  const start = new Date(startOfDay(now).getTime() - (bucketCount - 1) * dayInMs);
  const buckets = Array.from({ length: bucketCount }, (_, index) => {
    const bucketStart = new Date(start.getTime() + index * dayInMs);
    const bucketEnd = new Date(bucketStart.getTime() + dayInMs);

    return {
      label: formatDayLabel(bucketStart),
      start: bucketStart,
      end: bucketEnd,
    };
  });

  return {
    startDate: start.toISOString(),
    endDate: now.toISOString(),
    buckets,
  };
}

function toChartPoints(earningsHistory: EarningsHistory[], chartWindow: ChartWindow | null): ChartPoint[] {
  if (!chartWindow) {
    return [];
  }

  const bucketValues = chartWindow.buckets.map((bucket) => ({
    label: bucket.label,
    value: 0,
  }));

  earningsHistory.forEach((item) => {
    const createdAt = new Date(item.createdAt).getTime();

    if (Number.isNaN(createdAt)) {
      return;
    }

    const bucketIndex = chartWindow.buckets.findIndex(
      (bucket, index) =>
        createdAt >= bucket.start.getTime() &&
        (index === chartWindow.buckets.length - 1 ? createdAt <= bucket.end.getTime() : createdAt < bucket.end.getTime())
    );

    if (bucketIndex >= 0) {
      bucketValues[bucketIndex].value += item.amount;
    }
  });

  return bucketValues;
}

function getPointCoordinates(points: ChartPoint[]) {
  const maxValue = Math.max(...points.map((point) => point.value), 0);
  const usableHeight = chartBaseline - chartTopPadding;

  return points.map((point, index) => {
    const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
    const normalizedValue = maxValue > 0 ? point.value / maxValue : 0;
    const y = chartBaseline - normalizedValue * usableHeight;

    return { ...point, x, y };
  });
}

function buildLinePath(points: ReturnType<typeof getPointCoordinates>) {
  if (points.length === 0) {
    return "";
  }

  if (points.length === 1) {
    return `M0,${points[0].y.toFixed(2)} L100,${points[0].y.toFixed(2)}`;
  }

  return points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.y.toFixed(2)}`)
    .join(" ");
}

function getVisibleLabels(points: ChartPoint[]) {
  if (points.length <= 7) {
    return points;
  }

  const labelStep = Math.ceil((points.length - 1) / 5);
  return points.filter((_, index) => index === 0 || index === points.length - 1 || index % labelStep === 0);
}

function getScaleMarkers(points: ChartPoint[]) {
  const maxValue = Math.max(...points.map((point) => point.value), 0);

  if (maxValue <= 0) {
    return [0, 1, 2, 3];
  }

  const step = maxValue / 3;
  return [3, 2, 1, 0].map((index) => step * index);
}

function getChartYForValue(value: number, maxValue: number) {
  const usableHeight = chartBaseline - chartTopPadding;
  const normalizedValue = maxValue > 0 ? value / maxValue : 0;
  return chartBaseline - normalizedValue * usableHeight;
}

export function WalletOverview({ wallet, stats, onWithdraw, isLoading }: WalletOverviewProps) {
  const [chartRange, setChartRange] = useState<ChartRange>("day");
  const [chartWindow, setChartWindow] = useState<ChartWindow | null>(null);
  const [earningsHistory, setEarningsHistory] = useState<EarningsHistory[]>([]);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [chartError, setChartError] = useState<string | null>(null);

  const values = {
    total: stats.totalBalance,
    available: stats.availableBalance,
    frozen: wallet.frozenBalance,
    pending: stats.pendingPayouts,
  };

  useEffect(() => {
    const controller = new AbortController();
    const nextChartWindow = createChartWindow(chartRange);
    setChartWindow(nextChartWindow);
    setHoveredPointIndex(null);

    const loadEarningsHistory = async () => {
      setIsChartLoading(true);
      setChartError(null);

      try {
        const data = await EarningsService.getEarningsHistoryRange(
          {
            startDate: nextChartWindow.startDate,
            endDate: nextChartWindow.endDate,
          },
          { signal: controller.signal }
        );

        setEarningsHistory(data);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setEarningsHistory([]);
        setChartError(getErrorMessage(error, "Unable to load earnings chart."));
      } finally {
        if (!controller.signal.aborted) {
          setIsChartLoading(false);
        }
      }
    };

    void loadEarningsHistory();

    return () => {
      controller.abort();
    };
  }, [chartRange]);

  const chartPoints = useMemo(() => toChartPoints(earningsHistory, chartWindow), [earningsHistory, chartWindow]);
  const visibleLabels = useMemo(() => getVisibleLabels(chartPoints), [chartPoints]);
  const chartCoordinates = useMemo(() => getPointCoordinates(chartPoints), [chartPoints]);
  const scaleMarkers = useMemo(() => getScaleMarkers(chartPoints), [chartPoints]);
  const chartLinePath = useMemo(() => buildLinePath(chartCoordinates), [chartCoordinates]);
  const chartFillPath = chartLinePath ? `${chartLinePath} L100,${chartHeight} L0,${chartHeight} Z` : "";
  const hoveredPoint = hoveredPointIndex === null ? null : chartCoordinates[hoveredPointIndex];
  const hasChartData = chartPoints.some((point) => point.value > 0);
  const selectedRangeLabel = getRangeLabel(chartRange).toLowerCase();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <article
            key={card.key}
            className="group relative overflow-hidden rounded-lg border border-border/30 bg-card p-8 transition-colors hover:border-primary/30"
          >
            <div className="absolute -right-4 -top-4 opacity-[0.04] transition-opacity group-hover:opacity-10">
              <span className="material-symbols-outlined text-[10rem]" aria-hidden="true">
                {card.icon}
              </span>
            </div>
            <p className="mb-3 font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {card.label}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="font-headline text-5xl font-black tracking-tight text-foreground">
                {values[card.key].toLocaleString()}
              </p>
              <span className="font-headline text-lg font-bold text-secondary">AC</span>
            </div>
            <div className="mt-6 flex items-center gap-2 font-label text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span className="material-symbols-outlined text-sm" aria-hidden="true">
                {card.key === "total"
                  ? "trending_up"
                  : card.key === "available"
                    ? "payments"
                    : card.key === "frozen"
                      ? "lock"
                      : "hourglass_top"}
              </span>
              {card.key === "total"
                ? "+12.5% vs last month"
                : card.key === "available"
                  ? "Ready to withdraw"
                  : card.key === "frozen"
                    ? "Temporarily locked"
                    : "Awaiting settlement"}
            </div>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <section className="rounded-lg border border-border/30 bg-card p-8 lg:col-span-2">
          <div className="mb-10 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-headline text-xl font-black tracking-tight text-foreground">Earnings Velocity</h2>
              <p className="font-body text-xs text-muted-foreground">AC accumulation trend by selected period</p>
            </div>
            <select
              value={chartRange}
              onChange={(event) => setChartRange(event.target.value as ChartRange)}
              className="rounded-sm border border-border/40 bg-background px-4 py-2 font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground outline-none focus:border-primary"
              aria-label="Earnings chart range"
            >
              {chartRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative h-64 w-full">
            {isChartLoading ? (
              <div className="flex h-full items-center justify-center rounded-md border border-border/20 bg-background/40 font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Loading earnings trend...
              </div>
            ) : chartError ? (
              <div className="flex h-full items-center justify-center rounded-md border border-primary/30 bg-primary/10 px-6 text-center font-body text-sm text-primary">
                {chartError}
              </div>
            ) : hasChartData ? (
              <div className="relative h-full w-full pl-14">
                <div className="absolute left-0 top-0 flex h-[calc(100%-2rem)] flex-col justify-between pr-3 text-right font-label text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {scaleMarkers.map((marker) => (
                    <span key={marker}>{formatAcValue(marker)} AC</span>
                  ))}
                </div>
                <div className="relative h-[calc(100%-2rem)]">
                  {hoveredPoint ? (
                    <div
                      className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-sm border border-secondary/50 bg-background px-3 py-2 text-center shadow-lg shadow-secondary/10"
                      style={{
                        left: `${hoveredPoint.x}%`,
                        top: `calc(${(hoveredPoint.y / chartHeight) * 100}% - 48px)`,
                      }}
                    >
                      <p className="font-label text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{hoveredPoint.label}</p>
                      <p className="mt-1 font-headline text-sm font-black text-secondary">{formatAcValue(hoveredPoint.value)} AC</p>
                    </div>
                  ) : null}
                  <svg
                    className="h-full w-full"
                    preserveAspectRatio="none"
                    viewBox={`0 0 100 ${chartHeight}`}
                    role="img"
                    aria-label="Earnings trend chart"
                    onPointerLeave={() => setHoveredPointIndex(null)}
                  >
                    <defs>
                      <linearGradient id="walletLine" x1="0%" x2="100%" y1="0%" y2="0%">
                        <stop offset="0%" stopColor="var(--primary)" />
                        <stop offset="100%" stopColor="var(--secondary)" />
                      </linearGradient>
                      <linearGradient id="walletFill" x1="0%" x2="0%" y1="0%" y2="100%">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {scaleMarkers.map((marker) => {
                      const markerY = getChartYForValue(marker, scaleMarkers[0] ?? 0);

                      return (
                        <line
                          key={marker}
                          x1="0"
                          x2="100"
                          y1={markerY}
                          y2={markerY}
                          stroke="var(--border)"
                          strokeOpacity="0.28"
                          strokeWidth="0.35"
                          vectorEffect="non-scaling-stroke"
                        />
                      );
                    })}
                    <path d={chartFillPath} fill="url(#walletFill)" vectorEffect="non-scaling-stroke" />
                    <path d={chartLinePath} fill="none" stroke="url(#walletLine)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" vectorEffect="non-scaling-stroke" />
                    {chartCoordinates.map((point, index) => (
                      <g key={`${point.label}-${index}`}>
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r="1.35"
                          fill="var(--secondary)"
                          stroke="var(--card)"
                          strokeWidth="0.6"
                          vectorEffect="non-scaling-stroke"
                        />
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r="3.8"
                          fill="transparent"
                          className="cursor-crosshair"
                          onFocus={() => setHoveredPointIndex(index)}
                          onPointerEnter={() => setHoveredPointIndex(index)}
                          tabIndex={0}
                          vectorEffect="non-scaling-stroke"
                        />
                      </g>
                    ))}
                  </svg>
                </div>
                <div className="mt-6 flex justify-between font-label text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {visibleLabels.map((point) => (
                    <span key={point.label}>{point.label}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-md border border-border/20 bg-background/40 px-6 text-center font-body text-sm text-muted-foreground">
                No earnings recorded for the last {selectedRangeLabel}.
              </div>
            )}
          </div>
        </section>

        <aside className="rounded-lg border border-border/30 bg-card p-8">
          <h2 className="mb-8 font-headline text-xl font-black tracking-tight text-foreground">Redemption</h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-border/30 bg-background p-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Conversion Rate</span>
                <span className="material-symbols-outlined text-sm text-secondary" aria-hidden="true">info</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-lg font-black text-foreground">100 AC</span>
                <span className="font-body text-sm text-muted-foreground">=</span>
                <span className="font-headline text-lg font-black text-secondary">10,000 VND</span>
              </div>
            </div>

            <div className="rounded-lg border border-border/30 bg-background p-4">
              <span className="font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Wallet Status</span>
              <p className="mt-2 font-headline text-lg font-bold text-foreground">{wallet.status}</p>
            </div>

            <button
              type="button"
              onClick={onWithdraw}
              disabled={wallet.balance <= 0 || isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-6 py-4 font-headline text-xs font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            >
              <span className="material-symbols-outlined text-base" aria-hidden="true">payments</span>
              {isLoading ? "Processing..." : "Withdraw Now"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
