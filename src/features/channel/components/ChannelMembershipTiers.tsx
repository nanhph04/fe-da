import Link from "next/link";
import type { PublicChannelDetail } from "@/features/watch/services/publicMediaService";

interface ChannelMembershipTiersProps {
  channel: PublicChannelDetail;
}

function getBlockedMessage(channel: PublicChannelDetail) {
  if (channel.isMembershipClosedByAdmin) {
    return "Admin đang đóng khả năng nhận hội viên mới của kênh này.";
  }

  if (!channel.isEligibleForMembership) {
    return "Kênh chưa đủ điều kiện mở membership.";
  }

  return null;
}

export function ChannelMembershipTiers({ channel }: ChannelMembershipTiersProps) {
  const blockedMessage = getBlockedMessage(channel);
  const tiers = [...channel.membershipTiers].sort((a, b) => a.level - b.level || a.priceCoin - b.priceCoin);

  return (
    <aside className="h-fit rounded-lg border border-border/20 bg-card p-6 shadow-2xl">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Membership</p>
      <h2 className="mt-2 font-headline text-2xl font-black tracking-tight text-foreground">
        Gói hội viên
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Dùng Aura Coins để mở khóa nội dung và ủng hộ trực tiếp kênh.
      </p>

      {blockedMessage ? (
        <div className="mt-6 rounded-lg border border-border/20 bg-muted/40 p-4 text-sm text-muted-foreground">
          {blockedMessage}
        </div>
      ) : null}

      {tiers.length === 0 ? (
        <div className="mt-6 rounded-lg border border-border/20 bg-muted/40 p-4 text-sm text-muted-foreground">
          Kênh chưa có gói membership đang mở.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {tiers.map((tier) => {
            const canJoin = !blockedMessage && tier.isAcceptingNew;
            return (
              <article key={tier.id} className="rounded-lg border border-border/20 bg-background/60 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      Level {tier.level}
                    </p>
                    <h3 className="mt-1 font-headline text-lg font-black text-foreground">{tier.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="font-headline text-2xl font-black text-foreground">{tier.priceCoin.toLocaleString()}</p>
                    <p className="text-xs font-bold text-secondary">AC / tháng</p>
                  </div>
                </div>

                {canJoin ? (
                  <Link
                    href={`/creator/${channel.id}/join?tier=${tier.id}`}
                    className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-sm bg-primary px-4 py-3 text-xs font-black uppercase tracking-widest text-primary-foreground transition-all duration-300 hover:opacity-90 active:scale-95"
                  >
                    Chọn gói
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-sm bg-muted px-4 py-3 text-xs font-black uppercase tracking-widest text-muted-foreground"
                  >
                    Tạm đóng
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </aside>
  );
}
