import { mediaService } from "@/features/watch/services/mediaService";
import type { MembershipPurchaseResponse } from "@/features/watch/services/mediaService";
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
}: CreateMembershipPaymentInput): Promise<MembershipPurchaseResponse> {
  const response = await mediaService.purchaseMembership(channel.id, tier.id, {
    idempotencyKey,
    requestId,
  });

  return response.data;
}
