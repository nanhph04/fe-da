"use client";

import { Link } from "@/i18n/routing";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { mediaService } from "@/features/watch/services/mediaService";
import { getErrorMessage } from "@/shared/api/client";
import type { ApiError } from "@/shared/api/types";
import { CinematicPlayer } from "./CinematicPlayer";
import { WatchAccessGate, type WatchAccessData } from "./WatchAccessGate";

const DEFAULT_METADATA_RESOLUTIONS: string[] = [];

interface PlayerContainerClientProps {
  videoId: string;
  poster?: string;
  title?: string;
  metadataResolutions?: string[];
  access?: WatchAccessData;
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

function isPermissionError(error: unknown) {
  const apiError = error as ApiError;
  const statusCode = apiError.code ?? apiError.status;

  if (statusCode === 402 || statusCode === 403) {
    return true;
  }

  const message = getErrorMessage(error, "").toLowerCase();

  return (
    message.includes("permission") ||
    message.includes("forbidden") ||
    message.includes("access denied") ||
    message.includes("not have access") ||
    message.includes("không có quyền")
  );
}

export function PlayerContainerClient({
  videoId,
  poster,
  title,
  metadataResolutions = DEFAULT_METADATA_RESOLUTIONS,
  access,
}: PlayerContainerClientProps) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [initialPositionSeconds, setInitialPositionSeconds] = useState(0);
  const [availableResolutions, setAvailableResolutions] = useState<string[]>(metadataResolutions);
  const [error, setError] = useState<string | null>(null);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackReloadKey, setPlaybackReloadKey] = useState(0);
  const [hasCompletedPurchase, setHasCompletedPurchase] = useState(false);

  const retryPlayback = useCallback(() => {
    setPlaybackReloadKey((current) => current + 1);
  }, []);

  const handleUnlocked = useCallback(() => {
    setHasCompletedPurchase(true);
    setAccessDeniedMessage(null);
    setError(null);
    setIsLoading(true);
    retryPlayback();
  }, [retryPlayback]);

  useEffect(() => {
    setHasCompletedPurchase(false);
  }, [videoId]);

  useEffect(() => {
    let isActive = true;

    if (isAuthLoading) {
      setIsLoading(true);
      return () => {
        isActive = false;
      };
    }

    if (!isAuthenticated) {
      setVideoUrl(null);
      setInitialPositionSeconds(0);
      setAvailableResolutions([]);
      setAccessDeniedMessage(null);
      setError(null);
      setIsLoading(false);
      return () => {
        isActive = false;
      };
    }

    async function loadVideo() {
      try {
        setIsLoading(true);
        setError(null);
        setAccessDeniedMessage(null);

        const tokenRes = await mediaService.getPlaybackInfo(videoId);

        if (!isActive) {
          return;
        }

        if (tokenRes.success && tokenRes.data) {
          const rawStreamUrl = tokenRes.data.playbackUrl || "";

          if (!rawStreamUrl) {
            setError("Playback URL was not returned by the media service.");
            setVideoUrl(null);
            return;
          }

          const finalUrl = buildPlaybackUrl(
            rawStreamUrl,
            tokenRes.data.playbackToken,
          );

          console.info("[watch] playback source resolved", {
            videoId,
            source: redactUrlForLogs(finalUrl),
            type: inferSourceType(finalUrl),
            resumePositionSeconds: tokenRes.data.resumePositionSeconds,
          });

          setInitialPositionSeconds(tokenRes.data.resumePositionSeconds || 0);
          setAvailableResolutions(
            tokenRes.data.resolutions?.length
              ? tokenRes.data.resolutions
              : metadataResolutions,
          );
          setVideoUrl(finalUrl);
        } else if (isPermissionError({ code: tokenRes.code, mess: tokenRes.mess })) {
          setVideoUrl(null);
          setAccessDeniedMessage(tokenRes.mess || "Bạn chưa có quyền xem video này.");
        } else {
          setVideoUrl(null);
          setError(tokenRes.mess || "Failed to load video stream.");
        }
      } catch (err: unknown) {
        if (!isActive) {
          return;
        }

        setVideoUrl(null);

        if (isPermissionError(err)) {
          setAccessDeniedMessage(getErrorMessage(err, "Bạn chưa có quyền xem video này."));
          setError(null);
          return;
        }

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
  }, [videoId, isAuthenticated, isAuthLoading, metadataResolutions, playbackReloadKey]);

  if (isLoading) {
    return (
      <div className="relative aspect-video animate-pulse overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted shadow-lg">
            <span className="material-symbols-outlined text-3xl text-muted-foreground">
              play_arrow
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const loginHref = `/login?redirect=${encodeURIComponent(`/watch/${videoId}`)}`;

    return (
      <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
        {poster ? (
          <div
            className="absolute inset-0 scale-105 bg-cover bg-center opacity-45 blur-sm"
            style={{ backgroundImage: `url(${poster})` }}
            aria-hidden="true"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary shadow-lg">
            <span className="material-symbols-outlined text-3xl">lock</span>
          </div>
          <div className="max-w-md space-y-2">
            <p className="font-headline text-2xl font-extrabold tracking-tight text-foreground">
              Vui lòng đăng nhập để xem video
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              Bạn vẫn có thể xem thông tin video bên dưới. Đăng nhập để phát nội dung và tiếp tục trải nghiệm xem của bạn.
            </p>
          </div>
          <Link
            href={loginHref}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Đăng nhập để xem
          </Link>
        </div>
      </div>
    );
  }

  if (accessDeniedMessage && access) {
    return (
      <WatchAccessGate
        videoId={videoId}
        poster={poster}
        title={title}
        access={access}
        purchaseCompleted={hasCompletedPurchase}
        onUnlocked={handleUnlocked}
      />
    );
  }

  if (accessDeniedMessage) {
    return (
      <div className="flex aspect-video flex-col items-center justify-center gap-4 rounded-lg border border-border bg-card px-6 text-center">
        <span className="material-symbols-outlined text-6xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
          lock
        </span>
        <div className="max-w-xl space-y-2">
          <h2 className="font-headline text-2xl font-extrabold tracking-tight text-foreground">
            Bạn chưa có quyền xem video này
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            {accessDeniedMessage}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex aspect-video flex-col items-center justify-center gap-4 rounded-lg border border-border bg-card px-6 text-center">
        <span className="material-symbols-outlined text-6xl text-destructive">
          error
        </span>
        <p className="max-w-xl font-headline text-xl font-bold text-foreground">{error}</p>
        <button
          type="button"
          onClick={retryPlayback}
          className="inline-flex min-h-11 items-center justify-center rounded-sm border border-border/50 px-5 text-xs font-black uppercase tracking-widest text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Thử lại
        </button>
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
