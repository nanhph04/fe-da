import { notFound } from "next/navigation";
import { getErrorMessage } from "@/shared/api/client";
import {
  getChannelDetailCached,
  type PublicApiError,
  type PublicChannelDetail,
} from "@/features/watch/services/publicMediaService";
import { ChannelHero } from "./ChannelHero";
import { ChannelMembershipTiers } from "./ChannelMembershipTiers";
import { ChannelVideoGrid } from "./ChannelVideoGrid";

interface ChannelPageProps {
  channelId: string;
}

function buildFallbackChannel(channelId: string): PublicChannelDetail {
  return {
    id: channelId,
    userId: "",
    name: "Velvet Gallery",
    bio: "Không thể tải đầy đủ thông tin kênh lúc này.",
    isEligibleForMembership: false,
    isMembershipClosedByAdmin: false,
    avatarUrl: null,
    bannerUrl: null,
    status: "unknown",
    createdAt: "",
    updatedAt: "",
    membershipEligibility: {
      isEligible: false,
      readyVideoCount: 0,
      minReadyVideoCount: 10,
      totalVideoViews: 0,
      minTotalVideoViews: 1000,
      missingRequirements: [],
    },
    membershipTiers: [],
    publicVideos: [],
  };
}

export async function ChannelPage({ channelId }: ChannelPageProps) {
  let channel = buildFallbackChannel(channelId);
  let errorMessage: string | null = null;

  try {
    const response = await getChannelDetailCached(channelId);
    if (response.success && response.data) {
      channel = response.data;
    } else {
      errorMessage = response.mess || "Không thể tải thông tin kênh.";
    }
  } catch (err: unknown) {
    const apiError = err as PublicApiError;
    if (apiError.code === 404) {
      notFound();
    }

    errorMessage = getErrorMessage(err, "Không thể tải thông tin kênh.");
  }

  return (
    <main className="mx-auto min-h-screen max-w-[1700px] bg-background px-4 pt-24 pb-16 md:px-8 lg:pl-72">
      {errorMessage ? (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-card p-4 text-sm text-muted-foreground">
          {errorMessage}
        </div>
      ) : null}

      <ChannelHero channel={channel} />

      <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <ChannelVideoGrid videos={channel.publicVideos} channelName={channel.name} />
        <ChannelMembershipTiers channel={channel} />
      </div>
    </main>
  );
}
