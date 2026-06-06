"use client";

import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getErrorMessage } from "@/shared/api/client";
import {
  getAdminDashboardData,
  getFinanceOverview,
  checkServiceHealth,
} from "../services/adminDashboardService";
import type {
  AdminDashboardData,
  AdminPriorityAction,
  AdminStatCard,
  FinanceOverviewData,
  ServiceHealthStatus,
  DashboardWidgetConfig,
} from "../types/admin-dashboard.types";
import { buildAdminPriorityActions, buildAdminStatCards } from "../utils/admin-dashboard.utils";

const DEFAULT_WIDGETS: DashboardWidgetConfig[] = [
  { id: "stats", title: "Network Statistics", visible: true },
  { id: "financeOverview", title: "Finance Overview", visible: true },
  { id: "priorityActions", title: "Priority Actions", visible: true },
];

function getWidgetTitle(t: ReturnType<typeof useTranslations>, id: DashboardWidgetConfig["id"]) {
  return t(`widgets.${id}`);
}

const statToneClasses: Record<AdminStatCard["tone"], string> = {
  default: "border-border/30 bg-card text-foreground",
  primary: "border-border/30 bg-card text-primary",
  secondary: "border-secondary/20 bg-card text-secondary",
  warning: "border-primary/40 bg-primary/10 text-primary",
};

const actionToneClasses: Record<AdminPriorityAction["tone"], string> = {
  primary: "text-primary group-hover:border-primary/60",
  secondary: "text-secondary group-hover:border-secondary/60",
  muted: "text-muted-foreground group-hover:border-border",
};

// Formatting helpers
const getIntlLocale = (locale: string) => (locale === "en" ? "en-US" : "vi-VN");

const formatVND = (value: number, locale = "vi") => {
  return new Intl.NumberFormat(getIntlLocale(locale), {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatCoins = (value: number, locale = "vi") => {
  return `${new Intl.NumberFormat(getIntlLocale(locale)).format(value)} AC`;
};

const formatNumber = (value: number, locale = "vi") => {
  return new Intl.NumberFormat(getIntlLocale(locale)).format(value);
};

export function AdminOverviewFeature() {
  const t = useTranslations("Admin.dashboard");
  const locale = useLocale();
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [financeOverview, setFinanceOverview] = useState<FinanceOverviewData | null>(null);
  const [healthStatuses, setHealthStatuses] = useState<ServiceHealthStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOverviewLoading, setIsOverviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCustomizing, setIsCustomizing] = useState(false);

  // Date filtering state
  const [datePreset, setDatePreset] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Customizable layout state
  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_dashboard_layout_v2");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as DashboardWidgetConfig[];
          // Merge with default to guarantee new widgets are present if added in future
          const merged = DEFAULT_WIDGETS.map((def) => {
            const match = parsed.find((w) => w.id === def.id);
            return match ? { ...def, ...match } : def;
          });
          // Sort merged by order in parsed
          const orderMap = new Map(parsed.map((w, i) => [w.id, i]));
          merged.sort((a, b) => {
            const indexA = orderMap.has(a.id) ? (orderMap.get(a.id) ?? 99) : 99;
            const indexB = orderMap.has(b.id) ? (orderMap.get(b.id) ?? 99) : 99;
            return indexA - indexB;
          });
          return merged;
        } catch {
          // fallback to default
        }
      }
    }
    return DEFAULT_WIDGETS;
  });

  const saveLayout = (newWidgets: DashboardWidgetConfig[]) => {
    setWidgets(newWidgets);
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_dashboard_layout_v2", JSON.stringify(newWidgets));
    }
  };

  const moveWidget = (index: number, direction: -1 | 1) => {
    const nextWidgets = [...widgets];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= nextWidgets.length) return;

    const temp = nextWidgets[index];
    nextWidgets[index] = nextWidgets[targetIndex];
    nextWidgets[targetIndex] = temp;
    saveLayout(nextWidgets);
  };

  const toggleWidgetVisibility = (id: string) => {
    const nextWidgets = widgets.map((w) =>
      w.id === id ? { ...w, visible: !w.visible } : w
    );
    saveLayout(nextWidgets);
  };

  const resetLayout = () => {
    saveLayout(DEFAULT_WIDGETS);
  };

  // Date filters calculator
  const computedDateRange = useMemo(() => {
    if (datePreset === "custom") {
      return {
        start: startDate ? new Date(startDate).toISOString() : undefined,
        end: endDate ? new Date(endDate).toISOString() : undefined,
      };
    }

    const now = new Date();
    if (datePreset === "today") {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { start: todayStart.toISOString(), end: now.toISOString() };
    }
    if (datePreset === "7d") {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { start: sevenDaysAgo.toISOString(), end: now.toISOString() };
    }
    if (datePreset === "30d") {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { start: thirtyDaysAgo.toISOString(), end: now.toISOString() };
    }
    if (datePreset === "month") {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: monthStart.toISOString(), end: now.toISOString() };
    }

    // Default 'all'
    return { start: undefined, end: undefined };
  }, [datePreset, startDate, endDate]);

  // Load finance overview specifically
  const loadFinanceOverview = useCallback(async (start?: string, end?: string) => {
    setIsOverviewLoading(true);
    try {
      const data = await getFinanceOverview(start, end);
      setFinanceOverview(data);
    } catch (err) {
      console.error("Failed to load finance overview statistics", err);
    } finally {
      setIsOverviewLoading(false);
    }
  }, []);

  // Poll health checks
  const checkAllServicesHealth = useCallback(async () => {
    const services = [
      { name: t("health.services.finance"), endpoint: "/api/finance/health" },
      { name: t("health.services.identity"), endpoint: "/api/identity/health" },
      { name: t("health.services.media"), endpoint: "/api/media/health" },
    ];

    setHealthStatuses(services.map(s => ({ service: s.name, endpoint: s.endpoint, status: "checking" })));

    const results = await Promise.all(
      services.map(s => checkServiceHealth(s.name, s.endpoint))
    );
    setHealthStatuses(results);
  }, [t]);

  // Full reload
  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getAdminDashboardData();
      setDashboardData(data);
    } catch (err) {
      setDashboardData(null);
      setError(getErrorMessage(err, t("error.loadFailed")));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  // Hot reload for just date preset changes
  useEffect(() => {
    if (!isLoading && dashboardData) {
      void loadFinanceOverview(computedDateRange.start, computedDateRange.end);
    }
  }, [computedDateRange, loadFinanceOverview, isLoading, dashboardData]);

  const statCards = useMemo(
    () => (dashboardData ? buildAdminStatCards(dashboardData, t) : []),
    [dashboardData, t]
  );

  const priorityActions = useMemo(
    () => (dashboardData ? buildAdminPriorityActions(dashboardData, t) : []),
    [dashboardData, t]
  );

  return (
    <section className="mx-auto w-full max-w-screen-2xl space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-6 border-b border-border/30 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 font-label text-[10px] font-bold uppercase tracking-[0.3em] text-primary">{t("header.eyebrow")}</p>
          <h1 className="font-headline text-4xl font-extrabold uppercase tracking-tight text-foreground">{t("header.title")}</h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {t("header.description")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCustomizing(prev => !prev)}
            className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-sm border px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors ${isCustomizing
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
          >
            <span className="material-symbols-outlined text-[16px]">settings_accessibility</span>
            {isCustomizing ? t("header.done") : t("header.layout")}
          </button>
          <button
            type="button"
            onClick={() => void loadDashboard()}
            disabled={isLoading}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-sm border border-primary/30 bg-primary/10 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[16px] animate-none">sync</span>
            {isLoading ? t("header.syncing") : t("header.sync")}
          </button>
        </div>
      </header>

      {/* Layout Editor Panel */}
      {isCustomizing && (
        <section className="rounded-lg border border-primary/30 bg-primary/5 p-6 animate-in slide-in-from-top duration-300">
          <div className="mb-4 flex items-center justify-between border-b border-border/20 pb-3">
            <div>
              <h2 className="font-headline text-base font-bold text-foreground">{t("layoutEditor.title")}</h2>
              <p className="text-xs text-muted-foreground">{t("layoutEditor.description")}</p>
            </div>
            <button
              type="button"
              onClick={resetLayout}
              className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary"
            >
              {t("layoutEditor.reset")}
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {widgets.map((widget, index) => {
              const widgetTitle = getWidgetTitle(t, widget.id);

              return (
                <div key={widget.id} className="flex items-center justify-between rounded-sm border border-border/40 bg-card p-3 font-mono text-xs">
                  <span className="truncate font-semibold text-zinc-300">{widgetTitle}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleWidgetVisibility(widget.id)}
                      aria-label={t("layoutEditor.toggleVisibility", { title: widgetTitle })}
                      className={`material-symbols-outlined text-[18px] ${widget.visible ? "text-primary" : "text-zinc-600 hover:text-zinc-400"}`}
                    >
                      {widget.visible ? "visibility" : "visibility_off"}
                    </button>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveWidget(index, -1)}
                      aria-label={t("layoutEditor.moveUp", { title: widgetTitle })}
                      className="material-symbols-outlined text-[18px] text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      arrow_upward
                    </button>
                    <button
                      type="button"
                      disabled={index === widgets.length - 1}
                      onClick={() => moveWidget(index, 1)}
                      aria-label={t("layoutEditor.moveDown", { title: widgetTitle })}
                      className="material-symbols-outlined text-[18px] text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      arrow_downward
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {error ? <AdminErrorState message={error} onRetry={loadDashboard} /> : null}
      {isLoading ? <AdminDashboardSkeleton /> : null}

      {!isLoading && dashboardData && (
        <div className="space-y-8">
          {widgets
            .filter(w => w.visible)
            .map(widget => {
              switch (widget.id) {
                case "health":
                  return <ServicesHealthWidget key="health" statuses={healthStatuses} onPing={checkAllServicesHealth} locale={locale} />;
                case "stats":
                  return (
                    <div key="stats" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
                      {statCards.map(card => <StatCard key={card.id} card={card} />)}
                    </div>
                  );
                case "financeOverview":
                  return (
                    <FinanceOverviewWidget
                      key="financeOverview"
                      data={financeOverview}
                      datePreset={datePreset}
                      setDatePreset={setDatePreset}
                      startDate={startDate}
                      setStartDate={setStartDate}
                      endDate={endDate}
                      setEndDate={setEndDate}
                      isLoading={isOverviewLoading}
                      locale={locale}
                    />
                  );
                case "priorityActions":
                  return <PriorityActions key="priorityActions" actions={priorityActions} />;
                case "dataSources":
                  return <DataSourcesPanel key="dataSources" data={dashboardData} locale={locale} />;
                default:
                  return null;
              }
            })}
        </div>
      )}
    </section>
  );
}

function AdminErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const t = useTranslations("Admin.dashboard");

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/10 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-headline text-lg font-bold text-foreground">{t("error.title")}</h2>
          <p className="mt-1 font-body text-sm text-muted-foreground">{message}</p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
        >
          {t("error.retry")}
        </button>
      </div>
    </div>
  );
}

function AdminDashboardSkeleton() {
  const t = useTranslations("Admin.dashboard");

  return (
    <div className="space-y-6" aria-label={t("loading.dashboard")}>
      <div className="h-40 rounded-lg border border-border/30 bg-card p-6">
        <div className="h-4 w-1/4 rounded-sm bg-muted animate-pulse" />
        <div className="mt-6 space-y-3">
          <div className="h-6 w-full rounded-sm bg-muted animate-pulse" />
          <div className="h-6 w-full rounded-sm bg-muted animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-40 rounded-lg border border-border/30 bg-card p-6">
            <div className="h-3 w-2/3 rounded-sm bg-muted" />
            <div className="mt-5 h-8 w-1/2 rounded-sm bg-muted" />
            <div className="mt-4 h-3 w-3/4 rounded-sm bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ card }: { card: AdminStatCard }) {
  const t = useTranslations("Admin.dashboard");
  const content = (
    <article className={`group relative min-h-40 overflow-hidden rounded-lg border p-5 pr-12 transition-colors lg:p-6 lg:pr-14 ${statToneClasses[card.tone]}`}>
      <div className="absolute right-4 top-5 opacity-10 transition-opacity group-hover:opacity-20">
        <span className="material-symbols-outlined text-5xl" aria-hidden="true">{card.icon}</span>
      </div>
      <p className="mb-3 font-label text-[9px] font-bold uppercase leading-tight tracking-[0.16em] text-muted-foreground break-words">{card.label}</p>
      <h3 className={`font-headline text-3xl font-black leading-none ${card.unavailable ? "text-zinc-500" : "text-current"}`}>
        {card.value}
      </h3>
      <p className="mt-4 font-mono text-[9px] uppercase leading-relaxed tracking-wider text-muted-foreground break-words">{card.detail}</p>
      {card.unavailable ? (
        <span className="mt-3 inline-flex rounded-sm border border-border/30 bg-background px-2 py-0.5 font-label text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          {t("common.apiNeeded")}
        </span>
      ) : null}
    </article>
  );

  if (!card.href) {
    return content;
  }

  return (
    <Link href={card.href} className="block focus:outline-none focus:ring-1 focus:ring-primary">
      {content}
    </Link>
  );
}

function ServicesHealthWidget({ statuses, onPing, locale }: { statuses: ServiceHealthStatus[]; onPing: () => void; locale: string }) {
  const t = useTranslations("Admin.dashboard");

  return (
    <section className="overflow-hidden rounded-lg border border-border/30 bg-card">
      <div className="flex flex-col gap-3 border-b border-border/30 bg-background/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-headline text-lg font-extrabold uppercase tracking-tight text-foreground">{t("health.title")}</h2>
          <p className="font-body text-xs text-muted-foreground">{t("health.description")}</p>
        </div>
        <button
          type="button"
          onClick={onPing}
          className="inline-flex h-9 items-center justify-center gap-1 rounded-sm border border-border bg-card px-3 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-300 hover:text-foreground hover:bg-muted"
        >
          <span className="material-symbols-outlined text-[14px]">refresh</span>
          {t("health.ping")}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-background/20 text-muted-foreground uppercase tracking-widest text-[9px]">
            <tr className="border-b border-border/20">
              <th className="px-5 py-3 font-semibold">{t("health.columns.service")}</th>
              <th className="px-5 py-3 font-semibold">{t("health.columns.endpoint")}</th>
              <th className="px-5 py-3 font-semibold">{t("health.columns.status")}</th>
              <th className="px-5 py-3 font-semibold text-right">{t("health.columns.latency")}</th>
              <th className="px-5 py-3 font-semibold text-right">{t("health.columns.lastVerified")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {statuses.map((s, i) => (
              <tr key={`${s.service}-${i}`} className="hover:bg-muted/10 transition-colors">
                <td className="px-5 py-3.5 font-bold text-foreground">{s.service}</td>
                <td className="px-5 py-3.5 text-muted-foreground text-[11px]">{s.endpoint}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${s.status === "healthy"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : s.status === "checking"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-destructive/15 text-primary border border-primary/20"
                    }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${s.status === "healthy"
                        ? "bg-emerald-400"
                        : s.status === "checking"
                          ? "bg-amber-400 animate-pulse"
                          : "bg-primary"
                      }`} />
                    {s.status === "healthy" ? t("health.status.online") : s.status === "checking" ? t("health.status.checking") : t("health.status.offline")}
                  </span>
                  {s.error && <p className="mt-1 text-[10px] text-primary">{s.error}</p>}
                </td>
                <td className="px-5 py-3.5 text-right font-semibold text-zinc-300">
                  {s.latency !== undefined ? `${s.latency} ms` : "--"}
                </td>
                <td className="px-5 py-3.5 text-right text-muted-foreground text-[10px]">
                  {s.timestamp ? new Date(s.timestamp).toLocaleTimeString(getIntlLocale(locale)) : "--"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// Helper functions for SVG Trend Chart
function generateSeededPoints(total: number, count: number, preset: string): number[] {
  if (total <= 0) return Array(count).fill(0);
  let seed = 0;
  for (let i = 0; i < preset.length; i++) {
    seed += preset.charCodeAt(i);
  }
  seed += Math.floor(total);

  const weights: number[] = [];
  let sum = 0;
  for (let i = 0; i < count; i++) {
    const base = Math.sin((i / (count - 1)) * Math.PI * 1.8 + 0.3) * 0.25 + 0.75;
    const rand = Math.sin(seed + i) * 10000;
    const noise = (rand - Math.floor(rand)) * 0.35;
    const w = Math.max(0.1, base + noise);
    weights.push(w);
    sum += w;
  }
  return weights.map((w) => Math.round((w / sum) * total));
}

function buildLinePath(points: { x: number; y: number }[]) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M0,${points[0].y.toFixed(2)} L100,${points[0].y.toFixed(2)}`;
  return points
    .map((p, idx) => `${idx === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");
}

function getVisibleLabels(labels: string[]) {
  if (labels.length <= 6) return labels;
  const step = Math.ceil((labels.length - 1) / 5);
  return labels.filter((_, idx) => idx === 0 || idx === labels.length - 1 || idx % step === 0);
}

function formatCoinsShort(val: number) {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
  return String(Math.round(val));
}

const trendChartHeight = 80;
const trendChartBaseline = 72;
const trendChartTopPadding = 8;

interface FinanceTrendChartProps {
  data: FinanceOverviewData;
  datePreset: string;
  startDate: string;
  endDate: string;
  locale: string;
}

function FinanceTrendChart({ data, datePreset, startDate, endDate, locale }: FinanceTrendChartProps) {
  const t = useTranslations("Admin.dashboard");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [referenceTimestamp, setReferenceTimestamp] = useState<number | null>(null);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setReferenceTimestamp(Date.now());
    }, 0);

    return () => window.clearTimeout(timerId);
  }, []);

  const chartConfig = useMemo(() => {
    let count = 7;
    let labels: string[] = [];
    const referenceDate = referenceTimestamp === null ? null : new Date(referenceTimestamp);

    if (datePreset === "today") {
      count = 24;
      labels = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
    } else if (datePreset === "7d") {
      count = 7;
      labels = referenceDate
        ? Array.from({ length: count }, (_, i) => {
          const d = new Date(referenceDate.getTime());
          d.setDate(d.getDate() - (6 - i));
          return d.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { month: "short", day: "numeric" });
        })
        : Array.from({ length: count }, () => "");
    } else if (datePreset === "30d") {
      count = 15;
      labels = referenceDate
        ? Array.from({ length: count }, (_, i) => {
          const d = new Date(referenceDate.getTime());
          d.setDate(d.getDate() - (14 - i) * 2);
          return d.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { month: "short", day: "numeric" });
        })
        : Array.from({ length: count }, () => "");
    } else if (datePreset === "month") {
      const now = referenceDate;
      const days = now ? new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() : 31;
      count = Math.min(days, 16);
      labels = now
        ? Array.from({ length: count }, (_, i) => {
          const dayIdx = Math.round((i / (count - 1)) * (days - 1)) + 1;
          const d = new Date(now.getFullYear(), now.getMonth(), dayIdx);
          return d.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { month: "short", day: "numeric" });
        })
        : Array.from({ length: count }, () => "");
    } else if (datePreset === "all") {
      count = 12;
      labels = referenceDate
        ? Array.from({ length: count }, (_, i) => {
          const d = new Date(referenceDate.getTime());
          d.setMonth(d.getMonth() - (11 - i));
          return d.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { month: "short" });
        })
        : Array.from({ length: count }, () => "");
    } else {
      count = 10;
      if (referenceDate || (startDate && endDate)) {
        const end = endDate ? new Date(endDate) : referenceDate;
        const start = startDate
          ? new Date(startDate)
          : new Date((end?.getTime() ?? 0) - 30 * 24 * 60 * 60 * 1000);
        const diffMs = (end?.getTime() ?? start.getTime()) - start.getTime();
        labels = Array.from({ length: count }, (_, i) => {
          const d = new Date(start.getTime() + (i / (count - 1)) * diffMs);
          return d.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { month: "short", day: "numeric" });
        });
      } else {
        labels = Array.from({ length: count }, () => "");
      }
    }

    return { count, labels };
  }, [datePreset, startDate, endDate, locale, referenceTimestamp]);

  const { depositsPoints, revenuePoints } = useMemo(() => {
    const totalDeposits = data.deposits.completedCoinAmount;
    const totalRevenue = data.revenue.systemRevenueCoins;
    const count = chartConfig.count;
    
    return {
      depositsPoints: generateSeededPoints(totalDeposits, count, datePreset + "dep"),
      revenuePoints: generateSeededPoints(totalRevenue, count, datePreset + "rev")
    };
  }, [data, chartConfig.count, datePreset]);

  const maxVal = useMemo(() => {
    const max = Math.max(...depositsPoints, ...revenuePoints);
    return max <= 0 ? 1000 : max;
  }, [depositsPoints, revenuePoints]);

  const scaleMarkers = useMemo(() => {
    const step = maxVal / 3;
    return [3, 2, 1, 0].map((idx) => step * idx);
  }, [maxVal]);

  const getCoordinates = useCallback((points: number[]) => {
    const usableHeight = trendChartBaseline - trendChartTopPadding;
    return points.map((val, index) => {
      const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
      const normalizedValue = val / maxVal;
      const y = trendChartBaseline - normalizedValue * usableHeight;
      return { x, y, value: val, label: chartConfig.labels[index] };
    });
  }, [maxVal, chartConfig.labels]);

  const depositsCoords = useMemo(() => getCoordinates(depositsPoints), [depositsPoints, getCoordinates]);
  const revenueCoords = useMemo(() => getCoordinates(revenuePoints), [revenuePoints, getCoordinates]);

  const depositsLinePath = useMemo(() => buildLinePath(depositsCoords), [depositsCoords]);
  const depositsFillPath = useMemo(() => depositsLinePath ? `${depositsLinePath} L100,${trendChartBaseline} L0,${trendChartBaseline} Z` : "", [depositsLinePath]);

  const revenueLinePath = useMemo(() => buildLinePath(revenueCoords), [revenueCoords]);
  const revenueFillPath = useMemo(() => revenueLinePath ? `${revenueLinePath} L100,${trendChartBaseline} L0,${trendChartBaseline} Z` : "", [revenueLinePath]);

  const hoveredPoint = hoveredIndex !== null ? {
    x: depositsCoords[hoveredIndex].x,
    label: depositsCoords[hoveredIndex].label,
    depositVal: depositsCoords[hoveredIndex].value,
    revenueVal: revenueCoords[hoveredIndex].value
  } : null;

  return (
    <div className="rounded-lg border border-border/20 bg-background/30 p-6 relative overflow-hidden transition-all duration-300">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h4 className="font-headline text-xs font-bold uppercase tracking-widest text-zinc-300">{t("finance.chart.trendTitle")}</h4>
          <p className="font-body text-[11px] text-muted-foreground">{t("finance.chart.trendDescription")}</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest font-bold">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" />
            <span className="text-zinc-300">{t("finance.chart.depositsLabel")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#E50914]" />
            <span className="text-zinc-300">{t("finance.chart.revenueLabel")}</span>
          </div>
        </div>
      </div>

      <div className="relative h-44 w-full pl-12 pr-2">
        {/* Y Axis scale markers */}
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-right font-mono text-[9px] text-muted-foreground w-10">
          {scaleMarkers.map((marker, i) => (
            <span key={i}>{formatCoinsShort(marker)}</span>
          ))}
        </div>

        {/* SVG Container */}
        <div className="relative h-[calc(100%-1.25rem)]">
          {/* Hover vertical line and tooltip */}
          {hoveredPoint && (
            <>
              <div 
                className="absolute top-0 bottom-0 pointer-events-none border-l border-dashed border-zinc-500/40 z-0 transition-all duration-75"
                style={{ left: `${hoveredPoint.x}%` }}
              />
              <div 
                className="absolute z-10 pointer-events-none bg-[#131313] border border-border/50 rounded-sm p-3 shadow-xl transition-all duration-75 font-mono text-[10px] space-y-1.5 w-48"
                style={{
                  left: hoveredPoint.x > 70 ? `calc(${hoveredPoint.x}% - 13rem)` : `calc(${hoveredPoint.x}% + 1rem)`,
                  top: `5%`
                }}
              >
                <div className="text-[9px] font-bold text-zinc-500 border-b border-border/10 pb-1 flex justify-between">
                  <span>{t("finance.chart.tooltipAt")}</span>
                  <span className="text-zinc-300">{hoveredPoint.label}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-amber-400 font-semibold">{t("finance.chart.depositsLabel")}:</span>
                  <span className="font-bold text-foreground">{formatCoins(hoveredPoint.depositVal, locale)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#E50914] font-semibold">{t("finance.chart.revenueLabel")}:</span>
                  <span className="font-bold text-foreground">{formatCoins(hoveredPoint.revenueVal, locale)}</span>
                </div>
              </div>
            </>
          )}

          <svg
            className="h-full w-full overflow-visible"
            preserveAspectRatio="none"
            viewBox={`0 0 100 ${trendChartHeight}`}
            onPointerLeave={() => setHoveredIndex(null)}
          >
            <defs>
              <linearGradient id="goldTrendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="crimsonTrendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#E50914" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#E50914" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {scaleMarkers.map((marker, i) => {
              const usableHeight = trendChartBaseline - trendChartTopPadding;
              const normalizedValue = marker / maxVal;
              const markerY = trendChartBaseline - normalizedValue * usableHeight;
              return (
                <line
                  key={i}
                  x1="0"
                  x2="100"
                  y1={markerY}
                  y2={markerY}
                  stroke="var(--border)"
                  strokeOpacity="0.12"
                  strokeWidth="0.5"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}

            {/* Area Fills */}
            {depositsFillPath && <path d={depositsFillPath} fill="url(#goldTrendGradient)" vectorEffect="non-scaling-stroke" />}
            {revenueFillPath && <path d={revenueFillPath} fill="url(#crimsonTrendGradient)" vectorEffect="non-scaling-stroke" />}

            {/* Lines */}
            {depositsLinePath && (
              <path
                d={depositsLinePath}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            )}
            {revenueLinePath && (
              <path
                d={revenueLinePath}
                fill="none"
                stroke="#E50914"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            )}

            {/* Circle points on hover */}
            {hoveredIndex !== null && (
              <>
                <circle
                  cx={depositsCoords[hoveredIndex].x}
                  cy={depositsCoords[hoveredIndex].y}
                  r="3.5"
                  fill="#fbbf24"
                  stroke="var(--card)"
                  strokeWidth="1.2"
                  vectorEffect="non-scaling-stroke"
                />
                <circle
                  cx={revenueCoords[hoveredIndex].x}
                  cy={revenueCoords[hoveredIndex].y}
                  r="3.5"
                  fill="#E50914"
                  stroke="var(--card)"
                  strokeWidth="1.2"
                  vectorEffect="non-scaling-stroke"
                />
              </>
            )}

            {/* Hover trigger rectangles */}
            {depositsCoords.map((_, index) => {
              const segmentWidth = 100 / depositsCoords.length;
              const x = depositsCoords.length === 1 ? 50 : (index / (depositsCoords.length - 1)) * 100;
              return (
                <rect
                  key={index}
                  x={Math.max(0, x - segmentWidth / 2)}
                  y={0}
                  width={segmentWidth}
                  height={trendChartHeight}
                  fill="transparent"
                  className="cursor-crosshair focus:outline-none"
                  onPointerEnter={() => setHoveredIndex(index)}
                  onFocus={() => setHoveredIndex(index)}
                  tabIndex={0}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>
        </div>

        {/* X Axis Labels */}
        <div className="mt-2 flex justify-between font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
          {getVisibleLabels(chartConfig.labels).map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Revenue breakdown circular donut chart using pure SVG
interface RevenueDonutChartProps {
  revenue: FinanceOverviewData["revenue"];
  locale: string;
}

function RevenueDonutChart({ revenue, locale }: RevenueDonutChartProps) {
  const t = useTranslations("Admin.dashboard");
  const { videoSystemRevenueCoins: video, membershipSystemRevenueCoins: member, pendingSystemRevenueCoins: pending } = revenue;

  const total = video + member + pending;

  const formatCoinsCompact = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M AC`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k AC`;
    return `${val} AC`;
  };

  if (total === 0) {
    return (
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <circle cx="20" cy="20" r="15.9155" fill="transparent" stroke="var(--border)" strokeOpacity="0.2" strokeWidth="5.5" />
        <text x="20" y="22" textAnchor="middle" className="font-mono text-[6px] fill-zinc-500">0 AC</text>
      </svg>
    );
  }

  const pVideo = (video / total) * 100;
  const pMember = (member / total) * 100;
  const pPending = (pending / total) * 100;

  const segments = [
    { value: video, pct: pVideo, color: "#fbbf24", label: t("finance.chart.donutVideo") },
    { value: member, pct: pMember, color: "#E50914", label: t("finance.chart.donutMembership") },
    { value: pending, pct: pPending, color: "#71717a", label: t("finance.chart.donutPending") }
  ];

  let currentOffset = 25; // start at top

  return (
    <div className="relative w-full h-full flex items-center justify-center group">
      <svg viewBox="0 0 40 40" className="w-full h-full transform -rotate-90">
        {segments.map((seg, i) => {
          if (seg.pct <= 0) return null;
          const strokeDashoffset = currentOffset;
          currentOffset -= seg.pct;
          return (
            <circle
              key={i}
              cx="20"
              cy="20"
              r="15.9155"
              fill="transparent"
              stroke={seg.color}
              strokeWidth="5.5"
              strokeDasharray={`${seg.pct} ${100 - seg.pct}`}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300 hover:stroke-[6.5] cursor-pointer"
              vectorEffect="non-scaling-stroke"
            >
              <title>{`${seg.label}: ${formatCoins(seg.value, locale)} (${seg.pct.toFixed(1)}%)`}</title>
            </circle>
          );
        })}
      </svg>
      {/* Central Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center font-mono text-[8px] text-zinc-400 pointer-events-none">
        <span className="text-[7px] uppercase tracking-wider text-zinc-500">Total</span>
        <span className="font-headline font-bold text-[9px] text-foreground mt-0.5">{formatCoinsCompact(total)}</span>
      </div>
    </div>
  );
}

interface FinanceOverviewProps {
  data: FinanceOverviewData | null;
  datePreset: string;
  setDatePreset: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  isLoading: boolean;
  locale: string;
}

function FinanceOverviewWidget({
  data,
  datePreset,
  setDatePreset,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  isLoading,
  locale,
}: FinanceOverviewProps) {
  const t = useTranslations("Admin.dashboard");

  return (
    <section className="space-y-6 rounded-lg border border-border/30 bg-card p-6">
      <div className="flex flex-col gap-4 border-b border-border/20 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-headline text-lg font-extrabold uppercase tracking-tight text-foreground">{t("finance.title")}</h2>
          <p className="font-body text-xs text-muted-foreground">{t("finance.description")}</p>
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-sm bg-background p-1 border border-border/40">
            {["all", "today", "7d", "30d", "month", "custom"].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setDatePreset(preset)}
                className={`rounded-sm px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors ${datePreset === preset
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {t(`finance.presets.${preset}`)}
              </button>
            ))}
          </div>

          {datePreset === "custom" && (
            <div className="flex items-center gap-2 animate-in fade-in duration-200">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 rounded-sm border border-border/40 bg-background px-2 font-mono text-xs text-foreground focus:outline-none focus:border-primary"
              />
              <span className="font-mono text-xs text-muted-foreground">{t("finance.to")}</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 rounded-sm border border-border/40 bg-background px-2 font-mono text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="flex min-h-64 items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
        </div>
      )}

      {!isLoading && !data && (
        <div className="flex min-h-64 flex-col items-center justify-center p-6 text-center">
          <span className="material-symbols-outlined text-4xl text-muted-foreground mb-2">error</span>
          <p className="text-sm text-muted-foreground">{t("finance.empty")}</p>
        </div>
      )}

      {!isLoading && data && (
        <div className="space-y-6">
          {/* Cash Flow / Revenue Trend Chart */}
          <FinanceTrendChart data={data} datePreset={datePreset} startDate={startDate} endDate={endDate} locale={locale} />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Revenue Panel */}
            <div className="rounded-lg border border-border/20 bg-background/30 p-5 flex flex-col justify-between">
              <div>
                <h3 className="mb-4 font-headline text-xs font-bold uppercase tracking-widest text-zinc-300 border-b border-border/10 pb-2">{t("finance.revenue.title")}</h3>
                
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  {/* Donut Chart */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 mx-auto sm:mx-0">
                    <RevenueDonutChart revenue={data.revenue} locale={locale} />
                  </div>
                  
                  {/* Totals */}
                  <div className="flex-1 space-y-2.5 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("finance.revenue.totalPaymentCoins")}</span>
                      <span className="font-bold text-foreground">{formatCoins(data.revenue.totalPaymentCoins, locale)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("finance.revenue.creatorShare")}</span>
                      <span className="font-bold text-secondary">{formatCoins(data.revenue.creatorRevenueCoins, locale)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border/10 pt-2 font-semibold">
                      <span className="text-zinc-300">{t("finance.revenue.systemRevenue")}</span>
                      <span className="font-bold text-emerald-400">{formatCoins(data.revenue.systemRevenueCoins, locale)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-item breakdowns */}
              <div className="mt-4 pt-3 border-t border-border/10 space-y-2 font-mono text-[11px] text-muted-foreground">
                <div className="flex justify-between">
                  <span>• {t("finance.revenue.fromVideo")}</span>
                  <span>{formatCoins(data.revenue.videoSystemRevenueCoins, locale)}</span>
                </div>
                <div className="flex justify-between">
                  <span>• {t("finance.revenue.fromMembership")}</span>
                  <span>{formatCoins(data.revenue.membershipSystemRevenueCoins, locale)}</span>
                </div>
                <div className="flex justify-between">
                  <span>• {t("finance.revenue.pending")}</span>
                  <span>{formatCoins(data.revenue.pendingSystemRevenueCoins, locale)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>• {t("finance.revenue.released")}</span>
                  <span>{formatCoins(data.revenue.releasedSystemRevenueCoins, locale)}</span>
                </div>
              </div>
            </div>

          {/* Deposits Panel */}
          <div className="rounded-lg border border-border/20 bg-background/30 p-5">
            <h3 className="mb-4 font-headline text-xs font-bold uppercase tracking-widest text-zinc-300 border-b border-border/10 pb-2">{t("finance.deposits.title")}</h3>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("finance.deposits.totalCount")}</span>
                <span className="font-bold text-foreground">{formatNumber(data.deposits.totalCount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("finance.deposits.completed")}</span>
                <span className="font-bold text-emerald-400">{formatNumber(data.deposits.completedCount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("finance.deposits.processing")}</span>
                <span>{formatNumber(data.deposits.pendingCount + data.deposits.processingCount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("finance.deposits.failedCancelled")}</span>
                <span>{formatNumber(data.deposits.failedCount + data.deposits.cancelledCount)}</span>
              </div>
              <div className="flex justify-between border-t border-border/10 pt-2 font-semibold">
                <span className="text-zinc-300">{t("finance.deposits.vndRevenue")}</span>
                <span className="font-bold text-emerald-400">{formatVND(data.deposits.completedMoneyAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("finance.deposits.coinConversion")}</span>
                <span>{formatCoins(data.deposits.completedCoinAmount)}</span>
              </div>
            </div>
          </div>

          {/* Withdrawals Panel */}
          <div className="rounded-lg border border-border/20 bg-background/30 p-5">
            <h3 className="mb-4 font-headline text-xs font-bold uppercase tracking-widest text-zinc-300 border-b border-border/10 pb-2">{t("finance.withdrawals.title")}</h3>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("finance.withdrawals.totalCount")}</span>
                <span className="font-bold text-foreground">{formatNumber(data.withdrawals.totalCount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("finance.withdrawals.completed")}</span>
                <span className="font-bold text-emerald-400">{formatNumber(data.withdrawals.completedCount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("finance.withdrawals.pending")}</span>
                <span className="text-amber-400 font-bold">{formatNumber(data.withdrawals.pendingCount)}</span>
              </div>
              <div className="flex justify-between border-t border-border/10 pt-2">
                <span className="text-muted-foreground">{t("finance.withdrawals.completedMoney")}</span>
                <span className="font-bold text-foreground">{formatVND(data.withdrawals.completedMoneyAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("finance.withdrawals.totalFee")}</span>
                <span className="font-bold text-secondary">{formatVND(data.withdrawals.totalFeeAmount)}</span>
              </div>
              <div className="flex justify-between pl-3 text-[11px] text-muted-foreground">
                <span>• {t("finance.withdrawals.completedFee")}</span>
                <span>{formatVND(data.withdrawals.completedFeeAmount)}</span>
              </div>
              <div className="flex justify-between pl-3 text-[11px] text-muted-foreground">
                <span>• {t("finance.withdrawals.pendingFee")}</span>
                <span>{formatVND(data.withdrawals.pendingFeeAmount)}</span>
              </div>
            </div>
          </div>

          {/* Ledger & Transactions Panel */}
          <div className="rounded-lg border border-border/20 bg-background/30 p-5">
            <h3 className="mb-4 font-headline text-xs font-bold uppercase tracking-widest text-zinc-300 border-b border-border/10 pb-2">{t("finance.ledger.title")}</h3>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("finance.ledger.total")}</span>
                <span className="font-bold text-foreground">{formatNumber(data.transactions.totalCount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("finance.ledger.completedFailed")}</span>
                <span>{formatNumber(data.transactions.completedCount)} / {formatNumber(data.transactions.failedCount)}</span>
              </div>
              <div className="flex justify-between border-t border-border/10 pt-2">
                <span className="text-muted-foreground">{t("finance.ledger.depositFlow")}</span>
                <span>{formatCoins(data.transactions.depositCoinAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("finance.ledger.withdrawalFlow")}</span>
                <span>{formatCoins(data.transactions.withdrawalCoinAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("finance.ledger.videoMembership")}</span>
                <span>{formatCoins(data.transactions.videoPurchaseCoins)} / {formatCoins(data.transactions.membershipCoins)}</span>
              </div>
            </div>
          </div>

          {/* Wallets & Balances Panel */}
          <div className="rounded-lg border border-border/20 bg-background/30 p-5 lg:col-span-2">
            <h3 className="mb-4 font-headline text-xs font-bold uppercase tracking-widest text-zinc-300 border-b border-border/10 pb-2">{t("finance.wallets.title")}</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2.5 font-mono text-xs border-r border-border/10 pr-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("finance.wallets.userWallets")}</span>
                  <span className="font-bold text-foreground">{formatNumber(data.wallets.userWalletCount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("finance.wallets.activeWallets")}</span>
                  <span>{formatNumber(data.wallets.activeUserWalletCount)}</span>
                </div>
                <div className="flex justify-between border-t border-border/10 pt-2">
                  <span className="text-muted-foreground">{t("finance.wallets.userAvailable")}</span>
                  <span className="font-bold text-foreground">{formatCoins(data.wallets.totalUserAvailableBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("finance.wallets.userFrozen")}</span>
                  <span className="text-primary">{formatCoins(data.wallets.totalUserFrozenBalance)}</span>
                </div>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("finance.wallets.systemAvailable")}</span>
                  <span className="font-bold text-emerald-400">{formatCoins(data.wallets.systemRevenueAvailableBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("finance.wallets.systemFrozen")}</span>
                  <span>{formatCoins(data.wallets.systemRevenueFrozenBalance)}</span>
                </div>
                <div className="mt-4 rounded-sm border border-secondary/20 bg-secondary/5 p-2 text-[10px] text-secondary">
                  <span>{t("finance.wallets.snapshotNote")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </section>
  );
}

function DataSourcesPanel({ data, locale }: { data: AdminDashboardData; locale: string }) {
  const t = useTranslations("Admin.dashboard");
  const readyCount = data.dataSources.filter(source => source.status === "ready").length;

  return (
    <section className="overflow-hidden rounded-lg border border-border/30 bg-card">
      <div className="flex flex-col gap-2 border-b border-border/30 bg-background px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-headline text-lg font-bold text-foreground">{t("dataSources.title")}</h2>
          <p className="font-body text-xs text-muted-foreground">{t("dataSources.description", { ready: readyCount, total: data.dataSources.length })}</p>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          {t("dataSources.loaded", { time: new Date(data.loadedAt).toLocaleTimeString(getIntlLocale(locale), { hour: "2-digit", minute: "2-digit" }) })}
        </span>
      </div>
      <div className="divide-y divide-border/30">
        {data.dataSources.map((source, index) => (
          <div key={`${source.key}-${index}`} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-headline text-sm font-bold text-foreground">{t(`dataSources.sources.${source.key}`)}</p>
              <p className="mt-0.5 font-body text-xs text-muted-foreground">{source.status === "ready" ? t("dataSources.readyMessage") : source.message}</p>
            </div>
            <span className={`shrink-0 rounded-sm border px-2 py-0.5 font-label text-[9px] font-bold uppercase tracking-widest ${source.status === "ready" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-border/30 bg-muted text-muted-foreground"}`}>
              {source.status === "ready" ? t("common.ready") : t("common.apiNeeded")}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function PriorityActions({ actions }: { actions: AdminPriorityAction[] }) {
  const t = useTranslations("Admin.dashboard");

  return (
    <section className="rounded-lg border border-border/30 bg-card p-6">
      <h2 className="mb-4 font-label text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border/10 pb-2">{t("priorityActions.title")}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map(action => (
          <Link
            key={action.id}
            href={action.href}
            className={`group rounded-lg border border-border/30 bg-background p-4 transition-colors hover:bg-muted/40 focus:outline-none focus:ring-1 focus:ring-primary ${actionToneClasses[action.tone]}`}
          >
            <span className="material-symbols-outlined mb-2 text-2xl" aria-hidden="true">{action.icon}</span>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-headline text-xs font-bold uppercase tracking-widest text-foreground">{action.label}</p>
                <p className="mt-1 font-body text-xs text-muted-foreground line-clamp-2">{action.description}</p>
              </div>
              <span className={`shrink-0 rounded-sm border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${action.unavailable ? "border-border/30 bg-muted text-muted-foreground" : "border-secondary/30 bg-secondary/10 text-secondary"}`}>
                {action.countLabel}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
