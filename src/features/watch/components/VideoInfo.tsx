interface VideoInfoProps {
  title: string;
  viewCount: number;
  publishedAt: string | null;
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

export function VideoInfo({ title, viewCount, publishedAt }: VideoInfoProps) {
  return (
    <div className="mt-10 space-y-6">
      <div className="space-y-3">
        <h1 className="font-headline text-4xl font-extrabold tracking-tighter text-foreground md:text-5xl">
          {title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-muted-foreground">
          <span>{viewCount.toLocaleString()} lượt xem</span>
          <span aria-hidden="true">•</span>
          <span>{formatPublishedDate(publishedAt)}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-y border-border/20 py-5 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base">visibility</span>
          <span>Dữ liệu lấy từ media service</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base">verified</span>
          <span>Phát qua token bảo mật</span>
        </div>
      </div>
    </div>
  );
}
