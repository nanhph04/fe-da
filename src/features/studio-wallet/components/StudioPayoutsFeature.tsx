"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/shared/api/client";
import { WithdrawalService } from "../services/withdrawalService";
import type { WithdrawalHistoryResponse, WithdrawalSummary } from "../types/withdrawal.types";
import { PayoutHistory } from "./PayoutHistory";

const initialHistory: WithdrawalHistoryResponse = {
  withdrawals: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

export function StudioPayoutsFeature() {
  const t = useTranslations("Studio");
  const [history, setHistory] = useState<WithdrawalHistoryResponse>(initialHistory);
  const [summary, setSummary] = useState<WithdrawalSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPayouts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [response, summaryResponse] = await Promise.all([
        WithdrawalService.getWithdrawalHistory({
          status: "ALL",
          page: 1,
          limit: 10,
        }),
        WithdrawalService.getWithdrawalSummary(),
      ]);

      setHistory(response);
      setSummary(summaryResponse);
    } catch (err) {
      setError(getErrorMessage(err, t("wallet.payouts.error")));
      setHistory(initialHistory);
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadPayouts();
  }, [loadPayouts]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-3">
          {["pending", "completed", "records"].map(item => (
            <div key={item} className="rounded-md border border-border/40 bg-card p-5">
              <div className="h-3 w-24 rounded-sm bg-muted" />
              <div className="mt-3 h-8 w-32 rounded-sm bg-muted" />
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-border/30 bg-card p-6 text-sm text-muted-foreground">
          {t("wallet.payouts.loading")}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6">
        <p className="font-headline text-lg font-bold text-foreground">{t("wallet.payouts.error")}</p>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Button
          type="button"
          onClick={loadPayouts}
          className="mt-5 rounded-sm bg-primary px-5 font-headline text-xs font-bold uppercase tracking-widest text-primary-foreground hover:opacity-90"
        >
          {t("wallet.payouts.retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label={t("wallet.payouts.summary.pending")} value={`${(summary?.pendingCoinAmount ?? 0).toLocaleString()} AC`} />
        <SummaryCard label={t("wallet.payouts.summary.completed")} value={`${(summary?.completedCoinAmount ?? 0).toLocaleString()} AC`} />
        <SummaryCard label={t("wallet.payouts.summary.records")} value={(history.pagination.total || summary?.completedCount || 0).toLocaleString()} />
      </div>

      <PayoutHistory
        initialItems={history.withdrawals}
        initialPagination={history.pagination}
        onHistoryChanged={loadPayouts}
      />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/40 bg-card p-5">
      <p className="font-label text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-3 font-headline text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

