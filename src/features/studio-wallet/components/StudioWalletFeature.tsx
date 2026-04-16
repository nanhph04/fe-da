"use client";

import { useState } from "react";
import { WalletDashboard } from "./WalletDashboard";
import { PayoutHistory } from "./PayoutHistory";
import { WithdrawFundsOverlay } from "./WithdrawFundsOverlay";

export function StudioWalletFeature() {
  const [showWithdrawOverlay, setShowWithdrawOverlay] = useState(false);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 w-full animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-[#f9f5f8] mb-2">Creator Wallet</h1>
        <p className="text-zinc-400">Manage your earnings, convert Aura Coins to fiat, and track your payout history.</p>
      </div>

      <WalletDashboard onWithdrawClick={() => setShowWithdrawOverlay(true)} />
      
      <PayoutHistory />

      {showWithdrawOverlay && (
        <WithdrawFundsOverlay onClose={() => setShowWithdrawOverlay(false)} />
      )}
    </div>
  );
}
