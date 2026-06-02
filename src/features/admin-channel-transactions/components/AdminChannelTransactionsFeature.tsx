"use client";

import { Link } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import { getErrorMessage } from "@/shared/api/client";
import type { ApiPagination } from "@/shared/api/types";

import { adminChannelTransactionsService } from "../services/adminChannelTransactionsService";
import type {
  AdminChannelTransactionsParams,
  AdminChannelTransactionsSummary,
  TransactionResponseDto,
} from "../types/admin-channel-transactions.types";

const initialPagination: ApiPagination = { page: 1, limit: 20, total: 0, totalPages: 0 };
const initialSummary: AdminChannelTransactionsSummary = {
  totalTransactions: 0,
  totalAmount: 0,
  completedAmount: 0,
  pendingAmount: 0,
  failedAmount: 0,
  creatorCoins: 0,
  systemCoins: 0,
};

const statusFilters = ["all", "completed", "pending", "failed", "cancelled"] as const;
const typeFilters = ["all", "video_purchase", "member_subscription", "channel_revenue", "system_revenue", "refund"] as const;

type Translator = ReturnType<typeof useTranslations>;
type SummaryTone = "default" | "secondary" | "success" | "danger";

function getIntlLocale(locale: string) {
  return locale === "en" ? "en-US" : "vi-VN";
}

function formatDate(value: string | null | undefined, locale: string, fallback: string) {
  if (!value) {
    return fallback;
  }

  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function normalizeText(value: string | null | undefined) {
  return (value || "").toLowerCase();
}

function getStatusClass(status: string) {
  const normalized = normalizeText(status);

  if (normalized === "completed") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  }

  if (normalized === "pending") {
    return "border-secondary/30 bg-secondary/10 text-secondary";
  }

  return "border-primary/30 bg-primary/10 text-primary";
}

function getStatusLabel(status: string, t: Translator) {
  const normalized = normalizeText(status);

  if (normalized === "completed" || normalized === "pending" || normalized === "failed" || normalized === "cancelled") {
    return t(`transactions.statuses.${normalized}`);
  }

  return status.replace(/_/g, " ");
}

function getTypeLabel(type: string, t: Translator) {
  const normalized = normalizeText(type);

  if (
    normalized === "video_purchase" ||
    normalized === "membership_purchase" ||
    normalized === "member_subscription" ||
    normalized === "channel_revenue" ||
    normalized === "system_revenue" ||
    normalized === "refund"
  ) {
    return t(`transactions.types.${normalized}`);
  }

  return type.replace(/_/g, " ");
}

function getAssetLabel(assetType: string) {
  return normalizeText(assetType) === "coin" ? "AC" : assetType.toUpperCase();
}

function getWalletLabel(kind: "from" | "to", transaction: TransactionResponseDto, t: Translator) {
  if (kind === "from") {
    return t("transactions.table.payerWallet");
  }

  if (transaction.type === "channel_revenue") {
    return t("transactions.table.channelWallet");
  }

  if (transaction.type === "system_revenue") {
    return t("transactions.table.systemWallet");
  }

  return t("transactions.table.receiverWallet");
}

function getServiceLabel(serviceType: unknown, t: Translator) {
  if (serviceType === "video") {
    return t("transactions.table.videoService");
  }

  if (serviceType === "membership") {
    return t("transactions.table.membershipService");
  }

  return typeof serviceType === "string" && serviceType.trim()
    ? serviceType.replace(/_/g, " ")
    : t("transactions.fallbacks.notAvailable");
}

function IdentityReveal({ label, value, t }: { label: string; value?: string | null; t: Translator }) {
  if (!value) {
    return <span className="text-muted-foreground">{t("transactions.table.noId")}</span>;
  }

  return (
    <details className="group/id max-w-[240px]" title={`${label}: ${value}`}>
      <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-sm border border-border/30 bg-muted/40 px-2 py-1 font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:border-secondary hover:text-secondary [&::-webkit-details-marker]:hidden">
        <span>{label}</span>
        <span className="material-symbols-outlined text-[13px]" aria-hidden="true">info</span>
      </summary>
      <code className="mt-1 block rounded-sm border border-border/30 bg-background px-2 py-1 font-mono text-[10px] leading-relaxed text-foreground break-all">
        {value}
      </code>
    </details>
  );
}

function getSummaryToneClass(tone: SummaryTone) {
  if (tone === "secondary") {
    return "border-l-secondary text-secondary";
  }

  if (tone === "success") {
    return "border-l-emerald-500 text-emerald-400";
  }

  if (tone === "danger") {
    return "border-l-primary text-primary";
  }

  return "border-l-border text-foreground";
}

function buildSummaryCards(summary: AdminChannelTransactionsSummary | null, t: Translator, numberFormatter: Intl.NumberFormat) {
  const current = summary ?? initialSummary;
  const formatCoins = (value: number) => `${numberFormatter.format(value)} AC`;

  return [
    {
      label: t("transactions.summary.totalTransactions"),
      value: numberFormatter.format(current.totalTransactions),
      detail: t("transactions.summary.totalAmount", { amount: formatCoins(current.totalAmount) }),
      icon: "receipt_long",
      tone: "default" as SummaryTone,
    },
    {
      label: t("transactions.summary.completed"),
      value: formatCoins(current.completedAmount),
      detail: t("transactions.summary.pending", { amount: formatCoins(current.pendingAmount) }),
      icon: "task_alt",
      tone: "success" as SummaryTone,
    },
    {
      label: t("transactions.summary.failed"),
      value: formatCoins(current.failedAmount),
      detail: t("transactions.summary.riskWindow"),
      icon: "error",
      tone: "danger" as SummaryTone,
    },
    {
      label: t("transactions.summary.split"),
      value: formatCoins(current.creatorCoins),
      detail: t("transactions.summary.systemCoins", { amount: formatCoins(current.systemCoins) }),
      icon: "call_split",
      tone: "secondary" as SummaryTone,
    },
  ];
}

export function AdminChannelTransactionsFeature() {
  const params = useParams();
  const channelParam = params.channelId;
  const channelId = Array.isArray(channelParam) ? channelParam[0] : channelParam;
  const t = useTranslations("Admin.channels");
  const locale = useLocale();
  const numberFormatter = useMemo(() => new Intl.NumberFormat(getIntlLocale(locale)), [locale]);
  const dateFallback = t("fallbacks.notRecorded");

  const [summary, setSummary] = useState<AdminChannelTransactionsSummary | null>(null);
  const [transactions, setTransactions] = useState<TransactionResponseDto[]>([]);
  const [pagination, setPagination] = useState<ApiPagination>(initialPagination);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryParams = useMemo<AdminChannelTransactionsParams>(
    () => ({
      page,
      limit: pagination.limit || 20,
      status: status === "all" ? undefined : status,
      type: type === "all" ? undefined : type,
      search: search || undefined,
    }),
    [page, pagination.limit, search, status, type]
  );

  const loadTransactions = useCallback(async () => {
    if (!channelId) {
      setError(t("transactions.errors.missingChannel"));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await adminChannelTransactionsService.getTransactions(channelId, queryParams);
      setTransactions(data.items);
      setSummary(data.summary);
      setPagination(data.pagination);
    } catch (err) {
      setError(getErrorMessage(err, t("transactions.errors.loadFailed")));
      setTransactions([]);
      setSummary(null);
      setPagination(initialPagination);
    } finally {
      setIsLoading(false);
    }
  }, [channelId, queryParams, t]);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const showingFrom = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const showingTo = Math.min(pagination.page * pagination.limit, pagination.total);
  const summaryCards = buildSummaryCards(summary, t, numberFormatter);

  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-border/30 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <Link
            href="/admin/channels"
            className="mb-4 inline-flex items-center gap-2 font-label text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-secondary"
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_back</span>
            {t("transactions.header.back")}
          </Link>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-secondary">
            {t("transactions.header.eyebrow")}
          </p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">
            {t("transactions.header.title")}
          </h1>
          <p className="mt-2 max-w-2xl font-body text-sm text-muted-foreground">
            {t("transactions.header.description", { channelId: channelId || "-" })}
          </p>
        </div>
        <span className="inline-flex items-center justify-center rounded-sm border border-border/40 bg-muted px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-foreground">
          {t("transactions.header.liveApi")}
        </span>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(item => (
          <article key={item.label} className={`group relative min-h-36 overflow-hidden rounded-lg border border-border/30 border-l-4 bg-card p-6 ${getSummaryToneClass(item.tone)}`}>
            <span className="material-symbols-outlined pointer-events-none absolute bottom-4 right-4 text-6xl opacity-10 transition-opacity group-hover:opacity-20" aria-hidden="true">
              {item.icon}
            </span>
            <div className="relative z-10 flex h-full flex-col justify-between gap-4">
              <p className="font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.label}</p>
              <div>
                <h2 className="font-headline text-4xl font-black leading-none tabular-nums text-foreground">{isLoading ? "-" : item.value}</h2>
                <p className="mt-3 max-w-[15rem] font-body text-xs leading-5 text-muted-foreground">{item.detail}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-border/30 bg-card">
        <div className="space-y-4 border-b border-border/30 bg-background px-6 py-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="font-headline text-lg font-bold text-foreground">{t("transactions.list.title")}</h2>
              <p className="mt-1 font-body text-xs text-muted-foreground">{t("transactions.list.description")}</p>
            </div>
            <form className="grid w-full gap-2 sm:grid-cols-[1fr_auto_auto_auto] xl:w-[52rem]" onSubmit={handleSearchSubmit}>
              <label className="sr-only" htmlFor="admin-channel-transactions-search">{t("transactions.filters.searchLabel")}</label>
              <input
                id="admin-channel-transactions-search"
                className="min-h-11 rounded-sm border border-border/30 bg-input px-3 py-2 font-body text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                placeholder={t("transactions.filters.searchPlaceholder")}
                value={searchInput}
                onChange={event => setSearchInput(event.target.value)}
              />
              <label className="sr-only" htmlFor="admin-channel-transactions-status">{t("transactions.filters.statusLabel")}</label>
              <select
                id="admin-channel-transactions-status"
                className="min-h-11 rounded-sm border border-border/30 bg-input px-3 py-2 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                value={status}
                onChange={event => {
                  setPage(1);
                  setStatus(event.target.value);
                }}
              >
                {statusFilters.map(item => (
                  <option key={item} value={item}>{t(`transactions.filters.statuses.${item}`)}</option>
                ))}
              </select>
              <label className="sr-only" htmlFor="admin-channel-transactions-type">{t("transactions.filters.typeLabel")}</label>
              <select
                id="admin-channel-transactions-type"
                className="min-h-11 rounded-sm border border-border/30 bg-input px-3 py-2 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                value={type}
                onChange={event => {
                  setPage(1);
                  setType(event.target.value);
                }}
              >
                {typeFilters.map(item => (
                  <option key={item} value={item}>{t(`transactions.filters.types.${item}`)}</option>
                ))}
              </select>
              <button className="min-h-11 rounded-sm bg-primary px-4 font-headline text-xs font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90" type="submit">
                {t("actions.search")}
              </button>
            </form>
          </div>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={() => void loadTransactions()} t={t} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border/30 bg-background text-[10px] uppercase tracking-widest text-muted-foreground">
                    <th className="px-6 py-4 font-semibold">{t("transactions.table.transaction")}</th>
                    <th className="px-6 py-4 font-semibold">{t("transactions.table.service")}</th>
                    <th className="px-6 py-4 font-semibold">{t("transactions.table.amount")}</th>
                    <th className="px-6 py-4 font-semibold">{t("transactions.table.wallets")}</th>
                    <th className="px-6 py-4 text-center font-semibold">{t("transactions.table.status")}</th>
                    <th className="px-6 py-4 text-right font-semibold">{t("transactions.table.updated")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {isLoading ? (
                    <TransactionSkeletonRows />
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td className="px-6 py-14" colSpan={6}>
                        <EmptyState t={t} />
                      </td>
                    </tr>
                  ) : (
                    transactions.map(transaction => (
                      <TransactionRow
                        key={transaction.id}
                        transaction={transaction}
                        locale={locale}
                        dateFallback={dateFallback}
                        numberFormatter={numberFormatter}
                        t={t}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 border-t border-border/30 bg-background px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {t("transactions.pagination.summary", { from: showingFrom, to: showingTo, total: numberFormatter.format(pagination.total) })}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage(current => Math.max(1, current - 1))}
                  disabled={isLoading || pagination.page <= 1}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border/30 text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={t("transactions.pagination.previous")}
                >
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">chevron_left</span>
                </button>
                <span className="rounded-sm border border-primary/30 bg-primary/10 px-3 py-2 font-mono text-xs text-primary">
                  {pagination.page} / {Math.max(1, pagination.totalPages)}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(current => Math.min(Math.max(1, pagination.totalPages), current + 1))}
                  disabled={isLoading || pagination.page >= pagination.totalPages}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border/30 text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={t("transactions.pagination.next")}
                >
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">chevron_right</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function TransactionRow({
  transaction,
  locale,
  dateFallback,
  numberFormatter,
  t,
}: {
  transaction: TransactionResponseDto;
  locale: string;
  dateFallback: string;
  numberFormatter: Intl.NumberFormat;
  t: Translator;
}) {
  const metadata = transaction.metadata ?? {};
  const splitPercent = typeof metadata.splitPercent === "number" ? metadata.splitPercent : null;
  const creatorCoins = typeof metadata.creatorCoins === "number" ? metadata.creatorCoins : null;
  const systemCoins = typeof metadata.systemCoins === "number" ? metadata.systemCoins : null;
  const channelName = typeof metadata.channelName === "string" && metadata.channelName.trim()
    ? metadata.channelName
    : t("transactions.fallbacks.unknownChannel");
  const description = transaction.description || t("transactions.fallbacks.noDescription");
  const serviceId = typeof metadata.serviceId === "string" ? metadata.serviceId : transaction.referenceId;

  return (
    <tr className="group align-top transition-colors hover:bg-muted/40">
      <td className="px-6 py-4">
        <p className="font-headline text-sm font-bold text-foreground">{getTypeLabel(transaction.type, t)}</p>
        <p className="mt-1 font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {t("transactions.table.ledgerEntry")}
        </p>
        <p className="mt-2 max-w-[260px] font-body text-xs text-muted-foreground">{description}</p>
        <div className="mt-3">
          <IdentityReveal label={t("transactions.table.transactionId")} value={transaction.id} t={t} />
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="font-headline text-sm font-bold text-foreground">{channelName}</p>
        <p className="mt-1 font-body text-xs capitalize text-muted-foreground">{getServiceLabel(metadata.serviceType, t)}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <IdentityReveal label={t("transactions.table.serviceId")} value={serviceId} t={t} />
          <IdentityReveal label={t("transactions.table.channelId")} value={typeof metadata.channelId === "string" ? metadata.channelId : null} t={t} />
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="font-headline text-sm font-bold text-secondary">
          {numberFormatter.format(transaction.amount)} {getAssetLabel(transaction.assetType)}
        </p>
        <p className="mt-1 font-mono text-[10px] text-muted-foreground">
          {splitPercent === null ? t("transactions.fallbacks.noSplit") : t("transactions.table.splitPercent", { percent: splitPercent })}
        </p>
        {creatorCoins !== null || systemCoins !== null ? (
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">
            {t("transactions.table.splitCoins", {
              creator: creatorCoins === null ? "-" : numberFormatter.format(creatorCoins),
              system: systemCoins === null ? "-" : numberFormatter.format(systemCoins),
            })}
          </p>
        ) : null}
      </td>
      <td className="px-6 py-4">
        <div className="flex max-w-[260px] flex-wrap gap-2">
          <IdentityReveal label={getWalletLabel("from", transaction, t)} value={transaction.fromWalletId} t={t} />
          <IdentityReveal label={getWalletLabel("to", transaction, t)} value={transaction.toWalletId} t={t} />
          <IdentityReveal label={t("transactions.table.user")} value={transaction.initiatedByUserId} t={t} />
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <span className={`rounded-sm border px-2 py-0.5 font-label text-[10px] font-bold uppercase tracking-widest ${getStatusClass(transaction.status)}`}>
          {getStatusLabel(transaction.status, t)}
        </span>
        {transaction.failureReason ? <p className="mt-2 max-w-[180px] text-xs text-primary">{transaction.failureReason}</p> : null}
      </td>
      <td className="px-6 py-4 text-right">
        <p className="font-mono text-xs text-muted-foreground">{formatDate(transaction.updatedAt, locale, dateFallback)}</p>
        <p className="mt-1 font-mono text-[10px] text-muted-foreground">{t("transactions.table.created", { date: formatDate(transaction.createdAt, locale, dateFallback) })}</p>
      </td>
    </tr>
  );
}

function TransactionSkeletonRows() {
  return Array.from({ length: 5 }).map((_, index) => (
    <tr key={index} className="animate-pulse">
      <td className="px-6 py-4" colSpan={6}>
        <div className="h-16 rounded-sm bg-muted/60" />
      </td>
    </tr>
  ));
}

function ErrorState({ message, onRetry, t }: { message: string; onRetry: () => void; t: Translator }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-10 text-center">
      <span className="material-symbols-outlined text-4xl text-primary" aria-hidden="true">error</span>
      <div>
        <h2 className="font-headline text-lg font-bold text-foreground">{t("transactions.errors.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
      <button className="rounded-sm bg-primary px-4 py-2 font-headline text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90" type="button" onClick={onRetry}>
        {t("actions.retry")}
      </button>
    </div>
  );
}

function EmptyState({ t }: { t: Translator }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 text-center">
      <span className="material-symbols-outlined text-4xl text-muted-foreground" aria-hidden="true">receipt_long</span>
      <div>
        <h2 className="font-headline text-lg font-bold text-foreground">{t("transactions.empty.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("transactions.empty.description")}</p>
      </div>
    </div>
  );
}
