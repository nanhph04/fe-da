"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  mediaService,
  type ChannelDetailResponse,
} from "@/features/watch/services/mediaService";
import { getErrorMessage } from "@/shared/api/client";
import type { PublicChannelDetail } from "@/features/watch/services/publicMedia.types";
import { StudioChannelHero } from "./StudioChannelHero";
import { StudioChannelTabs } from "./StudioChannelTabs";

type LoadingState = "idle" | "loading" | "success" | "error";

function toPublicChannelDetail(raw: ChannelDetailResponse): PublicChannelDetail {
  return {
    id: raw.id,
    userId: raw.userId,
    name: raw.name,
    bio: raw.bio,
    isEligibleForMembership: raw.isEligibleForMembership,
    isMembershipClosedByAdmin: raw.isMembershipClosedByAdmin,
    membershipReviewStatus: raw.membershipReviewStatus,
    membershipRejectionReason: raw.membershipRejectionReason,
    membershipRequestedAt: raw.membershipRequestedAt,
    membershipReviewedAt: raw.membershipReviewedAt,
    avatarUrl: raw.avatarUrl || null,
    bannerUrl: raw.bannerUrl || null,
    status: raw.status,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    membershipEligibility: raw.membershipEligibility ?? {
      isEligible: false,
      readyVideoCount: 0,
      minReadyVideoCount: 10,
      totalVideoViews: 0,
      minTotalVideoViews: 1000,
      missingRequirements: [],
    },
    membershipTiers: raw.membershipTiers ?? [],
    publicVideos: (raw.publicVideos ?? []).map((v) => ({
      id: v.id,
      title: v.title,
      category: v.category,
      tags: v.tags,
      status: v.status,
      thumbnailUrl: v.thumbnailUrl,
      thumbnailSource: v.thumbnailSource ?? "auto",
      thumbnailStatus: v.thumbnailStatus,
      publishedAt: v.publishedAt,
    })),
    subscriberCount: raw.subscriberCount,
    videoCount: raw.videoCount,
  };
}

export function StudioChannelFeature() {
  const t = useTranslations("Studio.channel");
  const [state, setState] = useState<LoadingState>("idle");
  const [channel, setChannel] = useState<PublicChannelDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadChannel = async () => {
      setState("loading");
      setError(null);

      try {
        // Step 1: Get channelId from /me/channel
        const myChannelRes = await mediaService.getMyChannel();
        if (!myChannelRes.success || !myChannelRes.data) {
          if (!cancelled) {
            setError(t("errors.noChannel"));
            setState("error");
          }
          return;
        }

        const channelId = myChannelRes.data.channelId;

        // Step 2: Get full channel detail
        const detailRes = await mediaService.getChannel(channelId);
        if (!detailRes.success || !detailRes.data) {
          if (!cancelled) {
            setError(detailRes.message || t("errors.loadFailed"));
            setState("error");
          }
          return;
        }

        if (!cancelled) {
          setChannel(toPublicChannelDetail(detailRes.data));
          setState("success");
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, t("errors.loadFailed")));
          setState("error");
        }
      }
    };

    loadChannel();

    return () => {
      cancelled = true;
    };
  }, [t]);

  if (state === "idle" || state === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="font-headline text-sm font-bold uppercase tracking-widest text-muted-foreground">
            {t("loading")}
          </p>
        </div>
      </div>
    );
  }

  if (state === "error" || !channel) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="max-w-md rounded-lg border border-destructive/30 bg-card p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="font-headline text-xl font-black text-foreground">
            {t("errors.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {error || t("errors.loadFailed")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">
          {t("pageLabel")}
        </p>
        <h1 className="mt-2 font-headline text-3xl font-black tracking-tight text-foreground md:text-4xl">
          {t("pageTitle")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {t("pageSubtitle")}
        </p>
      </div>

      <StudioChannelHero channel={channel} />
      <StudioChannelTabs channel={channel} />
    </div>
  );
}
