import type { PublicMembershipTier } from "../services/publicMedia.types";
import {
  findRecommendedMembershipTier,
  getMembershipJoinHref,
  hasJoinableMembershipTier,
  isJoinableMembershipTier,
} from "./watchMembershipAccess";

const membershipTiers: PublicMembershipTier[] = [
  {
    id: "tier-basic",
    channelId: "channel-1",
    name: "Basic",
    level: 1,
    priceCoin: 100,
    isAcceptingNew: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "tier-premium",
    channelId: "channel-1",
    name: "Premium",
    level: 2,
    priceCoin: 200,
    isAcceptingNew: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "tier-exclusive",
    channelId: "channel-1",
    name: "Exclusive",
    level: 3,
    priceCoin: 300,
    isAcceptingNew: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

describe("watchMembershipAccess", () => {
  it("returns the first joinable tier that satisfies the required level", () => {
    expect(findRecommendedMembershipTier(membershipTiers, 2)?.id).toBe("tier-premium");
  });

  it("does not recommend a membership tier when no required level is provided", () => {
    expect(findRecommendedMembershipTier(membershipTiers, null)).toBeNull();
  });

  it("does not recommend a tier when the channel is membership-locked", () => {
    expect(findRecommendedMembershipTier(membershipTiers, 2, true)).toBeNull();
    expect(hasJoinableMembershipTier(membershipTiers, true)).toBe(false);
  });

  it("does not build a generic join path without a tier id", () => {
    expect(getMembershipJoinHref("channel-1", undefined)).toBeNull();
    expect(getMembershipJoinHref("", "tier-premium")).toBeNull();
  });

  it("builds a tier-specific join path only for joinable tiers", () => {
    expect(isJoinableMembershipTier(membershipTiers[1])).toBe(true);
    expect(isJoinableMembershipTier(membershipTiers[1], true)).toBe(false);
    expect(getMembershipJoinHref("channel-1", membershipTiers[1].id)).toBe(
      "/creator/channel-1/join?tier=tier-premium",
    );
  });
});
