"use client";

import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { getErrorMessage } from "@/shared/api/client";
import { adminContentService } from "../services/adminContentService";
import type { AdminVideoItem } from "../types/admin-content.types";
import { VideoThumbnail } from "@/shared/components/VideoThumbnail";
import { formatDuration } from "@/features/home/utils/format";

const initialPagination = { page: 1, limit: 10, total: 0, totalPages: 0 };

function getIntlLocale(locale: string) {
  return locale === "en" ? "en-US" : "vi-VN";
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatCompactNumber(value: number, locale: string) {
  return new Intl.NumberFormat(getIntlLocale(locale), { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function ContentReviewQueueFeature() {
  const t = useTranslations("Admin.content.reviewQueue");
  const locale = useLocale();
  const [videos, setVideos] = useState<AdminVideoItem[]>([]);
  const [pagination, setPagination] = useState(initialPagination);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadVideos = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await adminContentService.getVideos({
          status: "pending_manual_review",
          page: 1,
          limit: 10,
        });

        if (!cancelled) {
          setVideos(data.items);
          setPagination(data.pagination);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, t("errors.loadFailed")));
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
  }, [t]);

  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-border/30 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">{t("header.eyebrow")}</p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">{t("header.title")}</h1>
          <p className="mt-2 flex items-center gap-2 font-body text-sm text-muted-foreground">
            <span className="material-symbols-outlined text-base text-primary" aria-hidden="true">warning</span>
            {isLoading ? t("header.loading") : t("header.summary", { count: pagination.total })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/content"
            className="inline-flex items-center gap-2 rounded-sm border border-border/40 bg-muted/30 px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:bg-muted/60"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_back</span>
            {t("actions.backToContent")}
          </Link>
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
                <th className="px-6 py-4">{t("table.flaggedMedia")}</th>
                <th className="px-6 py-4">Kênh</th>
                <th className="px-6 py-4">{t("table.reason")}</th>
                <th className="px-6 py-4">Thể loại</th>
                <th className="px-6 py-4">Ngày yêu cầu</th>
                <th className="px-6 py-4 text-right">{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4" colSpan={6}>
                      <div className="h-12 rounded-sm bg-muted/60" />
                    </td>
                  </tr>
                ))
              ) : videos.length === 0 ? (
                <tr>
                  <td className="px-6 py-12 text-center font-body text-sm text-muted-foreground" colSpan={6}>
                    Không có video nào đang chờ duyệt thủ công.
                  </td>
                </tr>
              ) : (
                videos.map((video) => {
                  const moderationDetails = video.moderationDetails;
                  const label = (moderationDetails?.label as string) || null;
                  const reason = (moderationDetails?.reason as string) || video.errorMessage || "Cần duyệt thủ công";

                  return (
                    <tr key={video.id} className="group transition-colors hover:bg-muted/40">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative h-14 w-24 overflow-hidden rounded-sm border border-border/30 bg-[radial-gradient(circle_at_30%_20%,rgba(229,9,20,0.22),transparent_35%),linear-gradient(135deg,rgba(31,31,34,0.95),rgba(14,14,16,1))]">
                            <VideoThumbnail
                              src={video.thumbnailUrl || null}
                              alt=""
                              className="absolute inset-0 h-full w-full object-cover opacity-85 transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          <div>
                            <p className="max-w-[200px] truncate font-headline text-sm font-bold text-foreground">{video.title}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5 font-body text-[10px] text-muted-foreground">
                              {video.durationSeconds !== null && (
                                <span className="font-mono">{formatDuration(video.durationSeconds)}</span>
                              )}
                              <span className="text-muted-foreground/50">•</span>
                              <span>{formatCompactNumber(video.viewCount, locale)} lượt xem</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-foreground/80">
                        {video.channelName || video.channel?.name || "Velvet Gallery"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          {label && (
                            <span className="w-fit rounded bg-primary/10 border border-primary/20 px-1 py-0.25 text-[9px] font-extrabold uppercase tracking-wider text-primary">
                              {label}
                            </span>
                          )}
                          <span className="text-xs text-foreground/90 max-w-[220px] truncate block" title={reason}>{reason}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-label text-[10px] font-bold uppercase tracking-widest text-secondary">{video.categoryTitle || video.category || "N/A"}</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        {formatDate(video.createdAt, locale)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/admin/content/${video.id}?mode=review`} className="inline-flex rounded-sm bg-primary px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90">
                          {t("actions.review")}
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
