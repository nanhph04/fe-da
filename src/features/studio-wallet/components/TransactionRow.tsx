import { useState } from "react";
import { Withdrawal } from "../types/withdrawal.types";

interface TransactionRowProps {
  item: Withdrawal;
  onCancel: (id: string) => void;
  onView: (item: Withdrawal) => void;
  formatDate: (dateStr: string) => string;
}

export function TransactionRow({ item, onCancel, onView, formatDate }: TransactionRowProps) {
  // Handle cancel state
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = () => {
    setIsCancelling(true);
    onCancel(item.id);
    setTimeout(() => setIsCancelling(false), 2000);
  };

  // Get status badge styling
  const getStatusBadge = (status: Withdrawal['status']) => {
    const baseClasses = "inline-block px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest";

    switch (status) {
      case 'completed':
        return (
          <span className={`${baseClasses} bg-green-500/10 text-green-500`}>
            Completed
          </span>
        );
      case 'pending':
        return (
          <span className={`${baseClasses} bg-yellow-500/10 text-yellow-500 animate-pulse`}>
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className={`${baseClasses} bg-blue-500/10 text-blue-500`}>
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className={`${baseClasses} bg-red-500/10 text-red-500`}>
            Rejected
          </span>
        );
      case 'cancelled':
        return (
          <span className={`${baseClasses} bg-red-500/10 text-red-500`}>
            Cancelled
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-zinc-500/10 text-muted-foreground`}>
            {status}
          </span>
        );
    }
  };

  // Format amount based on status
  const getAmountDisplay = () => {
    const baseClasses = "text-sm font-bold";

    if (item.status === 'completed') {
      return <span className={`${baseClasses} text-[var(--color-secondary-600)]`}>{(item.coinAmount).toLocaleString()} AC</span>;
    } else if (item.status === 'rejected' || item.status === 'cancelled') {
      return <span className={`${baseClasses} text-red-500`}>{(item.coinAmount).toLocaleString()} AC</span>;
    } else {
      return <span className={`${baseClasses} text-[var(--color-primary-600)]`}>{(item.coinAmount).toLocaleString()} AC</span>;
    }
  };

  return (
    <tr className="border-b border-[var(--color-border-700)]/50 hover:bg-[var(--color-background-900)] transition-colors">
      <td className="py-4 px-4">
        <div>
          <div className="text-sm font-bold text-[var(--color-primary-600)]">
            {item.id.split('-').pop()?.substring(0, 8).toUpperCase()}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {item.id}
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <div>
          <div className="text-sm text-foreground/80">
            {formatDate(item.requestedAt)}
          </div>
          {item.completedAt && (
            <div className="text-xs text-green-500 mt-1">
              Completed: {formatDate(item.completedAt)}
            </div>
          )}
        </div>
      </td>
      <td className="py-4 px-4">
        <div>
          <div className="text-sm font-bold text-foreground">
            {item.bankInfo.bankName}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            **** {item.bankInfo.accountNumber.slice(-4)}
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        {getAmountDisplay()}
      </td>
      <td className="py-4 px-4 text-right">
        {getStatusBadge(item.status)}
      </td>
      <td className="py-4 px-4 text-right">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onView(item)}
            className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
          >
            Details
          </button>
          {item.status === 'pending' && (
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCancelling ? "Cancelling..." : "Cancel"}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
