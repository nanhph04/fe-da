import { cn } from '@/shared/utils/cn';

interface LoadingSkeletonProps {
  type?: 'wallet-dashboard' | 'payout-management' | 'earnings-dashboard' | 'default';
  className?: string;
}

export function LoadingSkeleton({ type = 'default', className }: LoadingSkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-800 rounded-lg";

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="space-y-2">
        <div className={cn(baseClasses, "h-8 w-48 rounded")} />
        <div className={cn(baseClasses, "h-4 w-96 rounded")} />
      </div>

      {/* Different skeleton patterns based on type */}
      {type === 'wallet-dashboard' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className={cn(baseClasses, "h-32")} />
            ))}
          </div>

          {/* Transaction List */}
          <div>
            <div className={cn(baseClasses, "h-6 w-32 mb-4")} />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={cn(baseClasses, "h-16")} />
              ))}
            </div>
          </div>
        </div>
      )}

      {type === 'payout-management' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className={cn(baseClasses, "h-32")} />
            ))}
          </div>

          {/* Payment Method List */}
          <div>
            <div className={cn(baseClasses, "h-6 w-48 mb-4")} />
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={cn(baseClasses, "h-10 w-10 rounded-full")} />
                    <div className="space-y-2">
                      <div className={cn(baseClasses, "h-4 w-32")} />
                      <div className={cn(baseClasses, "h-3 w-24")} />
                    </div>
                  </div>
                  <div className={cn(baseClasses, "h-8 w-20 rounded")} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {type === 'earnings-dashboard' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={cn(baseClasses, "h-32")} />
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={cn(baseClasses, "h-64 lg:col-span-2")} />
            <div className={cn(baseClasses, "h-64")} />
          </div>

          {/* Video List */}
          <div>
            <div className={cn(baseClasses, "h-6 w-40 mb-4")} />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={cn(baseClasses, "h-10 w-10 rounded")} />
                    <div className="space-y-1">
                      <div className={cn(baseClasses, "h-4 w-48")} />
                      <div className={cn(baseClasses, "h-3 w-32")} />
                    </div>
                  </div>
                  <div className={cn(baseClasses, "h-6 w-24")} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {type === 'default' && (
        <div className="space-y-4">
          <div className={cn(baseClasses, "h-4 w-full")} />
          <div className={cn(baseClasses, "h-4 w-5/6")} />
          <div className={cn(baseClasses, "h-4 w-4/6")} />
        </div>
      )}
    </div>
  );
}