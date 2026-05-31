"use client";

import { Link } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

import { getErrorMessage } from "@/shared/api/client";
import type { Withdrawal } from "@/features/wallet/types/wallet.types";

import { AdminWithdrawalService } from "../services/adminWithdrawalService";

type Translator = ReturnType<typeof useTranslations>;

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

function getStatusClass(status: string) {
  if (status === "completed" || status === "approved" || status === "COMPLETED" || status === "APPROVED") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  }

  if (status === "pending" || status === "PENDING" || status === "processing") {
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

export function PayoutDetailFeature() {
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("Admin.payouts");
  const locale = useLocale();
  const dateFallback = t("fallbacks.notAvailable");
  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat(getIntlLocale(locale), {
      maximumFractionDigits: 0,
      style: "currency",
      currency: "VND",
    }),
    [locale]
  );
  const numberFormatter = useMemo(() => new Intl.NumberFormat(getIntlLocale(locale)), [locale]);
  const riskChecks = useMemo(
    () => [
      { label: t("detail.risk.adminRouteAccess"), value: t("detail.risk.verified") },
      { label: t("detail.risk.serverOwnershipBypass"), value: t("detail.risk.adminScoped") },
      { label: t("detail.risk.bankDetailSource"), value: t("detail.risk.financeApi") },
    ],
    [t]
  );
  const [withdrawal, setWithdrawal] = useState<Withdrawal | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [transferReference, setTransferReference] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadWithdrawal = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await AdminWithdrawalService.getWithdrawal(id);
      setWithdrawal(data);
      setAdminNote(data.adminNote ?? "");
    } catch (err) {
      setError(getErrorMessage(err, t("errors.loadDetailFailed")));
      setWithdrawal(null);
    } finally {
      setIsLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void loadWithdrawal();
  }, [loadWithdrawal]);

  const runAction = async (action: "approve" | "reject" | "complete") => {
    if (!withdrawal) {
      return;
    }

    try {
      setIsActionLoading(true);
      setActionMessage(null);
      setError(null);

      const note = adminNote.trim();
      let updated: Withdrawal;

      if (action === "approve") {
        updated = await AdminWithdrawalService.approveWithdrawal(withdrawal.id, note || t("defaults.approvedNote"));
        setActionMessage(t("messages.approved"));
      } else if (action === "reject") {
        updated = await AdminWithdrawalService.rejectWithdrawal(
          withdrawal.id,
          rejectReason.trim() || t("defaults.rejectedReason"),
          note || t("defaults.rejectedNote")
        );
        setActionMessage(t("messages.rejected"));
      } else {
        updated = await AdminWithdrawalService.completeWithdrawal(
          withdrawal.id,
          transferReference.trim() || `BANK-${withdrawal.id}`,
          note || t("defaults.completedNote")
        );
        setActionMessage(t("messages.completed"));
      }

      setWithdrawal(updated);
      setAdminNote(updated.adminNote ?? note);
    } catch (err) {
      setError(getErrorMessage(err, t("errors.updateFailed")));
    } finally {
      setIsActionLoading(false);
    }
  };

  const canApprove = withdrawal?.status === "pending" || withdrawal?.status === "PENDING";
  const canReject = withdrawal?.status === "pending" || withdrawal?.status === "PENDING" || withdrawal?.status === "approved" || withdrawal?.status === "APPROVED";
  const canComplete = withdrawal?.status === "approved" || withdrawal?.status === "processing" || withdrawal?.status === "APPROVED";

  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-border/30 pb-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/payouts"
            className="flex h-10 w-10 items-center justify-center rounded border border-border/30 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={t("detail.backAria")}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              arrow_back
            </span>
          </Link>
          <div>
            <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-secondary">
              {t("detail.header.eyebrow")}
            </p>
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground">
              {id}
            </h1>
          </div>
        </div>
        <span className={`w-fit rounded-sm border px-3 py-1 font-label text-xs font-bold uppercase tracking-widest ${getStatusClass(withdrawal?.status ?? "pending")}`}>
          {withdrawal ? getStatusLabel(withdrawal.status, t) : t("queue.loading")}
        </span>
      </header>

      {error ? (
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 font-body text-sm text-primary">{error}</div>
      ) : null}

      {actionMessage ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 font-body text-sm text-emerald-400">{actionMessage}</div>
      ) : null}

      {isLoading ? (
        <div className="rounded-lg border border-border/30 bg-card p-8 font-body text-sm text-muted-foreground">{t("detail.loading")}</div>
      ) : !withdrawal ? (
        <div className="rounded-lg border border-border/30 bg-card p-8 font-body text-sm text-muted-foreground">{t("detail.notFound")}</div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <article className="rounded-lg border border-border/30 bg-card p-6">
              <h2 className="mb-6 border-b border-border/30 pb-4 font-headline text-lg font-bold uppercase tracking-widest text-foreground">
                {t("detail.transaction.title")}
              </h2>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div>
                  <p className="font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("detail.transaction.creator")}</p>
                  <p className="mt-1 font-headline text-sm font-bold text-foreground">{withdrawal.userId}</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{t("detail.transaction.wallet", { walletId: withdrawal.walletId })}</p>
                </div>

                <div>
                  <p className="font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {t("detail.transaction.amountRequested")}
                  </p>
                  <p className="mt-1 font-headline text-3xl font-black text-secondary">{numberFormatter.format(withdrawal.coinAmount)} AC</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{t("detail.transaction.exchangeRate", { rate: numberFormatter.format(withdrawal.exchangeRate) })}</p>
                </div>

                <div>
                  <p className="font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {t("detail.transaction.bankDetails")}
                  </p>
                  <div className="mt-3 space-y-1 rounded-sm border border-border/30 bg-background p-4 font-mono text-xs">
                    <p className="text-foreground">{t("detail.transaction.bank", { bankName: withdrawal.bankInfo.bankName, bankCode: withdrawal.bankInfo.bankCode })}</p>
                    <p className="text-muted-foreground">{t("detail.transaction.account", { accountNumber: withdrawal.bankInfo.accountNumber })}</p>
                    <p className="text-muted-foreground">{t("detail.transaction.accountHolder", { accountHolderName: withdrawal.bankInfo.accountHolderName })}</p>
                    {withdrawal.bankInfo.qrCode ? <p className="text-muted-foreground">{t("detail.transaction.qrAvailable")}</p> : null}
                  </div>
                </div>

                <div>
                  <p className="font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {t("detail.transaction.finalPayoutAmount")}
                  </p>
                  <p className="mt-1 font-headline text-3xl font-black text-emerald-400">{currencyFormatter.format(withdrawal.moneyAmount)}</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{t("detail.transaction.requested", { date: formatDate(withdrawal.requestedAt, locale, dateFallback) })}</p>
                </div>
              </div>
            </article>

            <article className="rounded-lg border border-border/30 bg-card p-6">
              <h2 className="mb-4 border-b border-border/30 pb-4 font-headline text-lg font-bold uppercase tracking-widest text-foreground">
                {t("detail.audit.title")}
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Info label={t("detail.audit.approvedAt")} value={formatDate(withdrawal.approvedAt, locale, dateFallback)} />
                <Info label={t("detail.audit.completedAt")} value={formatDate(withdrawal.completedAt, locale, dateFallback)} />
                <Info label={t("detail.audit.rejectedAt")} value={formatDate(withdrawal.rejectedAt, locale, dateFallback)} />
                <Info label={t("detail.audit.cancelledAt")} value={formatDate(withdrawal.cancelledAt, locale, dateFallback)} />
                <Info label={t("detail.audit.processedBy")} value={withdrawal.processedByAdminId ?? dateFallback} />
                <Info label={t("detail.audit.transferRef")} value={withdrawal.transferReference ?? dateFallback} />
                <Info label={t("detail.audit.description")} value={withdrawal.description ?? dateFallback} />
                <Info label={t("detail.audit.rejectionReason")} value={withdrawal.rejectionReason ?? dateFallback} />
              </div>
            </article>

            <article className="rounded-lg border border-border/30 bg-card p-6">
              <h2 className="mb-4 border-b border-border/30 pb-4 font-headline text-lg font-bold uppercase tracking-widest text-foreground">
                {t("detail.risk.title")}
              </h2>
              <ul className="space-y-3 font-mono text-xs">
                {riskChecks.map((check) => (
                  <li key={check.label} className="flex items-center justify-between gap-4 rounded-sm bg-background px-4 py-3">
                    <span className="text-muted-foreground">{check.label}</span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                        check_circle
                      </span>
                      {check.value}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <div className="sticky top-24 rounded-lg border border-border/30 bg-card p-6">
              <h2 className="mb-6 font-headline text-xl font-bold uppercase tracking-widest text-foreground">{t("detail.action.title")}</h2>

              <div className="space-y-6">
                <div>
                  <label className="mb-3 block font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {t("detail.action.transactionNotes")}
                  </label>
                  <textarea
                    className="min-h-[100px] w-full rounded-sm border border-border/30 bg-background p-3 font-body text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-secondary"
                    placeholder={t("detail.action.notesPlaceholder")}
                    value={adminNote}
                    onChange={(event) => setAdminNote(event.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-3 block font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {t("detail.action.transferReference")}
                  </label>
                  <input
                    className="w-full rounded-sm border border-border/30 bg-background p-3 font-body text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-secondary"
                    placeholder="BANK-TXN-123"
                    value={transferReference}
                    onChange={(event) => setTransferReference(event.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-3 block font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {t("detail.action.rejectReason")}
                  </label>
                  <input
                    className="w-full rounded-sm border border-border/30 bg-background p-3 font-body text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                    placeholder={t("detail.action.rejectPlaceholder")}
                    value={rejectReason}
                    onChange={(event) => setRejectReason(event.target.value)}
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    disabled={!canApprove || isActionLoading}
                    onClick={() => void runAction("approve")}
                    className="flex w-full items-center justify-center gap-2 rounded-sm bg-secondary py-3 font-headline text-xs font-black uppercase tracking-widest text-black shadow-lg shadow-secondary/20 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {t("actions.approve")}
                  </button>
                  <button
                    type="button"
                    disabled={!canComplete || isActionLoading}
                    onClick={() => void runAction("complete")}
                    className="flex w-full items-center justify-center gap-2 rounded-sm border border-emerald-500/40 bg-emerald-500/10 py-3 font-headline text-xs font-bold uppercase tracking-widest text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {t("actions.complete")}
                  </button>
                  <button
                    type="button"
                    disabled={!canReject || isActionLoading}
                    onClick={() => void runAction("reject")}
                    className="w-full rounded-sm border border-primary/40 bg-transparent py-3 font-headline text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {t("actions.reject")}
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border/30 bg-background p-4">
      <p className="font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 break-words font-mono text-xs text-foreground">{value}</p>
    </div>
  );
}
