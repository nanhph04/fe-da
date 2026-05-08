"use client";

import { useEffect, useRef, useState } from "react";
import type { EarningsSummary, MonthlyEarnings } from "../types/earnings.types";
import { EarningsService } from "../services/earningsService";

interface EarningsOverviewProps {
  initialSummary?: EarningsSummary;
  initialMonthly?: MonthlyEarnings;
}

export function EarningsOverview({
  initialSummary,
  initialMonthly,
}: EarningsOverviewProps) {
  const [summary, setSummary] = useState<EarningsSummary | null>(initialSummary ?? null);
  const [monthly, setMonthly] = useState<MonthlyEarnings | null>(initialMonthly ?? null);
  const [loading, setLoading] = useState(!initialSummary || !initialMonthly);
  const [error, setError] = useState<string | null>(null);
  const skipInitialFetchRef = useRef(Boolean(initialSummary && initialMonthly));

  useEffect(() => {
    if (skipInitialFetchRef.current) {
      skipInitialFetchRef.current = false;
      return;
    }

    const loadOverview = async () => {
      setLoading(true);
      setError(null);

      try {
        const now = new Date();
        const [nextSummary, nextMonthly] = await Promise.all([
          EarningsService.getEarningsSummary(),
          EarningsService.getMonthlyEarnings(now.getFullYear(), now.getMonth() + 1),
        ]);

        setSummary(nextSummary);
        setMonthly(nextMonthly);
      } catch {
        setError("Failed to load earnings overview.");
      } finally {
        setLoading(false);
      }
    };

    void loadOverview();
  }, []);

  if (loading) {
    return (
      <div className="rounded-md border border-zinc-800 bg-zinc-950/80 p-6 text-zinc-400">
        Loading earnings overview...
      </div>
    );
  }

  if (error || !summary || !monthly) {
    return (
      <div className="rounded-md border border-[#4d1117] bg-[#220b0f] p-6 text-sm text-[#f7d7db]">
        {error || "No earnings data available."}
      </div>
    );
  }

  return (
    <section className="space-y-6 rounded-md border border-zinc-800 bg-zinc-950/80 p-6">
      <div>
        <h2 className="font-headline text-2xl font-bold text-white">Earnings Overview</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Current revenue performance and payout readiness.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Total earnings" value={`$${summary.totalEarnings.toFixed(2)}`} />
        <MetricCard label="Monthly payout" value={`$${monthly.payoutAmount.toFixed(2)}`} />
        <MetricCard label="Total views" value={summary.totalViews.toLocaleString()} />
        <MetricCard label="Videos earning" value={summary.totalVideos.toLocaleString()} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Pending earnings" value={`$${summary.pendingEarnings.toFixed(2)}`} tone="amber" />
        <MetricCard label="Confirmed earnings" value={`$${summary.confirmedEarnings.toFixed(2)}`} tone="gold" />
        <MetricCard label="Paid earnings" value={`$${summary.paidEarnings.toFixed(2)}`} tone="green" />
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "amber" | "gold" | "green";
}) {
  const toneClass =
    tone === "amber"
      ? "text-[#fcbf49]"
      : tone === "gold"
        ? "text-[#e9c46a]"
        : tone === "green"
          ? "text-[#7bd389]"
          : "text-white";

  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-900/70 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p className={`mt-3 text-2xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

export default EarningsOverview;
