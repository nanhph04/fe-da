"use client";

import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { getErrorMessage } from "@/shared/api/client";
import type { Withdrawal } from "@/features/wallet/types/wallet.types";

import { AdminWithdrawalService, type AdminWithdrawalSummary } from "../services/adminWithdrawalService";

const initialPagination = { page: 1, limit: 10, total: 0, totalPages: 0 };
type SummaryAccent = "secondary" | "danger";
type Translator = ReturnType<typeof useTranslations>;

function getIntlLocale(locale: string) {
  return locale === "en" ? "en-US" : "vi-VN";
}

function getStatusClass(status: string) {
  if (status === "approved" || status === "APPROVED" || status === "completed" || status === "COMPLETED") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  }

  if (status === "pending" || status === "PENDING") {
    return "border-secondary/30 bg-secondary/10 text-secondary";
  }

  return "border-primary/30 bg-primary/10 text-primary";
}

function getStatusLabel(status: string, t: Translator) {
  switch (status.toLowerCase()) {
    case "approved":
      return t("statuses.approved");
    case "cancelled":
      return t("statuses.cancelled");
    case "completed":
      return t("statuses.completed");
    case "pending":
      return t("statuses.pending");
    case "processing":
      return t("statuses.processing");
    case "rejected":
      return t("statuses.rejected");
    default:
      return status;
  }
}

function formatDate(value: string | null | undefined, locale: string, fallback: string) {
  if (!value) {
    return fallback;
  }

  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function buildSummary(
  summary: AdminWithdrawalSummary | null,
  t: Translator,
  numberFormatter: Intl.NumberFormat,
  currencyFormatter: Intl.NumberFormat
) {
  return [
    {
      label: t("summary.pendingRequests.label"),
      value: summary ? numberFormatter.format(summary.pendingCount) : "-",
      detail: summary ? currencyFormatter.format(summary.pendingMoneyAmount) : t("summary.unavailable"),
      icon: "pending_actions",
      accent: "secondary" as SummaryAccent,
    },
    {
      label: t("summary.completed30d.label"),
      value: summary ? currencyFormatter.format(summary.completed30dMoneyAmount) : "-",
      detail: t("summary.completed30d.detail"),
      icon: "account_balance",
      accent: "danger" as SummaryAccent,
    },
  ];
}

function getSummaryAccent(accent: SummaryAccent) {
  if (accent === "secondary") {
    return "border-l-secondary text-secondary";
  }

  return "border-l-primary text-primary";
}

export function PayoutManagementFeature() {
  const t = useTranslations("Admin.payouts");
  const locale = useLocale();
  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat(getIntlLocale(locale), {
      maximumFractionDigits: 0,
      style: "currency",
      currency: "VND",
    }),
    [locale]
  );
  const numberFormatter = useMemo(() => new Intl.NumberFormat(getIntlLocale(locale)), [locale]);
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
          setError(getErrorMessage(err, t("errors.loadFailed")));
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
  }, [t]);

  const payoutSummary = buildSummary(summary, t, numberFormatter, currencyFormatter);

  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-border/30 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-secondary">
            {t("header.eyebrow")}
          </p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">
            {t("header.title")}
          </h1>
          <p className="mt-2 max-w-2xl font-body text-sm text-muted-foreground">
            {t("header.description")}
          </p>
        </div>
        <span className="inline-flex items-center justify-center rounded-sm border border-border/40 bg-muted px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-foreground">
          {t("header.liveApi")}
        </span>
      </header>

      {error ? (
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-6 font-body text-sm text-primary">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
            <h2 className="font-headline text-lg font-bold text-foreground">{t("queue.title")}</h2>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {isLoading ? t("queue.loading") : t("queue.pendingCount", { count: pagination.total })}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border/30 bg-background text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-6 py-4">{t("table.requestId")}</th>
                <th className="px-6 py-4">{t("table.creator")}</th>
                <th className="px-6 py-4">{t("table.amount")}</th>
                <th className="px-6 py-4">{t("table.bank")}</th>
                <th className="px-6 py-4 text-center">{t("table.status")}</th>
                <th className="px-6 py-4 text-right">{t("table.actions")}</th>
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
                    {t("queue.empty")}
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="group transition-colors hover:bg-muted/40">
                    <td className="px-6 py-4 font-mono text-xs text-foreground">
                      {request.id}
                      <br />
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(request.requestedAt, locale, t("fallbacks.notAvailable"))}
                      </span>
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
                        {getStatusLabel(request.status, t)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/payouts/${request.id}`}
                        className="inline-flex items-center justify-center rounded-sm border border-border/40 bg-muted px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:border-secondary hover:text-secondary"
                      >
                        {request.status === "PENDING" || request.status === "pending" ? t("actions.review") : t("actions.receipt")}
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
