"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  mediaService,
  type PurchasedVideoResponse,
} from "@/features/watch/services/mediaService";

function formatDuration(seconds: number | null) {
  if (!seconds || seconds <= 0) {
    return "Chưa rõ thời lượng";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.ceil((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Không rõ ngày mua";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function PurchasedLibrary() {
  const [items, setItems] = useState<PurchasedVideoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPurchasedVideos() {
      try {
        setError(null);
        const response = await mediaService.getPurchasedVideos({ page: 1, limit: 6 });
        if (isMounted && response.success && response.data) {
          setItems(response.data);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load purchased videos", err);
          setError("Không thể tải thư viện đã mua.");
          setItems([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadPurchasedVideos();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section>
      <div className="mb-8 flex items-end justify-between">
        <h2 className="font-headline text-3xl font-bold text-foreground">Thư viện đã mua</h2>
      </div>

      {isLoading ? (
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

      {!isLoading && error ? (
        <div className="rounded-lg border border-border/20 bg-card p-6 text-sm text-muted-foreground">
          {error}
        </div>
      ) : null}

      {!isLoading && !error && items.length === 0 ? (
        <div className="rounded-lg border border-border/20 bg-card p-6 text-sm text-muted-foreground">
          Chưa có dữ liệu.
        </div>
      ) : null}

      {!isLoading && !error && items.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((item, index) => {
            const isFeatured = index === 0;
            return (
              <Link
                key={item.videoId}
                href={`/watch/${item.videoId}`}
                className={
                  isFeatured
                    ? "group relative h-80 overflow-hidden rounded-lg md:col-span-2"
                    : "group overflow-hidden rounded-lg border border-border/20 bg-card transition-colors hover:border-primary/40"
                }
              >
                <div className={isFeatured ? "absolute inset-0" : "relative h-48 overflow-hidden"}>
                  {item.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={item.title}
                      src={item.thumbnailUrl}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                      <span className="material-symbols-outlined text-5xl">movie</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute left-3 top-3 rounded-sm bg-secondary px-2 py-1 text-[10px] font-black uppercase tracking-widest text-secondary-foreground">
                    Đã mua
                  </div>
                </div>

                <div className={isFeatured ? "absolute bottom-8 left-8 max-w-xl space-y-2 pr-8" : "space-y-2 p-5"}>
                  <h3 className={isFeatured ? "font-headline text-4xl font-black tracking-tighter text-foreground" : "font-headline text-lg font-bold text-foreground"}>
                    {item.title}
                  </h3>
                  <p className="line-clamp-2 text-sm text-zinc-300">
                    {item.description || item.channelName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.channelName} • {formatDuration(item.durationSeconds)} • Mua ngày {formatDate(item.purchasedAt)}
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
