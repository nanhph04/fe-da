"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/shared/api/client";
import { WithdrawalService } from "../services/withdrawalService";
import type { Withdrawal, WithdrawalHistoryResponse } from "../types/withdrawal.types";
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
  const [history, setHistory] = useState<WithdrawalHistoryResponse>(initialHistory);
  const [allWithdrawals, setAllWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPayouts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await WithdrawalService.getWithdrawalHistory({
        status: "ALL",
        page: 1,
        limit: 10,
      });
      const summaryResponse = await WithdrawalService.getWithdrawalHistory({
        status: "ALL",
        page: 1,
        limit: Number.MAX_SAFE_INTEGER,
      });

      setHistory(response);
      setAllWithdrawals(summaryResponse.withdrawals);
    } catch (err) {
      setError(getErrorMessage(err, "Không thể tải lịch sử payout."));
      setHistory(initialHistory);
      setAllWithdrawals([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPayouts();
  }, [loadPayouts]);

  const pendingTotal = allWithdrawals
    .filter(withdrawal => withdrawal.status === "pending")
    .reduce((total, withdrawal) => total + withdrawal.coinAmount, 0);
  const completedTotal = allWithdrawals
    .filter(withdrawal => withdrawal.status === "completed")
    .reduce((total, withdrawal) => total + withdrawal.coinAmount, 0);

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
          Loading withdrawal history...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6">
        <p className="font-headline text-lg font-bold text-foreground">Không thể tải payout</p>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Button
          type="button"
          onClick={loadPayouts}
          className="mt-5 rounded-sm bg-primary px-5 font-headline text-xs font-bold uppercase tracking-widest text-primary-foreground hover:opacity-90"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Pending" value={`${pendingTotal.toLocaleString()} AC`} />
        <SummaryCard label="Completed" value={`${completedTotal.toLocaleString()} AC`} />
        <SummaryCard label="Records" value={allWithdrawals.length.toLocaleString()} />
      </div>

      <PayoutHistory
        initialItems={history.withdrawals}
        initialPagination={history.pagination}
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
