import type { ApiPagination } from "@/shared/api/types";

export type AdminChannelTransactionStatus = "pending" | "completed" | "failed" | "cancelled" | string;
export type AdminChannelTransactionType =
  | "deposit"
  | "withdrawal"
  | "payment"
  | "video_purchase"
  | "membership_purchase"
  | "member_subscription"
  | "channel_revenue"
  | "system_revenue"
  | "refund"
  | "system_adjustment"
  | string;

export interface AdminChannelTransactionMetadata {
  serviceType?: string;
  serviceId?: string;
  channelId?: string;
  channelOwnerId?: string;
  splitPercent?: number;
  creatorCoins?: number;
  systemCoins?: number;
  channelName?: string;
  [key: string]: unknown;
}

export interface TransactionResponseDto {
  id: string;
  type: AdminChannelTransactionType;
  assetType: string;
  amount: number;
  status: AdminChannelTransactionStatus;
  fromWalletId: string | null;
  toWalletId: string | null;
  initiatedByUserId: string | null;
  referenceId: string | null;
  description: string | null;
  failureReason: string | null;
  metadata: AdminChannelTransactionMetadata | null;
  completedAt: string | null;
  failedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminChannelTransactionsSummary {
  totalTransactions: number;
  totalAmount: number;
  completedAmount: number;
  pendingAmount: number;
  failedAmount: number;
  creatorCoins: number;
  systemCoins: number;
}

export interface AdminChannelTransactionsParams {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  assetType?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface AdminChannelTransactionsResponse {
  items: TransactionResponseDto[];
  summary: AdminChannelTransactionsSummary;
  pagination: ApiPagination;
}
