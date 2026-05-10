"use client";

import { TopUpPackages } from "./TopUpPackages";
import { PaymentMethods } from "./PaymentMethods";
import { TransactionHistory } from "./TransactionHistory";
import type { DepositPackage, Transaction, Wallet } from "../types/wallet.types";

interface WalletDashboardProps {
  initialWallet: Wallet;
  initialTransactions: Transaction[];
  initialPackages: DepositPackage[];
}

export function WalletDashboard({
  initialWallet,
  initialTransactions,
  initialPackages,
}: WalletDashboardProps) {
  const wallet = initialWallet;

  return (
    <main className="flex-1 min-h-screen bg-background p-8 pt-24 md:pl-64">
      {/* Header Section */}
      <section className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-7xl mx-auto">
        <div>
          <h1 className="mb-2 font-headline text-4xl font-extrabold tracking-tighter text-foreground">
            My Wallet
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Fuel your favorite creators and unlock exclusive cinematic experiences with Aura Coins.
          </p>
        </div>

        {/* Current Balance Card */}
        <div className="flex min-w-[240px] flex-col items-center justify-center rounded-lg border border-secondary/20 bg-card px-8 py-6 shadow-[0px_10px_30px_rgba(251,191,36,0.08)]">
          <span className="mb-1 text-xs font-bold uppercase tracking-widest text-secondary">Current Balance</span>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
            <span className="font-headline text-5xl font-black text-foreground">
              {wallet.balance.toLocaleString()}
            </span>
            <span className="font-headline text-xl font-bold text-secondary">AC</span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-4 gap-12">
        <div className="xl:col-span-3">
          <TopUpPackages initialPackages={initialPackages} />
        </div>
        <div className="xl:col-span-1">
          <PaymentMethods />
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <TransactionHistory initialTransactions={initialTransactions} />
      </div>
    </main>
  );
}
