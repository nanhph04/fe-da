import { VideoInfo } from "./VideoInfo";
import { CreatorSection } from "./CreatorSection";
import { RelatedVideosSidebar } from "./RelatedVideosSidebar";
import { PlayerContainerClient } from "./PlayerContainerClient";
import {
  getVideoMetadataCached,
  type PublicApiError,
} from "../services/publicMediaService";
import { getErrorMessage } from "@/shared/api/client";
import { notFound } from "next/navigation";

interface WatchVideoFeatureProps {
  videoId: string;
}

export async function WatchVideoFeature({ videoId }: WatchVideoFeatureProps) {
  let title = "Unknown Video";
  let poster = undefined;
  let viewCount = 0;
  let publishedAt: string | null = null;
  let description = "";

  try {
    const infoRes = await getVideoMetadataCached(videoId);
    if (infoRes.success && infoRes.data) {
      title = infoRes.data.title;
      poster = infoRes.data.thumbnailUrl || undefined;
      viewCount = infoRes.data.viewCount;
      publishedAt = infoRes.data.publishedAt;
      description = infoRes.data.description;
    }
  } catch (err: unknown) {
    const apiError = err as PublicApiError;
    if (apiError.code === 404) {
      notFound();
    }

    console.warn("Failed to load video metadata SSR:", {
      videoId,
      message: getErrorMessage(err),
      code: apiError.code ?? null,
    });
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[1700px] flex-col gap-10 bg-background px-4 pt-24 pb-12 md:px-8 xl:flex-row xl:pl-64">
      {/* Main Content (Left) */}
      <div className="flex-grow xl:w-2/3">
        <PlayerContainerClient videoId={videoId} poster={poster} title={title} />
        <VideoInfo title={title} viewCount={viewCount} publishedAt={publishedAt} />
        <CreatorSection description={description} />
        {/* CommentsSection intentionally hidden: comments are not in the current development scope. */}
      </div>

      {/* Related Videos Sidebar (Right) */}
      <RelatedVideosSidebar currentVideoId={videoId} />
    </div>
  );
}
