export interface MembershipPaymentChannel {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string | null;
}

export interface MembershipPaymentTier {
  id: string;
  channelId: string;
  name: string;
  level: number;
  priceCoin: number;
  isAcceptingNew: boolean;
}

export interface MembershipPaymentSession {
  idempotencyKey: string;
  requestId: string;
}
