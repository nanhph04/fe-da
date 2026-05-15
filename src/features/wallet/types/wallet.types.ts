export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED" | "pending" | "completed" | "failed" | "cancelled";
export type TransactionType = "DEPOSIT" | "WITHDRAWAL" | "VIDEO_PURCHASE" | "CHANNEL_REVENUE" | "SYSTEM_REVENUE" | "deposit" | "withdrawal" | "payment" | "video_purchase" | "membership_purchase" | "member_subscription" | "channel_revenue" | "system_revenue" | "refund" | "system_adjustment";
export type DepositStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED" | "pending" | "processing" | "completed" | "failed" | "cancelled";
export type WithdrawalStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED" | "CANCELLED" | "pending" | "approved" | "processing" | "completed" | "rejected" | "cancelled";
export type PaymentServiceType = "video" | "membership";

export interface PaymentMetadata {
  videoTitle?: string;
  channelName?: string;
  thumbnailUrl?: string;
  packageName?: string;
}

import { WalletStatus, WalletType } from "./base-wallet.types";

export interface Wallet {
  id: string;
  userId: string;
  type: WalletType;
  balance: number;
  frozenBalance: number;
  status: WalletStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  assetType: "money" | "coin" | "MONEY" | "COIN" | string;
  amount: number;
  status: TransactionStatus;
  fromWalletId: string | null;
  toWalletId: string | null;
  initiatedByUserId: string | null;
  referenceId: string | null;
  description: string | null;
  failureReason: string | null;
  metadata: Record<string, unknown>;
  completedAt: string | null;
  failedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DepositPackage {
  id: string;
  code: string;
  name: string;
  moneyAmount: number;
  baseCoinAmount: number;
  bonusCoinAmount: number;
  totalCoinAmount: number;
  sortOrder: number;
  description: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Deposit {
  id: string;
  walletId: string;
  userId: string;
  packageId: string;
  packageCode: string;
  packageName: string;
  moneyAmount: number;
  baseCoinAmount: number;
  bonusCoinAmount: number;
  totalCoinAmount: number;
  gateway: string;
  status: DepositStatus;
  paymentCode: string;
  transferContent: string | null;
  gatewayTransactionId: string | null;
  checkoutUrl: string | null;
  description: string | null;
  requestedAt: string;
  completedAt: string | null;
  failedAt: string | null;
  cancelledAt: string | null;
}

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

export interface PaymentRequest {
  serviceType: PaymentServiceType;
  serviceId: string;
  channelId: string;
  channelOwnerId: string;
  coinAmount: number;
  metadata?: PaymentMetadata;
}

export interface PaymentTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  fromWalletId: string | null;
  toWalletId: string | null;
  referenceId: string | null;
}

export interface PaymentResponse {
  payerWalletId: string;
  channelWalletId: string;
  systemWalletId: string;
  serviceType: PaymentServiceType;
  serviceId: string;
  channelId: string;
  channelOwnerId: string;
  coinAmount: number;
  splitPercent: number;
  creatorCoins: number;
  systemCoins: number;
  transactions: PaymentTransaction[];
}
