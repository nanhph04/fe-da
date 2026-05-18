import { notFound } from "next/navigation";
import { PlayerContainerClient } from "./PlayerContainerClient";
import { RelatedVideosSidebar } from "./RelatedVideosSidebar";
import { VideoInfo } from "./VideoInfo";
import { WatchChannelCard } from "./WatchChannelCard";
import { getErrorMessage } from "@/shared/api/client";
import {
  getChannelDetailCached,
  getReadyPublicThumbnailUrl,
  getVideoMetadataCached,
  type PublicApiError,
  type PublicMembershipTier,
  type PublicVideoMetadata,
} from "../services/publicMediaService";

interface WatchVideoFeatureProps {
  videoId: string;
}

function resolveVideoPriceCoin(video: PublicVideoMetadata) {
  return video.priceCoin ?? video.coinAmount ?? video.price ?? 0;
}

function resolveRequiredTierLevel(video: PublicVideoMetadata) {
  return (
    video.requiredTierLevel ??
    video.requiredTier ??
    video.minTierLevel ??
    video.requiredMembershipLevel ??
    null
  );
}

export async function WatchVideoFeature({ videoId }: WatchVideoFeatureProps) {
  let title = "Unknown Video";
  let poster: string | undefined;
  let viewCount = 0;
  let publishedAt: string | null = null;
  let description = "";
  let category = "";
  let tags: string[] = [];
  let channelId = "";
  let channelName = "Velvet Gallery";
  let channelOwnerId: string | null = null;
  let avatarUrlChannel: string | null = null;
  let priceCoin = 0;
  let requiredTierLevel: number | null = null;
  let membershipTiers: PublicMembershipTier[] = [];

  try {
    const infoRes = await getVideoMetadataCached(videoId);
    if (!infoRes.success || !infoRes.data) {
      notFound();
    }

    title = infoRes.data.title;
    poster = getReadyPublicThumbnailUrl(infoRes.data.thumbnailUrl, infoRes.data.thumbnailStatus, infoRes.data.id) || undefined;
    viewCount = infoRes.data.viewCount;
    publishedAt = infoRes.data.publishedAt;
    description = infoRes.data.description;
    category = infoRes.data.category;
    tags = infoRes.data.tags;
    channelId = infoRes.data.channelId;
    channelName = infoRes.data.channelName;
    avatarUrlChannel = infoRes.data.avatarUrlChannel;
    priceCoin = resolveVideoPriceCoin(infoRes.data);
    requiredTierLevel = resolveRequiredTierLevel(infoRes.data);
    membershipTiers = infoRes.data.membershipTiers ?? [];
  } catch (err: unknown) {
    const apiError = err as PublicApiError;
    if (apiError.code === 403 || apiError.code === 404) {
      notFound();
    }

    console.warn("Failed to load video metadata SSR:", {
      videoId,
      message: getErrorMessage(err),
      code: apiError.code ?? null,
    });
  }

  if (channelId) {
    try {
      const channelRes = await getChannelDetailCached(channelId);
      if (channelRes.success && channelRes.data) {
        channelOwnerId = channelRes.data.userId;
        membershipTiers = channelRes.data.membershipTiers?.length
          ? channelRes.data.membershipTiers
          : membershipTiers;
      }
    } catch (err: unknown) {
      console.warn("Failed to load channel access metadata SSR:", {
        channelId,
        videoId,
        message: getErrorMessage(err),
      });
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-[1700px] flex-col gap-10 bg-background px-4 pt-24 pb-12 md:px-8 lg:pl-72 xl:flex-row">
      <div className="min-w-0 flex-grow xl:w-2/3">
        <PlayerContainerClient
          videoId={videoId}
          poster={poster}
          title={title}
          access={{
            channelId,
            channelName,
            channelOwnerId,
            membershipTiers,
            priceCoin,
            requiredTierLevel,
          }}
        />
        <VideoInfo
          title={title}
          viewCount={viewCount}
          publishedAt={publishedAt}
          category={category}
          tags={tags}
        />
        <WatchChannelCard
          channelId={channelId}
          channelName={channelName}
          avatarUrl={avatarUrlChannel}
          description={description}
          membershipTiers={membershipTiers}
        />
      </div>

      <RelatedVideosSidebar currentVideoId={videoId} />
    </main>
  );
}
