"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  mediaService,
  type UserMembershipResponse,
} from "@/features/watch/services/mediaService";

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "K";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatExpiryDate(value: string | null, isActive: boolean) {
  if (!value) {
    return isActive ? "Đang hoạt động" : "Không có ngày hết hạn";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return isActive ? "Đang hoạt động" : "Không rõ ngày hết hạn";
  }

  return `${isActive ? "Hết hạn" : "Đã hết hạn"} ${new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)}`;
}

interface SubscriptionsProps {
  refreshKey?: number;
}

export function Subscriptions({ refreshKey = 0 }: SubscriptionsProps) {
  const [items, setItems] = useState<UserMembershipResponse[]>([]);
  const [failedAvatarUrls, setFailedAvatarUrls] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMemberships() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await mediaService.getMyMemberships({ page: 1, limit: 5 });
        if (isMounted && response.success && response.data) {
          setItems(response.data);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load memberships", err);
          setError("Không thể tải gói hội viên.");
          setItems([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadMemberships();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  return (
    <div className="space-y-6 lg:col-span-1">
      <h2 className="font-headline text-2xl font-bold text-foreground">Gói hội viên</h2>

      <div className="space-y-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 rounded-lg border border-border/20 bg-card p-4">
                <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))
          : null}

        {!isLoading && error ? (
          <div className="rounded-lg border border-border/20 bg-card p-6 text-sm text-muted-foreground">
            {error}
          </div>
        ) : null}

        {!isLoading && !error && items.length === 0 ? (
          <div className="rounded-lg border border-border/20 bg-card p-6 text-sm text-muted-foreground">
            Chưa có dữ liệu.
          </div>
        ) : null}

        {!isLoading && !error
          ? items.map((membership) => {
              const avatarFailed = membership.channelAvatarUrl
                ? failedAvatarUrls.has(membership.channelAvatarUrl)
                : false;
              const showAvatar = Boolean(membership.channelAvatarUrl && !avatarFailed);

              return (
                <Link
                  key={membership.membershipId}
                  href={`/creator/${membership.channelId}/join`}
                  className="group flex items-center justify-between rounded-lg border border-border/20 bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-primary/20 bg-muted text-sm font-bold text-foreground transition-colors group-hover:border-primary/60">
                      {showAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          alt={membership.channelName}
                          src={membership.channelAvatarUrl || ""}
                          className="h-full w-full object-cover"
                          onError={() => {
                            if (!membership.channelAvatarUrl) return;
                            setFailedAvatarUrls((current) => new Set(current).add(membership.channelAvatarUrl || ""));
                          }}
                        />
                      ) : (
                        <span>{getInitials(membership.channelName)}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-headline text-sm font-bold text-foreground">{membership.channelName}</h4>
                      <p className="text-xs text-muted-foreground">
                        Lv{membership.tierLevel} • {membership.tierName} • {membership.priceCoin.toLocaleString()} AC
                      </p>
                      <p className={membership.isActive ? "text-xs text-secondary" : "text-xs text-zinc-500"}>
                        {formatExpiryDate(membership.expiryDate, membership.isActive)}
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-zinc-600 transition-colors group-hover:text-zinc-300">chevron_right</span>
                </Link>
              );
            })
          : null}
      </div>
    </div>
  );
}
