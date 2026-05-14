import type { EarningsTrendPoint, StudioDashboardRange } from "../types/studio-dashboard.types";

interface EarningsGraphProps {
  points: EarningsTrendPoint[];
  dateRange: StudioDashboardRange;
  isLoading?: boolean;
}

function buildChartPath(points: EarningsTrendPoint[]) {
  if (points.length === 0) {
    return { line: "", area: "" };
  }

  if (points.length === 1) {
    return { line: "M0,150 L1000,150", area: "M0,150 L1000,150 V300 H0 Z" };
  }

  const maxValue = Math.max(...points.map(point => point.value), 1);
  const step = 1000 / (points.length - 1);
  const coordinates = points.map((point, index) => {
    const x = index * step;
    const y = 280 - (point.value / maxValue) * 240;
    return `${x.toFixed(2)},${Math.max(20, y).toFixed(2)}`;
  });

  const line = `M${coordinates.join(" L")}`;
  const area = `${line} V300 H0 Z`;
  return { line, area };
}

export function EarningsGraph({ points, isLoading = false, dateRange }: EarningsGraphProps) {
  const chartPath = buildChartPath(points);
  const visibleLabels = points.length > 0
    ? points.filter((_, index) => index === 0 || index === points.length - 1 || index === Math.floor(points.length / 2))
    : [];

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-sm border border-border/30 bg-card p-8">
      <div className="mb-12 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-headline text-xl font-bold text-foreground">Earnings Growth</h2>
          <p className="mt-1 text-sm text-muted-foreground">Aura Coins trend from live earnings API</p>
        </div>
        <span className="rounded-sm border border-border/30 bg-background px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-foreground">
          Last {dateRange === "7D" ? "7" : "30"} days
        </span>
      </div>

      <div className="relative mt-auto h-64 w-full">
        {isLoading ? (
          <div className="h-full w-full rounded-sm bg-muted" />
        ) : points.length > 0 ? (
          <>
            <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 1000 300" aria-label="Earnings trend chart">
              <defs>
                <linearGradient id="studio-dashboard-gradient-chart" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={chartPath.line} fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4" className="text-primary" />
              <path d={chartPath.area} fill="url(#studio-dashboard-gradient-chart)" className="text-primary" />
            </svg>
            <div className="absolute bottom-0 flex w-full justify-between px-1 text-[10px] font-bold text-muted-foreground">
              {visibleLabels.map(point => <span key={`${point.label}-${point.value}`}>{point.label}</span>)}
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-sm border border-dashed border-border/40 bg-background/60 text-center">
            <span className="material-symbols-outlined text-4xl text-muted-foreground">monitoring</span>
            <p className="mt-3 font-headline text-sm font-bold text-foreground">No earnings trend yet</p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">The chart will appear after the earnings analytics API returns trend data.</p>
          </div>
        )}
      </div>
    </div>
  );
}
