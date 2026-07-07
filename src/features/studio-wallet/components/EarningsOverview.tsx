"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Wallet,
  TrendingUp,
  Eye,
  Film,
  Clock,
  CheckCircle2,
  Landmark,
  Loader2,
  AlertCircle
} from "lucide-react";
import type { EarningsSummary, MonthlyEarnings } from "../types/earnings.types";
import { EarningsService } from "../services/earningsService";

interface EarningsOverviewProps {
  initialSummary?: EarningsSummary;
  initialMonthly?: MonthlyEarnings;
}

const formatCoin = (value: number) => {
  return `${new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(value)} Coin`;
};

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
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-border/20 bg-black/40 backdrop-blur-xl">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 animate-pulse font-headline tracking-widest text-muted-foreground uppercase text-sm">
          {t("wallet.analytics.loading")}
        </p>
      </div>
    );
  }

  if (error || !summary || !monthly) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 backdrop-blur-xl p-8 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <p className="font-headline text-lg font-bold text-destructive-foreground">
          {error || t("wallet.analytics.empty")}
        </p>
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/20 bg-gradient-to-b from-zinc-900/90 to-black p-8 shadow-2xl backdrop-blur-2xl">
      {/* Subtle Background Glow */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-500/5 blur-[120px]" />

      <div className="relative z-10 mb-10">
        <h2 className="font-headline text-3xl font-black tracking-tight text-white md:text-4xl">
          {t("wallet.analytics.overview")}
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          {t("wallet.analytics.sub")}
        </p>
      </div>

      <div className="relative z-10 grid gap-5 md:grid-cols-4 mb-5">
        <MetricCard
          label={t("wallet.analytics.metrics.total")}
          value={formatCoin(summary.totalEarnings)}
          icon={<Wallet className="h-5 w-5" />}
          primary
        />
        <MetricCard
          label={t("wallet.analytics.metrics.monthly")}
          value={formatCoin(monthly.payoutAmount)}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <MetricCard
          label={t("wallet.analytics.metrics.views")}
          value={summary.totalViews.toLocaleString()}
          icon={<Eye className="h-5 w-5" />}
        />
        <MetricCard
          label={t("wallet.analytics.metrics.videos")}
          value={summary.totalVideos.toLocaleString()}
          icon={<Film className="h-5 w-5" />}
        />
      </div>

      <div className="relative z-10 grid gap-5 md:grid-cols-3">
        <MetricCard
          label={t("wallet.analytics.metrics.pending")}
          value={formatCoin(summary.pendingEarnings)}
          icon={<Clock className="h-5 w-5" />}
          tone="amber"
        />
        <MetricCard
          label={t("wallet.analytics.metrics.confirmed")}
          value={formatCoin(summary.confirmedEarnings)}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="gold"
        />
        <MetricCard
          label={t("wallet.analytics.metrics.paid")}
          value={formatCoin(summary.paidEarnings)}
          icon={<Landmark className="h-5 w-5" />}
          tone="green"
        />
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  icon,
  tone = "default",
  primary = false,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  tone?: "default" | "amber" | "gold" | "green";
  primary?: boolean;
}) {
  const getToneStyles = () => {
    if (primary) {
      return "border-primary/40 bg-gradient-to-br from-primary/20 to-primary/5 text-primary-foreground shadow-[0_0_30px_-10px_rgba(229,9,20,0.3)]";
    }
    switch (tone) {
      case "amber":
        return "border-[#fcbf49]/20 bg-gradient-to-br from-[#fcbf49]/10 to-transparent text-[#fcbf49]";
      case "gold":
        return "border-[#e9c46a]/20 bg-gradient-to-br from-[#e9c46a]/10 to-transparent text-[#e9c46a]";
      case "green":
        return "border-[#7bd389]/20 bg-gradient-to-br from-[#7bd389]/10 to-transparent text-[#7bd389]";
      default:
        return "border-white/10 bg-white/5 text-white";
    }
  };

  const getIconColor = () => {
    if (primary) return "text-primary";
    switch (tone) {
      case "amber": return "text-[#fcbf49]";
      case "gold": return "text-[#e9c46a]";
      case "green": return "text-[#7bd389]";
      default: return "text-zinc-400";
    }
  };

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl ${getToneStyles()}`}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
          {label}
        </p>
        {icon && (
          <div className={`transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${getIconColor()}`}>
            {icon}
          </div>
        )}
      </div>
      <p className={`font-headline text-2xl font-extrabold tracking-tight sm:text-3xl ${primary ? "text-white" : ""}`}>
        {value}
      </p>
      
      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-700 ease-out group-hover:translate-x-[150%] group-hover:opacity-100" />
    </div>
  );
}

export default EarningsOverview;

