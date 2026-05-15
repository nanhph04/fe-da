import Link from "next/link";
import type { PublicChannelVideo } from "@/features/watch/services/publicMediaService";

interface ChannelVideoGridProps {
  videos: PublicChannelVideo[];
  channelName: string;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Chưa xuất bản";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Chưa rõ ngày đăng";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function ChannelVideoGrid({ videos, channelName }: ChannelVideoGridProps) {
  return (
    <section>
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Channel library</p>
          <h2 className="mt-2 font-headline text-3xl font-black tracking-tight text-foreground">
            Video công khai
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">Nội dung đang phát hành bởi {channelName}.</p>
      </div>

      {videos.length === 0 ? (
        <div className="rounded-lg border border-border/20 bg-card p-10 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-sm border border-secondary/20 bg-secondary/10">
            <span className="material-symbols-outlined text-secondary">movie</span>
          </div>
          <h3 className="font-headline text-xl font-bold text-foreground">Chưa có video công khai</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Khi kênh xuất bản video mới, nội dung sẽ xuất hiện tại đây.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => (
            <Link
              key={video.id}
              href={`/watch/${video.id}`}
              className="group overflow-hidden rounded-lg border border-border/20 bg-card transition-all duration-300 hover:border-primary/40 hover:-translate-y-0.5"
            >
              <div className="relative aspect-video overflow-hidden bg-muted">
                {video.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <span className="material-symbols-outlined text-5xl">movie</span>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <span className="rounded-sm bg-black/70 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                    {video.category}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="line-clamp-2 font-headline text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                  {video.title}
                </h3>
                <p className="mt-2 text-xs font-bold text-muted-foreground">{formatDate(video.publishedAt)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
