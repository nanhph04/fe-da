"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { PlayerContainerClient } from "@/features/watch/components/PlayerContainerClient";
import { getReadyOwnerVideoThumbnailUrl, mediaService, type OwnerVideoDetailResponse } from "@/features/watch/services/mediaService";
import { getErrorMessage } from "@/shared/api/client";
import { StudioVideoDraftActions } from "./StudioVideoDraftActions";

interface StudioVideoPreviewFeatureProps {
  videoId: string;
}

type NotReadyCopy = {
  icon: string;
  title: string;
  message: string;
  className: string;
};

const READY_STATUS = "ready";
const DRAFT_STATUS = "draft";
const PLAYABLE_STATUSES = new Set([READY_STATUS, "private"]);
const PROCESSING_STATUSES = new Set(["processing", "pending_moderation", "moderating", "pending_manual_review"]);
const FAILED_STATUSES = new Set(["failed", "rejected"]);

function normalizeStatus(status?: string | null) {
  return status?.toLowerCase() || "unknown";
}

function formatStatus(status?: string | null) {
  return normalizeStatus(status).replaceAll("_", " ").toUpperCase();
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Not published";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDuration(seconds?: number | null) {
  if (!seconds || seconds <= 0) {
    return "Runtime pending";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function getAccessLabel(video: OwnerVideoDetailResponse) {
  if (video.requiredTierLevel) {
    return `LV${video.requiredTierLevel}`;
  }

  if ((video.price ?? 0) > 0) {
    return `${video.price.toLocaleString("en")} AC`;
  }

  return "Free";
}

function getStatusClass(status: string) {
  if (PLAYABLE_STATUSES.has(status)) {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }

  if (PROCESSING_STATUSES.has(status)) {
    return "border-secondary/30 bg-secondary/10 text-secondary";
  }

  if (FAILED_STATUSES.has(status)) {
    return "border-destructive/30 bg-destructive/10 text-destructive";
  }

  return "border-border/40 bg-muted text-muted-foreground";
}

function getNotReadyCopy(status: string): NotReadyCopy {
  if (PROCESSING_STATUSES.has(status)) {
    return {
      icon: "hourglass_top",
      title: "Video is still processing",
      message: "Playback becomes available after moderation and HLS processing finish. Refresh this page when the pipeline completes.",
      className: "border-secondary/30 bg-secondary/10 text-secondary",
    };
  }

  if (status === "rejected") {
    return {
      icon: "report",
      title: "Video was rejected",
      message: "Rejected videos cannot be previewed. Review the rejection reason in Content Library, then upload a compliant replacement.",
      className: "border-destructive/30 bg-destructive/10 text-destructive",
    };
  }

  if (status === "failed") {
    return {
      icon: "error",
      title: "Processing failed",
      message: "This asset did not finish processing, so there is no playable stream yet. Delete the failed upload and try again.",
      className: "border-destructive/30 bg-destructive/10 text-destructive",
    };
  }

  return {
    icon: "lock_clock",
    title: "Preview is not available yet",
    message: "Only READY videos can be played in Creator Studio. Complete upload and processing before opening the player.",
    className: "border-border/40 bg-muted text-muted-foreground",
  };
}

function StudioVideoPreviewSkeleton() {
  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 p-8 animate-in fade-in duration-500">
      <div className="h-6 w-36 rounded-sm bg-muted/70" />
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="aspect-video rounded-lg border border-border/30 bg-card" />
        <aside className="space-y-4 rounded-lg border border-border/30 bg-card p-6">
          <div className="h-4 w-24 rounded-sm bg-muted/70" />
          <div className="h-8 w-full rounded-sm bg-muted/70" />
          <div className="h-4 w-3/4 rounded-sm bg-muted/70" />
          <div className="h-24 rounded-sm bg-muted/70" />
        </aside>
      </div>
    </section>
  );
}

export function StudioVideoPreviewFeature({ videoId }: StudioVideoPreviewFeatureProps) {
  const [video, setVideo] = useState<OwnerVideoDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const loadedVideoIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadVideo() {
      const isNewVideo = loadedVideoIdRef.current !== videoId;

      if (isNewVideo) {
        setVideo(null);
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      setError(null);

      try {
        const response = await mediaService.getOwnerVideoDetail(videoId);

        if (cancelled) {
          return;
        }

        if (response.success && response.data) {
          setVideo(response.data);
          return;
        }

        setError(response.mess || "Unable to load this Studio video.");
        setVideo(null);
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, "Unable to load this Studio video. Please try again."));
          setVideo(null);
        }
      } finally {
        if (!cancelled) {
          loadedVideoIdRef.current = videoId;
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    void loadVideo();

    return () => {
      cancelled = true;
    };
  }, [refreshKey, videoId]);

  const status = normalizeStatus(video?.status);
  const isReady = PLAYABLE_STATUSES.has(status);
  const notReadyCopy = useMemo(() => getNotReadyCopy(status), [status]);
  const isDraft = status === DRAFT_STATUS;
  const poster = getReadyOwnerVideoThumbnailUrl(video?.id, video?.thumbnailUrl, video?.thumbnailStatus) || "/images/thumbnail.png";
  const viewCount = video?.viewCount ?? video?.metrics?.viewsCount ?? 0;
  const tags = video?.tags?.filter(Boolean) ?? [];

  const refreshDetail = () => {
    setRefreshKey(value => value + 1);
  };

  if (isLoading) {
    return <StudioVideoPreviewSkeleton />;
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 p-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-6 border-b border-border/30 pb-8 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 space-y-4">
          <Link
            href="/studio/content"
            className="inline-flex items-center gap-2 font-headline text-sm font-bold text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_back</span>
            Back to Content Library
          </Link>
          <div>
            <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">Creator Preview</p>
            <h1 className="max-w-4xl truncate font-headline text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
              {video?.title || "Video preview"}
            </h1>
            <p className="mt-2 max-w-2xl font-body text-sm leading-6 text-muted-foreground">
              Preview your processed video exactly from Studio. Viewer access, purchases, and membership rules still apply on public watch surfaces.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setRefreshKey(value => value + 1)}
            disabled={isRefreshing}
            className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-border/40 bg-card px-4 font-headline text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className={`material-symbols-outlined text-[18px] ${isRefreshing ? "animate-spin" : ""}`} aria-hidden="true">refresh</span>
            Refresh
          </button>
          {video ? (
            <Link
              href="/studio/content"
              className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-primary px-4 font-headline text-xs font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring/60"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">video_library</span>
              Manage
            </Link>
          ) : null}
        </div>
      </header>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-card p-10 text-center">
          <span className="material-symbols-outlined text-5xl text-destructive" aria-hidden="true">error</span>
          <h2 className="mt-4 font-headline text-2xl font-extrabold tracking-tight text-foreground">Unable to open video</h2>
          <p className="mx-auto mt-2 max-w-xl font-body text-sm leading-6 text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={() => setRefreshKey(value => value + 1)}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-5 font-headline text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring/60"
          >
            Try again
          </button>
        </div>
      ) : null}

      {video && !error ? (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-6">
            {isReady ? (
              <PlayerContainerClient videoId={video.id} poster={poster} title={video.title} />
            ) : (
              <div className="relative flex aspect-video overflow-hidden rounded-lg border border-border/30 bg-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={poster}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full scale-105 object-cover opacity-35 blur-sm"
                  onError={event => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/images/thumbnail.png";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
                <div className="relative z-10 flex w-full flex-col items-center justify-center gap-4 px-6 text-center">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-full border ${notReadyCopy.className}`}>
                    <span className="material-symbols-outlined text-3xl" aria-hidden="true">{notReadyCopy.icon}</span>
                  </div>
                  <div className="max-w-lg space-y-2">
                    <h2 className="font-headline text-2xl font-extrabold tracking-tight text-foreground">{notReadyCopy.title}</h2>
                    <p className="font-body text-sm leading-6 text-muted-foreground">{notReadyCopy.message}</p>
                  </div>
                </div>
              </div>
            )}

            {isDraft ? (
              <StudioVideoDraftActions video={video} onChanged={refreshDetail} />
            ) : null}

            <article className="rounded-lg border border-border/30 bg-card p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`rounded-sm border px-2.5 py-1 font-label text-[10px] font-bold uppercase tracking-widest ${getStatusClass(status)}`}>
                  {formatStatus(video.status)}
                </span>
                <span className="rounded-sm border border-secondary/30 bg-secondary/10 px-2.5 py-1 font-label text-[10px] font-bold uppercase tracking-widest text-secondary">
                  {getAccessLabel(video)}
                </span>
                <span className="rounded-sm border border-border/40 bg-muted px-2.5 py-1 font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {video.visibility}
                </span>
              </div>
              <p className="mt-5 whitespace-pre-line font-body text-sm leading-7 text-muted-foreground">
                {video.description || "No description has been added yet."}
              </p>
            </article>
          </div>

          <aside className="h-fit rounded-lg border border-border/30 bg-card p-6">
            <p className="font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">Asset Details</p>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex items-start justify-between gap-4 border-b border-border/30 pb-4">
                <dt className="text-muted-foreground">Status</dt>
                <dd className="text-right font-headline font-bold text-foreground">{formatStatus(video.status)}</dd>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-border/30 pb-4">
                <dt className="text-muted-foreground">Published</dt>
                <dd className="text-right font-headline font-bold text-foreground">{formatDate(video.publishedAt || video.createdAt)}</dd>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-border/30 pb-4">
                <dt className="text-muted-foreground">Runtime</dt>
                <dd className="text-right font-headline font-bold text-foreground">{formatDuration(video.durationSeconds)}</dd>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-border/30 pb-4">
                <dt className="text-muted-foreground">Views</dt>
                <dd className="text-right font-headline font-bold text-foreground">{viewCount.toLocaleString("en")}</dd>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-border/30 pb-4">
                <dt className="text-muted-foreground">Category</dt>
                <dd className="text-right font-headline font-bold text-foreground">{video.category || "Uncategorized"}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Video ID</dt>
                <dd className="max-w-[190px] truncate text-right font-mono text-xs text-foreground">{video.id}</dd>
              </div>
            </dl>

            {tags.length > 0 ? (
              <div className="mt-6 border-t border-border/30 pt-5">
                <p className="mb-3 font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <span key={tag} className="rounded-sm border border-border/30 bg-muted px-2 py-1 text-xs text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      ) : null}
    </section>
  );
}
