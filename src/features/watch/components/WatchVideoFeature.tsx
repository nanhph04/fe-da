"use client";

import { useEffect, useState } from "react";
import { VideoInfo } from "./VideoInfo";
import { CreatorSection } from "./CreatorSection";
import { CommentsSection } from "./CommentsSection";
import { RelatedVideosSidebar } from "./RelatedVideosSidebar";
import { CinematicPlayer } from "./CinematicPlayer";
import { mediaService } from "../services/mediaService";

interface WatchVideoFeatureProps {
  videoId: string;
}

export function WatchVideoFeature({ videoId }: WatchVideoFeatureProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [poster, setPoster] = useState<string | undefined>();
  const [title, setTitle] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadVideo() {
      try {
        setIsLoading(true);
        // 1. Fetch Video Info
        const infoRes = await mediaService.getVideoMetadata(videoId);
        if (infoRes.success && infoRes.data) {
          setTitle(infoRes.data.title);
          setPoster(infoRes.data.thumbnailUrl || undefined);
        }

        // 2. Fetch Playback Token
        const tokenRes = await mediaService.getPlaybackInfo(videoId);
        if (tokenRes.success && tokenRes.data) {
          // Gắn token vào URL nếu backend yêu cầu hoặc backend trả về playbackUrl đã có token
          const streamUrl = tokenRes.data.playbackUrl;
          const token = tokenRes.data.playbackToken;
          
          // Giả sử streamUrl đã kèm token (thông thường HLS proxy URL hoặc presigned URL)
          // Hoặc ta nối ?token= vào streamUrl:
          const finalUrl = streamUrl.includes('?') ? `${streamUrl}&token=${token}` : `${streamUrl}?token=${token}`;
          setVideoUrl(finalUrl);
        } else {
          setError(tokenRes.mess || "Failed to load video stream.");
        }
      } catch (err: any) {
        setError("Playback Error: " + (err.message || "Unknown error"));
      } finally {
        setIsLoading(false);
      }
    }
    
    if (videoId) {
      loadVideo();
    }
  }, [videoId]);

  return (
    <div className="xl:pl-64 pt-24 pb-12 px-4 md:px-8 max-w-[1700px] mx-auto flex flex-col xl:flex-row gap-10 min-h-screen">
      {/* Main Content (Left) */}
      <div className="flex-grow xl:w-2/3">
        {isLoading ? (
          <div className="aspect-video bg-[#131315] rounded-xl flex items-center justify-center border border-[#262528]">
             <span className="material-symbols-outlined animate-spin text-4xl text-[#ff8e80]">progress_activity</span>
          </div>
        ) : error ? (
          <div className="aspect-video bg-[#131315] rounded-xl flex flex-col items-center justify-center border border-[#262528] gap-4">
             <span className="material-symbols-outlined text-6xl text-red-500">error</span>
             <p className="text-white font-headline font-bold text-xl">{error}</p>
          </div>
        ) : videoUrl ? (
          <CinematicPlayer src={videoUrl} poster={poster} title={title} />
        ) : null}

        <VideoInfo />
        <CreatorSection />
        <CommentsSection />
      </div>

      {/* Related Videos Sidebar (Right) */}
      <RelatedVideosSidebar />
    </div>
  );
}
