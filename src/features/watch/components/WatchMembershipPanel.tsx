"use client";

import { Link } from "@/i18n/routing";
import { useEffect, useId, useRef } from "react";
import type { PublicMembershipTier } from "../services/publicMedia.types";

interface WatchMembershipPanelProps {
  channelId: string;
  tiers: PublicMembershipTier[];
  onClose: () => void;
}

function getTierLabel(level: number) {
  if (level === 1) return "Standard";
  if (level === 2) return "Premium";
  if (level === 3) return "Exclusive";
  return `Level ${level}`;
}

export function WatchMembershipPanel({ channelId, tiers, onClose }: WatchMembershipPanelProps) {
  const sortedTiers = [...tiers].sort((a, b) => a.level - b.level || a.priceCoin - b.priceCoin);
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = Array.from(
        document.querySelectorAll<HTMLElement>(
          '[role="dialog"] a[href], [role="dialog"] button:not(:disabled), [role="dialog"] [tabindex]:not([tabindex="-1"])',
        ),
      );

      if (focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 md:px-8" role="presentation">
      <button
        type="button"
        aria-label="Đóng popup membership"
        className="absolute inset-0 cursor-default bg-background/88 backdrop-blur-md"
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[calc(100dvh-48px)] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-border/30 bg-card shadow-[0_32px_100px_rgba(0,0,0,0.72)]"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_22%_0%,rgba(229,9,20,0.28),transparent_42%),radial-gradient(circle_at_78%_0%,rgba(245,158,11,0.16),transparent_34%)]" />

        <div className="relative flex items-start justify-between gap-4 border-b border-border/20 px-5 py-5 md:px-8 md:py-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Membership tiers</p>
            <h3 id={titleId} className="mt-2 font-headline text-2xl font-black tracking-tight text-foreground md:text-3xl">
              Mở khóa nội dung của kênh
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Giá hiển thị bằng Aura Coins. Chọn gói còn nhận thành viên mới để tiếp tục thanh toán.
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-border/30 bg-background/70 text-muted-foreground transition-all duration-300 hover:border-primary/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 active:scale-95"
          >
            <span className="material-symbols-outlined text-xl" aria-hidden="true">
              close
            </span>
          </button>
        </div>

        <div className="relative overflow-y-auto px-5 py-5 md:px-8 md:py-8">
          {sortedTiers.length === 0 ? (
            <div className="rounded-lg border border-border/20 bg-background/60 p-6 text-sm leading-relaxed text-muted-foreground">
              Kênh chưa mở gói membership. Bạn vẫn có thể theo dõi các video công khai của kênh.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              {sortedTiers.map((tier) => {
                const isFeatured = tier.level === 2;
                return (
                  <article
                    key={tier.id}
                    className={`flex min-h-72 flex-col rounded-lg border p-5 transition-all duration-300 ${
                      isFeatured
                        ? "border-primary/50 bg-muted/50 shadow-[0_20px_60px_rgba(229,9,20,0.16)]"
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
                        <span className="material-symbols-outlined text-base text-primary" aria-hidden="true">
                          check_circle
                        </span>
                        <span>Truy cập nội dung cấp Lv{tier.level}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-primary" aria-hidden="true">
                          check_circle
                        </span>
                        <span>Huy hiệu thành viên của kênh</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-secondary" aria-hidden="true">
                          toll
                        </span>
                        <span>Thanh toán bằng Aura Coins</span>
                      </div>
                    </div>

                    {tier.isAcceptingNew && channelId ? (
                      <Link
                        href={`/creator/${channelId}/join?tier=${tier.id}`}
                        className="inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-4 py-3 text-xs font-black uppercase tracking-widest text-primary-foreground transition-all duration-300 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/60 active:scale-95"
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
          )}
        </div>
      </section>
    </div>
  );
}
