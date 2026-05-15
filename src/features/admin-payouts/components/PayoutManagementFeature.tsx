"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getErrorMessage } from "@/shared/api/client";
import type { Withdrawal } from "@/features/wallet/types/wallet.types";

import { AdminWithdrawalService, type AdminWithdrawalSummary } from "../services/adminWithdrawalService";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
  style: "currency",
  currency: "VND",
});

const numberFormatter = new Intl.NumberFormat("en-US");
const initialPagination = { page: 1, limit: 10, total: 0, totalPages: 0 };

function getStatusClass(status: string) {
  if (status === "approved" || status === "APPROVED" || status === "completed" || status === "COMPLETED") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  }

  if (status === "pending" || status === "PENDING") {
    return "border-secondary/30 bg-secondary/10 text-secondary";
  }

  return "border-primary/30 bg-primary/10 text-primary";
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function buildSummary(summary: AdminWithdrawalSummary | null) {
  return [
    {
      label: "Pending Requests",
      value: summary ? numberFormatter.format(summary.pendingCount) : "-",
      detail: summary ? currencyFormatter.format(summary.pendingMoneyAmount) : "Finance service unavailable",
      icon: "pending_actions",
      accent: "secondary",
    },
    {
      label: "Approved / Processing",
      value: summary ? numberFormatter.format(summary.approvedCount + summary.processingCount) : "-",
      detail: summary ? `${numberFormatter.format(summary.pendingCoinAmount)} AC pending` : "Waiting for API response",
      icon: "task_alt",
      accent: "success",
    },
    {
      label: "Completed (30 Days)",
      value: summary ? currencyFormatter.format(summary.completed30dMoneyAmount) : "-",
      detail: "Real finance-service contract",
      icon: "account_balance",
      accent: "danger",
    },
  ] as const;
}

function getSummaryAccent(accent: ReturnType<typeof buildSummary>[number]["accent"]) {
  if (accent === "secondary") {
    return "border-l-secondary text-secondary";
  }

  if (accent === "success") {
    return "border-l-emerald-500 text-emerald-400";
  }

  return "border-l-primary text-primary";
}

export function PayoutManagementFeature() {
  const [summary, setSummary] = useState<AdminWithdrawalSummary | null>(null);
  const [requests, setRequests] = useState<Withdrawal[]>([]);
  const [pagination, setPagination] = useState(initialPagination);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadPayouts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [summaryData, listData] = await Promise.all([
          AdminWithdrawalService.getSummary(),
          AdminWithdrawalService.getWithdrawals({ status: "pending", page: 1, limit: 10 }),
        ]);

        if (!cancelled) {
          setSummary(summaryData);
          setRequests(listData.items);
          setPagination(listData.pagination);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, "Khong the tai danh sach payout."));
          setSummary(null);
          setRequests([]);
          setPagination(initialPagination);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadPayouts();

    return () => {
      cancelled = true;
    };
  }, []);

  const payoutSummary = buildSummary(summary);

  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-border/30 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-secondary">
            Finance Control
          </p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">
            Payout Management
          </h1>
          <p className="mt-2 max-w-2xl font-body text-sm text-muted-foreground">
            Review Aura Coin withdrawals before funds leave the platform treasury.
          </p>
        </div>
        <span className="inline-flex items-center justify-center rounded-sm border border-border/40 bg-muted px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-foreground">
          Live API
        </span>
      </header>

      {error ? (
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-6 font-body text-sm text-primary">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {payoutSummary.map((item) => (
          <article
            key={item.label}
            className={`relative overflow-hidden rounded-lg border border-border/30 border-l-4 bg-card p-6 ${getSummaryAccent(item.accent)}`}
          >
            <span className="material-symbols-outlined absolute right-4 top-4 text-6xl opacity-10" aria-hidden="true">
              {item.icon}
            </span>
            <p className="mb-2 font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {item.label}
            </p>
            <h2 className="font-headline text-4xl font-black tabular-nums text-foreground">{item.value}</h2>
            <p className="mt-1 font-mono text-xs">{item.detail}</p>
          </article>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-border/30 bg-card">
        <div className="flex items-center justify-between border-b border-border/30 bg-background px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary" aria-hidden="true">
              account_balance_wallet
            </span>
            <h2 className="font-headline text-lg font-bold text-foreground">Withdrawal Queue</h2>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {isLoading ? "Loading..." : `${pagination.total} pending requests`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border/30 bg-background text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-6 py-4">Request ID</th>
                <th className="px-6 py-4">Creator</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Bank</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4" colSpan={6}>
                      <div className="h-12 rounded-sm bg-muted/60" />
                    </td>
                  </tr>
                ))
              ) : requests.length === 0 ? (
                <tr>
                  <td className="px-6 py-12 text-center font-body text-sm text-muted-foreground" colSpan={6}>
                    Chua co lenh rut tien dang cho duyet.
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="group transition-colors hover:bg-muted/40">
                    <td className="px-6 py-4 font-mono text-xs text-foreground">
                      {request.id}
                      <br />
                      <span className="text-[10px] text-muted-foreground">{formatDate(request.requestedAt)}</span>
                    </td>
                    <td className="px-6 py-4 font-headline text-sm font-bold text-foreground">{request.userId}</td>
                    <td className="px-6 py-4">
                      <p className="font-headline font-bold text-secondary">{numberFormatter.format(request.coinAmount)} AC</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{currencyFormatter.format(request.moneyAmount)}</p>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                      {request.bankInfo.bankName}<br />{request.bankInfo.accountNumber}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`rounded-sm border px-2 py-0.5 font-label text-[10px] font-bold uppercase tracking-widest ${getStatusClass(request.status)}`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/payouts/${request.id}`}
                        className="inline-flex items-center justify-center rounded-sm border border-border/40 bg-muted px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:border-secondary hover:text-secondary"
                      >
                        {request.status === "PENDING" || request.status === "pending" ? "Review" : "Receipt"}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
