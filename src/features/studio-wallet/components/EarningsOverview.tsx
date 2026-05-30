"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("Studio");
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
        setError(t("wallet.analytics.error"));
      } finally {
        setLoading(false);
      }
    };

    void loadOverview();
  }, [t]);

  if (loading) {
    return (
      <div className="rounded-md border border-border bg-background/80 p-6 text-muted-foreground">
        {t("wallet.analytics.loading")}
      </div>
    );
  }

  if (error || !summary || !monthly) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive-foreground">
        {error || t("wallet.analytics.empty")}
      </div>
    );
  }

  return (
    <section className="space-y-6 rounded-md border border-border bg-background/80 p-6">
      <div>
        <h2 className="font-headline text-2xl font-bold text-foreground">{t("wallet.analytics.overview")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("wallet.analytics.sub")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label={t("wallet.analytics.metrics.total")} value={`$${summary.totalEarnings.toFixed(2)}`} />
        <MetricCard label={t("wallet.analytics.metrics.monthly")} value={`$${monthly.payoutAmount.toFixed(2)}`} />
        <MetricCard label={t("wallet.analytics.metrics.views")} value={summary.totalViews.toLocaleString()} />
        <MetricCard label={t("wallet.analytics.metrics.videos")} value={summary.totalVideos.toLocaleString()} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label={t("wallet.analytics.metrics.pending")} value={`$${summary.pendingEarnings.toFixed(2)}`} tone="amber" />
        <MetricCard label={t("wallet.analytics.metrics.confirmed")} value={`$${summary.confirmedEarnings.toFixed(2)}`} tone="gold" />
        <MetricCard label={t("wallet.analytics.metrics.paid")} value={`$${summary.paidEarnings.toFixed(2)}`} tone="green" />
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
      : "text-foreground";

  return (
    <div className="rounded-md border border-border bg-accent/70 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className={`mt-3 text-2xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

export default EarningsOverview;

