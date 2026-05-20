"use client";

import { Link } from "@/i18n/routing";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { mediaService, type UserMembershipResponse } from "../services/mediaService";
import type { PublicMembershipTier } from "../services/publicMediaService";
import { WatchMembershipPanel } from "./WatchMembershipPanel";

interface WatchChannelCardProps {
  channelId: string;
  channelName: string;
  avatarUrl: string | null;
  description: string;
  membershipTiers: PublicMembershipTier[];
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

function mapMembershipToTier(membership: UserMembershipResponse): PublicMembershipTier {
  return {
    id: membership.tierId,
    channelId: membership.channelId,
    name: membership.tierName,
    level: membership.tierLevel,
    priceCoin: membership.priceCoin,
    isAcceptingNew: false,
    createdAt: "",
    updatedAt: "",
  };
}

function getViewerVisibleTiers(
  tiers: PublicMembershipTier[],
  activeMembershipTiers: PublicMembershipTier[],
) {
  const activeTierIds = new Set(activeMembershipTiers.map((tier) => tier.id));
  const visibleTiers = tiers.filter((tier) => tier.isAcceptingNew || activeTierIds.has(tier.id));
  const visibleTierIds = new Set(visibleTiers.map((tier) => tier.id));
  const missingActiveTiers = activeMembershipTiers.filter((tier) => !visibleTierIds.has(tier.id));

  return [...visibleTiers, ...missingActiveTiers];
}

export function WatchChannelCard({
  channelId,
  channelName,
  avatarUrl,
  description,
  membershipTiers,
}: WatchChannelCardProps) {
  const { isAuthenticated } = useAuth();
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [activeMembershipTiers, setActiveMembershipTiers] = useState<PublicMembershipTier[]>([]);
  const hasChannelLink = Boolean(channelId);
  const hasDescription = Boolean(description.trim());
  const visibleTiers = useMemo(
    () => getViewerVisibleTiers(membershipTiers, activeMembershipTiers),
    [activeMembershipTiers, membershipTiers]
  );
  const hasJoinableTier = visibleTiers.some((tier) => tier.isAcceptingNew);
  const canShowAvatar = Boolean(avatarUrl && !avatarFailed);

  useEffect(() => {
    let isMounted = true;

    const loadViewerMemberships = async () => {
      if (!isAuthenticated) {
        if (isMounted) {
          setActiveMembershipTiers([]);
        }
        return;
      }

      try {
        const response = await mediaService.getMyMemberships({ page: 1, limit: 100 });
        const memberships: UserMembershipResponse[] = response.success && response.data ? response.data : [];
        const nextActiveMembershipTiers = memberships
          .filter((membership) => membership.channelId === channelId && membership.isActive)
          .map(mapMembershipToTier);

        if (isMounted) {
          setActiveMembershipTiers(nextActiveMembershipTiers);
        }
      } catch {
        if (isMounted) {
          setActiveMembershipTiers([]);
        }
      }
    };

    void loadViewerMemberships();

    return () => {
      isMounted = false;
    };
  }, [channelId, isAuthenticated]);

  const channelTitle = (
    <span className="inline-flex items-center gap-2 transition-colors hover:text-primary">
      {channelName}
      <span
        aria-label="Kênh đã xác minh"
        className="material-symbols-outlined text-lg text-primary"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        verified
      </span>
    </span>
  );

  return (
    <section className="mt-8 space-y-6">
      <div className="flex flex-col gap-6 rounded-lg border border-border/20 bg-background/50 p-6 shadow-2xl md:flex-row md:items-center md:justify-between md:p-8">
        <div className="flex min-w-0 items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-secondary/30 bg-gradient-to-tr from-primary/80 to-secondary/80 p-0.5 text-sm font-black text-foreground">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-4 border-zinc-950 bg-card">
              {canShowAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl || ""}
                  alt={channelName}
                  className="h-full w-full object-cover"
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                <span>{getInitials(channelName)}</span>
              )}
            </div>
          </div>

          <div className="min-w-0">
            <h2 className="truncate font-headline text-xl font-bold text-foreground">
              {hasChannelLink ? (
                <Link href={`/channel/${channelId}`} className="focus:outline-none focus:ring-2 focus:ring-primary/60">
                  {channelTitle}
                </Link>
              ) : (
                channelTitle
              )}
            </h2>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {visibleTiers.length > 0
                ? `${visibleTiers.length} gói membership`
                : "Kênh chưa có gói membership có thể đăng ký"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsMembershipOpen((current) => !current)}
          disabled={visibleTiers.length === 0}
          className="inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-6 py-3 text-sm font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground md:px-8"
        >
          {visibleTiers.length === 0
            ? "Chưa mở gói"
            : isMembershipOpen
              ? "Ẩn gói"
              : hasJoinableTier
                ? "Đăng ký membership"
                : "Xem gói membership"}
        </button>
      </div>

      {isMembershipOpen ? (
        <WatchMembershipPanel channelId={channelId} tiers={visibleTiers} />
      ) : null}

      <div className="rounded-lg border border-border/20 bg-background/30 p-6 md:p-8">
        <p className={`whitespace-pre-wrap text-sm font-medium leading-relaxed text-muted-foreground ${isDescriptionOpen ? "" : "line-clamp-4"}`}>
          {hasDescription ? description : "Chưa có mô tả cho video này."}
        </p>
        {hasDescription && description.length > 220 ? (
          <button
            type="button"
            onClick={() => setIsDescriptionOpen((current) => !current)}
            className="mt-6 text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:text-primary/80 hover:underline"
          >
            {isDescriptionOpen ? "Thu gọn" : "Xem thêm"}
          </button>
        ) : null}
      </div>
    </section>
  );
}
