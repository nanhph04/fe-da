'use client';

import { lazy, Suspense } from 'react';

// Lazy load EarningsOverview component
const EarningsOverview = lazy(() => import('../EarningsOverview'));

interface LazyEarningsOverviewProps {
  filters?: any;
  className?: string;
}

export const LazyEarningsOverview: React.FC<LazyEarningsOverviewProps> = ({
  className: _className,
}) => {
  return (
    <Suspense fallback={<WalletEarningsSkeleton />}>
      <EarningsOverview />
    </Suspense>
  );
};

// Skeleton loader for earnings overview
const WalletEarningsSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-800 rounded-lg p-4">
            <div className="h-3 bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-700 rounded w-1/4 mt-2"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="animate-pulse bg-gray-800 rounded-lg p-6 h-80">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-2 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
        <div className="animate-pulse bg-gray-800 rounded-lg p-6 h-80">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-2 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
      <div className="animate-pulse bg-gray-800 rounded-lg p-6">
        <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="h-10 bg-gray-700 rounded w-10"></div>
              <div className="flex-1">
                <div className="h-3 bg-gray-700 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
