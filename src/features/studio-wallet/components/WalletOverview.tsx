"use client";

import { StudioWallet, WalletStats } from "../types/studio-wallet.types";

interface WalletOverviewProps {
  wallet: StudioWallet;
  stats: WalletStats;
  onWithdraw: () => void;
  isLoading: boolean;
}

const summaryCards = [
  { label: "Total Earned AC", icon: "stars", key: "total" },
  { label: "Available for Payout", icon: "account_balance_wallet", key: "available" },
  { label: "Pending Payouts", icon: "schedule", key: "pending" },
] as const;

export function WalletOverview({ wallet, stats, onWithdraw, isLoading }: WalletOverviewProps) {
  const values = {
    total: stats.totalBalance,
    available: stats.availableBalance,
    pending: stats.pendingPayouts,
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {summaryCards.map((card) => (
          <article
            key={card.key}
            className="group relative overflow-hidden rounded-lg border border-border/30 bg-card p-8 transition-colors hover:border-primary/30"
          >
            <div className="absolute -right-4 -top-4 opacity-[0.04] transition-opacity group-hover:opacity-10">
              <span className="material-symbols-outlined text-[10rem]" aria-hidden="true">
                {card.icon}
              </span>
            </div>
            <p className="mb-3 font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {card.label}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="font-headline text-5xl font-black tracking-tight text-foreground">
                {values[card.key].toLocaleString()}
              </p>
              <span className="font-headline text-lg font-bold text-secondary">AC</span>
            </div>
            <div className="mt-6 flex items-center gap-2 font-label text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span className="material-symbols-outlined text-sm" aria-hidden="true">
                {card.key === "total" ? "trending_up" : card.key === "available" ? "payments" : "hourglass_top"}
              </span>
              {card.key === "total" ? "+12.5% vs last month" : card.key === "available" ? "Ready to withdraw" : "Awaiting settlement"}
            </div>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <section className="rounded-lg border border-border/30 bg-card p-8 lg:col-span-2">
          <div className="mb-10 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-headline text-xl font-black tracking-tight text-foreground">Earnings Velocity</h2>
              <p className="font-body text-xs text-muted-foreground">Monthly AC accumulation trend</p>
            </div>
            <select className="rounded-sm border border-border/40 bg-background px-4 py-2 font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground outline-none focus:border-primary">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>

          <div className="relative h-64 w-full">
            <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 40">
              <defs>
                <linearGradient id="walletLine" x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--secondary))" />
                </linearGradient>
                <linearGradient id="walletFill" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,35 Q10,32 20,25 T40,15 T60,20 T80,8 T100,12" fill="none" stroke="url(#walletLine)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
              <path d="M0,35 Q10,32 20,25 T40,15 T60,20 T80,8 T100,12 V40 H0 Z" fill="url(#walletFill)" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="mt-6 flex justify-between font-label text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
            </div>
          </div>
        </section>

        <aside className="rounded-lg border border-border/30 bg-card p-8">
          <h2 className="mb-8 font-headline text-xl font-black tracking-tight text-foreground">Redemption</h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-border/30 bg-background p-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Conversion Rate</span>
                <span className="material-symbols-outlined text-sm text-secondary" aria-hidden="true">info</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-lg font-black text-foreground">100 AC</span>
                <span className="font-body text-sm text-muted-foreground">=</span>
                <span className="font-headline text-lg font-black text-secondary">10,000 VND</span>
              </div>
            </div>

            <div className="rounded-lg border border-border/30 bg-background p-4">
              <span className="font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Wallet Status</span>
              <p className="mt-2 font-headline text-lg font-bold text-foreground">{wallet.status}</p>
            </div>

            <button
              type="button"
              onClick={onWithdraw}
              disabled={wallet.balance <= 0 || isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-6 py-4 font-headline text-xs font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            >
              <span className="material-symbols-outlined text-base" aria-hidden="true">payments</span>
              {isLoading ? "Processing..." : "Withdraw Now"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
