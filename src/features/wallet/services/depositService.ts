import { api } from "@/shared/api/client";
import { Deposit, DepositPackage } from "../types/wallet.types";
import { assertWalletCanOperate } from "../types/wallet-utils";
import { WalletService } from "./walletService";

export class DepositService {
  /**
   * Get list of active deposit packages
   */
  static async getDepositPackages(): Promise<DepositPackage[]> {
    const response = await api.get<DepositPackage[]>("/api/deposits/packages");
    return response.data;
  }

  /**
   * Create a new deposit request
   * @param packageId ID of the deposit package
   * @returns Deposit object containing checkoutUrl
   */
  static async createDeposit(
    packageId: string, 
    idempotencyKey?: string
  ): Promise<Deposit> {
    const wallet = await WalletService.getMyWallet();
    assertWalletCanOperate(wallet.status, "deposit");

    const response = await api.post<Deposit>(
      "/api/deposits",
      { packageId },
      {
        requireAuth: true,
        headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
      }
    );
    return response.data;
  }
}
