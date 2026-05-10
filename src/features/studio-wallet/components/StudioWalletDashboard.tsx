"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="space-y-10">
      <header className="flex flex-col gap-6 border-b border-border/30 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <nav className="mb-3 flex items-center gap-2 font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <span>Creator Studio</span>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-secondary">Aura Wallet</span>
          </nav>
          <h1 className="font-headline text-4xl font-black tracking-tight text-foreground">
            Aura Wallet <span className="font-light text-muted-foreground">&</span> Payouts
          </h1>
          <p className="mt-2 max-w-md font-body text-sm text-muted-foreground">
            Track earned Aura Coins and convert eligible balances to your preferred currency.
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-lg border border-border/30 bg-card px-6 py-3">
          <div>
            <span className="mb-1 block font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Convertible Balance
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
            Withdraw Now
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

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-lg border border-border/30 bg-card p-6 lg:col-span-1">
          <h2 className="mb-6 font-headline text-lg font-bold text-foreground">Payout Snapshot</h2>
          <div className="space-y-4 font-body text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Available balance</span>
              <span className="font-headline font-semibold text-foreground">{stats.availableBalance.toLocaleString()} AC</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Pending payouts</span>
              <span className="font-headline font-semibold text-secondary">{stats.pendingPayouts.toLocaleString()} AC</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total withdrawn</span>
              <span className="font-headline font-semibold text-foreground">{stats.totalWithdrawn.toLocaleString()} AC</span>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border/30 bg-card p-6 lg:col-span-2">
          <h2 className="mb-6 font-headline text-lg font-bold text-foreground">Performance Summary</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard label="Videos" value={wallet.videoCount.toLocaleString()} />
            <MetricCard label="Total views" value={stats.totalViews.toLocaleString()} />
            <MetricCard label="Avg revenue/video" value={stats.avgRevenuePerVideo.toFixed(2)} tone="secondary" />
          </div>
        </section>
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

function MetricCard({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "secondary" }) {
  return (
    <div className="rounded-lg border border-border/30 bg-background p-4">
      <p className="font-label text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className={`mt-2 font-headline text-3xl font-bold ${tone === "secondary" ? "text-secondary" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

export default StudioWalletDashboard;
