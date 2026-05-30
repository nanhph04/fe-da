"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getErrorMessage } from "@/shared/api/client";
import { TransactionHistory } from "@/features/wallet/components/TransactionHistory";
import { TransactionService } from "@/features/wallet/services/transactionService";
import type { Transaction } from "@/features/wallet/types/wallet.types";
import { StudioWalletService } from "../services/studioWalletService";
import type { StudioWallet, WalletStats } from "../types/studio-wallet.types";
import { WalletOverview } from "./WalletOverview";
import { WithdrawFundsOverlay } from "./WithdrawFundsOverlayv2";

interface StudioWalletDashboardProps {
  initialWallet: StudioWallet;
  initialStats: WalletStats;
}

export function StudioWalletDashboard({
  initialWallet,
  initialStats,
}: StudioWalletDashboardProps) {
  const t = useTranslations("Studio");
  const [wallet, setWallet] = useState(initialWallet);
  const [stats, setStats] = useState(initialStats);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  const refreshWallet = async () => {
    setIsRefreshing(true);
    setError(null);
    setTransactionsError(null);

    try {
      const [nextWallet, nextStats, nextTransactions] = await Promise.allSettled([
        StudioWalletService.getStudioWallet(),
        StudioWalletService.getWalletStats(),
        TransactionService.getMyTransactions(),
      ]);

      if (nextWallet.status === "fulfilled") {
        setWallet(nextWallet.value);
      } else {
        setError(getErrorMessage(nextWallet.reason, t("wallet.dashboard.refreshError")));
      }

      if (nextStats.status === "fulfilled") {
        setStats(nextStats.value);
      } else {
        setError(getErrorMessage(nextStats.reason, t("wallet.dashboard.refreshError")));
      }

      if (nextTransactions.status === "fulfilled") {
        setTransactions(nextTransactions.value);
      } else {
        setTransactions([]);
        setTransactionsError(getErrorMessage(nextTransactions.reason, t("wallet.dashboard.transactionsError")));
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    const loadTransactions = async () => {
      setIsTransactionsLoading(true);
      setTransactionsError(null);

      try {
        const nextTransactions = await TransactionService.getMyTransactions({ signal: controller.signal });
        setTransactions(nextTransactions);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setTransactions([]);
        setTransactionsError(getErrorMessage(error, t("wallet.dashboard.transactionsError")));
      } finally {
        if (!controller.signal.aborted) {
          setIsTransactionsLoading(false);
        }
      }
    };

    void loadTransactions();

    return () => {
      controller.abort();
    };
  }, [t]);

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-6 border-b border-border/30 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <nav className="mb-3 flex items-center gap-2 font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <span>{t("wallet.dashboard.breadcrumb.studio")}</span>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-secondary">{t("wallet.dashboard.breadcrumb.wallet")}</span>
          </nav>
          <h1 className="font-headline text-4xl font-black tracking-tight text-foreground">
            {t("wallet.dashboard.title")}
          </h1>
          <p className="mt-2 max-w-md font-body text-sm text-muted-foreground">
            {t("wallet.dashboard.description")}
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-lg border border-border/30 bg-card px-6 py-3">
          <div>
            <span className="mb-1 block font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {t("wallet.dashboard.convertibleBalance")}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-headline text-2xl font-black text-foreground">{stats.availableBalance.toLocaleString()}</span>
              <span className="font-headline text-sm font-bold text-secondary">AC</span>
            </div>
          </div>
          <div className="h-10 w-px bg-border/40" />
          <Button
            className="rounded-sm bg-primary px-6 py-3 font-headline text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90"
            onClick={() => setIsWithdrawOpen(true)}
            disabled={wallet.balance <= 0}
          >
            {t("wallet.dashboard.withdrawNow")}
          </Button>
        </div>
      </header>

      {error ? (
        <Card className="rounded-md border-primary/30 bg-primary/10 text-primary">
          <CardContent className="py-4 text-sm">{error}</CardContent>
        </Card>
      ) : null}

      <WalletOverview
        wallet={wallet}
        stats={stats}
        onWithdraw={() => setIsWithdrawOpen(true)}
        isLoading={isRefreshing}
      />

      <TransactionHistory
        title={t("wallet.dashboard.history.title")}
        description={t("wallet.dashboard.history.description")}
        className="mt-0"
        error={transactionsError}
        initialTransactions={transactions}
        loading={isTransactionsLoading}
        excludeInternalRevenue={false}
        emptyMessage={t("wallet.dashboard.history.empty")}
      />

      <WithdrawFundsOverlay
        wallet={wallet}
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        onSuccess={refreshWallet}
      />
    </div>
  );
}

export default StudioWalletDashboard;
