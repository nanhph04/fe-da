import { api } from "@/shared/api/client";

import type {
  AdminMembershipReviewDecisionResponse,
  AdminMembershipReviewItem,
  MembershipReviewDecisionPayload,
  MembershipReviewStatus,
} from "../types/admin-verification.types";

const buildReviewQuery = (status: MembershipReviewStatus) => {
  const params = new URLSearchParams({ status });
  return params.toString();
};

export const adminMembershipReviewService = {
  async getReviews(status: MembershipReviewStatus = "pending") {
    const response = await api.get<AdminMembershipReviewItem[]>(
      `/api/media/admin/channels/membership-reviews?${buildReviewQuery(status)}`,
      { requireAuth: true }
    );

    return response.data;
  },

  async decideReview(channelId: string, payload: MembershipReviewDecisionPayload) {
    const response = await api.patch<AdminMembershipReviewDecisionResponse>(
      `/api/media/admin/channels/${channelId}/membership-review`,
      payload,
      { requireAuth: true }
    );

    return response.data;
  },
};
