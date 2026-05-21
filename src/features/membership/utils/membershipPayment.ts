import { createIdempotencyKey, createRandomId } from "@/shared/utils/idempotency";
import type { MembershipPaymentSession } from "../types/membership.types";

export function createMembershipPaymentSession(
  userId: string,
  channelId: string,
  tierId: string,
): MembershipPaymentSession {
  const paymentIntentId = createRandomId();

  return {
    idempotencyKey: createIdempotencyKey("membership", userId, channelId, tierId, paymentIntentId),
    requestId: `membership-checkout:${paymentIntentId}`,
  };
}
