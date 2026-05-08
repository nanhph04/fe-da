import { VideoEarning } from "../types/studio-wallet.types";

interface EarningsChartProps {
  earnings: VideoEarning[];
}

export function EarningsChart({ earnings }: EarningsChartProps) {
  // Placeholder for chart implementation
  // Could use libraries like Chart.js, Recharts, or custom SVG

  return (
    <div className="bg-[var(--color-border-700)] rounded-xl p-6 h-64 flex items-center justify-center">
      <div className="text-center text-zinc-400">
        <div className="text-3xl mb-2">📊</div>
        <p>Earnings Chart</p>
        <p className="text-sm">Chart library will be implemented here</p>
      </div>
    </div>
  );
}