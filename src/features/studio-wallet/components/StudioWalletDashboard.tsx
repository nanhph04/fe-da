"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [wallet, setWallet] = useState(initialWallet);
  const [stats, setStats] = useState(initialStats);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshWallet = async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      const [nextWallet, nextStats] = await Promise.all([
        StudioWalletService.getStudioWallet(),
        StudioWalletService.getWalletStats(),
      ]);

      setWallet(nextWallet);
      setStats(nextStats);
    } catch {
      setError("Failed to refresh wallet data.");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-[#f9f5f8]">
            Studio Wallet
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Manage creator earnings, monitor wallet balance, and request payouts without leaving the studio workspace.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="rounded-md border-zinc-800 bg-zinc-950 text-zinc-100 hover:bg-zinc-900"
            onClick={refreshWallet}
            disabled={isRefreshing}
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button
            className="rounded-md bg-[#c1121f] text-white hover:bg-[#a60f1a]"
            onClick={() => setIsWithdrawOpen(true)}
            disabled={wallet.balance <= 0}
          >
            Withdraw Funds
          </Button>
        </div>
      </div>

      {error ? (
        <Card className="rounded-md border-[#4d1117] bg-[#220b0f] text-[#f7d7db]">
          <CardContent className="py-4 text-sm">{error}</CardContent>
        </Card>
      ) : null}

      <WalletOverview
        wallet={wallet}
        stats={stats}
        onWithdraw={() => setIsWithdrawOpen(true)}
        isLoading={isRefreshing}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-md border-zinc-800 bg-zinc-950/80 lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline text-lg text-zinc-100">
              Payout Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-zinc-300">
            <div className="flex items-center justify-between">
              <span>Available balance</span>
              <span className="font-semibold text-white">
                {stats.availableBalance.toLocaleString()} AC
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Pending payouts</span>
              <span className="font-semibold text-[#fcbf49]">
                {stats.pendingPayouts.toLocaleString()} AC
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total withdrawn</span>
              <span className="font-semibold text-white">
                {stats.totalWithdrawn.toLocaleString()} AC
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-md border-zinc-800 bg-zinc-950/80 lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline text-lg text-zinc-100">
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-md border border-zinc-800 bg-zinc-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Videos</p>
              <p className="mt-2 text-3xl font-bold text-white">{wallet.videoCount}</p>
            </div>
            <div className="rounded-md border border-zinc-800 bg-zinc-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Total views</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {stats.totalViews.toLocaleString()}
              </p>
            </div>
            <div className="rounded-md border border-zinc-800 bg-zinc-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Avg revenue/video</p>
              <p className="mt-2 text-3xl font-bold text-[#fcbf49]">
                {stats.avgRevenuePerVideo.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

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
