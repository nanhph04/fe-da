"use client";

import { useEffect, useState } from "react";
import { WithdrawalService } from "../services/withdrawalService";
import type { Withdrawal } from "../types/withdrawal.types";
import { formatCurrency, formatDate } from "@/shared/utils/formatters";

export function RecentPayouts() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const data = await WithdrawalService.getWithdrawalHistory({
          status: "ALL",
          page: 1,
          limit: 5,
        });
        setWithdrawals(data.withdrawals.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch withdrawals:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchWithdrawals();
  }, []);

  if (loading) {
    return (
      <div className="bg-card border border-[var(--color-border-700)] rounded-lg p-8">
        <div className="h-32 bg-card border border-[var(--color-border-700)] rounded-lg animate-pulse" />
      </div>
    );
  }

  if (withdrawals.length === 0) {
    return (
      <div className="bg-card border border-[var(--color-border-700)] rounded-lg p-8 text-center">
        <p className="text-muted-foreground">No withdrawal history</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-[var(--color-border-700)] rounded-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-headline text-foreground">
          Recent Withdrawals
        </h2>
      </div>

      <div className="space-y-4">
        {withdrawals.map((withdrawal) => (
          <WithdrawalRow key={withdrawal.id} withdrawal={withdrawal} />
        ))}
      </div>
    </div>
  );
}

interface WithdrawalRowProps {
  withdrawal: Withdrawal;
}

function WithdrawalRow({ withdrawal }: WithdrawalRowProps) {
  const getStatusColor = (status: Withdrawal["status"]) => {
    switch (status) {
      case "pending":
      case "approved":
      case "processing":
        return "text-[var(--color-secondary-700)]";
      case "completed":
        return "text-[#22c55e]";
      case "rejected":
        return "text-[#ef4444]";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="bg-[var(--color-border-700)] rounded-lg p-4 hover:bg-accent transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <span className="material-symbols-outlined text-[var(--color-primary-600)] text-xl">
              account_balance
            </span>
            <span className="font-medium text-foreground truncate">
              {withdrawal.bankInfo.bankName}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDate(withdrawal.requestedAt)}
          </p>
        </div>

        <div className="text-right">
          <div className="font-bold text-foreground">
            {formatCurrency(withdrawal.coinAmount)} AC
          </div>
          <div className={`text-sm font-medium ${getStatusColor(withdrawal.status)}`}>
            {withdrawal.status.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}
