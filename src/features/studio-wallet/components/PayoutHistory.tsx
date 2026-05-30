"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/shared/api/client";
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
  onHistoryChanged?: () => void;
}

export function PayoutHistory({
  className = "",
  initialItems = [],
  initialPagination,
  onHistoryChanged,
}: PayoutHistoryProps) {
  const t = useTranslations("Studio");
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
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [confirmingCancelId, setConfirmingCancelId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
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
        setError(t("wallet.history.table.errorLoad"));
      } finally {
        setIsLoading(false);
      }
    };

    void loadHistory();
  }, [filters, t]);

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

  const handleCancelWithdrawal = async (withdrawalId: string) => {
    setCancellingId(withdrawalId);
    setCancelError(null);

    try {
      const cancelledWithdrawal = await WithdrawalService.cancelWithdrawal(withdrawalId);
      setItems(previous =>
        previous.map(item => (item.id === withdrawalId ? cancelledWithdrawal : item))
      );
      setConfirmingCancelId(null);
      onHistoryChanged?.();
    } catch (err) {
      setCancelError(getErrorMessage(err, t("wallet.history.table.errorCancel")));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <section className={`rounded-lg border border-border/30 bg-card p-6 ${className}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-headline text-2xl font-bold text-foreground">{t("wallet.history.title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("wallet.history.description")}
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
      {cancelError ? <p className="mt-4 text-sm text-red-300">{cancelError}</p> : null}

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border text-muted-foreground">
            <tr>
              <th className="pb-3 pr-4 font-medium">{t("wallet.history.table.requested")}</th>
              <th className="pb-3 pr-4 font-medium">{t("wallet.history.table.bank")}</th>
              <th className="pb-3 pr-4 font-medium">{t("wallet.history.table.coinAmount")}</th>
              <th className="pb-3 pr-4 font-medium">{t("wallet.history.table.moneyAmount")}</th>
              <th className="pb-3 pr-4 font-medium">{t("wallet.history.table.status")}</th>
              <th className="pb-3 pr-4 text-right font-medium">{t("wallet.history.table.action")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="py-6 text-muted-foreground" colSpan={6}>
                  {t("wallet.history.table.loading")}
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="py-6 text-muted-foreground" colSpan={6}>
                  {t("wallet.history.table.empty")}
                </td>
              </tr>
            ) : (
              items.map(item => {
                const canCancel = item.status === "pending";
                const isConfirming = confirmingCancelId === item.id;
                const isCancelling = cancellingId === item.id;

                return (
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
                    <td className="py-4 pr-4 text-right">
                      {canCancel ? (
                        isConfirming ? (
                          <div className="flex min-w-56 flex-col items-end gap-2">
                            <span className="text-xs text-muted-foreground">{t("wallet.history.table.cancelConfirm")}</span>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={isCancelling}
                                onClick={() => setConfirmingCancelId(null)}
                                className="rounded-sm text-muted-foreground hover:text-foreground"
                              >
                                {t("wallet.history.table.keep")}
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                disabled={isCancelling}
                                onClick={() => void handleCancelWithdrawal(item.id)}
                                className="rounded-sm border border-destructive/40 bg-destructive/15 font-headline text-xs font-bold uppercase tracking-widest text-destructive hover:bg-destructive/25"
                              >
                                {isCancelling ? t("wallet.history.table.cancelling") : t("wallet.history.table.confirm")}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={Boolean(cancellingId)}
                            onClick={() => {
                              setCancelError(null);
                              setConfirmingCancelId(item.id);
                            }}
                            className="rounded-sm border-destructive/40 bg-transparent font-headline text-xs font-bold uppercase tracking-widest text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            {t("wallet.history.table.cancel")}
                          </Button>
                        )
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {t("wallet.history.pagination.page", { page: pagination.page, totalPages: pagination.totalPages })}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              {t("wallet.history.pagination.previous")}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              {t("wallet.history.pagination.next")}
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

