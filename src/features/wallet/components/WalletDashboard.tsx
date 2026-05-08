"use client";

import { useEffect, useState } from "react";
import { TopUpPackages } from "./TopUpPackages";
import { PaymentMethods } from "./PaymentMethods";
import { TransactionHistory } from "./TransactionHistory";
import { WalletService } from "../services/walletService";
import { Wallet } from "../types/wallet.types";

export function WalletDashboard() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const data = await WalletService.getMyWallet();
        setWallet(data);
      } catch (error) {
        console.error("Failed to fetch wallet:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, []);

  return (
    <main className="flex-1 md:pl-64 p-8 pt-24 min-h-screen bg-[#0e0e10]">
      {/* Header Section */}
      <section className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-7xl mx-auto">
        <div>
          <h1 className="font-headline text-4xl font-extrabold tracking-tighter mb-2 text-[#f9f5f8]">
            My Wallet
          </h1>
          <p className="text-zinc-400 max-w-md text-sm">
            Fuel your favorite creators and unlock exclusive cinematic experiences with Aura Coins.
          </p>
        </div>

        {/* Current Balance Card */}
        <div className="bg-zinc-950/40 backdrop-blur-2xl px-8 py-6 rounded-xl border border-[#fdc003]/20 flex flex-col items-center justify-center min-w-[240px] shadow-[0px_10px_30px_rgba(253,192,3,0.1)]">
          <span className="text-xs font-bold text-[#fdc003] uppercase tracking-widest mb-1">Current Balance</span>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-[#fdc003]" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
            {loading ? (
              <span className="font-headline text-5xl font-black text-[#f9f5f8] animate-pulse">...</span>
            ) : (
              <span className="font-headline text-5xl font-black text-[#f9f5f8]">
                {wallet ? wallet.balance.toLocaleString() : "0"}
              </span>
            )}
            <span className="font-headline text-xl font-bold text-[#fdc003]">AC</span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-4 gap-12">
        <div className="xl:col-span-3">
          <TopUpPackages />
        </div>
        <div className="xl:col-span-1">
          <PaymentMethods />
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <TransactionHistory />
      </div>
    </main>
  );
}
