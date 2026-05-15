"use client";

import { useEffect, useState } from "react";
import { getErrorMessage } from "@/shared/api/client";
import { createAsyncState, isAsyncLoading } from "@/shared/api/async-state";
import { TopUpPackages } from "./TopUpPackages";
import { TransactionHistory } from "./TransactionHistory";
import { EmbeddedPayOsCheckout } from "./EmbeddedPayOsCheckout";
import { WalletService } from "../services/walletService";
import { TransactionService } from "../services/transactionService";
import type { DepositPackage, Transaction, Wallet } from "../types/wallet.types";

const walletNumberFormatter = new Intl.NumberFormat("vi-VN");

function formatWalletNumber(value: number) {
  return walletNumberFormatter.format(value);
}

interface WalletDashboardProps {
  initialPackages: DepositPackage[];
}

export function WalletDashboard({ initialPackages }: WalletDashboardProps) {
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
          error: getErrorMessage(walletResult.reason, "Không thể tải số dư ví."),
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
          error: getErrorMessage(transactionResult.reason, "Không thể tải lịch sử giao dịch."),
        });
      }
    }

    void loadWalletData();

    return () => {
      isMounted = false;
    };
  }, []);

  const balanceLabel = walletState.data ? formatWalletNumber(walletState.data.balance) : "--";
  const hasWalletError = walletState.status === "error";

  return (
    <main className="min-h-screen flex-1 bg-background p-8 pt-24 md:pl-64">
      <section className="mx-auto mb-12 flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="mb-2 font-headline text-4xl font-extrabold tracking-tighter text-foreground">
            My Wallet
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Fuel your favorite creators and unlock exclusive cinematic experiences with Aura Coins.
          </p>
        </div>

        <div className="flex min-w-[240px] flex-col items-center justify-center rounded-lg border border-secondary/20 bg-card px-8 py-6 shadow-[0px_10px_30px_rgba(245,158,11,0.08)]">
          <span className="mb-1 text-xs font-bold uppercase tracking-widest text-secondary">
            Current Balance
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
          />
        </div>
      </div>

      {selectedPackage ? (
        <div className="mx-auto mt-12 max-w-7xl">
          <EmbeddedPayOsCheckout
            selectedPackage={selectedPackage}
            onClose={() => setSelectedPackage(null)}
          />
        </div>
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
