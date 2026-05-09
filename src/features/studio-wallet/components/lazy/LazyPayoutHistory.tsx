'use client';

import type { Payout } from "../../types/payout.types";
import { lazy, Suspense } from 'react';

// Lazy load PayoutHistory component
const PayoutHistory = lazy(() => import('../PayoutHistory'));

interface LazyPayoutHistoryProps {
  initialItems?: Payout[];
  initialPagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  className?: string;
}

export const LazyPayoutHistory: React.FC<LazyPayoutHistoryProps> = ({
  className,
  initialItems,
  initialPagination,
}) => {
  return (
    <Suspense fallback={<WalletHistorySkeleton />}>
      <PayoutHistory
        className={className}
        initialItems={initialItems}
        initialPagination={initialPagination}
      />
    </Suspense>
  );
};

// Skeleton loader for payout history
const WalletHistorySkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-gray-800 rounded w-1/3"></div>
        <div className="h-32 bg-gray-800 rounded"></div>
        <div className="h-4 bg-gray-800 rounded w-1/4"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-800 rounded-lg p-4">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2 mb-1"></div>
            <div className="h-3 bg-gray-700 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
