"use client";

import { useEffect, useState } from "react";
import { mediaService } from "@/features/watch/services/mediaService";
import { CinematicPlayer } from "./CinematicPlayer";
import { getErrorMessage } from "@/shared/api/client";

interface PlayerContainerClientProps {
  videoId: string;
  poster?: string;
  title?: string;
}

function redactUrlForLogs(rawUrl: string) {
  try {
    const base =
      typeof window !== "undefined" ? window.location.origin : "http://localhost";
    const url = new URL(rawUrl, base);
    if (url.searchParams.has("token")) {
      url.searchParams.set("token", "[redacted]");
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return rawUrl.replace(/token=[^&]+/i, "token=[redacted]");
  }
}

function inferSourceType(src: string) {
  const mediaPath = src.split("?")[0]?.toLowerCase() ?? src.toLowerCase();

  if (mediaPath.endsWith(".m3u8")) {
    return "application/x-mpegURL";
  }

  if (mediaPath.endsWith(".mp4")) {
    return "video/mp4";
  }

  if (mediaPath.endsWith(".webm")) {
    return "video/webm";
  }

  if (mediaPath.endsWith(".ogg") || mediaPath.endsWith(".ogv")) {
    return "video/ogg";
  }

  return "application/x-mpegURL";
}

function buildPlaybackUrl(streamUrl: string, token?: string) {
  if (!token) {
    return streamUrl;
  }

  try {
    const base =
      typeof window !== "undefined" ? window.location.origin : "http://localhost";
    const url = new URL(streamUrl, base);

    if (!url.searchParams.has("token")) {
      url.searchParams.set("token", token);
    }

    if (/^https?:\/\//i.test(streamUrl)) {
      return url.toString();
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    if (/[?&]token=/i.test(streamUrl)) {
      return streamUrl;
    }

    return streamUrl.includes("?")
      ? `${streamUrl}&token=${token}`
      : `${streamUrl}?token=${token}`;
  }
}

export function PlayerContainerClient({
  videoId,
  poster,
  title,
}: PlayerContainerClientProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [initialPositionSeconds, setInitialPositionSeconds] = useState(0);
  const [availableResolutions, setAvailableResolutions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadVideo() {
      try {
        setIsLoading(true);
        setError(null);

        const tokenRes = await mediaService.getPlaybackInfo(videoId);

        if (!isActive) {
          return;
        }

        if (tokenRes.success && tokenRes.data) {
          const rawStreamUrl =
            tokenRes.data.playbackUrl || tokenRes.data.streamUrl || "";

          if (!rawStreamUrl) {
            setError("Playback Error: Playback URL was not returned by the media service.");
            setVideoUrl(null);
            return;
          }

          const finalUrl = buildPlaybackUrl(
            rawStreamUrl,
            tokenRes.data.playbackToken
          );

          console.info("[watch] playback source resolved", {
            videoId,
            source: redactUrlForLogs(finalUrl),
            type: inferSourceType(finalUrl),
            resumePositionSeconds: tokenRes.data.resumePositionSeconds,
          });

          setInitialPositionSeconds(tokenRes.data.resumePositionSeconds || 0);
          setAvailableResolutions(tokenRes.data.resolutions || []);
          setVideoUrl(finalUrl);
        } else {
          setVideoUrl(null);
          setError(tokenRes.mess || "Failed to load video stream.");
        }
      } catch (err: unknown) {
        if (!isActive) {
          return;
        }

        setVideoUrl(null);
        setError(`Playback Error: ${getErrorMessage(err, "Unknown error")}`);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    if (videoId) {
      void loadVideo();
    }

    return () => {
      isActive = false;
    };
  }, [videoId]);

  if (isLoading) {
    return (
      <div className="relative aspect-video animate-pulse overflow-hidden rounded-xl border border-[#262528] bg-[#131315] shadow-2xl">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1f1f22] shadow-lg">
            <span className="material-symbols-outlined text-3xl text-zinc-500">
              play_arrow
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex aspect-video flex-col items-center justify-center gap-4 rounded-xl border border-[#262528] bg-[#131315]">
        <span className="material-symbols-outlined text-6xl text-red-500">
          error
        </span>
        <p className="font-headline text-xl font-bold text-white">{error}</p>
      </div>
    );
  }

  if (!videoUrl) {
    return null;
  }

  return (
    <CinematicPlayer
      videoId={videoId}
      src={videoUrl}
      poster={poster}
      title={title}
      initialPositionSeconds={initialPositionSeconds}
      availableResolutions={availableResolutions}
    />
  );
}
