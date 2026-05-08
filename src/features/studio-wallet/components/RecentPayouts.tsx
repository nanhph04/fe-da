"use client";

import { useState, useEffect } from "react";
import { PayoutService } from "../services/payoutService";
import type { Payout } from "../types/payout.types";
import { formatCurrency, formatDate } from "@/shared/utils/formatters";

export function RecentPayouts() {
  const [withdrawals, setWithdrawals] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const data = await PayoutService.getPayoutHistory({
        status: "ALL",
        page: 1,
        limit: 5,
      });
      setWithdrawals(data.payouts.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch withdrawals:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#131315] border border-[var(--color-border-700)] rounded-xl p-8">
        <div className="h-32 bg-[#131315] border border-[var(--color-border-700)] rounded-xl animate-pulse" />
      </div>
    );
  }

  if (withdrawals.length === 0) {
    return (
      <div className="bg-[#131315] border border-[var(--color-border-700)] rounded-xl p-8 text-center">
        <p className="text-zinc-400">No withdrawal history</p>
      </div>
    );
  }

  return (
    <div className="bg-[#131315] border border-[var(--color-border-700)] rounded-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-headline text-white">
          Recent Payouts
        </h2>
        <button className="text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {withdrawals.map((withdrawal) => (
          <WithdrawalRow key={withdrawal.id} withdrawal={withdrawal} />
        ))}
      </div>

      {/* Withdraw CTA */}
      <div className="mt-8 pt-6 border-t border-[var(--color-border-700)]">
        <button className="w-full px-8 py-3 bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)]
                  text-black font-bold font-headline text-sm
                  rounded-lg shadow-lg shadow-[var(--color-primary-600)]/20
                  transition-all disabled:opacity-50">
          Request Withdrawal
        </button>
      </div>
    </div>
  );
}

interface WithdrawalRowProps {
  withdrawal: Payout;
}

function WithdrawalRow({ withdrawal }: WithdrawalRowProps) {
  const getStatusColor = (status: Payout["status"]) => {
    switch (status) {
      case "PENDING":
        return "text-[var(--color-secondary-700)]"; // amber
      case "PROCESSING":
        return "text-[#3b82f6]"; // blue
      case "COMPLETED":
        return "text-[#22c55e]"; // green
      case "FAILED":
        return "text-[#ef4444]"; // red
      default:
        return "text-zinc-400";
    }
  };

  const getStatusText = (status: Payout["status"]) => {
    switch (status) {
      case "PENDING":
        return "Pending Approval";
      case "PROCESSING":
        return "Processing";
      case "COMPLETED":
        return "Completed";
      case "FAILED":
        return "Failed";
      default:
        return status;
    }
  };

  const getMethodText = (methodType: string) => {
    return methodType === "BANK_ACCOUNT" ? "Bank Transfer" : methodType;
  };

  return (
    <div className="bg-[var(--color-border-700)] rounded-lg p-4 hover:bg-[#2e2d30] transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-semibold text-white font-headline">
              {getMethodText(withdrawal.method.type)}
            </span>
            <span className="text-xs text-zinc-400">
              • {formatDate(withdrawal.requestedAt)}
            </span>
          </div>
          <p className="text-sm text-zinc-400 truncate">
            {withdrawal.description || "Payout request"}
          </p>
          {withdrawal.adminNote && (
            <p className="text-xs text-zinc-500 mt-1">
              Note: {withdrawal.adminNote}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-4 ml-4">
          <div className="text-right">
            <p className="text-lg font-bold font-headline text-white">
              {formatCurrency(withdrawal.netAmount)}
            </p>
            <p className="text-xs text-zinc-500">
              Fee: {formatCurrency(withdrawal.fee)}
            </p>
          </div>

          <div className="flex flex-col items-end">
            <span className={`text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
              {getStatusText(withdrawal.status)}
            </span>
            {withdrawal.status === "PENDING" && (
              <div className="w-2 h-2 bg-[var(--color-secondary-700)] rounded-full animate-pulse mt-1" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
