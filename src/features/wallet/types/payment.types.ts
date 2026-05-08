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
  serviceType: string;
  serviceId: string;
  channelId: string;
  channelOwnerId: string;
  coinAmount: number;
  splitPercent: number;
  creatorCoins: number;
  systemCoins: number;
  transactions: any[];
}
