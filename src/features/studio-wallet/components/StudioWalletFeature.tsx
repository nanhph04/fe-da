"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getErrorMessage } from "@/shared/api/client";
import { StudioWalletDashboard } from "./StudioWalletDashboard";
import { StudioWalletService } from "../services/studioWalletService";
import type { StudioWallet, WalletStats } from "../types/studio-wallet.types";

export function StudioWalletFeature() {
  const [wallet, setWallet] = useState<StudioWallet | null>(null);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [walletData, statsData] = await Promise.all([
        StudioWalletService.getStudioWallet(),
        StudioWalletService.getWalletStats(),
      ]);

      setWallet(walletData);
      setStats(statsData);
    } catch (err) {
      setWallet(null);
      setStats(null);
      setError(getErrorMessage(err, "Không thể tải dữ liệu ví studio."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchWallet();
  }, [fetchWallet]);

  if (isLoading) {
    return <StudioWalletLoading />;
  }

  if (error || !wallet || !stats) {
    return <StudioWalletError message={error ?? "Không tìm thấy dữ liệu ví studio."} onRetry={fetchWallet} />;
  }

  return (
    <div className="mx-auto max-w-7xl px-8 py-8">
      <StudioWalletDashboard initialWallet={wallet} initialStats={stats} />
    </div>
  );
}

function StudioWalletLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-8 py-8">
      <div className="space-y-3 border-b border-border/30 pb-8">
        <div className="h-3 w-48 rounded-sm bg-muted" />
        <div className="h-10 w-80 rounded-sm bg-muted" />
        <div className="h-4 w-full max-w-md rounded-sm bg-muted" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {["balance", "pending", "withdrawn"].map((item) => (
          <div key={item} className="rounded-lg border border-border/30 bg-card p-6">
            <div className="h-3 w-28 rounded-sm bg-muted" />
            <div className="mt-4 h-8 w-36 rounded-sm bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

function StudioWalletError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center px-8 py-8">
      <Card className="w-full rounded-lg border-border/40 bg-card">
        <CardContent className="flex flex-col gap-5 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">
              Studio Wallet
            </p>
            <h1 className="mt-2 font-headline text-2xl font-black tracking-tight text-foreground">
              Không thể tải ví studio
            </h1>
            <p className="mt-2 max-w-2xl font-body text-sm text-muted-foreground">{message}</p>
          </div>
          <Button
            type="button"
            onClick={onRetry}
            className="rounded-sm bg-primary px-6 font-headline text-xs font-bold uppercase tracking-widest text-primary-foreground hover:opacity-90"
          >
            Thử lại
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
