import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Clock, WalletCards } from "lucide-react";
import type { Transaction, Wallet } from "@/features/wallet/types/wallet.types";
import { formatProfileDateTime, getTransactionAmountLabel, getTransactionTitle, getTransactionTone } from "../utils/profile-formatters";

interface WalletHistoryMiniProps {
  wallet: Wallet | null;
  transactions: Transaction[];
  error?: string;
}

export function WalletHistoryMini({ wallet, transactions, error }: WalletHistoryMiniProps) {
  const latestTransactions = transactions.slice(0, 5);

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-3 font-headline text-xl font-bold text-foreground">
          <span className="h-6 w-1 rounded-full bg-primary" aria-hidden="true" />
          Lịch sử ví
        </h2>
        <Link href="/wallet" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary">
          Xem tất cả
        </Link>
      </div>

      <div className="mb-4 rounded-lg border border-secondary/20 bg-secondary/10 p-5">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-secondary">Aura Balance</p>
        <p className="mt-2 font-headline text-3xl font-black text-foreground">
          {(wallet?.balance ?? 0).toLocaleString("vi-VN")} <span className="text-base text-secondary">AC</span>
        </p>
        {wallet?.frozenBalance ? (
          <p className="mt-1 text-xs text-muted-foreground">Đang đóng băng: {wallet.frozenBalance.toLocaleString("vi-VN")} AC</p>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg border border-border/20 bg-card shadow-lg">
        {error ? (
          <div className="p-6 text-sm text-destructive">{error}</div>
        ) : latestTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-muted text-muted-foreground">
              <WalletCards className="h-5 w-5" />
            </div>
            <p className="font-headline text-lg font-bold text-foreground">Chưa có giao dịch</p>
            <p className="mt-2 text-sm text-muted-foreground">Các giao dịch Aura Coins sẽ xuất hiện tại đây.</p>
          </div>
        ) : (
          latestTransactions.map((item, index) => {
            const tone = getTransactionTone(item, wallet?.id);
            const isPositive = tone === "positive";
            const Icon = isPositive ? ArrowDownLeft : ArrowUpRight;

            return (
              <div
                key={item.id}
                className={`flex items-center justify-between gap-4 p-5 transition-colors hover:bg-muted/30 ${index !== latestTransactions.length - 1 ? "border-b border-border/10" : ""}`}
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted ${isPositive ? "text-secondary" : "text-primary"}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">{getTransactionTitle(item)}</p>
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatProfileDateTime(item.completedAt || item.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`font-black ${isPositive ? "text-secondary" : "text-foreground"}`}>{getTransactionAmountLabel(item, wallet?.id)}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{item.status}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
