import { VideoInfo } from "./VideoInfo";
import { CreatorSection } from "./CreatorSection";
import { CommentsSection } from "./CommentsSection";
import { RelatedVideosSidebar } from "./RelatedVideosSidebar";
import { PlayerContainerClient } from "./PlayerContainerClient";
import {
  getVideoMetadataCached,
  type PublicApiError,
} from "../services/publicMediaService";
import { getErrorMessage } from "@/shared/utils/apiClient";
import { notFound } from "next/navigation";

interface WatchVideoFeatureProps {
  videoId: string;
}

export async function WatchVideoFeature({ videoId }: WatchVideoFeatureProps) {
  let title = "Unknown Video";
  let poster = undefined;

  try {
    const infoRes = await getVideoMetadataCached(videoId);
    if (infoRes.success && infoRes.data) {
      title = infoRes.data.title;
      poster = infoRes.data.thumbnailUrl || undefined;
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
    <div className="xl:pl-64 pt-24 pb-12 px-4 md:px-8 max-w-[1700px] mx-auto flex flex-col xl:flex-row gap-10 min-h-screen">
      {/* Main Content (Left) */}
      <div className="flex-grow xl:w-2/3">
        <PlayerContainerClient videoId={videoId} poster={poster} title={title} />
        <VideoInfo />
        <CreatorSection />
        <CommentsSection />
      </div>

      {/* Related Videos Sidebar (Right) */}
      <RelatedVideosSidebar />
    </div>
  );
}
