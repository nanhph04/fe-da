"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getErrorMessage } from "@/shared/api/client";
import { createAsyncState, isAsyncLoading } from "@/shared/api/async-state";
import { TopUpPackages } from "./TopUpPackages";
import { TransactionHistory } from "./TransactionHistory";
import { EmbeddedPayOsCheckout } from "./EmbeddedPayOsCheckout";
import { WalletService } from "../services/walletService";
import { TransactionService } from "../services/transactionService";
import type { DepositPackage, Transaction, Wallet } from "../types/wallet.types";

function getNumberLocale(locale: string) {
  return locale === "en" ? "en-US" : "vi-VN";
}

function normalizeWalletStatus(status: string) {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "active") {
    return "active";
  }

  if (["frozen", "suspended", "inactive"].includes(normalizedStatus)) {
    return "frozen";
  }

  if (normalizedStatus === "closed") {
    return "closed";
  }

  return "unknown";
}

interface WalletDashboardProps {
  initialPackages: DepositPackage[];
}

export function WalletDashboard({ initialPackages }: WalletDashboardProps) {
  const t = useTranslations("Wallet.Dashboard");
  const locale = useLocale();
  const walletNumberFormatter = useMemo(
    () => new Intl.NumberFormat(getNumberLocale(locale)),
    [locale]
  );
  const formatWalletNumber = (value: number) => walletNumberFormatter.format(value);
  const loadBalanceFailedMessage = t("errors.loadBalanceFailed");
  const loadTransactionsFailedMessage = t("errors.loadTransactionsFailed");
  const [walletState, setWalletState] = useState(() => createAsyncState<Wallet | null>(null));
  const [transactionState, setTransactionState] = useState(() =>
    createAsyncState<Transaction[]>([])
  );
  const [selectedPackage, setSelectedPackage] = useState<DepositPackage | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadWalletData() {
      setWalletState((current) => ({ ...current, status: "loading", error: null }));
      setTransactionState((current) => ({ ...current, status: "loading", error: null }));

      const [walletResult, transactionResult] = await Promise.allSettled([
        WalletService.getMyWallet(),
        TransactionService.getMyTransactions(),
      ]);

      if (!isMounted) {
        return;
      }

      if (walletResult.status === "fulfilled") {
        setWalletState({ status: "success", data: walletResult.value, error: null });
      } else {
        setWalletState({
          status: "error",
          data: null,
          error: getErrorMessage(walletResult.reason, loadBalanceFailedMessage),
        });
      }

      if (transactionResult.status === "fulfilled") {
        setTransactionState({
          status: "success",
          data: transactionResult.value,
          error: null,
        });
      } else {
        setTransactionState({
          status: "error",
          data: [],
          error: getErrorMessage(transactionResult.reason, loadTransactionsFailedMessage),
        });
      }
    }

    void loadWalletData();

    return () => {
      isMounted = false;
    };
  }, [loadBalanceFailedMessage, loadTransactionsFailedMessage]);

  useEffect(() => {
    if (selectedPackage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedPackage]);

  const balanceLabel = walletState.data ? formatWalletNumber(walletState.data.balance) : "--";
  const hasWalletError = walletState.status === "error";
  const walletStatus = walletState.data ? normalizeWalletStatus(walletState.data.status) : "active";
  const topUpDisabledReason = walletStatus === "closed"
    ? t("statusMessages.depositClosed")
    : walletStatus === "unknown"
      ? t("statusMessages.unknown")
      : null;

  return (
    <main className="min-h-screen flex-1 bg-background p-8 pt-24 md:pl-64">
      <section className="mx-auto mb-12 flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="mb-2 font-headline text-4xl font-extrabold tracking-tighter text-foreground">
            {t("title")}
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>

        <div className="flex min-w-[240px] flex-col items-center justify-center rounded-lg border border-secondary/20 bg-card px-8 py-6 shadow-[0px_10px_30px_rgba(245,158,11,0.08)]">
          <span className="mb-1 text-xs font-bold uppercase tracking-widest text-secondary">
            {t("currentBalance")}
          </span>
          <div className="flex items-center gap-3">
            <span
              className="material-symbols-outlined text-4xl text-secondary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              monetization_on
            </span>
            <span className="font-headline text-5xl font-black text-foreground">
              {isAsyncLoading(walletState) ? "..." : balanceLabel}
            </span>
            <span className="font-headline text-xl font-bold text-secondary">AC</span>
          </div>
          {hasWalletError ? (
            <p className="mt-3 max-w-[260px] text-center text-xs text-destructive">
              {walletState.error}
            </p>
          ) : null}
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 xl:grid-cols-4">
        <div className="xl:col-span-3">
          <TopUpPackages
            initialPackages={initialPackages}
            onSelectPackage={setSelectedPackage}
            disabledReason={topUpDisabledReason}
          />
        </div>
      </div>

      {selectedPackage ? (
        <EmbeddedPayOsCheckout
          selectedPackage={selectedPackage}
          onClose={() => setSelectedPackage(null)}
        />
      ) : null}

      <div className="mx-auto max-w-7xl">
        <TransactionHistory
          error={transactionState.error}
          initialTransactions={transactionState.data}
          loading={isAsyncLoading(transactionState)}
        />
      </div>
    </main>
  );
}
