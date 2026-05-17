import { VideoEarning } from "../types/studio-wallet.types";

interface EarningsChartProps {
  earnings: VideoEarning[];
}

export function EarningsChart({ earnings }: EarningsChartProps) {
  const hasData = earnings.length > 0;

  // Placeholder for chart implementation
  // Could use libraries like Chart.js, Recharts, or custom SVG

  return (
    <div className="bg-[var(--color-border-700)] rounded-xl p-6 h-64 flex items-center justify-center">
      <div className="text-center text-muted-foreground">
        <div className="text-3xl mb-2">📊</div>
        <p>Earnings Chart</p>
        <p className="text-sm">
          {hasData ? "Chart library will be implemented here" : "No earnings data available yet"}
        </p>
      </div>
    </div>
  );
}
