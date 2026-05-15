interface VideoInfoProps {
  title: string;
  viewCount: number;
  publishedAt: string | null;
  category?: string;
  tags?: string[];
}

function formatPublishedDate(value: string | null) {
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

export function VideoInfo({ title, viewCount, publishedAt, category, tags = [] }: VideoInfoProps) {
  const badges = [category, ...tags].filter(Boolean).slice(0, 3);

  return (
    <section className="mt-10 space-y-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
        <div className="space-y-3">
          <h1 className="max-w-5xl text-balance font-headline text-4xl font-extrabold tracking-tighter text-foreground md:text-5xl">
            {title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-muted-foreground md:gap-6">
            <span>{viewCount.toLocaleString()} lượt xem</span>
            <span aria-hidden="true">•</span>
            <span>{formatPublishedDate(publishedAt)}</span>
            {badges.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {badges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-md border border-border/40 bg-muted/40 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-300"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
