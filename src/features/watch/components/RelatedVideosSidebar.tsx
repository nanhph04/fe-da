import Link from "next/link";
import {
  getLatestVideosCached,
  type PublicDiscoveryVideo,
} from "../services/publicMediaService";

interface RelatedVideosSidebarProps {
  currentVideoId: string;
}

function formatViews(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M lượt xem`;
  }

  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}K lượt xem`;
  }

  return `${value.toLocaleString()} lượt xem`;
}

function formatDuration(seconds: number | null) {
  if (!seconds || seconds <= 0) {
    return "--:--";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function getChannelName(video: PublicDiscoveryVideo) {
  return video.channel?.name || "Velvet Gallery";
}

export async function RelatedVideosSidebar({ currentVideoId }: RelatedVideosSidebarProps) {
  const response = await getLatestVideosCached(8);
  const videos = (response.data || []).filter((video) => video.id !== currentVideoId).slice(0, 6);

  return (
    <aside className="space-y-8 xl:w-1/3">
      <div className="rounded-lg border border-border/20 bg-card p-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-secondary/20 bg-secondary/10">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>movie</span>
          </div>
          <div>
            <p className="font-headline text-lg font-black text-foreground">Video liên quan</p>
            <p className="text-xs text-muted-foreground">Dữ liệu mới nhất từ media service</p>
          </div>
        </div>
      </div>

      {!response.success ? (
        <div className="rounded-lg border border-border/20 bg-card p-6 text-sm text-muted-foreground">
          Không thể tải video liên quan.
        </div>
      ) : null}

      {response.success && videos.length === 0 ? (
        <div className="rounded-lg border border-border/20 bg-card p-6 text-sm text-muted-foreground">
          Chưa có dữ liệu.
        </div>
      ) : null}

      <div className="space-y-6">
        {videos.map((video) => (
          <Link key={video.id} href={`/watch/${video.id}`} className="group flex gap-4">
            <div className="relative h-24 w-44 flex-shrink-0 overflow-hidden rounded-lg border border-border/20 bg-muted">
              {video.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  src={video.thumbnailUrl}
                  alt={video.title}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <span className="material-symbols-outlined text-4xl">movie</span>
                </div>
              )}
              <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-black uppercase text-foreground">
                {formatDuration(video.durationSeconds)}
              </span>
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <h4 className="line-clamp-2 text-sm font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                {video.title}
              </h4>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{getChannelName(video)}</p>
              <p className="text-[11px] font-bold text-muted-foreground/50">{formatViews(video.viewCount)}</p>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
