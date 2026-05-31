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
  { id: "health", title: "Services Health Status", visible: true },
  { id: "stats", title: "Network Statistics", visible: true },
  { id: "financeOverview", title: "Finance Overview", visible: true },
  { id: "priorityActions", title: "Priority Actions", visible: true },
  { id: "dataSources", title: "Data Contract Status", visible: true },
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
      await checkAllServicesHealth();
    } catch (err) {
      setDashboardData(null);
      setError(getErrorMessage(err, t("error.loadFailed")));
    } finally {
      setIsLoading(false);
    }
  }, [checkAllServicesHealth, t]);

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
    <section className="space-y-8 animate-in fade-in duration-500">
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
                    <div key="stats" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-36 rounded-lg border border-border/30 bg-card p-6">
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
    <article className={`group relative min-h-36 overflow-hidden rounded-lg border p-5 transition-colors ${statToneClasses[card.tone]}`}>
      <div className="absolute right-4 top-4 opacity-10 transition-opacity group-hover:opacity-20">
        <span className="material-symbols-outlined text-5xl" aria-hidden="true">{card.icon}</span>
      </div>
      <p className="mb-2 font-label text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{card.label}</p>
      <h3 className={`font-headline text-2xl font-black ${card.unavailable ? "text-zinc-500" : "text-current"}`}>
        {card.value}
      </h3>
      <p className="mt-3 max-w-[15rem] font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{card.detail}</p>
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

interface FinanceOverviewProps {
  data: FinanceOverviewData | null;
  datePreset: string;
  setDatePreset: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  isLoading: boolean;
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Revenue Panel */}
          <div className="rounded-lg border border-border/20 bg-background/30 p-5">
            <h3 className="mb-4 font-headline text-xs font-bold uppercase tracking-widest text-zinc-300 border-b border-border/10 pb-2">{t("finance.revenue.title")}</h3>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("finance.revenue.totalPaymentCoins")}</span>
                <span className="font-bold text-foreground">{formatCoins(data.revenue.totalPaymentCoins)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("finance.revenue.creatorShare")}</span>
                <span className="font-bold text-secondary">{formatCoins(data.revenue.creatorRevenueCoins)}</span>
              </div>
              <div className="flex justify-between border-t border-border/10 pt-2 font-semibold">
                <span className="text-zinc-300">{t("finance.revenue.systemRevenue")}</span>
                <span className="font-bold text-emerald-400">{formatCoins(data.revenue.systemRevenueCoins)}</span>
              </div>
              <div className="flex justify-between pl-3 text-[11px] text-muted-foreground">
                <span>• {t("finance.revenue.fromVideo")}</span>
                <span>{formatCoins(data.revenue.videoSystemRevenueCoins)}</span>
              </div>
              <div className="flex justify-between pl-3 text-[11px] text-muted-foreground">
                <span>• {t("finance.revenue.fromMembership")}</span>
                <span>{formatCoins(data.revenue.membershipSystemRevenueCoins)}</span>
              </div>
              <div className="flex justify-between border-t border-border/10 pt-2">
                <span className="text-muted-foreground">{t("finance.revenue.pending")}</span>
                <span>{formatCoins(data.revenue.pendingSystemRevenueCoins)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("finance.revenue.released")}</span>
                <span>{formatCoins(data.revenue.releasedSystemRevenueCoins)}</span>
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
