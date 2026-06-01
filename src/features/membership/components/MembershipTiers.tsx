"use client";

import type { PublicMembershipTier } from "@/features/watch/services/publicMedia.types";

interface MembershipTiersProps {
  tiers: PublicMembershipTier[];
  selectedTierId: string | null;
  blockedMessage?: string | null;
  onSelectTier: (tier: PublicMembershipTier) => void;
  onCheckout: (tier: PublicMembershipTier) => void;
}

function getTierLabel(level: number) {
  if (level === 1) return "Standard";
  if (level === 2) return "Premium";
  if (level === 3) return "Exclusive";
  return `Level ${level}`;
}

function getTierBenefits(level: number) {
  if (level === 1) {
    return ["Huy hiệu hội viên độc quyền", "Bình luận nổi bật trong cộng đồng", "Nội dung community chỉ dành cho member"];
  }

  if (level === 2) {
    return ["Toàn bộ quyền lợi Level 1", "Mở khóa video sớm", "Behind the scenes và ưu tiên phản hồi"];
  }

  return ["Toàn bộ quyền lợi tier thấp hơn", "Nội dung cấp cao nhất của kênh", "Ưu đãi và badge thành viên đặc biệt"];
}

export function MembershipTiers({
  tiers,
  selectedTierId,
  blockedMessage,
  onSelectTier,
  onCheckout,
}: MembershipTiersProps) {
  const sortedTiers = [...tiers].sort((a, b) => a.level - b.level || a.priceCoin - b.priceCoin);

  return (
    <div className="mb-24">
      <div className="mb-12">
        <h2 className="mb-2 font-headline text-3xl font-bold text-foreground">Join The Velvet Gallery</h2>
        <p className="max-w-2xl text-muted-foreground">
          Chọn gói hội viên để mở khóa nội dung độc quyền, nhận quyền lợi theo cấp và ủng hộ trực tiếp creator bằng Aura Coins.
        </p>
      </div>

      {blockedMessage ? (
        <div className="mb-8 rounded-lg border border-destructive/30 bg-card p-5 text-sm leading-relaxed text-muted-foreground">
          {blockedMessage}
        </div>
      ) : null}

      {sortedTiers.length === 0 ? (
        <div className="rounded-lg border border-border/20 bg-card p-8 text-sm text-muted-foreground">
          Kênh chưa có gói membership đang mở.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {sortedTiers.map((tier) => {
            const isSelected = tier.id === selectedTierId;
            const isFeatured = tier.level === 2;
            const canJoin = !blockedMessage && tier.isAcceptingNew;
            const benefits = getTierBenefits(tier.level);

            return (
              <article
                key={tier.id}
                className={`relative flex flex-col rounded-lg border p-8 transition-all duration-300 ${
                  isSelected
                    ? "border-primary bg-card shadow-[0px_20px_60px_rgba(229,9,20,0.16)]"
                    : isFeatured
                      ? "border-primary/25 bg-card shadow-[0px_20px_60px_rgba(229,9,20,0.08)] lg:scale-105"
                      : "border-border/20 bg-card/80 hover:border-primary/40"
                }`}
              >
                {isFeatured ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-sm bg-primary px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-primary-foreground">
                    Most Popular
                  </div>
                ) : null}

                <div className="mb-8 mt-2">
                  <h3 className={`mb-1 font-headline text-sm font-bold uppercase tracking-[0.2em] ${isFeatured ? "text-primary" : "text-muted-foreground"}`}>
                    Level {tier.level}
                  </h3>
                  <div className="font-headline text-2xl font-black uppercase text-foreground">{tier.name}</div>
                  <p className="mt-2 text-xs font-bold uppercase tracking-widest text-secondary">
                    {getTierLabel(tier.level)}
                  </p>
                </div>

                <div className="mb-10 flex items-baseline gap-1">
                  <span className="font-headline text-4xl font-black text-foreground">
                    {tier.priceCoin.toLocaleString()}
                  </span>
                  <span className="font-headline font-bold text-secondary">AC</span>
                  <span className="ml-2 text-sm text-muted-foreground">/ tháng</span>
                </div>

                <div className="mb-12 flex-grow space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={benefit} className="flex items-start gap-3">
                      <span
                        className={`material-symbols-outlined text-xl ${index === 0 && tier.level >= 3 ? "text-secondary" : "text-primary"}`}
                        style={index === 0 ? { fontVariationSettings: "'FILL' 1" } : undefined}
                        aria-hidden="true"
                      >
                        {index === 0 && tier.level >= 3 ? "star" : "check_circle"}
                      </span>
                      <span className={`text-sm ${index === 0 && tier.level >= 2 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={!canJoin}
                  onClick={() => {
                    onSelectTier(tier);
                    onCheckout(tier);
                  }}
                  className={`inline-flex min-h-12 w-full items-center justify-center rounded-sm px-4 py-4 text-xs font-black uppercase tracking-widest transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  {canJoin ? (isSelected ? "Tiếp tục" : "Chọn gói") : "Tạm đóng"}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
