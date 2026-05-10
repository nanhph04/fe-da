"use client";

import { useEffect, useState } from "react";
import { TransactionService } from "@/features/wallet/services/transactionService";
import type { Transaction } from "@/features/wallet/types/wallet.types";

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

function getActivityMeta(transaction: Transaction) {
  if (transaction.type === "DEPOSIT") {
    return {
      title: transaction.description || "Nạp Aura Coin",
      amount: `+ ${transaction.amount.toLocaleString()} ${transaction.assetType === "COIN" ? "AC" : ""}`.trim(),
      icon: "add_card",
      iconColor: "text-secondary",
      iconBg: "bg-secondary/10",
      amountColor: "text-secondary",
    };
  }

  if (transaction.type === "VIDEO_PURCHASE") {
    return {
      title: transaction.description || "Mở khóa video",
      amount: `- ${transaction.amount.toLocaleString()} AC`,
      icon: "lock_open",
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      amountColor: "text-primary",
    };
  }

  if (transaction.type === "WITHDRAWAL") {
    return {
      title: transaction.description || "Rút tiền",
      amount: `- ${transaction.amount.toLocaleString()}`,
      icon: "payments",
      iconColor: "text-zinc-300",
      iconBg: "bg-muted",
      amountColor: "text-zinc-300",
    };
  }

  return {
    title: transaction.description || "Giao dịch tài khoản",
    amount: `${transaction.amount.toLocaleString()} ${transaction.assetType === "COIN" ? "AC" : ""}`.trim(),
    icon: "receipt_long",
    iconColor: "text-zinc-300",
    iconBg: "bg-muted",
    amountColor: "text-zinc-300",
  };
}

export function AccountActivity() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadTransactions() {
      try {
        setError(null);
        const data = await TransactionService.getMyTransactions();
        if (isMounted) {
          setTransactions(data.slice(0, 5));
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load account activity", err);
          setError("Không thể tải hoạt động tài khoản.");
          setTransactions([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadTransactions();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6 lg:col-span-2">
      <h2 className="font-headline text-2xl font-bold text-foreground">Hoạt động tài khoản</h2>

      <div className="overflow-hidden rounded-lg border border-border/20 bg-card divide-y divide-border/20">
        {isLoading ? (
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

        {!isLoading && error ? (
          <div className="p-6 text-sm text-muted-foreground">{error}</div>
        ) : null}

        {!isLoading && !error && transactions.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">Chưa có dữ liệu.</div>
        ) : null}

        {!isLoading && !error
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
