import type { MembershipPaymentSession } from "../types/membership.types";

const createRandomId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

export function createMembershipPaymentSession(
  userId: string,
  channelId: string,
  tierId: string,
): MembershipPaymentSession {
  const paymentIntentId = createRandomId();

  return {
    idempotencyKey: `membership:${userId}:${channelId}:${tierId}:${paymentIntentId}`,
    requestId: `membership-checkout:${paymentIntentId}`,
  };
}
