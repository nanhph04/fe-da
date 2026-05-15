import type { PaymentMetadata, PaymentServiceType, PaymentTransaction } from "./wallet.types";

export interface PaymentRequest {
  serviceType: PaymentServiceType;
  serviceId: string;
  channelId: string;
  channelOwnerId: string;
  coinAmount: number;
  metadata?: PaymentMetadata;
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
