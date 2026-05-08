import { WalletStatus, WalletType, UserWallet } from "./base-wallet.types";

export interface Wallet extends UserWallet {}

export interface WalletResponse {
  success: boolean;
  code: number;
  data: Wallet;
  mess?: string;
}