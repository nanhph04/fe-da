"use client";

import { Link } from "@/i18n/routing";
import { VideoThumbnail } from "@/shared/components/VideoThumbnail";
import { useEffect, useState } from "react";
import {
  mediaService,
  type PurchasedVideoResponse,
} from "@/features/watch/services/mediaService";
import { createAsyncState, isAsyncError, isAsyncLoading, isAsyncSuccess } from "@/shared/api/async-state";
import { getErrorMessage } from "@/shared/api/client";
import type { ApiPagination } from "@/shared/api/types";
import { useTranslations, useLocale } from "next-intl";

type TFunction = ReturnType<typeof useTranslations>;

function formatDuration(seconds: number | null, t: TFunction) {
  if (!seconds || seconds <= 0) {
    return t("unknownDuration");
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.ceil((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function formatDate(value: string, locale: string, t: TFunction) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return t("unknownPurchaseDate");
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

interface PurchasedLibraryProps {
  refreshKey?: number;
}

export function PurchasedLibrary({ refreshKey = 0 }: PurchasedLibraryProps) {
  const t = useTranslations("LibraryPage");
  const locale = useLocale();
  const [state, setState] = useState(() =>
    createAsyncState<PurchasedVideoResponse[]>([])
  );
  const [pagination, setPagination] = useState<ApiPagination | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPurchasedVideos() {
      try {
        setState((current) => ({ ...current, status: "loading", error: null }));
        const response = await mediaService.getPurchasedVideos({ page: 1, limit: 6 });
        if (!isMounted) {
          return;
        }

        if (!response.success) {
          setPagination(null);
          setState({
            status: "error",
            data: [],
            error: response.message || t("loadPurchasedFailed"),
          });
          return;
        }

        setPagination(response.pagination ?? null);
        setState({ status: "success", data: response.data ?? [], error: null });
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load purchased videos", err);
          setPagination(null);
          setState({
            status: "error",
            data: [],
            error: getErrorMessage(err, t("loadPurchasedFailed")),
          });
        }
      }
    }

    void loadPurchasedVideos();

    return () => {
      isMounted = false;
    };
  }, [refreshKey, t]);

  const items = state.data;

  return (
    <section>
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 className="font-headline text-3xl font-bold text-foreground">{t("purchasedLibraryTitle")}</h2>
        {pagination && pagination.total > items.length ? (
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {t("showingVideos", { count: items.length, total: pagination.total })}
          </p>
        ) : null}
      </div>

      {isAsyncLoading(state) ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-lg border border-border/20 bg-card">
              <div className="h-48 animate-pulse bg-muted" />
              <div className="space-y-3 p-5">
                <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {isAsyncError(state) ? (
        <div className="rounded-lg border border-destructive/30 bg-card p-6 text-sm text-muted-foreground">
          {state.error}
        </div>
      ) : null}

      {isAsyncSuccess(state) && items.length === 0 ? (
        <div className="rounded-lg border border-border/20 bg-card p-6 text-sm text-muted-foreground">
          {t("noPurchasedVideos")}
        </div>
      ) : null}

      {isAsyncSuccess(state) && items.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((item, index) => {
            const videoId = item.videoId;
            const primaryCategory = item.categories[0] || t("uncategorized");
            const isFeatured = index === 0;
            const itemKey = `${videoId}-${item.purchasedAt}-${index}`;

            return (
              <Link
                key={itemKey}
                href={`/watch/${videoId}`}
                className={
                  isFeatured
                    ? "group relative h-80 overflow-hidden rounded-lg md:col-span-2"
                    : "group overflow-hidden rounded-lg border border-border/20 bg-card transition-colors hover:border-primary/40"
                }
              >
                <div className={isFeatured ? "absolute inset-0" : "relative h-48 overflow-hidden"}>
                  <VideoThumbnail
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute left-3 top-3 rounded-sm bg-secondary px-2 py-1 text-[10px] font-black uppercase tracking-widest text-secondary-foreground">
                    {t("purchasedBadge")}
                  </div>
                </div>

                <div className={isFeatured ? "absolute bottom-8 left-8 max-w-xl space-y-2 pr-8" : "space-y-2 p-5"}>
                  <h3 className={isFeatured ? "font-headline text-4xl font-black tracking-tighter text-foreground" : "font-headline text-lg font-bold text-foreground"}>
                    {item.title}
                  </h3>
                  <p className="line-clamp-2 text-sm text-foreground/80">
                    {item.description || item.channelName || t("purchasedVideos")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {primaryCategory} • {formatDuration(item.durationSeconds, t)} • {t("purchasedOn", { date: formatDate(item.purchasedAt, locale, t) })}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
