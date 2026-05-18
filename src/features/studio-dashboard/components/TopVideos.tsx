"use client";

import { useEffect, useState } from "react";
import { getLocalAccessToken, refreshAccessToken, setLocalAccessToken } from "@/shared/api/client";
import type { DashboardTopVideo } from "../types/studio-dashboard.types";

const FALLBACK_THUMBNAIL = "/images/thumbnail.png";

interface TopVideosProps {
  videos: DashboardTopVideo[];
  isLoading?: boolean;
}

function getBadgeClass(tone: DashboardTopVideo["badgeTone"]) {
  if (tone === "secondary") {
    return "bg-secondary/10 text-secondary";
  }

  if (tone === "primary") {
    return "bg-primary/10 text-primary";
  }

  return "bg-muted text-muted-foreground";
}

function isOwnerThumbnailUrl(url: string) {
  return url.startsWith("/api/media/videos/me/");
}

interface StudioThumbnailProps {
  alt: string;
  src: string;
}

function StudioThumbnail({ alt, src }: StudioThumbnailProps) {
  const [resolvedSrc, setResolvedSrc] = useState(src || FALLBACK_THUMBNAIL);

  useEffect(() => {
    if (!src || !isOwnerThumbnailUrl(src)) {
      setResolvedSrc(src || FALLBACK_THUMBNAIL);
      return;
    }

    const controller = new AbortController();
    let objectUrl: string | null = null;

    const fetchThumbnail = (token: string) => fetch(src, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      signal: controller.signal,
    });

    const loadPrivateThumbnail = async () => {
      try {
        let token = getLocalAccessToken();

        if (!token) {
          token = await refreshAccessToken();
          setLocalAccessToken(token);
        }

        let response = await fetchThumbnail(token);

        if (response.status === 401) {
          token = await refreshAccessToken();
          setLocalAccessToken(token);
          response = await fetchThumbnail(token);
        }

        if (!response.ok) {
          throw new Error(`Thumbnail request failed with status ${response.status}`);
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setResolvedSrc(objectUrl);
      } catch {
        if (!controller.signal.aborted) {
          setResolvedSrc(FALLBACK_THUMBNAIL);
        }
      }
    };

    void loadPrivateThumbnail();

    return () => {
      controller.abort();
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      src={resolvedSrc}
      alt={alt}
      onError={event => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = FALLBACK_THUMBNAIL;
      }}
    />
  );
}

export function TopVideos({ videos, isLoading = false }: TopVideosProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-headline text-2xl font-extrabold tracking-tight text-foreground">Top Performing Videos</h2>
        <span className="text-sm font-bold text-muted-foreground">Live Studio data</span>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-6 rounded-sm border border-border/30 bg-card p-4">
              <div className="aspect-video w-32 shrink-0 rounded-sm bg-muted" />
              <div className="flex-1">
                <div className="h-4 w-56 rounded bg-muted" />
                <div className="mt-3 h-3 w-36 rounded bg-muted" />
              </div>
            </div>
          ))
        ) : videos.length > 0 ? (
          videos.map(video => (
            <div key={video.id} className="group flex items-center gap-6 rounded-sm border border-border/30 bg-card p-4 transition-colors hover:bg-muted/40">
              <div className="aspect-video w-32 shrink-0 overflow-hidden rounded-sm bg-background">
                <StudioThumbnail src={video.thumbnailUrl} alt={video.title} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="truncate font-headline text-sm font-bold text-foreground">{video.title}</h4>
                <div className="mt-2 flex flex-wrap gap-4">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="material-symbols-outlined text-xs">visibility</span> {video.views}
                  </div>
                  {/* <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="material-symbols-outlined text-xs">favorite</span> {video.likes}
                  </div> */}
                  <div className="flex items-center gap-1 text-[10px] font-bold text-secondary">
                    <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span> {video.earnings}
                  </div>
                </div>
              </div>
              <div className="hidden text-right sm:block">
                <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-tighter ${getBadgeClass(video.badgeTone)}`}>
                  {video.badgeLabel}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-sm border border-dashed border-border/40 bg-card p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-muted-foreground">video_library</span>
            <p className="mt-3 font-headline text-sm font-bold text-foreground">No videos yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Upload and publish videos to see top performers here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
