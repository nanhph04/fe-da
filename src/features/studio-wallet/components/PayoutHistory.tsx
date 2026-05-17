"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Withdrawal, WithdrawalHistoryFilters } from "../types/withdrawal.types";
import { WithdrawalService } from "../services/withdrawalService";

interface PayoutHistoryProps {
  className?: string;
  initialItems?: Withdrawal[];
  initialPagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function PayoutHistory({
  className = "",
  initialItems = [],
  initialPagination,
}: PayoutHistoryProps) {
  const [items, setItems] = useState<Withdrawal[]>(initialItems);
  const [pagination, setPagination] = useState(
    initialPagination ?? {
      page: 1,
      limit: 10,
      total: initialItems.length,
      totalPages: initialItems.length > 0 ? 1 : 0,
    }
  );
  const [filters, setFilters] = useState<WithdrawalHistoryFilters>({
    status: "ALL",
    page: initialPagination?.page ?? 1,
    limit: initialPagination?.limit ?? 10,
  });
  const [isLoading, setIsLoading] = useState(!initialPagination && initialItems.length === 0);
  const [error, setError] = useState<string | null>(null);
  const skipInitialFetchRef = useRef(Boolean(initialPagination) || initialItems.length > 0);

  useEffect(() => {
    if (skipInitialFetchRef.current) {
      skipInitialFetchRef.current = false;
      return;
    }

    const loadHistory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await WithdrawalService.getWithdrawalHistory(filters);
        setItems(response.withdrawals);
        setPagination(response.pagination);
      } catch {
        setError("Failed to load withdrawal history.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadHistory();
  }, [filters]);

  const handleStatusChange = (status: WithdrawalHistoryFilters["status"]) => {
    setFilters(previous => ({
      ...previous,
      status,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(previous => ({
      ...previous,
      page,
    }));
  };

  return (
    <section className={`rounded-lg border border-border/30 bg-card p-6 ${className}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-headline text-2xl font-bold text-foreground">Withdrawal History</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review withdrawal requests and processing states.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["ALL", "pending", "approved", "completed", "rejected", "cancelled"] as const).map(status => (
            <Button
              key={status}
              type="button"
              variant="outline"
              className={`rounded-md border-border ${
                filters.status === status
                  ? "bg-destructive/10 text-foreground"
                  : "bg-transparent text-muted-foreground hover:bg-accent"
              }`}
              onClick={() => handleStatusChange(status)}
            >
              {status.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border text-muted-foreground">
            <tr>
              <th className="pb-3 pr-4 font-medium">Requested</th>
              <th className="pb-3 pr-4 font-medium">Bank</th>
              <th className="pb-3 pr-4 font-medium">Coin Amount</th>
              <th className="pb-3 pr-4 font-medium">Money Amount</th>
              <th className="pb-3 pr-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="py-6 text-muted-foreground" colSpan={5}>
                  Loading withdrawal history...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="py-6 text-muted-foreground" colSpan={5}>
                  No withdrawal records found.
                </td>
              </tr>
            ) : (
              items.map(item => (
                <tr key={item.id} className="border-b border-border/80 text-zinc-200">
                  <td className="py-4 pr-4">{new Date(item.requestedAt).toLocaleDateString()}</td>
                  <td className="py-4 pr-4">{item.bankInfo.bankName}</td>
                  <td className="py-4 pr-4">{item.coinAmount.toLocaleString()} AC</td>
                  <td className="py-4 pr-4">{item.moneyAmount.toLocaleString()} VND</td>
                  <td className="py-4 pr-4">
                    <span className="rounded-sm border border-border px-2 py-1 text-xs uppercase tracking-wide text-foreground/80">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {pagination.page} / {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
