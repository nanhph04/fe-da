import Link from "next/link";
import { Film, Upload } from "lucide-react";
import type { OwnerVideoResponse } from "@/features/watch/services/mediaService";
import { formatDuration, formatProfileDate } from "../utils/profile-formatters";

interface ProfileCreatorVideosProps {
  videos: OwnerVideoResponse[];
  error?: string;
}

export function ProfileCreatorVideos({ videos, error }: ProfileCreatorVideosProps) {
  if (error) {
    return <div className="rounded-lg border border-destructive/30 bg-card p-6 text-sm text-destructive">{error}</div>;
  }

  if (videos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/30 bg-card p-10 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-sm bg-muted text-muted-foreground">
          <Film className="h-6 w-6" />
        </div>
        <h3 className="font-headline text-xl font-bold text-foreground">Chưa có video trong Studio</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Khi bạn đăng tải video, các nội dung mới nhất sẽ xuất hiện trong tab này.
        </p>
        <Link
          href="/studio/upload"
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-primary px-5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Upload className="h-4 w-4" />
          Tải video lên
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {videos.map(video => (
        <Link
          key={video.id}
          href={`/studio/content`}
          className="group overflow-hidden rounded-lg border border-border/20 bg-card shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40"
        >
          <div className="relative aspect-video bg-muted">
            {video.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <Film className="h-10 w-10" />
              </div>
            )}
            <div className="absolute bottom-2 right-2 rounded-sm bg-black/70 px-2 py-1 text-xs font-mono font-bold text-white">
              {formatDuration(video.durationSeconds)}
            </div>
            <div className="absolute left-2 top-2 rounded-sm bg-background/80 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-foreground">
              {video.status}
            </div>
          </div>
          <div className="p-4">
            <h3 className="line-clamp-1 font-headline font-bold text-foreground transition-colors group-hover:text-primary">{video.title}</h3>
            <p className="mt-2 text-xs text-muted-foreground">
              {formatProfileDate(video.publishedAt || video.createdAt)} - {(video.viewCount || 0).toLocaleString("vi-VN")} views
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
