"use client";

import { useEffect, useState } from "react";
import { TransactionService } from "@/features/wallet/services/transactionService";
import type { Transaction } from "@/features/wallet/types/wallet.types";
import { createAsyncState, isAsyncError, isAsyncLoading, isAsyncSuccess } from "@/shared/api/async-state";
import { getErrorMessage } from "@/shared/api/client";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Không rõ thời gian";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function normalizeText(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function formatNumber(value: number) {
  return value.toLocaleString("vi-VN");
}

function readNumberMetadata(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function isInternalRevenueTransaction(transaction: Transaction) {
  return ["channel_revenue", "system_revenue"].includes(normalizeText(transaction.type));
}

function isDepositTransaction(transaction: Transaction) {
  return normalizeText(transaction.type) === "deposit";
}

function getServiceType(transaction: Transaction) {
  const metadataServiceType = typeof transaction.metadata.serviceType === "string"
    ? transaction.metadata.serviceType
    : undefined;
  const serviceType = normalizeText(metadataServiceType);

  if (serviceType) {
    return serviceType;
  }

  const type = normalizeText(transaction.type);

  if (type.includes("video")) {
    return "video";
  }

  if (type.includes("membership")) {
    return "membership";
  }

  return "service";
}

function getActivityMeta(transaction: Transaction) {
  if (isDepositTransaction(transaction)) {
    const moneyAmount = readNumberMetadata(transaction.metadata, "moneyAmount");
    const coinAmount = readNumberMetadata(transaction.metadata, "totalCoinAmount") ?? transaction.amount;

    return {
      title: moneyAmount !== null ? `Nạp thành công ${formatNumber(moneyAmount)} VND` : "Nạp coin thành công",
      amount: `+${formatNumber(coinAmount)} AC`,
      icon: "add_card",
      iconColor: "text-secondary",
      iconBg: "bg-secondary/10",
      amountColor: "text-secondary",
    };
  }

  const serviceType = getServiceType(transaction);

  if (serviceType === "video") {
    return {
      title: "Thanh toán video",
      amount: `-${formatNumber(transaction.amount)} AC`,
      icon: "lock_open",
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      amountColor: "text-primary",
    };
  }

  if (serviceType === "membership") {
    return {
      title: "Thanh toán gói hội viên",
      amount: `-${formatNumber(transaction.amount)} AC`,
      icon: "autorenew",
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      amountColor: "text-primary",
    };
  }

  return {
    title: "Thanh toán dịch vụ",
    amount: `-${formatNumber(transaction.amount)} AC`,
    icon: "receipt_long",
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    amountColor: "text-primary",
  };
}

interface AccountActivityProps {
  refreshKey?: number;
}

export function AccountActivity({ refreshKey = 0 }: AccountActivityProps) {
  const [state, setState] = useState(() => createAsyncState<Transaction[]>([]));

  useEffect(() => {
    let isMounted = true;

    async function loadTransactions() {
      try {
        setState((current) => ({ ...current, status: "loading", error: null }));
        const data = await TransactionService.getMyTransactions();
        const viewerTransactions = data
          .filter((transaction) => !isInternalRevenueTransaction(transaction))
          .slice(0, 5);

        if (isMounted) {
          setState({ status: "success", data: viewerTransactions, error: null });
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load account activity", err);
          setState({
            status: "error",
            data: [],
            error: getErrorMessage(err, "Không thể tải hoạt động tài khoản."),
          });
        }
      }
    }

    void loadTransactions();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const transactions = state.data;

  return (
    <div className="space-y-6 lg:col-span-2">
      <h2 className="font-headline text-2xl font-bold text-foreground">Hoạt động tài khoản</h2>

      <div className="overflow-hidden rounded-lg border border-border/20 bg-card divide-y divide-border/20">
        {isAsyncLoading(state) ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
                <div>
                  <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                  <div className="mt-2 h-3 w-28 animate-pulse rounded bg-muted" />
                </div>
              </div>
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            </div>
          ))
        ) : null}

        {isAsyncError(state) ? (
          <div className="p-6 text-sm text-muted-foreground">{state.error}</div>
        ) : null}

        {isAsyncSuccess(state) && transactions.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">Chưa có dữ liệu.</div>
        ) : null}

        {isAsyncSuccess(state)
          ? transactions.map((transaction) => {
              const meta = getActivityMeta(transaction);
              return (
                <div key={transaction.id} className="flex items-center justify-between p-5 transition-colors hover:bg-muted/60">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${meta.iconBg}`}>
                      <span className={`material-symbols-outlined ${meta.iconColor}`}>{meta.icon}</span>
                    </div>
                    <div>
                      <p className="font-headline font-bold text-foreground">{meta.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(transaction.createdAt)}</p>
                    </div>
                  </div>
                  <span className={`font-black ${meta.amountColor}`}>{meta.amount}</span>
                </div>
              );
            })
          : null}
      </div>
    </div>
  );
}
