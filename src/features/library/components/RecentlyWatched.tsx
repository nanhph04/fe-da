"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  mediaService,
  type ContinueWatchingVideoResponse,
} from "@/features/watch/services/mediaService";
import { createAsyncState, isAsyncError, isAsyncLoading, isAsyncSuccess } from "@/shared/api/async-state";
import { getErrorMessage } from "@/shared/api/client";

function formatRemainingTime(value: number | null) {
  if (value === null || value <= 0) {
    return "Sắp xem xong";
  }

  const hours = Math.floor(value / 3600);
  const minutes = Math.ceil((value % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m còn lại`;
  }

  return `${minutes}m còn lại`;
}

interface RecentlyWatchedProps {
  refreshKey?: number;
}

export function RecentlyWatched({ refreshKey = 0 }: RecentlyWatchedProps) {
  const { user } = useAuth();
  const [state, setState] = useState(() =>
    createAsyncState<ContinueWatchingVideoResponse[]>([])
  );

  useEffect(() => {
    let isMounted = true;

    async function loadContinueWatching() {
      setState((current) => ({ ...current, status: "loading", error: null }));

      if (!user) {
        setState({ status: "success", data: [], error: null });
        return;
      }

      try {
        const res = await mediaService.getContinueWatching({ limit: 10 });
        if (isMounted && res.success && res.data) {
          setState({ status: "success", data: res.data, error: null });
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to load continue-watching videos", error);
          setState({
            status: "error",
            data: [],
            error: getErrorMessage(error, "Không thể tải danh sách xem tiếp."),
          });
        }
      }
    }

    void loadContinueWatching();

    return () => {
      isMounted = false;
    };
  }, [user, refreshKey]);

  const items = state.data;

  return (
    <section>
      <div className="mb-8 flex items-end justify-between">
        <h2 className="text-3xl font-headline font-bold text-foreground">
          Xem tiếp
        </h2>
      </div>

      {isAsyncLoading(state) ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="min-w-[320px]">
              <div className="mb-3 aspect-video animate-pulse rounded-lg bg-muted" />
              <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-muted" />
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
          Chưa có dữ liệu.
        </div>
      ) : null}

      {isAsyncSuccess(state) && items.length > 0 ? (
        <div className="hide-scrollbar flex gap-6 overflow-x-auto pb-4 snap-x">
        {items.map((item) => {
          const progress =
            item.durationSeconds && item.durationSeconds > 0
              ? Math.min(
                  100,
                  Math.round(
                    (item.resumePositionSeconds / item.durationSeconds) * 100
                  )
                )
              : 0;

          return (
            <Link
              href={`/watch/${item.videoId}`}
              key={item.videoId}
              className="group min-w-[320px] cursor-pointer snap-start"
            >
              <div className="relative mb-3 aspect-video overflow-hidden rounded-lg bg-background">
                {item.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={item.title}
                    src={item.thumbnailUrl}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                    <span className="material-symbols-outlined text-5xl">movie</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                <div className="absolute bottom-0 left-0 h-1.5 w-full bg-muted">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                    <span
                      className="material-symbols-outlined fill-current text-3xl text-foreground"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      play_arrow
                    </span>
                  </div>
                </div>
              </div>

              <h3 className="font-headline text-lg font-bold transition-colors group-hover:text-primary">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {formatRemainingTime(item.remainingSeconds)} •{" "}
                {item.viewCount.toLocaleString()} lượt xem
              </p>
            </Link>
          );
        })}
        </div>
      ) : null}
    </section>
  );
}
