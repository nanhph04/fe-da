export type PaymentMethodType = "BANK_ACCOUNT" | "E_WALLET" | "CRYPTO";
export type PayoutStatus =
  | "PENDING"
  | "APPROVED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  bankInfo?: BankInfo;
  cryptoInfo?: CryptoInfo;
  eWalletInfo?: EWalletInfo;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BankInfo {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  branchName?: string;
  qrCode?: string;
}

export interface CryptoInfo {
  address: string;
  network: string;
  currency: string;
  walletName?: string;
}

export interface EWalletInfo {
  provider: string;
  accountNumber: string;
  accountHolderName: string;
}

export interface Payout {
  id: string;
  walletId: string;
  userId: string;
  amount: number;
  fee: number;
  netAmount: number;
  method: PaymentMethod;
  status: PayoutStatus;
  adminNote?: string;
  processedByAdminId?: string;
  transferReference?: string;
  description: string;
  rejectionReason?: string;
  requestedAt: string;
  approvedAt?: string;
  completedAt?: string;
  rejectedAt?: string;
  cancelledAt?: string;
}

export interface CreatePayoutRequest {
  amount: number;
  methodId: string;
  description?: string;
}

export interface PayoutHistoryFilters {
  status?: "ALL" | "PENDING" | "APPROVED" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  methodType?: PaymentMethodType;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PayoutSummary {
  totalPending: number;
  totalProcessing: number;
  totalCompleted: number;
  totalFailed: number;
  totalAmount: number;
  totalFees: number;
  averageProcessingTime: number; // in hours
}

export interface PayoutMethodConfig {
  bank: {
    minAmount: number;
    maxAmount: number;
    fee: number;
    feeType: "percentage" | "fixed";
    processingTime: string;
  };
  crypto: {
    minAmount: number;
    maxAmount: number;
    fee: number;
    feeType: "percentage" | "fixed";
    processingTime: string;
  };
  eWallet: {
    minAmount: number;
    maxAmount: number;
    fee: number;
    feeType: "percentage" | "fixed";
    processingTime: string;
  };
}

export interface FeeCalculationRequest {
  amount: number;
  methodId: string;
}

export interface FeeCalculationResponse {
  amount: number;
  fee: number;
  netAmount: number;
  feePercentage: number;
  minAmount: number;
  maxAmount: number;
}
