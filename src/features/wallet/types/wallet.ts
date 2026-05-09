import type { UserWallet } from "./base-wallet.types";

export type Wallet = UserWallet;

export interface WalletResponse {
  success: boolean;
  code: number;
  data: Wallet;
  mess?: string;
}
