import type { PublicChannelDetail } from "@/features/watch/services/publicMediaService";

interface CreatorHeroProps {
  channel: PublicChannelDetail;
}

function getInitials(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return "VG";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

export function CreatorHero({ channel }: CreatorHeroProps) {
  const subscriberCount = channel.subscriberCount ?? 0;
  const totalVideos = channel.videoCount ?? channel.publicVideos.length;

  return (
    <section className="relative mb-16 h-[360px] w-full overflow-hidden rounded-lg border border-border/20 bg-card shadow-2xl md:h-[400px]">
      {channel.bannerUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="h-full w-full object-cover"
          src={channel.bannerUrl}
          alt={`${channel.name} banner`}
        />
      ) : (
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--primary) 34%, transparent), transparent 34%), radial-gradient(circle at 82% 12%, color-mix(in srgb, var(--secondary) 18%, transparent), transparent 30%), linear-gradient(135deg, var(--card), var(--background))",
          }}
        />
      )}

      <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-background/50 to-transparent" />

      <div className="absolute bottom-0 left-0 z-20 flex flex-col gap-6 p-6 md:flex-row md:items-end md:gap-8 md:p-10">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border-4 border-background bg-muted text-xl font-black text-foreground shadow-2xl md:h-32 md:w-32">
          {channel.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="h-full w-full object-cover"
              src={channel.avatarUrl}
              alt={`${channel.name} avatar`}
            />
          ) : (
            <span>{getInitials(channel.name)}</span>
          )}
        </div>

        <div className="pb-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-headline text-4xl font-black uppercase italic tracking-tighter text-foreground md:text-5xl">
              {channel.name}
            </h1>
            <span
              aria-label="Kênh đã xác minh"
              className="material-symbols-outlined text-secondary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
          </div>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm font-medium tracking-wide text-muted-foreground">
            <span>{subscriberCount.toLocaleString()} hội viên</span>
            <span className="h-1.5 w-1.5 rounded-full bg-border" aria-hidden="true" />
            <span>{totalVideos.toLocaleString()} video công khai</span>
            {channel.isMembershipClosedByAdmin ? (
              <span className="rounded-sm border border-destructive/40 bg-destructive/10 px-2 py-1 text-xs font-black uppercase tracking-widest text-destructive">
                Membership đóng
              </span>
            ) : null}
          </p>
        </div>
      </div>
    </section>
  );
}
