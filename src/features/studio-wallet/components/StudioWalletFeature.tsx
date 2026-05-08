"use client";

import { useState, useEffect } from "react";
import { StudioWalletDashboard } from "./StudioWalletDashboard";
import { StudioWalletService } from "../services/studioWalletService";
import type { StudioWallet, WalletStats } from "../types/studio-wallet.types";

export function StudioWalletFeature() {
  const [wallet, setWallet] = useState<StudioWallet | null>(null);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWallet = async () => {
    try {
      const [walletData, statsData] = await Promise.all([
        StudioWalletService.getStudioWallet(),
        StudioWalletService.getWalletStats(),
      ]);
      setWallet(walletData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch wallet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchWallet();
  }, []);

  if (isLoading || !wallet || !stats) {
    return <div className="p-8 text-sm text-zinc-400">Loading studio wallet...</div>;
  }

  return <StudioWalletDashboard initialWallet={wallet} initialStats={stats} />;
}
