export type WalletStatus = "ACTIVE" | "INACTIVE" | "FROZEN";
export type WalletType = "USER";

export interface Wallet {
  id: string;
  userId: string;
  type: WalletType;
  balance: number;
  frozenBalance: number;
  status: WalletStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WalletResponse {
  success: boolean;
  code: number;
  data: Wallet;
  mess?: string;
}