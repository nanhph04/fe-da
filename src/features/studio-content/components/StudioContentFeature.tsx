"use client";
import { CircleAlert } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { getReadyOwnerVideoThumbnailUrl, mediaService, type SubmitUploadBody, type OwnerVideoResponse, type OwnerVideosParams } from "@/features/watch/services/mediaService";
import { getErrorMessage } from "@/shared/api/client";
import {
  getModerationDetailsReason,
  getVideoJobStatusLabel,
  isVideoJobStatus,
  useVideoStatusEventSubscription,
  type VideoStatusChangedPayload,
} from "@/shared/hooks/use-video-status-events";
import { EditVideoMetadataDialog } from "./EditVideoMetadataDialog";
import { ProcessingProgressTracker } from "./ProcessingProgressTracker";
import { VideoThumbnail } from "@/shared/components/VideoThumbnail";

const PROCESSING_STATUSES = new Set(["waiting", "processing", "pending_moderation", "moderating", "pending_manual_review"]);
const FAILED_STATUSES = new Set(["failed", "rejected"]);
const READY_STATUSES = new Set(["ready", "private"]);
const REJECTED_STATUS = "rejected";
const DRAFT_STATUS = "draft";
const DEFAULT_CONFIRM_RESOLUTIONS: SubmitUploadBody["resolutions"] = ["720p"];

type TFunction = ReturnType<typeof useTranslations>;

type ContentFilter = "all" | "draft" | "processing" | "ready" | "failed";

type ContentFilterConfig = {
  label: string;
  value: ContentFilter;
  statuses: string[];
};

const CONTENT_FILTERS: ContentFilterConfig[] = [
  { label: "Videos", value: "all", statuses: [] },
  { label: "Drafts", value: "draft", statuses: ["draft"] },
  { label: "Processing", value: "processing", statuses: ["pending_moderation", "processing", "pending_manual_review"] },
  { label: "Ready", value: "ready", statuses: ["ready", "private"] },
  { label: "Failed", value: "failed", statuses: ["failed", "rejected"] },
];

const FILTER_STATUSES = CONTENT_FILTERS.reduce<Record<ContentFilter, Set<string>>>((acc, filter) => {
  acc[filter.value] = new Set(filter.statuses.map(status => status.toLowerCase()));
  return acc;
}, {
  all: new Set<string>(),
  draft: new Set<string>(),
  processing: new Set<string>(),
  ready: new Set<string>(),
  failed: new Set<string>(),
});

function matchesActiveFilter(video: OwnerVideoResponse, filter: ContentFilter) {
  if (filter === "all") {
    return true;
  }

  const status = normalizeStatus(video.status);
  return FILTER_STATUSES[filter].has(status);
}

function normalizeStatus(status?: string | null) {
  return status?.toLowerCase() || "unknown";
}

function normalizeVisibility(visibility?: string | null) {
  return visibility?.toLowerCase() || "private";
}

function getVisibilityTone(video: OwnerVideoResponse) {
  const visibility = normalizeVisibility(video.visibility);

  if (visibility === "public") {
    return "text-emerald-400";
  }

  if ((video.price ?? 0) > 0 || video.requiredTierLevel) {
    return "text-secondary";
  }

  return "text-muted-foreground";
}

function getStatusTone(status: string) {
  if (status === "succeeded" || READY_STATUSES.has(status)) {
    return "text-emerald-400";
  }

  if (FAILED_STATUSES.has(status)) {
    return "text-destructive";
  }

  if (PROCESSING_STATUSES.has(status)) {
    return "text-secondary";
  }

  return "text-muted-foreground";
}

function getRejectReason(t: TFunction, video: OwnerVideoResponse) {
  return video.failureReason || getModerationDetailsReason(video.moderationDetails) || video.errorMessage || video.jobStatusMessage || t("content.messages.noRejectReason");
}

function getConfirmResolutions(video: OwnerVideoResponse): SubmitUploadBody["resolutions"] {
  const allowedResolutions = new Set<SubmitUploadBody["resolutions"][number]>(["480p", "720p", "1080p"]);
  const selectedResolutions = (video.resolutions ?? []).filter(
    (resolution): resolution is SubmitUploadBody["resolutions"][number] =>
      allowedResolutions.has(resolution as SubmitUploadBody["resolutions"][number])
  );

  return selectedResolutions.length > 0 ? selectedResolutions : DEFAULT_CONFIRM_RESOLUTIONS;
}

function getVideoJobStatusText(payload: Pick<VideoStatusChangedPayload, "jobStatus" | "jobStatusMessage" | "failureReason" | "moderationDetails">) {
  const normalizedJobStatus = payload.jobStatus.toLowerCase();

  if (normalizedJobStatus === "failed" || normalizedJobStatus === "rejected") {
    return getModerationDetailsReason(payload.moderationDetails) || payload.failureReason || payload.jobStatusMessage;
  }

  return payload.jobStatusMessage || getVideoJobStatusLabel(payload.jobStatus);
}

// Helper to translate status safely
function getTranslatedStatus(t: TFunction, status: string) {
  const normalized = status.toLowerCase();
  const knownStatuses = ["ready", "pending", "failed", "processing", "rejected", "waiting", "succeeded", "draft", "private", "public", "unknown"];
  if (knownStatuses.includes(normalized)) {
    return t(`content.status.${normalized}`);
  }
  return status.toUpperCase();
}

function mergeVideoStatus(video: OwnerVideoResponse, payload: VideoStatusChangedPayload): OwnerVideoResponse {
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

function isStatusRelevantForFilter(video: OwnerVideoResponse, filter: ContentFilter) {
  return filter === "all" || matchesActiveFilter(video, filter);
}

export function StudioContentFeature() {
  const t = useTranslations("Studio");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const [videos, setVideos] = useState<OwnerVideoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<ContentFilter>("all");
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);
  const [confirmingVideoId, setConfirmingVideoId] = useState<string | null>(null);
  const [reuploadingVideoId, setReuploadingVideoId] = useState<string | null>(null);
  const [reuploadProgress, setReuploadProgress] = useState(0);
  const [expandedNoticeVideoId, setExpandedNoticeVideoId] = useState<string | null>(null);
  const draftFileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const videosRef = useRef<OwnerVideoResponse[]>([]);

  useEffect(() => {
    videosRef.current = videos;
  }, [videos]);

  const showActionMessage = useCallback((message: string) => {
    setActionMessage(message);
    window.setTimeout(() => setActionMessage(null), 3500);
  }, []);

  const fetchVideos = useCallback(async (showLoading = true, filter: ContentFilter) => {
    if (showLoading) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError(null);

    try {
      const filterConfig = CONTENT_FILTERS.find(item => item.value === filter);
      const params: OwnerVideosParams | undefined = filterConfig && filterConfig.statuses.length > 0
        ? { status: filterConfig.statuses }
        : undefined;
      const res = await mediaService.getOwnerVideos(params);
      if (res.success && res.data) {
        setVideos(filter === "all" ? res.data : res.data.filter(video => matchesActiveFilter(video, filter)));
        return true;
      }

      const message = res.message || t("content.messages.loadFailed");
      if (showLoading) {
        setVideos([]);
        setError(message);
      } else {
        showActionMessage(message);
      }
      return false;
    } catch (err) {
      const message = getErrorMessage(err, t("content.messages.loadFailedRetry"));
      if (showLoading) {
        setVideos([]);
        setError(message);
      } else {
        showActionMessage(message);
      }
      return false;
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [showActionMessage, t]);

  useEffect(() => {
    void fetchVideos(true, activeFilter);
  }, [activeFilter, fetchVideos]);

  const refreshAfterProcessing = useCallback(() => {
    void fetchVideos(false, activeFilter);
  }, [activeFilter, fetchVideos]);

  const handleVideoStatusChanged = useCallback((payload: VideoStatusChangedPayload) => {
    const existingVideo = videosRef.current.find(video => video.id === payload.videoId);

    if (!existingVideo) {
      void fetchVideos(false, activeFilter);
      return;
    }

    const nextVideo = mergeVideoStatus(existingVideo, payload);
    setVideos(currentVideos => currentVideos
      .map(video => video.id === payload.videoId ? mergeVideoStatus(video, payload) : video)
      .filter(video => isStatusRelevantForFilter(video, activeFilter))
    );

    const statusText = getTranslatedStatus(t, payload.jobStatus);
    const detailsText = getVideoJobStatusText(payload);
    showActionMessage(`${existingVideo.title}: ${statusText}${detailsText ? ` - ${detailsText}` : ""}`);

    if (!isStatusRelevantForFilter(nextVideo, activeFilter) || payload.jobStatus === "succeeded" || payload.jobStatus === "failed" || payload.jobStatus === "rejected") {
      void fetchVideos(false, activeFilter);
    }
  }, [activeFilter, fetchVideos, showActionMessage, t]);

  useVideoStatusEventSubscription(handleVideoStatusChanged);

  const handleFilterChange = (filter: ContentFilter) => {
    setActiveFilter(filter);
  };

  const filteredVideos = useMemo(() => {
    const activeVideos = videos.filter(video => matchesActiveFilter(video, activeFilter));

    if (!query) {
      return activeVideos;
    }

    return activeVideos.filter(video => {
      const searchableText = [
        video.title,
        video.description,
        normalizeStatus(video.status),
        normalizeVisibility(video.visibility),
        video.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [activeFilter, query, videos]);

  const handleRefresh = () => {
    void fetchVideos(false, activeFilter);
  };

  const handleDeleteVideo = async (video: OwnerVideoResponse) => {
    const status = normalizeStatus(video.status);
    setDeletingVideoId(video.id);
    setError(null);

    try {
      const response = FAILED_STATUSES.has(status)
        ? await mediaService.deleteFailedUpload(video.id)
        : await mediaService.deleteVideo(video.id);

      if (!response.success) {
        showActionMessage(response.message || t("content.messages.deleteFailed"));
        return;
      }

      showActionMessage(
        FAILED_STATUSES.has(status)
          ? t("content.messages.deleteSuccessFailed")
          : t("content.messages.deleteSuccessPublic")
      );
      await fetchVideos(false, activeFilter);
    } catch (err) {
      showActionMessage(getErrorMessage(err, t("content.messages.deleteFailed")));
    } finally {
      setDeletingVideoId(null);
    }
  };

  const handleConfirmDraftUpload = async (video: OwnerVideoResponse) => {
    setConfirmingVideoId(video.id);
    setError(null);

    try {
      if (!video.uploadId) {
        showActionMessage(t("content.messages.draftMissingSession"));
        return;
      }

      const response = await mediaService.submitUpload(video.id, video.uploadId, {
        resolutions: getConfirmResolutions(video),
      });

      if (!(response.success || response.statusCode === 200 || response.statusCode === 201)) {
        showActionMessage(response.message || t("content.messages.confirmFailed"));
        return;
      }

      showActionMessage(t("content.messages.confirmSuccess"));
      await fetchVideos(false, activeFilter);
    } catch (err) {
      showActionMessage(getErrorMessage(err, t("content.messages.confirmFailed")));
    } finally {
      setConfirmingVideoId(null);
    }
  };

  const handleDraftFileReupload = async (video: OwnerVideoResponse, file: File | null) => {
    if (!file) {
      return;
    }

    if (!video.uploadId) {
      showActionMessage(t("content.messages.draftMissingSession"));
      return;
    }

    setReuploadingVideoId(video.id);
    setReuploadProgress(0);
    setError(null);

    try {
      await mediaService.uploadResumableVideoFile({
        videoId: video.id,
        uploadId: video.uploadId,
        file,
        partSizeBytes: video.partSizeBytes || 5 * 1024 * 1024,
        onProgress: setReuploadProgress,
      });

      showActionMessage(t("content.messages.reuploadSuccess"));
      await fetchVideos(false, activeFilter);
    } catch (err) {
      showActionMessage(getErrorMessage(err, t("content.messages.reuploadFailed")));
    } finally {
      setReuploadingVideoId(null);
      setReuploadProgress(0);
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 p-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">{t("layout.creatorStudio")}</p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">{t("content.title")}</h1>
          <p className="mt-2 max-w-2xl font-body text-sm text-muted-foreground">
            {t("content.subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border/30 bg-card px-5 py-3 font-headline text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className={`material-symbols-outlined ${isRefreshing ? "animate-spin" : ""}`} aria-hidden="true">refresh</span>
            {t("content.refresh")}
          </button>
          <Link href="/studio/upload" className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-6 py-3 font-headline text-sm font-semibold text-primary-foreground shadow-[0_10px_20px_rgba(229,9,20,0.2)] transition-opacity hover:opacity-90">
            <span className="material-symbols-outlined" aria-hidden="true">add</span>
            {t("content.newUpload")}
          </Link>
        </div>
      </header>

      <div className="flex items-center gap-8 border-b border-border/30">
        {CONTENT_FILTERS.map(filter => (
          <button
            key={filter.value}
            type="button"
            onClick={() => handleFilterChange(filter.value)}
            className={`pb-4 font-headline text-sm font-semibold transition-colors ${
              activeFilter === filter.value ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t(`content.filters.${filter.value}`)}
            {activeFilter === filter.value ? (
              <span className="ml-2 rounded bg-card px-1.5 py-0.5 font-body text-xs text-muted-foreground">{filteredVideos.length}</span>
            ) : null}
          </button>
        ))}
      </div>

      {actionMessage ? (
        <div className="rounded-lg border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm font-medium text-secondary">
          {actionMessage}
        </div>
      ) : null}

      <div className="flex w-full flex-col gap-4">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 font-label text-xs uppercase tracking-wider text-muted-foreground">
          <div className="col-span-12 md:col-span-5">{t("content.table.video")}</div>
          <div className="hidden text-center md:col-span-2 md:block">{t("content.table.visibility")}</div>
          <div className="hidden text-center md:col-span-1 md:block">{t("content.table.level")}</div>
          <div className="hidden text-right md:col-span-2 md:block">{t("content.table.performance")}</div>
          <div className="col-span-12 text-right md:col-span-2">{t("content.table.actions")}</div>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-border/30 bg-card p-12 text-center text-muted-foreground">{t("content.empty.loading")}</div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/30 bg-card p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-destructive">error</span>
            <h2 className="mt-4 font-headline text-xl font-bold text-foreground">{t("content.messages.loadFailed")}</h2>
            <p className="mx-auto mt-2 max-w-md font-body text-sm text-muted-foreground">{error}</p>
            <button
              type="button"
              onClick={() => void fetchVideos(true, activeFilter)}
              className="mt-6 rounded-sm bg-primary px-5 py-2.5 font-headline text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {t("content.messages.retry")}
            </button>
          </div>
        ) : videos.length === 0 ? (
          <div className="rounded-lg border border-border/30 bg-card p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-muted-foreground">video_library</span>
            <h2 className="mt-4 font-headline text-xl font-bold text-foreground">{t("content.empty.noVideos")}</h2>
            <p className="mt-2 font-body text-sm text-muted-foreground">{t("content.empty.noVideosDesc")}</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="rounded-lg border border-border/30 bg-card p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-muted-foreground">search_off</span>
            <h2 className="mt-4 font-headline text-xl font-bold text-foreground">{t("content.empty.noMatches")}</h2>
            <p className="mt-2 font-body text-sm text-muted-foreground">{t("content.empty.noMatchesDesc")}</p>
          </div>
        ) : (
          filteredVideos.map((video) => {
            const status = normalizeStatus(video.status);
            const visibility = normalizeVisibility(video.visibility);
            const visibilityLabel = t(`content.visibility.${visibility}`);
            const formattedDate = video.createdAt ? new Date(video.createdAt).toLocaleDateString(locale) : "--";
            const thumbUrl = getReadyOwnerVideoThumbnailUrl(video.id, video.thumbnailUrl, video.thumbnailStatus) || "/images/thumbnail.png";
            const price = video.price ?? 0;
            const levelLabel = video.requiredTierLevel ? `LV${video.requiredTierLevel}` : price > 0 ? t("content.table.ppv") : t("content.table.free");
            const viewCount = video.viewCount ?? video.metrics?.viewsCount ?? 0;
            const normalizedJobStatus = video.jobStatus?.toLowerCase();
            const displayStatus = isVideoJobStatus(normalizedJobStatus) ? normalizedJobStatus : status;
            const statusLabel = getTranslatedStatus(t, displayStatus);
            const isRejected = status === REJECTED_STATUS || normalizedJobStatus === "rejected";
            const isDraft = status === DRAFT_STATUS;
            const isFailed = FAILED_STATUSES.has(status) || normalizedJobStatus === "failed" || normalizedJobStatus === "rejected";
            const isReady = READY_STATUSES.has(status);
            const isProcessing = PROCESSING_STATUSES.has(status) || normalizedJobStatus === "waiting" || normalizedJobStatus === "processing";
            const statusTone = getStatusTone(displayStatus);
            const isNoticeExpanded = expandedNoticeVideoId === video.id;
            const hasInlineNotice = isDraft || isFailed;
            const previewHref = `/studio/content/${video.id}`;
            const noticePanelId = `content-notice-${video.id}`;

            return (
              <article
                key={video.id}
                className="group relative grid grid-cols-12 items-center gap-4 overflow-hidden rounded-lg bg-card px-6 py-4 transition-colors hover:bg-muted/40"
              >
                {video.requiredTierLevel === 3 ? <div className="absolute inset-0 rounded-lg border border-secondary/10" /> : null}

                <div className="col-span-12 flex items-center gap-4 md:col-span-5">
                  <Link
                    href={previewHref}
                    className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring/70"
                    aria-label={`${isReady ? t("content.actions.preview") : t("content.actions.openDetails")} ${video.title}`}
                  >
                    <VideoThumbnail
                      src={thumbUrl}
                      alt=""
                      aria-hidden="true"
                      className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] ${isReady ? "" : "opacity-70"}`}
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-background/0 text-foreground opacity-0 transition-opacity duration-300 group-hover:bg-background/50 group-hover:opacity-100">
                      <span className="material-symbols-outlined text-3xl" aria-hidden="true">{isReady ? "play_circle" : "visibility"}</span>
                    </span>
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={previewHref}
                      className="block truncate pr-4 font-headline text-base font-semibold text-foreground transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring/70"
                    >
                      {video.title}
                    </Link>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className={`font-label text-xs ${statusTone}`}>
                        {statusLabel}
                      </span>
                      <span className="font-label text-xs text-muted-foreground">• {formattedDate}</span>
                      {hasInlineNotice ? (
                        <button
                          type="button"
                          onClick={() => setExpandedNoticeVideoId(current => current === video.id ? null : video.id)}
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring/70 ${
                            isFailed
                              ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                              : "bg-secondary/10 text-secondary hover:bg-secondary/20"
                          }`}
                          title={isNoticeExpanded ? t("content.notices.hideNotice") : t("content.notices.viewNotice")}
                          aria-label={`${isNoticeExpanded ? t("content.notices.hideNotice") : t("content.notices.viewNotice")} cho ${video.title}`}
                          aria-controls={noticePanelId}
                          aria-expanded={isNoticeExpanded}
                        >
                          <CircleAlert className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden="true" />
                        </button>
                      ) : null}
                    </div>
                    {isDraft && isNoticeExpanded ? (
                      <div
                        id={noticePanelId}
                        role="note"
                        className="mt-2 max-w-sm rounded-md border border-secondary/30 bg-secondary/10 px-3 py-2 text-xs text-muted-foreground"
                      >
                        {t("content.notices.draftWarning")}
                      </div>
                    ) : null}
                    {isDraft && reuploadingVideoId === video.id ? (
                      <div className="mt-3 max-w-sm space-y-1">
                        <div className="h-1.5 overflow-hidden rounded-full bg-background/70">
                          <div
                            className="h-full rounded-full bg-secondary transition-[width] duration-300"
                            style={{ width: `${reuploadProgress}%` }}
                          />
                        </div>
                        <p className="font-label text-[10px] font-bold uppercase tracking-widest text-secondary">
                          {t("content.notices.uploading", { progress: reuploadProgress })}
                        </p>
                      </div>
                    ) : null}
                    {isFailed && isNoticeExpanded ? (
                      <div
                        id={noticePanelId}
                        role="alert"
                        className="mt-2 max-w-sm rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                      >
                        <span className="font-bold uppercase tracking-widest">
                          {isRejected ? t("content.notices.rejectedWarning") : t("content.status.failed")}
                        </span>
                        <p className="mt-1 text-destructive/90">
                          {isRejected ? getRejectReason(t, video) : video.failureReason || video.errorMessage || video.jobStatusMessage || t("content.notices.failedWarning")}
                        </p>
                      </div>
                    ) : null}
                    {isProcessing ? (
                      <ProcessingProgressTracker
                        initialStatus={video.status}
                        jobStatus={video.jobStatus}
                        jobStatusMessage={video.jobStatusMessage}
                        failureReason={video.failureReason || video.errorMessage}
                        moderationDetails={video.moderationDetails}
                        isRefreshing={isRefreshing}
                        onRefreshStatus={refreshAfterProcessing}
                      />
                    ) : null}
                  </div>
                </div>

                <div className="hidden justify-center md:col-span-2 md:flex">
                  <span className={`inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 font-body text-xs font-medium ${getVisibilityTone(video)}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {visibilityLabel}
                  </span>
                </div>

                <div className="hidden justify-center md:col-span-1 md:flex">
                  <span className="rounded border border-border/30 bg-card px-2 py-1 font-headline text-xs font-bold text-foreground">
                    {levelLabel}
                  </span>
                </div>

                <div className="hidden flex-col text-right md:col-span-2 md:flex">
                  <span className="font-headline font-semibold text-foreground">
                    {t("content.table.views", { count: viewCount })}
                  </span>
                  <span className="font-body text-xs text-muted-foreground">{t("content.table.likesPending")}</span>
                </div>

                <div className="col-span-12 flex justify-end gap-2 md:col-span-2">
                  <Link
                    href={previewHref}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full p-0 text-muted-foreground transition-colors hover:bg-muted hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring/70"
                    aria-label={`${isReady ? t("content.actions.preview") : t("content.actions.openDetails")} ${video.title}`}
                  >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">{isReady ? "play_arrow" : "visibility"}</span>
                  </Link>
                  {isDraft ? (
                    <>
                      <input
                        ref={node => {
                          draftFileInputRefs.current[video.id] = node;
                        }}
                        type="file"
                        accept="video/*"
                        className="sr-only"
                        disabled={reuploadingVideoId === video.id}
                        onChange={event => {
                          const file = event.target.files?.[0] ?? null;
                          event.currentTarget.value = "";
                          void handleDraftFileReupload(video, file);
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => draftFileInputRefs.current[video.id]?.click()}
                        disabled={reuploadingVideoId === video.id || confirmingVideoId === video.id}
                        title={t("content.actions.resumeUpload")}
                        className="h-8 w-8 rounded-full p-0 text-secondary transition-colors hover:bg-secondary/10 hover:text-secondary disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`${t("content.actions.resumeUpload")} ${video.title}`}
                      >
                        <span className={`material-symbols-outlined text-[18px] ${reuploadingVideoId === video.id ? "animate-spin" : ""}`}>
                          {reuploadingVideoId === video.id ? "progress_activity" : "upload_file"}
                        </span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => void handleConfirmDraftUpload(video)}
                        disabled={confirmingVideoId === video.id || reuploadingVideoId === video.id}
                        title={t("content.notices.draftWarning")}
                        className="h-8 w-8 rounded-full p-0 text-secondary transition-colors hover:bg-secondary/10 hover:text-secondary disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`${t("content.actions.confirmUpload")} ${video.title}. Video will be deleted after 24 hours if you do not confirm upload.`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {confirmingVideoId === video.id ? "hourglass_top" : "check_circle"}
                        </span>
                      </Button>
                    </>
                  ) : null}
                  {!isRejected ? (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setEditingVideoId(video.id)}
                        className="h-8 w-8 rounded-full p-0 text-muted-foreground hover:text-foreground"
                        aria-label={`${t("content.actions.edit")} ${video.title}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </Button>
                    </>
                  ) : null}
                  {!isDraft ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => void handleDeleteVideo(video)}
                      disabled={deletingVideoId === video.id || PROCESSING_STATUSES.has(status)}
                      className="h-8 w-8 rounded-full p-0 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={`${t("content.actions.delete")} ${video.title}`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {deletingVideoId === video.id ? "hourglass_top" : "delete"}
                      </span>
                    </Button>
                  ) : null}
                </div>
              </article>
            );
          })
        )}
      </div>

      {editingVideoId ? (
        <EditVideoMetadataDialog
          videoId={editingVideoId}
          onClose={() => setEditingVideoId(null)}
          onSaved={() => {
            setEditingVideoId(null);
            void fetchVideos(false, activeFilter);
          }}
        />
      ) : null}
    </section>
  );
}
