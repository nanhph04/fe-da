import type { PaymentTransaction } from "./wallet.types";

export interface PaymentRequest {
  serviceType: "VIDEO" | "MEMBERSHIP";
  serviceId: string;
  channelId: string;
  channelOwnerId: string;
  coinAmount: number;
}

export interface PaymentResponse {
  payerWalletId: string;
  channelWalletId: string;
  systemWalletId: string;
  serviceType: "VIDEO" | "MEMBERSHIP";
  serviceId: string;
  channelId: string;
  channelOwnerId: string;
  coinAmount: number;
  splitPercent: number;
  creatorCoins: number;
  systemCoins: number;
  transactions: PaymentTransaction[];
}
