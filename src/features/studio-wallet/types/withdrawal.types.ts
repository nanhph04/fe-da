export interface BankInfo {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  qrCode?: string;
}

export interface Withdrawal {
  id: string;
  walletId: string;
  userId: string;
  coinAmount: number;
  moneyAmount: number;
  exchangeRate: number;
  bankInfo: BankInfo;
  status: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
  adminNote?: string;
  processedByAdminId?: string;
  transferReference?: string;
  description?: string;
  rejectionReason?: string;
  requestedAt: string;
  approvedAt?: string;
  completedAt?: string;
  rejectedAt?: string;
  cancelledAt?: string;
}

export interface CreateWithdrawalRequest {
  coinAmount: number;
  moneyAmount: number;
  exchangeRate: number;
  bankInfo: BankInfo;
  description?: string;
}

export interface WithdrawalHistoryFilters {
  status?: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED' | 'ALL';
  methodType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
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

export interface WithdrawalStatus {
  id: string;
  status: string;
  processedBy?: string;
  processedAt?: string;
  notes?: string;
}

export interface WithdrawalMethod {
  id: string;
  type: 'BANK' | 'WALLET' | 'CRYPTO';
  name: string;
  accountNumber: string;
  bankName?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeeCalculationRequest {
  amount: number;
  methodType: string;
}

export interface FeeCalculationResponse {
  amount: number;
  fee: number;
  totalAmount: number;
  feePercentage: number;
  fixedFee: number;
  methodType: string;
  currency: string;
}

export interface WithdrawalMethodConfig {
  bankTransfer: {
    enabled: boolean;
    minAmount: number;
    maxAmount: number;
    feePercentage: number;
    fixedFee: number;
    processingTime: string;
    currencies: Array<{
      code: string;
      name: string;
      symbol: string;
      decimalDigits: number;
    }>;
  };
  wallet: {
    enabled: boolean;
    minAmount: number;
    maxAmount: number;
    feePercentage: number;
    fixedFee: number;
    processingTime: string;
    supportedWallets: Array<{
      provider: string;
      name: string;
    }>;
  };
  crypto: {
    enabled: boolean;
    minAmount: number;
    maxAmount: number;
    feePercentage: number;
    fixedFee: number;
    processingTime: string;
    supportedCoins: Array<{
      symbol: string;
      name: string;
    }>;
  };
}

export interface WithdrawalValidationResponse {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
  availableBalance?: number;
  minAmount?: number;
  maxAmount?: number;
}
