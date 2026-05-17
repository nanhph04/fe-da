import type { PublicChannelDetail } from "@/features/watch/services/publicMediaService";
import { CreatorHero } from "./CreatorHero";
import { MembershipCheckoutClient } from "./MembershipCheckoutClient";
import { MembershipFAQ } from "./MembershipFAQ";

interface JoinMembershipFeatureProps {
  channel: PublicChannelDetail;
  initialTierId?: string | null;
  userId: string;
}

function getBlockedMessage(channel: PublicChannelDetail) {
  if (channel.isMembershipClosedByAdmin) {
    return "Admin đang đóng khả năng nhận hội viên mới của kênh này. Hội viên cũ vẫn giữ quyền truy cập đến hết chu kỳ.";
  }

  if (!channel.isEligibleForMembership) {
    return "Kênh chưa đủ điều kiện mở membership.";
  }

  if (channel.membershipReviewStatus !== "approved") {
    return "Membership của kênh này chưa được admin duyệt.";
  }

  if (!channel.membershipTiers.some((tier) => tier.isAcceptingNew)) {
    return "Hiện không có gói membership nào đang nhận hội viên mới.";
  }

  return null;
}

export function JoinMembershipFeature({ channel, initialTierId, userId }: JoinMembershipFeatureProps) {
  const blockedMessage = getBlockedMessage(channel);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 pt-24 pb-24 lg:px-8 lg:pl-72">
      <CreatorHero channel={channel} />
      <MembershipCheckoutClient
        channel={channel}
        initialTierId={initialTierId}
        userId={userId}
        blockedMessage={blockedMessage}
      />
      <MembershipFAQ />
    </main>
  );
}
