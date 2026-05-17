import { PaymentService } from "@/features/wallet/services/paymentService";
import type { PaymentResponse } from "@/features/wallet/types/wallet.types";
import type { MembershipPaymentChannel, MembershipPaymentTier } from "../types/membership.types";

interface CreateMembershipPaymentInput {
  channel: MembershipPaymentChannel;
  tier: MembershipPaymentTier;
  idempotencyKey: string;
  requestId?: string;
}

export async function createMembershipPayment({
  channel,
  tier,
  idempotencyKey,
  requestId,
}: CreateMembershipPaymentInput): Promise<PaymentResponse> {
  return PaymentService.createPayment(
    {
      serviceType: "membership",
      serviceId: tier.id,
      channelId: channel.id,
      channelOwnerId: channel.userId,
      coinAmount: tier.priceCoin,
      metadata: {
        channelName: channel.name,
        packageName: tier.name,
        thumbnailUrl: channel.avatarUrl ?? undefined,
      },
    },
    idempotencyKey,
    requestId,
  );
}
