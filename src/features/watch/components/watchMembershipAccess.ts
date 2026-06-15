import type { PublicMembershipTier } from "../services/publicMedia.types";

export function isJoinableMembershipTier(
  tier: PublicMembershipTier,
  isMembershipClosedByAdmin = false,
) {
  return !isMembershipClosedByAdmin && tier.isAcceptingNew;
}

export function hasJoinableMembershipTier(
  tiers: PublicMembershipTier[],
  isMembershipClosedByAdmin = false,
) {
  return tiers.some((tier) => isJoinableMembershipTier(tier, isMembershipClosedByAdmin));
}

export function findRecommendedMembershipTier(
  tiers: PublicMembershipTier[],
  requiredTierLevel: number | null,
  isMembershipClosedByAdmin = false,
) {
  if (requiredTierLevel == null || isMembershipClosedByAdmin) {
    return null;
  }

  return [...tiers]
    .filter((tier) => isJoinableMembershipTier(tier, isMembershipClosedByAdmin))
    .sort((a, b) => a.level - b.level || a.priceCoin - b.priceCoin)
    .find((tier) => tier.level >= requiredTierLevel) ?? null;
}

export function getMembershipJoinHref(channelId: string, tierId: string | null | undefined) {
  if (!channelId || !tierId) {
    return null;
  }

  return `/creator/${channelId}/join?tier=${tierId}`;
}
