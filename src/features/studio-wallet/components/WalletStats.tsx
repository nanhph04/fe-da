'use client';

import type { WalletStats as StudioWalletStats } from '../types/studio-wallet.types';

interface WalletStatsProps {
  stats: StudioWalletStats;
}

export function WalletStats({ stats }: WalletStatsProps) {
  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        label="Monthly Earnings"
        value={`$${(stats.monthlyEarnings ?? stats.totalBalance).toFixed(2)}`}
        tone="green"
        helper={`${(stats.monthlyGrowth ?? 0).toFixed(1)}% vs last month`}
      />
      <MetricCard
        label="Total Views"
        value={formatNumber(stats.totalViews)}
        tone="blue"
        helper="All time views"
      />
      <MetricCard
        label="Total Likes"
        value={formatNumber(stats.totalLikes ?? 0)}
        tone="red"
        helper="Engagement snapshot"
      />
      <MetricCard
        label="Top Video Revenue"
        value={`$${stats.topPerformingVideo?.revenue?.toFixed(2) ?? "0.00"}`}
        tone="gold"
        helper={stats.topPerformingVideo?.title || "No top video yet"}
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string;
  value: string;
  helper: string;
  tone: "green" | "blue" | "red" | "gold";
}) {
  const toneClass =
    tone === "green"
      ? "text-green-400"
      : tone === "blue"
        ? "text-blue-400"
        : tone === "red"
          ? "text-red-400"
          : "text-[#fcbf49]";

  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950/80 p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p className={`mt-3 text-3xl font-bold ${toneClass}`}>{value}</p>
      <p className="mt-2 text-sm text-zinc-500">{helper}</p>
    </div>
  );
}
