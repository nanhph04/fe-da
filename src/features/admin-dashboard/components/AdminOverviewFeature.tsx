"use client";

import { Link } from "@/i18n/routing";
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
const formatVND = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatCoins = (value: number) => {
  return `${new Intl.NumberFormat("en-US").format(value)} AC`;
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("en-US").format(value);
};

export function AdminOverviewFeature() {
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
      { name: "Finance Service", endpoint: "/api/health" },
      { name: "Identity Service", endpoint: "/api/identity/health" },
      { name: "Media Service", endpoint: "/api/media/health" },
    ];

    setHealthStatuses(services.map(s => ({ service: s.name, endpoint: s.endpoint, status: "checking" })));

    const results = await Promise.all(
      services.map(s => checkServiceHealth(s.name, s.endpoint))
    );
    setHealthStatuses(results);
  }, []);

  // Full reload
  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getAdminDashboardData();
      setDashboardData(data);
      await Promise.all([
        loadFinanceOverview(computedDateRange.start, computedDateRange.end),
        checkAllServicesHealth(),
      ]);
    } catch (err) {
      setDashboardData(null);
      setError(getErrorMessage(err, "Không thể tải dashboard admin."));
    } finally {
      setIsLoading(false);
    }
  }, [computedDateRange, loadFinanceOverview, checkAllServicesHealth]);

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
    () => (dashboardData ? buildAdminStatCards(dashboardData) : []),
    [dashboardData]
  );

  const priorityActions = useMemo(
    () => (dashboardData ? buildAdminPriorityActions(dashboardData) : []),
    [dashboardData]
  );

  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-6 border-b border-border/30 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 font-label text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Velvet Gallery System</p>
          <h1 className="font-headline text-4xl font-extrabold uppercase tracking-tight text-foreground">Command Center</h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            ADMINISTRATOR NETWORK STATUS & TRANSACTION AGGREGATION
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCustomizing(prev => !prev)}
            className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-sm border px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors ${
              isCustomizing
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">settings_accessibility</span>
            {isCustomizing ? "Hoàn thành" : "Bố cục"}
          </button>
          <button
            type="button"
            onClick={() => void loadDashboard()}
            disabled={isLoading}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-sm border border-primary/30 bg-primary/10 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[16px] animate-none">sync</span>
            {isLoading ? "Đang đồng bộ..." : "Đồng bộ dữ liệu"}
          </button>
        </div>
      </header>

      {/* Layout Editor Panel */}
      {isCustomizing && (
        <section className="rounded-lg border border-primary/30 bg-primary/5 p-6 animate-in slide-in-from-top duration-300">
          <div className="mb-4 flex items-center justify-between border-b border-border/20 pb-3">
            <div>
              <h2 className="font-headline text-base font-bold text-foreground">Tùy chỉnh cấu trúc giao diện</h2>
              <p className="text-xs text-muted-foreground">Nhấp vào mũi tên để di chuyển widget hoặc tắt hiển thị để ẩn widget.</p>
            </div>
            <button
              type="button"
              onClick={resetLayout}
              className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary"
            >
              Đặt lại mặc định
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {widgets.map((widget, index) => (
              <div key={widget.id} className="flex items-center justify-between rounded-sm border border-border/40 bg-card p-3 font-mono text-xs">
                <span className="truncate font-semibold text-zinc-300">{widget.title}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleWidgetVisibility(widget.id)}
                    aria-label={`Ẩn/Hiện ${widget.title}`}
                    className={`material-symbols-outlined text-[18px] ${widget.visible ? "text-primary" : "text-zinc-600 hover:text-zinc-400"}`}
                  >
                    {widget.visible ? "visibility" : "visibility_off"}
                  </button>
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveWidget(index, -1)}
                    aria-label={`Di chuyển ${widget.title} lên`}
                    className="material-symbols-outlined text-[18px] text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    arrow_upward
                  </button>
                  <button
                    type="button"
                    disabled={index === widgets.length - 1}
                    onClick={() => moveWidget(index, 1)}
                    aria-label={`Di chuyển ${widget.title} xuống`}
                    className="material-symbols-outlined text-[18px] text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    arrow_downward
                  </button>
                </div>
              </div>
            ))}
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
                  return <ServicesHealthWidget key="health" statuses={healthStatuses} onPing={checkAllServicesHealth} />;
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
                  return <DataSourcesPanel key="dataSources" data={dashboardData} />;
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
  return (
    <div className="rounded-lg border border-primary/30 bg-primary/10 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-headline text-lg font-bold text-foreground">Không thể tải dữ liệu admin</h2>
          <p className="mt-1 font-body text-sm text-muted-foreground">{message}</p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading admin dashboard">
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
          API Needed
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

function ServicesHealthWidget({ statuses, onPing }: { statuses: ServiceHealthStatus[]; onPing: () => void }) {
  return (
    <section className="overflow-hidden rounded-lg border border-border/30 bg-card">
      <div className="flex flex-col gap-3 border-b border-border/30 bg-background/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-headline text-lg font-extrabold uppercase tracking-tight text-foreground">Services Health Status</h2>
          <p className="font-body text-xs text-muted-foreground">Thời gian thực tế phản hồi giữa Gateway và các Services.</p>
        </div>
        <button
          type="button"
          onClick={onPing}
          className="inline-flex h-9 items-center justify-center gap-1 rounded-sm border border-border bg-card px-3 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-300 hover:text-foreground hover:bg-muted"
        >
          <span className="material-symbols-outlined text-[14px]">refresh</span>
          Ping
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-background/20 text-muted-foreground uppercase tracking-widest text-[9px]">
            <tr className="border-b border-border/20">
              <th className="px-5 py-3 font-semibold">Service Name</th>
              <th className="px-5 py-3 font-semibold">Endpoint</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold text-right">Ping (Latency)</th>
              <th className="px-5 py-3 font-semibold text-right">Last Verified</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {statuses.map((s, i) => (
              <tr key={`${s.service}-${i}`} className="hover:bg-muted/10 transition-colors">
                <td className="px-5 py-3.5 font-bold text-foreground">{s.service}</td>
                <td className="px-5 py-3.5 text-muted-foreground text-[11px]">{s.endpoint}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    s.status === "healthy"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : s.status === "checking"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-destructive/15 text-primary border border-primary/20"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      s.status === "healthy"
                        ? "bg-emerald-400"
                        : s.status === "checking"
                        ? "bg-amber-400 animate-pulse"
                        : "bg-primary"
                    }`} />
                    {s.status === "healthy" ? "Online" : s.status === "checking" ? "Checking" : "Offline"}
                  </span>
                  {s.error && <p className="mt-1 text-[10px] text-primary">{s.error}</p>}
                </td>
                <td className="px-5 py-3.5 text-right font-semibold text-zinc-300">
                  {s.latency !== undefined ? `${s.latency} ms` : "--"}
                </td>
                <td className="px-5 py-3.5 text-right text-muted-foreground text-[10px]">
                  {s.timestamp ? new Date(s.timestamp).toLocaleTimeString() : "--"}
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
  return (
    <section className="space-y-6 rounded-lg border border-border/30 bg-card p-6">
      <div className="flex flex-col gap-4 border-b border-border/20 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-headline text-lg font-extrabold uppercase tracking-tight text-foreground">Finance Overview Dashboard</h2>
          <p className="font-body text-xs text-muted-foreground">Thống kê giao dịch, ví, dòng tiền doanh thu toàn hệ thống.</p>
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-sm bg-background p-1 border border-border/40">
            {["all", "today", "7d", "30d", "month", "custom"].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setDatePreset(preset)}
                className={`rounded-sm px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors ${
                  datePreset === preset
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {preset === "all" ? "Tất cả" : preset === "today" ? "Hôm nay" : preset === "7d" ? "7 Ngày" : preset === "30d" ? "30 Ngày" : preset === "month" ? "Tháng này" : "Tự chọn"}
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
              <span className="font-mono text-xs text-muted-foreground">đến</span>
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
          <p className="text-sm text-muted-foreground">Không thể tải dữ liệu tài chính hoặc chưa có giao dịch nào.</p>
        </div>
      )}

      {!isLoading && data && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Revenue Panel */}
          <div className="rounded-lg border border-border/20 bg-background/30 p-5">
            <h3 className="mb-4 font-headline text-xs font-bold uppercase tracking-widest text-zinc-300 border-b border-border/10 pb-2">Revenue (Doanh thu)</h3>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tổng nạp AC:</span>
                <span className="font-bold text-foreground">{formatCoins(data.revenue.totalPaymentCoins)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Chia sẻ Creator:</span>
                <span className="font-bold text-secondary">{formatCoins(data.revenue.creatorRevenueCoins)}</span>
              </div>
              <div className="flex justify-between border-t border-border/10 pt-2 font-semibold">
                <span className="text-zinc-300">Hệ thống thực nhận:</span>
                <span className="font-bold text-emerald-400">{formatCoins(data.revenue.systemRevenueCoins)}</span>
              </div>
              <div className="flex justify-between pl-3 text-[11px] text-muted-foreground">
                <span>• Từ Video:</span>
                <span>{formatCoins(data.revenue.videoSystemRevenueCoins)}</span>
              </div>
              <div className="flex justify-between pl-3 text-[11px] text-muted-foreground">
                <span>• Từ Membership:</span>
                <span>{formatCoins(data.revenue.membershipSystemRevenueCoins)}</span>
              </div>
              <div className="flex justify-between border-t border-border/10 pt-2">
                <span className="text-muted-foreground">Đang xử lý (Pending):</span>
                <span>{formatCoins(data.revenue.pendingSystemRevenueCoins)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Đã ghi nhận (Released):</span>
                <span>{formatCoins(data.revenue.releasedSystemRevenueCoins)}</span>
              </div>
            </div>
          </div>

          {/* Deposits Panel */}
          <div className="rounded-lg border border-border/20 bg-background/30 p-5">
            <h3 className="mb-4 font-headline text-xs font-bold uppercase tracking-widest text-zinc-300 border-b border-border/10 pb-2">Deposits (Nạp tiền)</h3>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tổng số lệnh nạp:</span>
                <span className="font-bold text-foreground">{formatNumber(data.deposits.totalCount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Đã hoàn thành:</span>
                <span className="font-bold text-emerald-400">{formatNumber(data.deposits.completedCount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Đang xử lý/Chờ duyệt:</span>
                <span>{formatNumber(data.deposits.pendingCount + data.deposits.processingCount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lỗi/Đã hủy:</span>
                <span>{formatNumber(data.deposits.failedCount + data.deposits.cancelledCount)}</span>
              </div>
              <div className="flex justify-between border-t border-border/10 pt-2 font-semibold">
                <span className="text-zinc-300">Doanh thu VNĐ:</span>
                <span className="font-bold text-emerald-400">{formatVND(data.deposits.completedMoneyAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quy đổi xu nạp:</span>
                <span>{formatCoins(data.deposits.completedCoinAmount)}</span>
              </div>
            </div>
          </div>

          {/* Withdrawals Panel */}
          <div className="rounded-lg border border-border/20 bg-background/30 p-5">
            <h3 className="mb-4 font-headline text-xs font-bold uppercase tracking-widest text-zinc-300 border-b border-border/10 pb-2">Withdrawals (Rút tiền)</h3>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tổng lệnh rút:</span>
                <span className="font-bold text-foreground">{formatNumber(data.withdrawals.totalCount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Đã rút thành công:</span>
                <span className="font-bold text-emerald-400">{formatNumber(data.withdrawals.completedCount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lệnh chờ duyệt (Pending):</span>
                <span className="text-amber-400 font-bold">{formatNumber(data.withdrawals.pendingCount)}</span>
              </div>
              <div className="flex justify-between border-t border-border/10 pt-2">
                <span className="text-muted-foreground">Tiền rút thành công:</span>
                <span className="font-bold text-foreground">{formatVND(data.withdrawals.completedMoneyAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tổng phí rút thu được:</span>
                <span className="font-bold text-secondary">{formatVND(data.withdrawals.totalFeeAmount)}</span>
              </div>
              <div className="flex justify-between pl-3 text-[11px] text-muted-foreground">
                <span>• Đã thu (Completed Fee):</span>
                <span>{formatVND(data.withdrawals.completedFeeAmount)}</span>
              </div>
              <div className="flex justify-between pl-3 text-[11px] text-muted-foreground">
                <span>• Chờ thu (Pending Fee):</span>
                <span>{formatVND(data.withdrawals.pendingFeeAmount)}</span>
              </div>
            </div>
          </div>

          {/* Ledger & Transactions Panel */}
          <div className="rounded-lg border border-border/20 bg-background/30 p-5">
            <h3 className="mb-4 font-headline text-xs font-bold uppercase tracking-widest text-zinc-300 border-b border-border/10 pb-2">Ledger (Sổ cái giao dịch)</h3>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tổng Ledger:</span>
                <span className="font-bold text-foreground">{formatNumber(data.transactions.totalCount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hoàn thành / Thất bại:</span>
                <span>{formatNumber(data.transactions.completedCount)} / {formatNumber(data.transactions.failedCount)}</span>
              </div>
              <div className="flex justify-between border-t border-border/10 pt-2">
                <span className="text-muted-foreground">Dòng coin nạp:</span>
                <span>{formatCoins(data.transactions.depositCoinAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dòng coin rút:</span>
                <span>{formatCoins(data.transactions.withdrawalCoinAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mua Video / Membership:</span>
                <span>{formatCoins(data.transactions.videoPurchaseCoins)} / {formatCoins(data.transactions.membershipCoins)}</span>
              </div>
            </div>
          </div>

          {/* Wallets & Balances Panel */}
          <div className="rounded-lg border border-border/20 bg-background/30 p-5 lg:col-span-2">
            <h3 className="mb-4 font-headline text-xs font-bold uppercase tracking-widest text-zinc-300 border-b border-border/10 pb-2">Wallets Snapshot (Số dư ví hiện tại)</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2.5 font-mono text-xs border-r border-border/10 pr-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tổng số ví User:</span>
                  <span className="font-bold text-foreground">{formatNumber(data.wallets.userWalletCount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ví có phát sinh GD:</span>
                  <span>{formatNumber(data.wallets.activeUserWalletCount)}</span>
                </div>
                <div className="flex justify-between border-t border-border/10 pt-2">
                  <span className="text-muted-foreground">Khả dụng của User:</span>
                  <span className="font-bold text-foreground">{formatCoins(data.wallets.totalUserAvailableBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bị đóng băng (Frozen):</span>
                  <span className="text-primary">{formatCoins(data.wallets.totalUserFrozenBalance)}</span>
                </div>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Khả dụng ví Hệ thống:</span>
                  <span className="font-bold text-emerald-400">{formatCoins(data.wallets.systemRevenueAvailableBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bị đóng băng (System):</span>
                  <span>{formatCoins(data.wallets.systemRevenueFrozenBalance)}</span>
                </div>
                <div className="mt-4 rounded-sm border border-secondary/20 bg-secondary/5 p-2 text-[10px] text-secondary">
                  <span>* Snapshot thời gian thực tại thời điểm xem, không phụ thuộc vào bộ lọc khoảng ngày.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function DataSourcesPanel({ data }: { data: AdminDashboardData }) {
  const readyCount = data.dataSources.filter(source => source.status === "ready").length;

  return (
    <section className="overflow-hidden rounded-lg border border-border/30 bg-card">
      <div className="flex flex-col gap-2 border-b border-border/30 bg-background px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-headline text-lg font-bold text-foreground">Data Contract Status</h2>
          <p className="font-body text-xs text-muted-foreground">{readyCount} of {data.dataSources.length} sources are backed by confirmed APIs.</p>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          Loaded {new Date(data.loadedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
      <div className="divide-y divide-border/30">
        {data.dataSources.map((source, index) => (
          <div key={`${source.key}-${index}`} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-headline text-sm font-bold text-foreground">{source.label}</p>
              <p className="mt-0.5 font-body text-xs text-muted-foreground">{source.message}</p>
            </div>
            <span className={`shrink-0 rounded-sm border px-2 py-0.5 font-label text-[9px] font-bold uppercase tracking-widest ${source.status === "ready" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-border/30 bg-muted text-muted-foreground"}`}>
              {source.status === "ready" ? "Ready" : "API Needed"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function PriorityActions({ actions }: { actions: AdminPriorityAction[] }) {
  return (
    <section className="rounded-lg border border-border/30 bg-card p-6">
      <h2 className="mb-4 font-label text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border/10 pb-2">Priority Actions</h2>
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
