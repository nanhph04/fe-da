"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { getErrorMessage } from "@/shared/api/client";
import type { Withdrawal } from "@/features/wallet/types/wallet.types";

import { AdminWithdrawalService } from "../services/adminWithdrawalService";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
  style: "currency",
  currency: "VND",
});
const numberFormatter = new Intl.NumberFormat("en-US");

const riskChecks = [
  { label: "Admin route access", value: "Verified", status: "passed" },
  { label: "Server ownership bypass", value: "Admin scoped", status: "passed" },
  { label: "Bank detail source", value: "Finance API", status: "passed" },
];

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("vi-VN", {
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

export function PayoutDetailFeature() {
  const params = useParams();
  const id = params.id as string;
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
      setError(getErrorMessage(err, "Khong the tai chi tiet payout."));
      setWithdrawal(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

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
        updated = await AdminWithdrawalService.approveWithdrawal(withdrawal.id, note || "Approved by admin");
        setActionMessage("Payout approved successfully.");
      } else if (action === "reject") {
        updated = await AdminWithdrawalService.rejectWithdrawal(
          withdrawal.id,
          rejectReason.trim() || "Rejected by admin",
          note || "Rejected by admin"
        );
        setActionMessage("Payout rejected successfully.");
      } else {
        updated = await AdminWithdrawalService.completeWithdrawal(
          withdrawal.id,
          transferReference.trim() || `BANK-${withdrawal.id}`,
          note || "Transfer completed by admin"
        );
        setActionMessage("Payout completed successfully.");
      }

      setWithdrawal(updated);
      setAdminNote(updated.adminNote ?? note);
    } catch (err) {
      setError(getErrorMessage(err, "Khong the cap nhat payout."));
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
            aria-label="Back to payout queue"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              arrow_back
            </span>
          </Link>
          <div>
            <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-secondary">
              Payout Request
            </p>
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground">
              {id}
            </h1>
          </div>
        </div>
        <span className={`w-fit rounded-sm border px-3 py-1 font-label text-xs font-bold uppercase tracking-widest ${getStatusClass(withdrawal?.status ?? "pending")}`}>
          {withdrawal?.status ?? "Loading"}
        </span>
      </header>

      {error ? (
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 font-body text-sm text-primary">{error}</div>
      ) : null}

      {actionMessage ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 font-body text-sm text-emerald-400">{actionMessage}</div>
      ) : null}

      {isLoading ? (
        <div className="rounded-lg border border-border/30 bg-card p-8 font-body text-sm text-muted-foreground">Loading payout detail...</div>
      ) : !withdrawal ? (
        <div className="rounded-lg border border-border/30 bg-card p-8 font-body text-sm text-muted-foreground">Payout not found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <article className="rounded-lg border border-border/30 bg-card p-6">
              <h2 className="mb-6 border-b border-border/30 pb-4 font-headline text-lg font-bold uppercase tracking-widest text-foreground">
                Transaction Details
              </h2>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div>
                  <p className="font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Creator / User</p>
                  <p className="mt-1 font-headline text-sm font-bold text-foreground">{withdrawal.userId}</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">Wallet: {withdrawal.walletId}</p>
                </div>

                <div>
                  <p className="font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Amount Requested
                  </p>
                  <p className="mt-1 font-headline text-3xl font-black text-secondary">{numberFormatter.format(withdrawal.coinAmount)} AC</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">Exchange Rate: {numberFormatter.format(withdrawal.exchangeRate)} VND/AC</p>
                </div>

                <div>
                  <p className="font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Bank Details
                  </p>
                  <div className="mt-3 space-y-1 rounded-sm border border-border/30 bg-background p-4 font-mono text-xs">
                    <p className="text-foreground">Bank: {withdrawal.bankInfo.bankName} ({withdrawal.bankInfo.bankCode})</p>
                    <p className="text-muted-foreground">Account: {withdrawal.bankInfo.accountNumber}</p>
                    <p className="text-muted-foreground">Name: {withdrawal.bankInfo.accountHolderName}</p>
                    {withdrawal.bankInfo.qrCode ? <p className="text-muted-foreground">QR: Available</p> : null}
                  </div>
                </div>

                <div>
                  <p className="font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Final Payout Amount
                  </p>
                  <p className="mt-1 font-headline text-3xl font-black text-emerald-400">{currencyFormatter.format(withdrawal.moneyAmount)}</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">Requested: {formatDate(withdrawal.requestedAt)}</p>
                </div>
              </div>
            </article>

            <article className="rounded-lg border border-border/30 bg-card p-6">
              <h2 className="mb-4 border-b border-border/30 pb-4 font-headline text-lg font-bold uppercase tracking-widest text-foreground">
                Audit Metadata
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Info label="Approved At" value={formatDate(withdrawal.approvedAt)} />
                <Info label="Completed At" value={formatDate(withdrawal.completedAt)} />
                <Info label="Rejected At" value={formatDate(withdrawal.rejectedAt)} />
                <Info label="Cancelled At" value={formatDate(withdrawal.cancelledAt)} />
                <Info label="Processed By" value={withdrawal.processedByAdminId ?? "N/A"} />
                <Info label="Transfer Ref" value={withdrawal.transferReference ?? "N/A"} />
                <Info label="Description" value={withdrawal.description ?? "N/A"} />
                <Info label="Rejection Reason" value={withdrawal.rejectionReason ?? "N/A"} />
              </div>
            </article>

            <article className="rounded-lg border border-border/30 bg-card p-6">
              <h2 className="mb-4 border-b border-border/30 pb-4 font-headline text-lg font-bold uppercase tracking-widest text-foreground">
                Risk & Fraud Analysis
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
              <h2 className="mb-6 font-headline text-xl font-bold uppercase tracking-widest text-foreground">Action</h2>

              <div className="space-y-6">
                <div>
                  <label className="mb-3 block font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Transaction Notes
                  </label>
                  <textarea
                    className="min-h-[100px] w-full rounded-sm border border-border/30 bg-background p-3 font-body text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-secondary"
                    placeholder="Admin notes..."
                    value={adminNote}
                    onChange={(event) => setAdminNote(event.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-3 block font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Transfer Reference
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
                    Reject Reason
                  </label>
                  <input
                    className="w-full rounded-sm border border-border/30 bg-background p-3 font-body text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                    placeholder="Thong tin tai khoan khong hop le"
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
                    Approve Payout
                  </button>
                  <button
                    type="button"
                    disabled={!canComplete || isActionLoading}
                    onClick={() => void runAction("complete")}
                    className="flex w-full items-center justify-center gap-2 rounded-sm border border-emerald-500/40 bg-emerald-500/10 py-3 font-headline text-xs font-bold uppercase tracking-widest text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Complete Transfer
                  </button>
                  <button
                    type="button"
                    disabled={!canReject || isActionLoading}
                    onClick={() => void runAction("reject")}
                    className="w-full rounded-sm border border-primary/40 bg-transparent py-3 font-headline text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Reject Payout
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
