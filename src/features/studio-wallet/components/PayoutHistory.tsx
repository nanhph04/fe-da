"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Payout, PayoutHistoryFilters } from "../types/payout.types";
import { PayoutService } from "../services/payoutService";

interface PayoutHistoryProps {
  className?: string;
  initialItems?: Payout[];
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
  const [items, setItems] = useState<Payout[]>(initialItems);
  const [pagination, setPagination] = useState(
    initialPagination ?? {
      page: 1,
      limit: 10,
      total: initialItems.length,
      totalPages: initialItems.length > 0 ? 1 : 0,
    }
  );
  const [filters, setFilters] = useState<PayoutHistoryFilters>({
    status: "ALL",
    page: initialPagination?.page ?? 1,
    limit: initialPagination?.limit ?? 10,
  });
  const [isLoading, setIsLoading] = useState(initialItems.length === 0);
  const [error, setError] = useState<string | null>(null);
  const skipInitialFetchRef = useRef(initialItems.length > 0);

  useEffect(() => {
    if (skipInitialFetchRef.current) {
      skipInitialFetchRef.current = false;
      return;
    }

    const loadHistory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await PayoutService.getPayoutHistory(filters);
        setItems(response.payouts);
        setPagination(response.pagination);
      } catch {
        setError("Failed to load payout history.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadHistory();
  }, [filters]);

  const handleStatusChange = (status: PayoutHistoryFilters["status"]) => {
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
    <section className={`rounded-md border border-zinc-800 bg-zinc-950/80 p-6 ${className}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-headline text-2xl font-bold text-white">Payout History</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Review withdrawal requests and payout processing states.
          </p>
        </div>

        <div className="flex gap-2">
          {(["ALL", "PENDING", "PROCESSING", "COMPLETED", "FAILED"] as const).map(status => (
            <Button
              key={status}
              type="button"
              variant="outline"
              className={`rounded-md border-zinc-800 ${
                filters.status === status
                  ? "bg-[#2a0d12] text-white"
                  : "bg-transparent text-zinc-400 hover:bg-zinc-900"
              }`}
              onClick={() => handleStatusChange(status)}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-800 text-zinc-500">
            <tr>
              <th className="pb-3 pr-4 font-medium">Requested</th>
              <th className="pb-3 pr-4 font-medium">Method</th>
              <th className="pb-3 pr-4 font-medium">Amount</th>
              <th className="pb-3 pr-4 font-medium">Net</th>
              <th className="pb-3 pr-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="py-6 text-zinc-400" colSpan={5}>
                  Loading payout history...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="py-6 text-zinc-500" colSpan={5}>
                  No payout records found.
                </td>
              </tr>
            ) : (
              items.map(item => (
                <tr key={item.id} className="border-b border-zinc-900/80 text-zinc-200">
                  <td className="py-4 pr-4">{new Date(item.requestedAt).toLocaleDateString()}</td>
                  <td className="py-4 pr-4">
                    {item.method.bankInfo?.bankName || item.method.eWalletInfo?.provider || item.method.type}
                  </td>
                  <td className="py-4 pr-4">{item.amount.toLocaleString()} AC</td>
                  <td className="py-4 pr-4">{item.netAmount.toLocaleString()} AC</td>
                  <td className="py-4 pr-4">
                    <span className="rounded-sm border border-zinc-800 px-2 py-1 text-xs uppercase tracking-wide text-zinc-300">
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
        <div className="mt-6 flex items-center justify-between text-sm text-zinc-400">
          <span>
            Page {pagination.page} / {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-zinc-800 bg-transparent text-zinc-200 hover:bg-zinc-900"
              onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-zinc-800 bg-transparent text-zinc-200 hover:bg-zinc-900"
              onClick={() =>
                handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))
              }
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default PayoutHistory;
