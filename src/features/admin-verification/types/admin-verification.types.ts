export type MembershipReviewStatus = "pending" | "approved" | "rejected";

export interface AdminMembershipReviewItem {
  channelId: string;
  userId: string;
  name: string;
  status: string;
  isEligibleForMembership: boolean;
  isMembershipClosedByAdmin: boolean;
  membershipReviewStatus: MembershipReviewStatus;
  membershipRejectionReason: string | null;
  membershipRequestedAt: string | null;
  membershipReviewedAt: string | null;
  readyVideoCount: number;
  minReadyVideoCount: number;
  totalVideoViews: number;
  minTotalVideoViews: number;
}

export type MembershipReviewDecisionPayload =
  | { action: "approve" }
  | { action: "reject"; reason: string };

export interface AdminMembershipReviewDecisionResponse {
  id: string;
  userId: string;
  name: string;
  bio: string;
  isEligibleForMembership: boolean;
  isMembershipClosedByAdmin: boolean;
  membershipReviewStatus: "not_requested" | MembershipReviewStatus;
  membershipRejectionReason: string | null;
  membershipRequestedAt: string | null;
  membershipReviewedAt: string | null;
  avatarUrl: string;
  bannerUrl: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
