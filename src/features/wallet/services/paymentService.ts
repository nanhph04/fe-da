import { api } from "@/shared/api/client";
import { PaymentRequest, PaymentResponse } from "../types/wallet.types";

export class PaymentService {
  /**
   * Create a payment
   * @param payload Payment request payload
   * @param idempotencyKey A unique key to prevent duplicate payments
   */
  static async createPayment(payload: PaymentRequest, idempotencyKey: string): Promise<PaymentResponse> {
    const response = await api.post<PaymentResponse>("/api/payments", payload, {
      requireAuth: true,
      headers: {
        "idempotency-key": idempotencyKey,
      },
    });
    return response.data;
  }
}
