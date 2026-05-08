import { api } from "@/shared/api/client";
import { DepositPackage } from "@/features/wallet/types/wallet.types";

export interface CreatePackagePayload {
  code: string;
  name: string;
  moneyAmount: number;
  baseCoinAmount: number;
  bonusCoinAmount: number;
  sortOrder: number;
  isActive: boolean;
  description: string;
}

export type UpdatePackagePayload = Partial<CreatePackagePayload>;

export class AdminDepositService {
  /**
   * Get all deposit packages including inactive ones
   */
  static async getAdminPackages(): Promise<DepositPackage[]> {
    const response = await api.get<DepositPackage[]>("/api/deposits/admin/packages", { requireAuth: true });
    return response.data;
  }

  /**
   * Create a new deposit package
   */
  static async createPackage(payload: CreatePackagePayload): Promise<DepositPackage> {
    const response = await api.post<DepositPackage>("/api/deposits/admin/packages", payload, { requireAuth: true });
    return response.data;
  }

  /**
   * Update an existing deposit package
   */
  static async updatePackage(packageId: string, payload: UpdatePackagePayload): Promise<DepositPackage> {
    const response = await api.patch<DepositPackage>(`/api/deposits/admin/packages/${packageId}`, payload, { requireAuth: true });
    return response.data;
  }

  /**
   * Reconcile a pending deposit
   */
  static async reconcileDeposit(depositId: string): Promise<any> {
    const response = await api.post<any>(`/api/deposits/admin/${depositId}/reconcile`, {}, { requireAuth: true });
    return response.data;
  }
}
