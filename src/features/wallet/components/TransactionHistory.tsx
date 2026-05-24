"use client";

import { Badge } from "@/components/ui/badge";
import type { Transaction } from "../types/wallet.types";

interface TransactionHistoryProps {
  error?: string | null;
  initialTransactions?: Transaction[];
  loading?: boolean;
  title?: string;
  description?: string;
  excludeInternalRevenue?: boolean;
  emptyMessage?: string;
  className?: string;
}

type NormalizedTransactionStatus = "pending" | "completed" | "failed" | "cancelled";

type TransactionMetadata = {
  moneyAmount?: number;
  totalCoinAmount?: number;
  serviceType?: string;
};

const walletNumberFormatter = new Intl.NumberFormat("vi-VN");

function formatWalletNumber(value: number) {
  return walletNumberFormatter.format(value);
}

function normalizeText(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function readNumberMetadata(metadata: Record<string, unknown>, key: keyof TransactionMetadata) {
  const value = metadata[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeStatus(status: Transaction["status"]): NormalizedTransactionStatus {
  const normalizedStatus = normalizeText(status);

  if (["pending", "completed", "failed", "cancelled"].includes(normalizedStatus)) {
    return normalizedStatus as NormalizedTransactionStatus;
  }

  return "failed";
}

function isDepositTransaction(transaction: Transaction) {
  return normalizeText(transaction.type) === "deposit";
}

function isInternalRevenueTransaction(transaction: Transaction) {
  return ["channel_revenue", "system_revenue"].includes(normalizeText(transaction.type));
}

function isIncomingTransaction(transaction: Transaction) {
  return ["deposit", "channel_revenue", "system_revenue"].includes(normalizeText(transaction.type));
}

function getTransactionIcon(transaction: Transaction) {
  const type = normalizeText(transaction.type);

  if (type === "deposit") {
    return "add_circle";
  }

  if (type === "withdrawal") {
    return "account_balance";
  }

  return "receipt_long";
}

function getDepositDescription(transaction: Transaction) {
  const moneyAmount = readNumberMetadata(transaction.metadata, "moneyAmount");

  if (moneyAmount !== null) {
    return `Nạp thành công ${formatWalletNumber(moneyAmount)} VND`;
  }

  return "Nạp coin thành công";
}

function getPaymentDescription(transaction: Transaction) {
  const serviceType = normalizeText(
    typeof transaction.metadata.serviceType === "string" ? transaction.metadata.serviceType : undefined
  );

  if (serviceType === "membership") {
    return "Thanh toán gói hội viên";
  }

  if (serviceType === "video") {
    return "Thanh toán video";
  }

  return "Thanh toán dịch vụ";
}

function getTransactionDescription(transaction: Transaction) {
  if (transaction.description) {
    return transaction.description;
  }

  if (isDepositTransaction(transaction)) {
    return getDepositDescription(transaction);
  }

  if (isInternalRevenueTransaction(transaction)) {
    return "Doanh thu studio";
  }

  return getPaymentDescription(transaction);
}

function getDisplayAmount(transaction: Transaction) {
  const isDeposit = isDepositTransaction(transaction);
  const coinAmount = isDeposit
    ? readNumberMetadata(transaction.metadata, "totalCoinAmount") ?? transaction.amount
    : transaction.amount;
  const sign = isIncomingTransaction(transaction) ? "+" : "-";
  const assetLabel = normalizeText(transaction.assetType) === "coin" ? "AC" : transaction.assetType.toUpperCase();

  return `${sign}${formatWalletNumber(coinAmount)} ${assetLabel}`;
}

const sortTransactions = (transactions: Transaction[]) =>
  [...transactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

export function TransactionHistory({
  error = null,
  initialTransactions = [],
  loading = false,
  title = "Transaction History",
  description,
  excludeInternalRevenue = true,
  emptyMessage = "No transactions found.",
  className = "mt-20",
}: TransactionHistoryProps) {
  const transactions = sortTransactions(
    excludeInternalRevenue
      ? initialTransactions.filter((transaction) => !isInternalRevenueTransaction(transaction))
      : initialTransactions
  );

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateStr));
  };

  return (
    <section className={`rounded-lg border border-border/30 bg-card p-6 ${className}`}>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-headline text-2xl font-bold text-foreground">{title}</h2>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border/20 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-accent border-b border-border">
                <th className="px-6 py-4 font-headline text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-6 py-4 font-headline text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</th>
                <th className="px-6 py-4 font-headline text-xs font-bold uppercase tracking-wider text-muted-foreground">Amount</th>
                <th className="px-6 py-4 font-headline text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Loading transactions...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-destructive">{error}</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">{emptyMessage}</td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const status = normalizeStatus(tx.status);
                  const isIncoming = isIncomingTransaction(tx);

                  return (
                    <tr key={tx.id} className="transition-colors hover:bg-muted/50">
                      <td className="px-6 py-5 text-sm font-medium text-foreground/80">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                              {getTransactionIcon(tx)}
                            </span>
                          </div>
                          <span className="font-bold text-foreground">{getTransactionDescription(tx)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`font-headline font-bold ${isIncoming ? "text-secondary" : "text-foreground/80"}`}>
                          {getDisplayAmount(tx)}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {status === "completed" ? (
                          <Badge className="rounded-full border-0 bg-green-500/10 px-2.5 py-0.5 text-xs font-bold text-green-500 hover:bg-green-500/20">Thành công</Badge>
                        ) : status === "pending" ? (
                          <Badge className="rounded-full border-0 bg-yellow-500/10 px-2.5 py-0.5 text-xs font-bold text-yellow-500 hover:bg-yellow-500/20">Đang xử lý</Badge>
                        ) : status === "cancelled" ? (
                          <Badge className="rounded-full border-0 bg-zinc-500/10 px-2.5 py-0.5 text-xs font-bold text-muted-foreground hover:bg-zinc-500/20">Đã hủy</Badge>
                        ) : (
                          <Badge className="rounded-full border-0 bg-red-500/10 px-2.5 py-0.5 text-xs font-bold text-red-500 hover:bg-red-500/20">Thất bại</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
