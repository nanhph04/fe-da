"use client";

import type { StudioWallet, WalletStats } from "../types/studio-wallet.types";
import { StudioWalletDashboard } from "./StudioWalletDashboard";

interface StudioWalletDashboardClientProps {
  initialWallet: StudioWallet;
  initialStats: WalletStats;
}

export function StudioWalletDashboardClient({
  initialWallet,
  initialStats,
}: StudioWalletDashboardClientProps) {
  return (
    <StudioWalletDashboard
      initialWallet={initialWallet}
      initialStats={initialStats}
    />
  );
}
