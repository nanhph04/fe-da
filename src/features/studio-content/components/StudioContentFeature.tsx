"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { mediaService, type DiscoveryVideoResponse, type OwnerVideosParams } from "@/features/watch/services/mediaService";
import { getErrorMessage } from "@/shared/api/client";
import { EditVideoMetadataDialog } from "./EditVideoMetadataDialog";
import { ProcessingProgressTracker } from "./ProcessingProgressTracker";

const PROCESSING_STATUSES = new Set(["processing", "pending_moderation", "moderating"]);
const FAILED_STATUSES = new Set(["failed", "rejected"]);
const READY_STATUSES = new Set(["ready"]);

type ContentFilter = "all" | "draft" | "processing" | "ready" | "failed";

const CONTENT_FILTERS: Array<{ label: string; value: ContentFilter; statuses?: string[] }> = [
  { label: "Videos", value: "all" },
  { label: "Drafts", value: "draft", statuses: ["DRAFT"] },
  { label: "Processing", value: "processing", statuses: ["PROCESSING", "PENDING_MODERATION", "MODERATING"] },
  { label: "Ready", value: "ready", statuses: ["READY"] },
  { label: "Failed", value: "failed", statuses: ["FAILED", "REJECTED"] },
];

function normalizeStatus(status?: string | null) {
  return status?.toLowerCase() || "unknown";
}

function normalizeVisibility(visibility?: string | null) {
  return visibility?.toLowerCase() || "private";
}

function getVisibilityTone(video: DiscoveryVideoResponse) {
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

export function StudioContentFeature() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const [videos, setVideos] = useState<DiscoveryVideoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<ContentFilter>("all");
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchVideos = useCallback(async (showLoading = true, filter: ContentFilter = activeFilter) => {
    if (showLoading) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError(null);

    try {
      const filterConfig = CONTENT_FILTERS.find(item => item.value === filter);
      const params: OwnerVideosParams | undefined = filterConfig?.statuses
        ? { status: filterConfig.statuses }
        : undefined;
      const res = await mediaService.getOwnerVideos(params);
      if (res.success && res.data) {
        setVideos(res.data);
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
  }, [activeFilter]);

  useEffect(() => {
    void fetchVideos();
  }, [fetchVideos]);

  const refreshAfterProcessing = useCallback(() => {
    void fetchVideos(false);
  }, [fetchVideos]);

  const handleFilterChange = (filter: ContentFilter) => {
    setActiveFilter(filter);
  };

  const filteredVideos = useMemo(() => {
    if (!query) {
      return videos;
    }

    return videos.filter(video => {
      const searchableText = [
        video.title,
        video.description,
        normalizeStatus(video.status),
        normalizeVisibility(video.visibility),
        ...(video.categories ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [query, videos]);

  const handleRefresh = () => {
    void fetchVideos(false);
  };

  const handleUnavailableAction = (message: string) => {
    setActionMessage(message);
    window.setTimeout(() => setActionMessage(null), 3500);
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
              onClick={() => void fetchVideos()}
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
            const thumbUrl = video.thumbnailUrl;
            const price = video.price ?? 0;
            const levelLabel = video.requiredTierLevel ? `LV${video.requiredTierLevel}` : price > 0 ? "PPV" : "Free";
            const viewCount = video.viewCount ?? video.metrics?.viewsCount ?? 0;

            return (
              <article
                key={video.id}
                className="group relative grid grid-cols-12 items-center gap-4 overflow-hidden rounded-lg bg-card px-6 py-4 transition-colors hover:bg-muted/40"
              >
                {video.requiredTierLevel === 3 ? <div className="absolute inset-0 rounded-lg border border-secondary/10" /> : null}

                <div className="col-span-12 flex items-center gap-4 md:col-span-5">
                  <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-background">
                    <div
                      aria-label={video.title}
                      role="img"
                      className="h-full w-full bg-cover bg-center opacity-80 transition-opacity group-hover:opacity-100"
                      style={
                        thumbUrl
                          ? { backgroundImage: `url(${thumbUrl})` }
                          : undefined
                      }
                    />
                    {!thumbUrl ? (
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(229,9,20,0.22),transparent_35%),linear-gradient(135deg,rgba(31,31,34,0.95),rgba(14,14,16,1))]" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate pr-4 font-headline text-base font-semibold text-foreground transition-colors group-hover:text-primary">
                      {video.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className={`font-label text-xs ${getStatusTone(status)}`}>
                        {status.toUpperCase()}
                      </span>
                      <span className="font-label text-xs text-muted-foreground">• {formattedDate}</span>
                    </div>
                    {FAILED_STATUSES.has(status) ? (
                      <p className="mt-2 max-w-sm text-xs text-destructive">
                        {video.errorMessage || "Video xử lý thất bại. Vui lòng thử upload lại hoặc kiểm tra log backend."}
                      </p>
                    ) : null}
                    {PROCESSING_STATUSES.has(status) && (
                      <ProcessingProgressTracker
                        videoId={video.id}
                        initialStatus={status}
                        onComplete={refreshAfterProcessing}
                        onRefreshStatus={refreshAfterProcessing}
                      />
                    )}
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
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setEditingVideoId(video.id)}
                    className="h-8 w-8 rounded-full p-0 text-muted-foreground hover:text-foreground"
                    aria-label={`Edit ${video.title}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleUnavailableAction("Analytics API chưa sẵn sàng. Hiện chỉ có views cơ bản trong danh sách.")}
                    className="h-8 w-8 rounded-full p-0 text-muted-foreground hover:text-secondary"
                    aria-label={`View analytics for ${video.title}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleUnavailableAction("Chức năng xoá video chưa có API contract, nên không xoá local giả.")}
                    className="h-8 w-8 rounded-full p-0 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    aria-label={`Delete ${video.title}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
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
            void fetchVideos(false);
          }}
        />
      ) : null}
    </section>
  );
}
