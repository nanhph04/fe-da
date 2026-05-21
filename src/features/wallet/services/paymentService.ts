import { api } from "@/shared/api/client";
import { PaymentRequest, PaymentResponse } from "../types/wallet.types";
import { assertWalletCanOperate } from "../types/wallet-utils";
import { WalletService } from "./walletService";

export class PaymentService {
  /**
   * Create a payment
   * @param payload Payment request payload
   * @param idempotencyKey A unique key to prevent duplicate payments
   */
  static async createPayment(
    payload: PaymentRequest,
    idempotencyKey: string,
    userId: string,
    requestId?: string
  ): Promise<PaymentResponse> {
    const wallet = await WalletService.getMyWallet();
    assertWalletCanOperate(wallet.status, "spend");

    const headers: Record<string, string> = {
      "idempotency-key": idempotencyKey,
      "x-user-id": userId,
    };

    if (requestId) {
      headers["x-request-id"] = requestId;
    }

    const response = await api.post<PaymentResponse>("/api/payments", payload, {
      requireAuth: true,
      headers,
    });
    return response.data;
  }
}
