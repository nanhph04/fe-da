export interface BankInfo {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  qrCode?: string;
}

export type WithdrawalStatus =
  | "pending"
  | "approved"
  | "processing"
  | "completed"
  | "rejected"
  | "cancelled";

export interface Withdrawal {
  id: string;
  walletId: string;
  userId: string;
  coinAmount: number;
  moneyAmount: number;
  exchangeRate: number;
  bankInfo: BankInfo;
  status: WithdrawalStatus;
  adminNote: string | null;
  processedByAdminId: string | null;
  transferReference: string | null;
  description: string | null;
  rejectionReason: string | null;
  requestedAt: string;
  approvedAt: string | null;
  completedAt: string | null;
  rejectedAt: string | null;
  cancelledAt: string | null;
}

export interface CreateWithdrawalRequest {
  coinAmount: number;
  bankInfo: BankInfo;
  description?: string;
}

export interface WithdrawalHistoryFilters {
  status?: WithdrawalStatus | "ALL";
  page?: number;
  limit?: number;
}

export interface WithdrawalHistoryResponse {
  withdrawals: Withdrawal[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface WithdrawalSummary {
  totalRequested: number;
  totalApproved: number;
  totalCompleted: number;
  totalRejected: number;
  pendingCount: number;
  avgProcessingTime: number;
  lastWithdrawalDate?: string;
}
