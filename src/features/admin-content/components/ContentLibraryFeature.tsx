"use client";

import { VideoThumbnail } from "@/shared/components/VideoThumbnail";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { formatDuration } from "@/features/home/utils/format";

import { getErrorMessage } from "@/shared/api/client";
import type { ApiPagination } from "@/shared/api/types";

import { mediaService } from "@/features/watch/services/mediaService";
import type { CategoryResponse } from "@/features/watch/services/mediaService.types";
import { adminContentService } from "../services/adminContentService";
import type {
  AdminVideoItem,
  AdminVideoListParams,
  AdminVideoStatus,
  AdminVideoVisibility,
} from "../types/admin-content.types";

const initialPagination: ApiPagination = { page: 1, limit: 20, total: 0, totalPages: 0 };

function getIntlLocale(locale: string) {
  return locale === "en" ? "en-US" : "vi-VN";
}

function formatDate(value: string | null, locale: string, fallback: string) {
  if (!value) {
    return fallback;
  }

  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatCompactNumber(value: number, locale: string) {
  return new Intl.NumberFormat(getIntlLocale(locale), { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function formatLabel(value: string) {
  return value.replace(/_/g, " ");
}

function getAccessLabel(video: AdminVideoItem, t: ReturnType<typeof useTranslations>) {
  if (video.requiredTierLevel) {
    return t("library.access.tier", { level: video.requiredTierLevel });
  }

  if (video.price > 0) {
    return t("library.access.paid");
  }

  return t("library.access.free");
}

function getStatusLabel(video: AdminVideoItem) {
  return video.isDeleted ? "deleted" : video.status;
}

function getStatusDisplayLabel(video: AdminVideoItem, t: ReturnType<typeof useTranslations>) {
  const status = getStatusLabel(video);
  if (
    status === "draft" ||
    status === "pending_moderation" ||
    status === "processing" ||
    status === "pending_manual_review" ||
    status === "rejected" ||
    status === "ready" ||
    status === "failed" ||
    status === "deleted"
  ) {
    return t(`statuses.${status}`);
  }

  return formatLabel(status);
}

function getVisibilityLabel(value: string, t: ReturnType<typeof useTranslations>) {
  if (value === "public" || value === "private") {
    return t(`visibilities.${value}`);
  }

  return formatLabel(value);
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
  return video.thumbnailUrl || null;
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
  const t = useTranslations("Admin.content");
  const locale = useLocale();
  const [videos, setVideos] = useState<AdminVideoItem[]>([]);
  const [pagination, setPagination] = useState<ApiPagination>(initialPagination);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Categories list
  const [categories, setCategories] = useState<CategoryResponse[]>([]);

  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [filterQ, setFilterQ] = useState("");
  const [filterChannelId, setFilterChannelId] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterVisibility, setFilterVisibility] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");

  // Popup States
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedVideoDetail, setSelectedVideoDetail] = useState<AdminVideoItem | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const handleOpenDetail = async (id: string) => {
    setSelectedVideoId(id);
    setIsDetailLoading(true);
    setDetailError(null);
    setSelectedVideoDetail(null);
    try {
      const detail = await adminContentService.getVideo(id);
      setSelectedVideoDetail(detail);
    } catch (err) {
      setDetailError(getErrorMessage(err, t("library.errors.detailFailed")));
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedVideoId(null);
    setSelectedVideoDetail(null);
    setDetailError(null);
    setIsDetailLoading(false);
  };

  // Active filter values that are currently applied
  const [appliedFilters, setAppliedFilters] = useState({
    q: "",
    channelId: "",
    status: "",
    visibility: "",
    category: "",
  });

  const loadVideos = async (page = 1, limit = 20, filters = appliedFilters) => {
    try {
      setIsLoading(true);
      setError(null);

      const params: AdminVideoListParams = {
        page,
        limit,
      };

      if (filters.q.trim()) {
        params.q = filters.q.trim();
      }
      if (filters.channelId.trim()) {
        params.channelId = filters.channelId.trim();
      }
      if (filters.status) {
        params.status = filters.status as AdminVideoStatus;
      }
      if (filters.visibility) {
        params.visibility = filters.visibility as AdminVideoVisibility;
      }
      if (filters.category) {
        params.category = filters.category;
      }

      const data = await adminContentService.getVideos(params);

      setVideos(data.items);
      setPagination(data.pagination);
    } catch (err) {
      setError(getErrorMessage(err, t("library.errors.loadFailed")));
      setVideos([]);
      setPagination(initialPagination);
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial videos and categories on mount
  useEffect(() => {
    let cancelled = false;

    const fetchCategories = async () => {
      try {
        const res = await mediaService.getCategories({ limit: 100 });
        if (res.success && res.data && !cancelled) {
          setCategories(res.data.items);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    void fetchCategories();
    void loadVideos(1, 20);

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const nextFilters = {
      q: filterQ,
      channelId: filterChannelId,
      status: filterStatus,
      visibility: filterVisibility,
      category: filterCategory,
    };
    setAppliedFilters(nextFilters);
    void loadVideos(1, pagination.limit, nextFilters);
  };

  const handleResetFilters = () => {
    setFilterQ("");
    setFilterChannelId("");
    setFilterStatus("");
    setFilterVisibility("");
    setFilterCategory("");

    const reset = {
      q: "",
      channelId: "",
      status: "",
      visibility: "",
      category: "",
    };
    setAppliedFilters(reset);
    void loadVideos(1, pagination.limit, reset);
  };

  const handlePageChange = (targetPage: number) => {
    if (targetPage < 1 || targetPage > pagination.totalPages) return;
    void loadVideos(targetPage, pagination.limit);
  };

  const handleLimitChange = (targetLimit: number) => {
    void loadVideos(1, targetLimit);
  };

  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-border/30 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">{t("library.header.eyebrow")}</p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">{t("library.header.title")}</h1>
          <p className="mt-2 font-body text-sm text-muted-foreground">
            {isLoading ? t("library.header.loading") : t("library.header.summary", { count: pagination.total })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/content/review" className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90">
            <span className="material-symbols-outlined text-base" aria-hidden="true">fact_check</span>
            {t("library.actions.reviewQueue")}
          </Link>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 rounded-sm border px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest transition-colors duration-200 ${
              showFilters
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/40 bg-muted/30 text-foreground hover:bg-muted/60"
            }`}
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">filter_list</span>
            {t("library.actions.filters")}
          </button>
        </div>
      </header>

      {showFilters ? (
        <form
          onSubmit={handleApplyFilters}
          className="rounded-lg border border-border/30 bg-card p-6 space-y-6 animate-in slide-in-from-top-2 duration-300"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {/* Search Input */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {t("library.filters.searchLabel")}
              </label>
              <input
                type="text"
                placeholder={t("library.filters.searchPlaceholder")}
                value={filterQ}
                onChange={(e) => setFilterQ(e.target.value)}
                className="h-10 w-full rounded border border-border/40 bg-background px-3 font-body text-xs text-foreground outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Channel ID Input */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {t("library.filters.channelLabel")}
              </label>
              <input
                type="text"
                placeholder={t("library.filters.channelPlaceholder")}
                value={filterChannelId}
                onChange={(e) => setFilterChannelId(e.target.value)}
                className="h-10 w-full rounded border border-border/40 bg-background px-3 font-body text-xs text-foreground outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Category Select */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {t("library.filters.categoryLabel")}
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="h-10 w-full rounded border border-border/40 bg-background px-3 font-body text-xs text-foreground outline-none focus:border-primary transition-colors"
              >
                <option value="">{t("library.filters.allCategories")}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Select */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {t("library.filters.statusLabel")}
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-10 w-full rounded border border-border/40 bg-background px-3 font-body text-xs text-foreground outline-none focus:border-primary transition-colors"
              >
                <option value="">{t("library.filters.allStatuses")}</option>
                <option value="draft">{t("statuses.draft")}</option>
                <option value="pending_moderation">{t("statuses.pending_moderation")}</option>
                <option value="processing">{t("statuses.processing")}</option>
                <option value="pending_manual_review">{t("statuses.pending_manual_review")}</option>
                <option value="rejected">{t("statuses.rejected")}</option>
                <option value="ready">{t("statuses.ready")}</option>
                <option value="failed">{t("statuses.failed")}</option>
              </select>
            </div>

            {/* Visibility Select */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {t("library.filters.visibilityLabel")}
              </label>
              <select
                value={filterVisibility}
                onChange={(e) => setFilterVisibility(e.target.value)}
                className="h-10 w-full rounded border border-border/40 bg-background px-3 font-body text-xs text-foreground outline-none focus:border-primary transition-colors"
              >
                <option value="">{t("library.filters.allVisibilities")}</option>
                <option value="public">{t("visibilities.public")}</option>
                <option value="private">{t("visibilities.private")}</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex h-9 items-center justify-center rounded border border-border/40 bg-muted/20 px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted/40 transition-colors"
            >
              {t("library.actions.reset")}
            </button>
            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center rounded bg-primary px-4 text-xs font-bold uppercase tracking-widest text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {t("library.actions.apply")}
            </button>
          </div>
        </form>
      ) : null}

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
                <th className="px-6 py-4">{t("library.table.videoAsset")}</th>
                <th className="px-6 py-4">{t("library.table.channel")}</th>
                <th className="px-6 py-4">{t("library.table.privacy")}</th>
                <th className="px-6 py-4">{t("library.table.access")}</th>
                <th className="px-6 py-4">{t("library.table.status")}</th>
                <th className="px-6 py-4 text-right">{t("library.table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoading ? (
                <ContentSkeletonRows />
              ) : videos.length === 0 ? (
                <tr>
                  <td className="px-6 py-12 text-center font-body text-sm text-muted-foreground" colSpan={6}>
                    {t("library.empty")}
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
                          <div className="mt-1 flex flex-wrap items-center gap-1.5 font-body text-[10px] text-muted-foreground">
                            {video.category && (
                              <span className="rounded bg-muted/80 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-foreground">
                                {video.category}
                              </span>
                            )}
                            {video.durationSeconds !== null && (
                              <>
                                <span className="text-muted-foreground/50">•</span>
                                <span className="font-mono">{formatDuration(video.durationSeconds)}</span>
                              </>
                            )}
                            <span className="text-muted-foreground/50">•</span>
                            <span>{formatDate(video.updatedAt, locale, t("library.notPublished"))}</span>
                            <span className="text-muted-foreground/50">•</span>
                            <span>{t("library.metrics.views", { count: formatCompactNumber(video.viewCount, locale) })}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4" title={t("library.table.channelId", { id: video.channelId })}>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-muted-foreground/80" aria-hidden="true">
                          storefront
                        </span>
                        <span className="max-w-[150px] truncate font-headline text-sm font-semibold text-foreground/90">
                          {video.channelName || video.channel?.name || "Velvet Gallery"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-sm border border-secondary/30 px-2 py-0.5 font-label text-[10px] font-bold uppercase tracking-widest text-secondary">
                        {getVisibilityLabel(video.visibility, t)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-sm border border-border/30 bg-muted px-2 py-0.5 font-label text-[10px] font-bold text-foreground">{getAccessLabel(video, t)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1 font-label text-[10px] font-bold uppercase tracking-widest ${getStatusClass(video)}`}>
                        <span className="material-symbols-outlined text-[14px]" aria-hidden="true">{getStatusIcon(video)}</span>
                        {getStatusDisplayLabel(video, t)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(video.id)}
                        className="inline-flex rounded p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label={t("library.actions.viewDetailsAria", { title: video.title })}
                      >
                        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {pagination.totalPages > 1 ? (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-border/30 bg-muted/20 px-6 py-4 sm:flex-row">
            <div className="font-body text-xs text-muted-foreground">
              {t.rich("library.pagination.range", {
                from: (pagination.page - 1) * pagination.limit + 1,
                to: Math.min(pagination.page * pagination.limit, pagination.total),
                total: pagination.total,
                strong: (chunks) => <span className="font-bold text-foreground">{chunks}</span>,
              })}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="font-body text-xs text-muted-foreground">{t("library.pagination.rows")}</span>
                <select
                  value={pagination.limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="rounded border border-border/40 bg-background px-2 py-1 font-body text-xs text-foreground outline-none focus:border-primary"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded border border-border/40 bg-background text-foreground transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={t("library.pagination.previous")}
                >
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>

                {Array.from({ length: pagination.totalPages }).map((_, index) => {
                  const pageNumber = index + 1;
                  const shouldShow =
                    pageNumber === 1 ||
                    pageNumber === pagination.totalPages ||
                    Math.abs(pageNumber - pagination.page) <= 2;

                  if (!shouldShow) {
                    const showEllipsisBefore = pageNumber === 2 && pagination.page > 4;
                    const showEllipsisAfter =
                      pageNumber === pagination.totalPages - 1 &&
                      pagination.page < pagination.totalPages - 3;

                    if (showEllipsisBefore || showEllipsisAfter) {
                      return (
                        <span key={pageNumber} className="px-1 text-xs text-muted-foreground">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => handlePageChange(pageNumber)}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded text-xs font-bold transition-all ${
                        pagination.page === pageNumber
                          ? "bg-primary text-primary-foreground font-black"
                          : "border border-border/40 bg-background text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded border border-border/40 bg-background text-foreground transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={t("library.pagination.next")}
                >
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        ) : pagination.total > 0 ? (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-border/30 bg-muted/20 px-6 py-4 sm:flex-row">
            <div className="font-body text-xs text-muted-foreground">
              {t.rich("library.pagination.total", {
                total: pagination.total,
                strong: (chunks) => <span className="font-bold text-foreground">{chunks}</span>,
              })}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-body text-xs text-muted-foreground">{t("library.pagination.rows")}</span>
              <select
                value={pagination.limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="rounded border border-border/40 bg-background px-2 py-1 font-body text-xs text-foreground outline-none focus:border-primary"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        ) : null}
      </div>

      {/* Admin Video Detail Modal */}
      {selectedVideoId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={handleCloseDetail}
        >
          <div
            className="relative w-full max-w-3xl rounded-lg border border-border bg-card p-6 shadow-2xl overflow-y-auto max-h-[90vh] space-y-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between border-b border-border/30 pb-4">
              <h2 className="font-headline text-lg font-bold text-foreground">
                {t("library.detail.title")}
              </h2>
              <button
                type="button"
                onClick={handleCloseDetail}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label={t("library.actions.close")}
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </header>

            {isDetailLoading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">{t("library.detail.loading")}</p>
              </div>
            )}

            {detailError && (
              <div className="rounded border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive flex flex-col gap-2">
                <p>{detailError}</p>
                <button
                  type="button"
                  onClick={() => handleOpenDetail(selectedVideoId)}
                  className="self-start text-xs font-bold underline hover:no-underline"
                >
                  {t("library.actions.retry")}
                </button>
              </div>
            )}

            {selectedVideoDetail && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                  {/* Cột trái: Thumbnail & Badges */}
                  <div className="md:col-span-5 space-y-4">
                    <div className="relative aspect-video w-full overflow-hidden rounded-sm border border-border/30 bg-[radial-gradient(circle_at_30%_20%,rgba(229,9,20,0.15),transparent_35%)]">
                      <VideoThumbnail
                        src={getReadyThumbnailUrl(selectedVideoDetail)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {/* Status */}
                      <span className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 font-label text-[10px] font-bold uppercase tracking-widest ${getStatusClass(selectedVideoDetail)} bg-muted/40 border border-current/20`}>
                        <span className="material-symbols-outlined text-[12px]">{getStatusIcon(selectedVideoDetail)}</span>
                        {getStatusDisplayLabel(selectedVideoDetail, t)}
                      </span>

                      {/* Visibility */}
                      <span className="rounded-sm border border-secondary/30 bg-secondary/5 px-2 py-0.5 font-label text-[10px] font-bold uppercase tracking-widest text-secondary">
                        {formatLabel(selectedVideoDetail.visibility)}
                      </span>

                      {/* Access Label */}
                      <span className="rounded-sm border border-border/30 bg-muted px-2 py-0.5 font-label text-[10px] font-bold text-foreground">
                        {getAccessLabel(selectedVideoDetail, t)}
                      </span>
                    </div>

                    {/* Price if paid */}
                    {selectedVideoDetail.price > 0 && (
                      <div className="rounded border border-border/30 bg-muted/10 p-3 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{t("library.detail.price")}</span>
                        <span className="font-mono font-bold text-secondary flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">monetization_on</span>
                          {selectedVideoDetail.price} AC
                        </span>
                      </div>
                    )}

                    {/* Required Tier Level */}
                    {selectedVideoDetail.requiredTierLevel !== null && (
                      <div className="rounded border border-border/30 bg-muted/10 p-3 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{t("library.detail.requiredTier")}</span>
                        <span className="font-bold text-primary">
                          {t("library.access.tier", { level: selectedVideoDetail.requiredTierLevel })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Cột phải: Thông số chi tiết */}
                  <div className="md:col-span-7 space-y-4 font-body text-xs text-foreground">
                    <div>
                      <h3 className="font-headline text-lg font-bold text-foreground mb-1 leading-snug">
                        {selectedVideoDetail.title}
                      </h3>
                      <p className="font-mono text-[9px] text-muted-foreground select-all bg-muted/30 px-1.5 py-0.5 rounded inline-block">
                        ID: {selectedVideoDetail.id}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/20 pt-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("library.detail.ownerChannel")}</p>
                        <p className="mt-0.5 font-semibold text-foreground/90 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-muted-foreground">storefront</span>
                          {selectedVideoDetail.channelName || selectedVideoDetail.channel?.name || "Velvet Gallery"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("library.detail.category")}</p>
                        <p className="mt-0.5 font-semibold text-foreground/90">
                          {selectedVideoDetail.categoryTitle || selectedVideoDetail.category || t("library.detail.uncategorized")}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("library.detail.duration")}</p>
                        <p className="mt-0.5 font-mono">
                          {selectedVideoDetail.durationSeconds !== null ? formatDuration(selectedVideoDetail.durationSeconds) : "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("library.detail.views")}</p>
                        <p className="mt-0.5 font-semibold">
                          {t("library.metrics.views", { count: formatCompactNumber(selectedVideoDetail.viewCount, locale) })}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("library.detail.purchases")}</p>
                        <p className="mt-0.5 font-semibold text-secondary">
                          {t("library.metrics.purchases", { count: selectedVideoDetail.purchaseCount !== undefined ? formatCompactNumber(selectedVideoDetail.purchaseCount, locale) : "0" })}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("library.detail.resolutions")}</p>
                        <p className="mt-0.5 flex flex-wrap gap-1">
                          {selectedVideoDetail.resolutions && selectedVideoDetail.resolutions.length > 0 ? (
                            selectedVideoDetail.resolutions.map((res) => (
                              <span key={res} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground border border-border/20">
                                {res}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted-foreground italic">{t("library.detail.notProcessed")}</span>
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("library.detail.thumbnailSource")}</p>
                        <p className="mt-0.5 font-semibold capitalize text-foreground/80">
                          {selectedVideoDetail.thumbnailSource}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/20 pt-4 text-[11px]">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("library.detail.createdAt")}</p>
                        <p className="mt-0.5 text-muted-foreground">{formatDate(selectedVideoDetail.createdAt, locale, t("library.notPublished"))}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("library.detail.updatedAt")}</p>
                        <p className="mt-0.5 text-muted-foreground">{formatDate(selectedVideoDetail.updatedAt, locale, t("library.notPublished"))}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phần lỗi hệ thống nếu có */}
                {(selectedVideoDetail.status === "failed" || selectedVideoDetail.status === "rejected") && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-2">
                    <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-destructive">
                      <span className="material-symbols-outlined text-[16px]">report_problem</span>
                      {t("library.detail.systemError")}
                    </h4>
                    <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-2">
                      {selectedVideoDetail.failureReason && (
                        <div>
                          <span className="font-semibold text-muted-foreground">{t("library.detail.failureReason")}</span>{" "}
                          <span className="font-mono text-destructive">{selectedVideoDetail.failureReason}</span>
                        </div>
                      )}
                      {selectedVideoDetail.errorMessage && (
                        <div className="col-span-2">
                          <span className="font-semibold text-muted-foreground">{t("library.detail.errorMessage")}</span>{" "}
                          <span className="font-mono text-destructive">{selectedVideoDetail.errorMessage}</span>
                        </div>
                      )}
                      {selectedVideoDetail.jobStatus && (
                        <div>
                          <span className="font-semibold text-muted-foreground">{t("library.detail.jobStatus")}</span>{" "}
                          <span className="font-mono text-foreground/80 uppercase">{selectedVideoDetail.jobStatus}</span>
                        </div>
                      )}
                      {selectedVideoDetail.jobStatusMessage && (
                        <div className="col-span-2">
                          <span className="font-semibold text-muted-foreground">{t("library.detail.jobInfo")}</span>{" "}
                          <span className="font-mono text-foreground/70">{selectedVideoDetail.jobStatusMessage}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Mô tả */}
                {selectedVideoDetail.description && (
                  <div className="border-t border-border/20 pt-4 space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("library.detail.description")}</h4>
                    <p className="whitespace-pre-wrap rounded border border-border/20 bg-muted/20 p-3 font-body text-xs text-foreground/80 leading-relaxed max-h-36 overflow-y-auto">
                      {selectedVideoDetail.description}
                    </p>
                  </div>
                )}

                {/* Footer với các Actions */}
                <footer className="flex items-center justify-end gap-3 border-t border-border/30 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseDetail}
                    className="inline-flex h-9 items-center justify-center rounded border border-border/40 bg-muted/20 px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted/40 transition-colors"
                  >
                    {t("library.actions.close")}
                  </button>
                  {(selectedVideoDetail.status === "pending_moderation" || selectedVideoDetail.status === "pending_manual_review") && (
                    <Link
                      href={`/admin/content/${selectedVideoDetail.id}?mode=review`}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded bg-primary px-4 text-xs font-bold uppercase tracking-widest text-primary-foreground hover:opacity-90 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-[16px]">gavel</span>
                      {t("library.actions.reviewVideo")}
                    </Link>
                  )}
                </footer>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
