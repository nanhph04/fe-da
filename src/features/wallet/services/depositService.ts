import { api } from "@/shared/utils/apiClient";
import { Deposit, DepositPackage } from "../types/wallet.types";

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
  static async createDeposit(packageId: string): Promise<Deposit> {
    const response = await api.post<Deposit>("/api/deposits", { packageId }, { requireAuth: true });
    return response.data;
  }
}
