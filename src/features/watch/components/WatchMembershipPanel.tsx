import { Link } from "@/i18n/routing";
import type { PublicMembershipTier } from "../services/publicMediaService";

interface WatchMembershipPanelProps {
  channelId: string;
  tiers: PublicMembershipTier[];
}

function getTierLabel(level: number) {
  if (level === 1) return "Standard";
  if (level === 2) return "Premium";
  if (level === 3) return "Exclusive";
  return `Level ${level}`;
}

export function WatchMembershipPanel({ channelId, tiers }: WatchMembershipPanelProps) {
  const sortedTiers = [...tiers].sort((a, b) => a.level - b.level || a.priceCoin - b.priceCoin);

  if (sortedTiers.length === 0) {
    return (
      <div className="rounded-lg border border-border/20 bg-card p-6 text-sm text-muted-foreground">
        Kênh chưa mở gói membership. Bạn vẫn có thể theo dõi các video công khai của kênh.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/20 bg-card p-6 shadow-2xl md:p-8">
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Membership tiers</p>
          <h3 className="mt-2 font-headline text-2xl font-black tracking-tight text-foreground">
            Mở khóa nội dung của kênh
          </h3>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Giá hiển thị bằng Aura Coins. Chọn gói còn nhận thành viên mới để tiếp tục thanh toán.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {sortedTiers.map((tier) => {
          const isFeatured = tier.level === 2;
          return (
            <article
              key={tier.id}
              className={`flex min-h-64 flex-col rounded-lg border p-5 transition-all duration-300 ${
                isFeatured
                  ? "border-primary/50 bg-muted/50 shadow-[0_20px_60px_rgba(229,9,20,0.14)]"
                  : "border-border/20 bg-background/60 hover:border-primary/40"
              }`}
            >
              <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Level {tier.level}
                  </p>
                  <h4 className="mt-2 font-headline text-xl font-black text-foreground">{tier.name}</h4>
                  <p className="mt-1 text-xs font-bold uppercase tracking-widest text-primary">
                    {getTierLabel(tier.level)}
                  </p>
                </div>
                {isFeatured ? (
                  <span className="rounded-sm bg-primary px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-primary-foreground">
                    Popular
                  </span>
                ) : null}
              </div>

              <div className="mb-6 flex items-baseline gap-2">
                <span className="font-headline text-4xl font-black tracking-tight text-foreground">
                  {tier.priceCoin.toLocaleString()}
                </span>
                <span className="font-headline text-sm font-bold text-secondary">AC</span>
                <span className="text-sm text-muted-foreground">/ tháng</span>
              </div>

              <div className="mb-8 flex-grow space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-primary">check_circle</span>
                  <span>Truy cập nội dung cấp Lv{tier.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-primary">check_circle</span>
                  <span>Huy hiệu thành viên của kênh</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-secondary">toll</span>
                  <span>Thanh toán bằng Aura Coins</span>
                </div>
              </div>

              {tier.isAcceptingNew && channelId ? (
                <Link
                  href={`/creator/${channelId}/join?tier=${tier.id}`}
                  className="inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-4 py-3 text-xs font-black uppercase tracking-widest text-primary-foreground transition-all duration-300 hover:opacity-90 active:scale-95"
                >
                  Chọn gói
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex min-h-11 items-center justify-center rounded-sm bg-muted px-4 py-3 text-xs font-black uppercase tracking-widest text-muted-foreground"
                >
                  Tạm đóng
                </button>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
