'use client';

import { StudioWallet, WalletStats } from "../types/studio-wallet.types";

interface WalletOverviewProps {
  wallet: StudioWallet;
  stats: WalletStats;
  onWithdraw: () => void;
  isLoading: boolean;
}

export function WalletOverview({ wallet, stats, onWithdraw, isLoading }: WalletOverviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: wallet.currency || 'USD'
    }).format(amount);
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Main Balance Card */}
      <div className="bg-[#131315] border border-[var(--color-border-700)] rounded-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Total Balance
          </span>
          <span className="px-3 py-1 bg-[var(--color-border-700)] rounded-full text-xs font-medium text-zinc-400">
            {wallet.status}
          </span>
        </div>

        <div className="space-y-2">
          <span className="text-5xl font-extrabold font-headline text-white">
            {stats.totalBalance.toLocaleString()}{" "}
            <span className="text-2xl font-normal text-zinc-500">AC</span>
          </span>
          <p className="text-sm text-zinc-400">
            ≈ ${(stats.totalBalance * 0.01).toFixed(2)} USD
          </p>
        </div>

        {/* Balance Breakdown */}
        <div className="mt-8 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-400">Available</span>
            <span className="text-lg font-semibold text-white">
              {stats.availableBalance.toLocaleString()} AC
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-400">Pending</span>
            <span className="text-lg font-semibold text-[var(--color-primary-600)]">
              {stats.pendingPayouts.toLocaleString()} AC
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-400">Total Earned</span>
            <span className="text-lg font-semibold text-[var(--color-secondary-600)]">
              {stats.totalBalance.toLocaleString()} AC
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats Card */}
      <div className="bg-[#131315] border border-[var(--color-border-700)] rounded-xl p-8">
        <h3 className="text-lg font-semibold font-headline text-white mb-6">
          Studio Performance
        </h3>

        <div className="space-y-6">
          <StatItem
            label="Videos"
            value={wallet.videoCount}
            icon="📹"
            color="text-white"
          />
          <StatItem
            label="Total Views"
            value={stats.totalViews.toLocaleString()}
            icon="👁️"
            color="text-white"
          />
          <StatItem
            label="Avg Revenue/Video"
            value={`$${stats.avgRevenuePerVideo.toFixed(2)}`}
            icon="💰"
            color="text-[var(--color-secondary-600)]"
          />
          {stats.topPerformingVideo && (
            <div className="pt-4 border-t border-[var(--color-border-700)]">
              <p className="text-xs text-zinc-400 mb-2">Top Video</p>
              <div className="flex items-center space-x-3">
                <div className="text-xl">🏆</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white truncate">
                    {stats.topPerformingVideo.title}
                  </p>
                  <p className="text-xs text-[var(--color-secondary-600)]">
                    ${stats.topPerformingVideo.revenue} earned
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Withdraw Button */}
        <div className="mt-6">
          <button
            onClick={onWithdraw}
            disabled={wallet.balance <= 0 || isLoading}
            className="w-full py-3 bg-crimson-600 hover:bg-crimson-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-semibold flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                Withdraw Funds
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

interface StatItemProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

function StatItem({ label, value, icon, color }: StatItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <span className="text-xl">{icon}</span>
        <span className="text-sm text-zinc-400">{label}</span>
      </div>
      <span className={`text-sm font-semibold ${color} font-headline`}>
        {value}
      </span>
    </div>
  );
}
