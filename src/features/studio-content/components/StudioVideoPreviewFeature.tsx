"use client";

import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PlayerContainerClient } from "@/features/watch/components/PlayerContainerClient";
import { getReadyOwnerVideoThumbnailUrl, mediaService, type OwnerVideoDetailResponse } from "@/features/watch/services/mediaService";
import { getErrorMessage } from "@/shared/api/client";
import { getVideoStatusFailureReason, isVideoJobStatus, useVideoStatusEventSubscription, type VideoStatusChangedPayload } from "@/shared/hooks/use-video-status-events";
import { ProcessingProgressTracker } from "./ProcessingProgressTracker";
import { StudioVideoDraftActions } from "./StudioVideoDraftActions";
import { VideoThumbnail } from "@/shared/components/VideoThumbnail";
import { getVideoJobStatusMessageUi } from "../utils/video-job-status-message-ui";

interface StudioVideoPreviewFeatureProps {
  videoId: string;
}

type NotReadyCopy = {
  icon: string;
  title: string;
  message: string;
  className: string;
};

type TFunction = ReturnType<typeof useTranslations>;

const READY_STATUS = "ready";
const DRAFT_STATUS = "draft";
const PLAYABLE_STATUSES = new Set([READY_STATUS, "private"]);
const PROCESSING_STATUSES = new Set(["waiting", "processing", "pending_moderation", "moderating", "pending_manual_review"]);
const FAILED_STATUSES = new Set(["failed", "rejected"]);

function normalizeStatus(status?: string | null) {
  return status?.toLowerCase() || "unknown";
}

function normalizeVisibility(visibility?: string | null) {
  return visibility?.toLowerCase() || "private";
}

function formatStatus(t: TFunction, status?: string | null) {
  const normalized = normalizeStatus(status);
  const knownStatuses = ["ready", "pending", "failed", "processing", "rejected", "waiting", "succeeded", "draft", "private", "public", "unknown"];
  if (knownStatuses.includes(normalized)) {
    return t(`content.status.${normalized}`);
  }
  return normalized.replaceAll("_", " ").toUpperCase();
}

function formatDate(t: TFunction, locale: string, value?: string | null) {
  if (!value) {
    return t("content.preview.notPublished");
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return t("content.preview.unknownDate");
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDuration(t: TFunction, seconds?: number | null) {
  if (!seconds || seconds <= 0) {
    return t("content.preview.runtimePending");
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function getAccessLabel(t: TFunction, video: OwnerVideoDetailResponse) {
  if (video.requiredTierLevel) {
    return `LV${video.requiredTierLevel}`;
  }

  if ((video.price ?? 0) > 0) {
    return `${video.price.toLocaleString()} AC`;
  }

  return t("content.preview.free");
}

function getStatusClass(status: string) {
  if (status === "succeeded") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }

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

function translateJobStatusMessage(t: TFunction, message?: string | null) {
  if (!message) {
    return null;
  }

  const messageUi = getVideoJobStatusMessageUi(message);
  return messageUi.type === "translation" ? t(messageUi.key) : messageUi.message;
}

function getVideoStatusMessage(t: TFunction, video: OwnerVideoDetailResponse, status: string) {
  const translatedJobStatusMessage = translateJobStatusMessage(t, video.jobStatusMessage);

  if (status === "rejected" || status === "failed") {
    return getVideoStatusFailureReason({
      failureReason: video.failureReason || video.errorMessage || null,
      moderationDetails: video.moderationDetails,
    }) || translatedJobStatusMessage || t("content.preview.statusMessage.failed");
  }

  if (PROCESSING_STATUSES.has(status)) {
    return translatedJobStatusMessage || t("content.preview.statusMessage.processing");
  }

  if (status === "succeeded" || status === "ready") {
    return t("content.preview.statusMessage.succeeded");
  }

  return t("content.preview.statusMessage.default");
}

function getNotReadyCopy(t: TFunction, status: string): NotReadyCopy {
  if (PROCESSING_STATUSES.has(status)) {
    return {
      icon: "hourglass_top",
      title: t("content.preview.notReady.processingTitle"),
      message: t("content.preview.notReady.processingMessage"),
      className: "border-secondary/30 bg-secondary/10 text-secondary",
    };
  }

  if (status === "rejected") {
    return {
      icon: "report",
      title: t("content.preview.notReady.rejectedTitle"),
      message: t("content.preview.notReady.rejectedMessage"),
      className: "border-destructive/30 bg-destructive/10 text-destructive",
    };
  }

  if (status === "failed") {
    return {
      icon: "error",
      title: t("content.preview.notReady.failedTitle"),
      message: t("content.preview.notReady.failedMessage"),
      className: "border-destructive/30 bg-destructive/10 text-destructive",
    };
  }

  if (status === "succeeded") {
    return {
      icon: "play_circle",
      title: t("content.preview.notReady.succeededTitle"),
      message: t("content.preview.notReady.succeededMessage"),
      className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    };
  }

  return {
    icon: "lock_clock",
    title: t("content.preview.notReady.defaultTitle"),
    message: t("content.preview.notReady.defaultMessage"),
    className: "border-border/40 bg-muted text-muted-foreground",
  };
}

function mergeVideoDetail(video: OwnerVideoDetailResponse, payload: VideoStatusChangedPayload): OwnerVideoDetailResponse {
  return {
    ...video,
    status: payload.status,
    jobStatus: payload.jobStatus,
    jobStatusMessage: payload.jobStatusMessage,
    failureReason: payload.failureReason,
    thumbnailStatus: payload.thumbnailStatus,
    thumbnailUrl: payload.thumbnailUrl,
    moderationDetails: payload.moderationDetails,
    updatedAt: payload.updatedAt,
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
  const t = useTranslations("Studio");
  const locale = useLocale();
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

        setError(response.message || t("content.preview.errors.loadFailed"));
        setVideo(null);
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, t("content.preview.errors.loadFailedRetry")));
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
  }, [refreshKey, videoId, t]);

  const handleVideoStatusChanged = useCallback((payload: VideoStatusChangedPayload) => {
    if (payload.videoId !== videoId) {
      return;
    }

    setVideo(currentVideo => currentVideo ? mergeVideoDetail(currentVideo, payload) : currentVideo);

    if (payload.jobStatus === "succeeded" || payload.jobStatus === "failed" || payload.jobStatus === "rejected") {
      setRefreshKey(value => value + 1);
    }
  }, [videoId]);

  useVideoStatusEventSubscription(handleVideoStatusChanged);

  const status = normalizeStatus(video?.status);
  const normalizedJobStatus = video?.jobStatus?.toLowerCase();
  const displayStatus = isVideoJobStatus(normalizedJobStatus) ? normalizedJobStatus : status;
  const statusLabel = isVideoJobStatus(normalizedJobStatus) ? t(`content.status.${normalizedJobStatus}`) : formatStatus(t, video?.status);
  const isReady = PLAYABLE_STATUSES.has(status);
  const notReadyCopy = useMemo(() => getNotReadyCopy(t, status), [t, status]);
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
            {t("content.preview.back")}
          </Link>
          <div>
            <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">{t("content.preview.creatorPreview")}</p>
            <h1 className="max-w-4xl truncate font-headline text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
              {video?.title || t("content.preview.title")}
            </h1>
            <p className="mt-2 max-w-2xl font-body text-sm leading-6 text-muted-foreground">
              {t("content.preview.subtitle")}
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
            {t("content.refresh")}
          </button>
          {video ? (
            <Link
              href="/studio/content"
              className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-primary px-4 font-headline text-xs font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring/60"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">video_library</span>
              {t("content.actions.edit")}
            </Link>
          ) : null}
        </div>
      </header>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-card p-10 text-center">
          <span className="material-symbols-outlined text-5xl text-destructive" aria-hidden="true">error</span>
          <h2 className="mt-4 font-headline text-2xl font-extrabold tracking-tight text-foreground">{t("content.preview.errors.openFailed")}</h2>
          <p className="mx-auto mt-2 max-w-xl font-body text-sm leading-6 text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={() => setRefreshKey(value => value + 1)}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-5 font-headline text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring/60"
          >
            {t("content.preview.errors.tryAgain")}
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
                <VideoThumbnail
                  src={poster}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full scale-105 object-cover opacity-35 blur-sm"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
                <div className="relative z-10 flex w-full flex-col items-center justify-center gap-4 px-6 text-center">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-full border ${notReadyCopy.className}`}>
                    <span className="material-symbols-outlined text-3xl" aria-hidden="true">{notReadyCopy.icon}</span>
                  </div>
                  <div className="max-w-lg space-y-2">
                    <h2 className="font-headline text-2xl font-extrabold tracking-tight text-foreground">{notReadyCopy.title}</h2>
                    <p className="font-body text-sm leading-6 text-muted-foreground">{video ? getVideoStatusMessage(t, video, status) : notReadyCopy.message}</p>
                  </div>
                </div>
              </div>
            )}

            {isDraft ? (
              <StudioVideoDraftActions video={video} onChanged={refreshDetail} />
            ) : null}

            <article className="rounded-lg border border-border/30 bg-card p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`rounded-sm border px-2.5 py-1 font-label text-[10px] font-bold uppercase tracking-widest ${getStatusClass(displayStatus)}`}>
                  {statusLabel}
                </span>
                <span className="rounded-sm border border-secondary/30 bg-secondary/10 px-2.5 py-1 font-label text-[10px] font-bold uppercase tracking-widest text-secondary">
                  {getAccessLabel(t, video)}
                </span>
                <span className="rounded-sm border border-border/40 bg-muted px-2.5 py-1 font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {t(`content.visibility.${normalizeVisibility(video.visibility)}`)}
                </span>
              </div>
              <p className="mt-5 whitespace-pre-line font-body text-sm leading-7 text-muted-foreground">
                {video.description || t("content.preview.errors.noDescription")}
              </p>
              {video.jobStatus || PROCESSING_STATUSES.has(status) || FAILED_STATUSES.has(status) ? (
                <ProcessingProgressTracker
                  initialStatus={video.status}
                  jobStatus={video.jobStatus}
                  jobStatusMessage={video.jobStatusMessage}
                  failureReason={video.failureReason || video.errorMessage}
                  moderationDetails={video.moderationDetails}
                  onRefreshStatus={refreshDetail}
                />
              ) : null}
            </article>
          </div>

          <aside className="h-fit rounded-lg border border-border/30 bg-card p-6">
            <p className="font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">{t("content.preview.detailsTitle")}</p>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex items-start justify-between gap-4 border-b border-border/30 pb-4">
                <dt className="text-muted-foreground">{t("content.preview.fields.status")}</dt>
                <dd className="text-right font-headline font-bold text-foreground">{statusLabel}</dd>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-border/30 pb-4">
                <dt className="text-muted-foreground">{t("content.preview.fields.published")}</dt>
                <dd className="text-right font-headline font-bold text-foreground">{formatDate(t, locale, video.publishedAt || video.createdAt)}</dd>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-border/30 pb-4">
                <dt className="text-muted-foreground">{t("content.preview.fields.runtime")}</dt>
                <dd className="text-right font-headline font-bold text-foreground">{formatDuration(t, video.durationSeconds)}</dd>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-border/30 pb-4">
                <dt className="text-muted-foreground">{t("content.preview.fields.views")}</dt>
                <dd className="text-right font-headline font-bold text-foreground">{viewCount.toLocaleString(locale)}</dd>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-border/30 pb-4">
                <dt className="text-muted-foreground">{t("content.preview.fields.category")}</dt>
                <dd className="text-right font-headline font-bold text-foreground">{video.category || t("content.preview.uncategorized")}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">{t("content.preview.fields.videoId")}</dt>
                <dd className="max-w-[190px] truncate text-right font-mono text-xs text-foreground">{video.id}</dd>
              </div>
            </dl>

            {tags.length > 0 ? (
              <div className="mt-6 border-t border-border/30 pt-5">
                <p className="mb-3 font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("content.preview.fields.tags")}</p>
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
