"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { mediaService, type OwnerVideoResponse, type OwnerVideosParams } from "@/features/watch/services/mediaService";
import { getErrorMessage } from "@/shared/api/client";
import { EditVideoMetadataDialog } from "./EditVideoMetadataDialog";

const PROCESSING_STATUSES = new Set(["processing", "pending_moderation", "moderating", "pending_manual_review"]);
const FAILED_STATUSES = new Set(["failed", "rejected"]);
const READY_STATUSES = new Set(["ready"]);
const REJECTED_STATUS = "rejected";

type ContentFilter = "all" | "draft" | "processing" | "ready" | "failed";

type ContentFilterConfig = {
  label: string;
  value: ContentFilter;
  statuses: string[];
};

const CONTENT_FILTERS: ContentFilterConfig[] = [
  { label: "Videos", value: "all", statuses: [] },
  { label: "Drafts", value: "draft", statuses: ["DRAFT"] },
  { label: "Processing", value: "processing", statuses: ["PROCESSING"] },
  { label: "Ready", value: "ready", statuses: ["READY"] },
  { label: "Failed", value: "failed", statuses: ["FAILED", "REJECTED"] },
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

  return FILTER_STATUSES[filter].has(normalizeStatus(video.status));
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

function toTitleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getStatusTone(status: string) {
  if (READY_STATUSES.has(status)) {
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

function getRejectReason(video: OwnerVideoResponse) {
  return video.failureReason || video.errorMessage || video.jobStatusMessage || "Chưa có nguyên nhân reject từ hệ thống.";
}

export function StudioContentFeature() {
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
  const [expandedRejectReasonVideoId, setExpandedRejectReasonVideoId] = useState<string | null>(null);

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
        return;
      }

      if (showLoading) {
        setVideos([]);
        setError(res.mess || "Không thể tải danh sách video.");
      }
    } catch (err) {
      if (showLoading) {
        setVideos([]);
        setError(getErrorMessage(err, "Không thể tải danh sách video. Vui lòng thử lại."));
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchVideos(true, activeFilter);
  }, [activeFilter, fetchVideos]);

  const refreshAfterProcessing = useCallback(() => {
    void fetchVideos(false, activeFilter);
  }, [activeFilter, fetchVideos]);

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

  const showActionMessage = (message: string) => {
    setActionMessage(message);
    window.setTimeout(() => setActionMessage(null), 3500);
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
        showActionMessage(response.mess || "Không thể xoá video. Vui lòng thử lại.");
        return;
      }

      showActionMessage(
        FAILED_STATUSES.has(status)
          ? "Đã xoá video xử lý thất bại khỏi Studio."
          : "Đã gỡ video khỏi thư viện công khai."
      );
      await fetchVideos(false, activeFilter);
    } catch (err) {
      showActionMessage(getErrorMessage(err, "Không thể xoá video. Vui lòng thử lại."));
    } finally {
      setDeletingVideoId(null);
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 p-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">Creator Gallery</p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">Content Library</h1>
          <p className="mt-2 max-w-2xl font-body text-sm text-muted-foreground">
            Manage uploads, organize releases, and monitor performance across every access tier.
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
            Refresh
          </button>
          <Link href="/studio/upload" className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-6 py-3 font-headline text-sm font-semibold text-primary-foreground shadow-[0_10px_20px_rgba(229,9,20,0.2)] transition-opacity hover:opacity-90">
            <span className="material-symbols-outlined" aria-hidden="true">add</span>
            New Upload
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
            {filter.label}
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
          <div className="col-span-12 md:col-span-5">Video</div>
          <div className="hidden text-center md:col-span-2 md:block">Visibility</div>
          <div className="hidden text-center md:col-span-1 md:block">Level</div>
          <div className="hidden text-right md:col-span-2 md:block">Performance</div>
          <div className="col-span-12 text-right md:col-span-2">Actions</div>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-border/30 bg-card p-12 text-center text-muted-foreground">Loading videos...</div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/30 bg-card p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-destructive">error</span>
            <h2 className="mt-4 font-headline text-xl font-bold text-foreground">Không thể tải Content Library</h2>
            <p className="mx-auto mt-2 max-w-md font-body text-sm text-muted-foreground">{error}</p>
            <button
              type="button"
              onClick={() => void fetchVideos(true, activeFilter)}
              className="mt-6 rounded-sm bg-primary px-5 py-2.5 font-headline text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Thử lại
            </button>
          </div>
        ) : videos.length === 0 ? (
          <div className="rounded-lg border border-border/30 bg-card p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-muted-foreground">video_library</span>
            <h2 className="mt-4 font-headline text-xl font-bold text-foreground">No videos found</h2>
            <p className="mt-2 font-body text-sm text-muted-foreground">Upload a video to start building your gallery.</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="rounded-lg border border-border/30 bg-card p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-muted-foreground">search_off</span>
            <h2 className="mt-4 font-headline text-xl font-bold text-foreground">Không tìm thấy nội dung phù hợp</h2>
            <p className="mt-2 font-body text-sm text-muted-foreground">Thử tìm theo tiêu đề, mô tả, trạng thái hoặc category khác.</p>
          </div>
        ) : (
          filteredVideos.map((video) => {
            const status = normalizeStatus(video.status);
            const visibility = normalizeVisibility(video.visibility);
            const visibilityLabel = toTitleCase(visibility);
            const formattedDate = video.createdAt ? new Date(video.createdAt).toLocaleDateString() : "--";
            const thumbUrl = video.thumbnailUrl || "/images/thumbnail.png";
            const price = video.price ?? 0;
            const levelLabel = video.requiredTierLevel ? `LV${video.requiredTierLevel}` : price > 0 ? "PPV" : "Free";
            const viewCount = video.viewCount ?? video.metrics?.viewsCount ?? 0;
            const isRejected = status === REJECTED_STATUS;
            const isReady = READY_STATUSES.has(status);
            const isRejectReasonExpanded = expandedRejectReasonVideoId === video.id;
            const previewHref = `/studio/content/${video.id}`;

            return (
              <article
                key={video.id}
                className="group relative grid grid-cols-12 items-center gap-4 overflow-hidden rounded-lg bg-card px-6 py-4 transition-colors hover:bg-muted/40"
              >
                {video.requiredTierLevel === 3 ? <div className="absolute inset-0 rounded-lg border border-secondary/10" /> : null}

                <div className="col-span-12 flex items-center gap-4 md:col-span-5">
                  {isReady ? (
                    <Link
                      href={previewHref}
                      className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring/70"
                      aria-label={`Preview ${video.title}`}
                    >
                      <span
                        aria-hidden="true"
                        className="block h-full w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.03]"
                        style={{ backgroundImage: `url(${thumbUrl})` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-background/0 text-foreground opacity-0 transition-opacity duration-300 group-hover:bg-background/50 group-hover:opacity-100">
                        <span className="material-symbols-outlined text-3xl" aria-hidden="true">play_circle</span>
                      </span>
                    </Link>
                  ) : (
                    <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-background">
                      <div
                        aria-label={video.title}
                        role="img"
                        className="h-full w-full bg-cover bg-center opacity-70 transition-transform duration-300 group-hover:scale-[1.03]"
                        style={{ backgroundImage: `url(${thumbUrl})` }}
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    {isReady ? (
                      <Link
                        href={previewHref}
                        className="block truncate pr-4 font-headline text-base font-semibold text-foreground transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring/70"
                      >
                        {video.title}
                      </Link>
                    ) : (
                      <h3 className="truncate pr-4 font-headline text-base font-semibold text-foreground transition-colors group-hover:text-primary">
                        {video.title}
                      </h3>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className={`font-label text-xs ${getStatusTone(status)}`}>
                        {status.toUpperCase()}
                      </span>
                      <span className="font-label text-xs text-muted-foreground">• {formattedDate}</span>
                    </div>
                    {FAILED_STATUSES.has(status) && (!isRejected || isRejectReasonExpanded) ? (
                      <div className="mt-2 max-w-sm rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                        <span className="font-bold uppercase tracking-widest">
                          {isRejected ? "Reject reason" : "Processing failed"}
                        </span>
                        <p className="mt-1 text-destructive/90">
                          {isRejected ? getRejectReason(video) : video.failureReason || video.errorMessage || video.jobStatusMessage || "Video xử lý thất bại. Bạn có thể xoá bản lỗi và upload lại."}
                        </p>
                      </div>
                    ) : null}
                    {PROCESSING_STATUSES.has(status) ? (
                      <div className="mt-3 max-w-sm rounded-md border border-secondary/30 bg-secondary/10 p-3 text-xs text-secondary">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold uppercase tracking-widest">
                            {(video.jobStatus || status).replaceAll("_", " ")}
                          </span>
                          <button
                            type="button"
                            onClick={refreshAfterProcessing}
                            className="rounded-sm border border-secondary/30 px-2 py-1 font-bold uppercase tracking-widest transition-colors hover:bg-secondary/10"
                          >
                            Refresh
                          </button>
                        </div>
                        <p className="mt-2 text-muted-foreground">
                          {video.jobStatusMessage || "Video đang được xử lý. Nhấn Refresh để cập nhật trạng thái mới nhất."}
                        </p>
                      </div>
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
                    {viewCount.toLocaleString()} <span className="font-body text-xs font-normal text-muted-foreground">views</span>
                  </span>
                  <span className="font-body text-xs text-muted-foreground">Likes pending</span>
                </div>

                <div className="col-span-12 flex justify-end gap-2 md:col-span-2">
                  {isRejected ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setExpandedRejectReasonVideoId(current => current === video.id ? null : video.id)}
                      className="h-8 w-8 rounded-full p-0 text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`${isRejectReasonExpanded ? "Hide" : "View"} reject reason for ${video.title}`}
                      aria-expanded={isRejectReasonExpanded}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {isRejectReasonExpanded ? "error" : "report"}
                      </span>
                    </Button>
                  ) : (
                    <>
                      {isReady ? (
                        <Link
                          href={previewHref}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full p-0 text-muted-foreground transition-colors hover:bg-muted hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring/70"
                          aria-label={`Preview ${video.title}`}
                        >
                          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">play_arrow</span>
                        </Link>
                      ) : null}
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setEditingVideoId(video.id)}
                        className="h-8 w-8 rounded-full p-0 text-muted-foreground hover:text-foreground"
                        aria-label={`Edit ${video.title}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </Button>
                      {/* Analytics action is hidden until the feature is available.
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => showActionMessage("Analytics API chưa sẵn sàng. Hiện chỉ có views cơ bản trong danh sách.")}
                        className="h-8 w-8 rounded-full p-0 text-muted-foreground hover:text-secondary"
                        aria-label={`View analytics for ${video.title}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                      </Button>
                      */}
                    </>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => void handleDeleteVideo(video)}
                    disabled={deletingVideoId === video.id || PROCESSING_STATUSES.has(status)}
                    className="h-8 w-8 rounded-full p-0 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`Delete ${video.title}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {deletingVideoId === video.id ? "hourglass_top" : "delete"}
                    </span>
                  </Button>
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
