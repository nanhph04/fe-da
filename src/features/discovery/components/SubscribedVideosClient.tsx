"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { useAuth } from "@/features/auth/context/AuthContext";
import { VideoSkeleton } from "@/components/ui/VideoSkeleton";
import { VideoThumbnail } from "@/shared/components/VideoThumbnail";
import {
  getReadyPublicVideoThumbnailUrl,
  mediaService,
  type DiscoveryVideoResponse,
} from "@/features/watch/services/mediaService";

function getPrimaryResolution(resolutions: string[]) {
  return (
    [...resolutions].sort(
      (left, right) => parseInt(right, 10) - parseInt(left, 10)
    )[0] || "HD"
  );
}

export function SubscribedVideosClient() {
  const [subscribedVideos, setSubscribedVideos] = useState<
    DiscoveryVideoResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchSubscribed() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const subscribedRes = await mediaService.getSubscribedVideos({
          limit: 10,
        });
        if (subscribedRes.success && subscribedRes.data) {
          setSubscribedVideos(subscribedRes.data);
        }
      } catch (err) {
        console.error("Failed to load subscribed videos", err);
      }

      setLoading(false);
    }

    void fetchSubscribed();
  }, [user]);

  if (!user) {
    return (
      <p className="text-muted-foreground">
        Please log in to see videos from your subscriptions.
      </p>
    );
  }

  if (loading) {
    return <VideoSkeleton />;
  }

  if (subscribedVideos.length === 0) {
    return (
      <p className="text-muted-foreground">
        Subscribe to channels to see their latest videos here.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {subscribedVideos.map((video) => (
        <Link
          href={`/watch/${video.id}`}
          key={video.id}
          className="group flex cursor-pointer flex-col gap-3"
        >
          <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-card transition-colors duration-300 ease-in-out group-hover:border-primary/50">
            <VideoThumbnail
              src={getReadyPublicVideoThumbnailUrl(video.id, video.thumbnailUrl, video.thumbnailStatus)}
              alt={video.title}
              className="h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-transparent" />
            <div className="absolute bottom-2 right-2 rounded-sm bg-black/80 px-2 py-1 text-[10px] font-bold text-foreground">
              {getPrimaryResolution(video.resolutions)}
            </div>
          </div>
          <div>
            <h3 className="line-clamp-2 leading-snug text-foreground transition-colors duration-300 group-hover:text-primary font-headline font-bold">
              {video.title}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {video.category || "Uncategorized"}
            </p>
            <div className="mt-1.5 flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
              <span>{video.viewCount.toLocaleString()} views</span>
              <span>•</span>
              <span>{new Date(video.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
