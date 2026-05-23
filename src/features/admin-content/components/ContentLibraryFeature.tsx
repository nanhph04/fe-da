"use client";

import { VideoThumbnail } from "@/shared/components/VideoThumbnail";
import { Link } from "@/i18n/routing";
import { useEffect, useState } from "react";

import { getErrorMessage } from "@/shared/api/client";
import type { ApiPagination } from "@/shared/api/types";

import { adminContentService } from "../services/adminContentService";
import type { AdminVideoItem } from "../types/admin-content.types";

const initialPagination: ApiPagination = { page: 1, limit: 20, total: 0, totalPages: 0 };

function formatDate(value: string | null) {
  if (!value) {
    return "Not published";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function formatLabel(value: string) {
  return value.replace(/_/g, " ");
}

function getAccessLabel(video: AdminVideoItem) {
  if (video.requiredTierLevel) {
    return `LV${video.requiredTierLevel}`;
  }

  if (video.price > 0) {
    return "Paid";
  }

  return "Free";
}

function getStatusLabel(video: AdminVideoItem) {
  return video.isDeleted ? "deleted" : video.status;
}

function getStatusClass(video: AdminVideoItem) {
  const status = getStatusLabel(video);

  if (status === "ready") {
    return "text-emerald-400";
  }

  if (status === "processing" || status === "pending_moderation" || status === "pending_manual_review") {
    return "text-secondary";
  }

  return "text-primary";
}

function getReadyThumbnailUrl(video: AdminVideoItem) {
  return video.thumbnailUrl && video.thumbnailStatus === "ready" ? video.thumbnailUrl : null;
}

function getStatusIcon(video: AdminVideoItem) {
  const status = getStatusLabel(video);

  if (status === "ready") {
    return "check_circle";
  }

  if (status === "processing" || status === "pending_moderation" || status === "pending_manual_review") {
    return "pending_actions";
  }

  return "gavel";
}

function ContentSkeletonRows() {
  return Array.from({ length: 5 }).map((_, index) => (
    <tr key={index} className="animate-pulse">
      <td className="px-6 py-4" colSpan={6}>
        <div className="h-14 rounded-sm bg-muted/60" />
      </td>
    </tr>
  ));
}

export function ContentLibraryFeature() {
  const [videos, setVideos] = useState<AdminVideoItem[]>([]);
  const [pagination, setPagination] = useState<ApiPagination>(initialPagination);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadVideos = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await adminContentService.getVideos({ page: 1, limit: 20 });

        if (!cancelled) {
          setVideos(data.items);
          setPagination(data.pagination);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, "Khong the tai danh sach video admin."));
          setVideos([]);
          setPagination(initialPagination);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadVideos();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-border/30 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">Global Registry</p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">Content Library</h1>
          <p className="mt-2 font-body text-sm text-muted-foreground">
            {isLoading ? "Loading platform media..." : `${pagination.total} videos across every creator state.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/content/review" className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90">
            <span className="material-symbols-outlined text-base" aria-hidden="true">fact_check</span>
            Review Queue
          </Link>
          <button type="button" disabled className="inline-flex cursor-not-allowed items-center gap-2 rounded-sm border border-border/40 bg-muted/60 px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors">
            <span className="material-symbols-outlined text-base" aria-hidden="true">filter_list</span>
            Filters
          </button>
        </div>
      </header>

      {error ? (
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-6 font-body text-sm text-primary">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-border/30 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border/30 bg-background text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-6 py-4">Video Asset</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Privacy</th>
                <th className="px-6 py-4">Access</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoading ? (
                <ContentSkeletonRows />
              ) : videos.length === 0 ? (
                <tr>
                  <td className="px-6 py-12 text-center font-body text-sm text-muted-foreground" colSpan={6}>
                    Chua co video nao trong thu vien noi dung.
                  </td>
                </tr>
              ) : (
                videos.map((video) => (
                  <tr key={video.id} className="group transition-colors hover:bg-muted/40">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-14 w-24 overflow-hidden rounded-sm border border-border/30 bg-[radial-gradient(circle_at_30%_20%,rgba(229,9,20,0.22),transparent_35%),linear-gradient(135deg,rgba(31,31,34,0.95),rgba(14,14,16,1))]">
                          <VideoThumbnail
                            src={getReadyThumbnailUrl(video)}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover opacity-85 transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div>
                          <p className="max-w-[260px] truncate font-headline text-sm font-bold text-foreground">{video.title}</p>
                          <p className="font-mono text-[10px] text-muted-foreground">
                            {video.id} - {formatDate(video.updatedAt)} - {formatCompactNumber(video.viewCount)} views
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 font-mono text-[10px] text-muted-foreground">
                        <p className="max-w-[180px] truncate text-xs text-foreground/80">{video.channelId}</p>
                        <p className="max-w-[180px] truncate">Owner {video.ownerId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-sm border border-secondary/30 px-2 py-0.5 font-label text-[10px] font-bold uppercase tracking-widest text-secondary">
                        {formatLabel(video.visibility)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-sm border border-border/30 bg-muted px-2 py-0.5 font-label text-[10px] font-bold text-foreground">{getAccessLabel(video)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1 font-label text-[10px] font-bold uppercase tracking-widest ${getStatusClass(video)}`}>
                        <span className="material-symbols-outlined text-[14px]" aria-hidden="true">{getStatusIcon(video)}</span>
                        {formatLabel(getStatusLabel(video))}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/content/${video.id}`} className="inline-flex rounded p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label={`View ${video.title}`}>
                        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">admin_panel_settings</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
