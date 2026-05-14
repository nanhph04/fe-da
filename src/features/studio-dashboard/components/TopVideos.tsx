import type { DashboardTopVideo } from "../types/studio-dashboard.types";

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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  src={video.thumbnailUrl}
                  alt={video.title}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="truncate font-headline text-sm font-bold text-foreground">{video.title}</h4>
                <div className="mt-2 flex flex-wrap gap-4">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="material-symbols-outlined text-xs">visibility</span> {video.views}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="material-symbols-outlined text-xs">favorite</span> {video.likes}
                  </div>
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
