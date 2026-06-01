"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { VideoThumbnail } from "@/shared/components/VideoThumbnail";
import {
  getReadyPublicThumbnailUrl,
  type PublicChannelDetail,
  type PublicChannelVideo,
  type PublicMembershipTier,
} from "@/features/watch/services/publicMedia.types";

interface StudioChannelTabsProps {
  channel: PublicChannelDetail;
}

type ChannelTab = "videos" | "membership" | "about";

function formatDate(value: string | null, locale: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function StudioChannelTabs({ channel }: StudioChannelTabsProps) {
  const t = useTranslations("Studio.channel");
  const [activeTab, setActiveTab] = useState<ChannelTab>("videos");

  const tabButtonClass = (tab: ChannelTab) =>
    `border-b-2 pb-4 font-headline text-sm font-bold uppercase tracking-widest transition-colors ${
      activeTab === tab
        ? "border-primary text-primary"
        : "border-transparent text-muted-foreground hover:text-foreground"
    }`;

  return (
    <>
      <div className="flex gap-8 border-b border-border/20">
        <button
          type="button"
          onClick={() => setActiveTab("videos")}
          className={tabButtonClass("videos")}
        >
          {t("tabs.videos")}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("membership")}
          className={tabButtonClass("membership")}
        >
          {t("tabs.membership")}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("about")}
          className={tabButtonClass("about")}
        >
          {t("tabs.about")}
        </button>
      </div>

      {activeTab === "videos" && <VideosTab videos={channel.publicVideos} channelName={channel.name} />}
      {activeTab === "membership" && <MembershipTab channel={channel} />}
      {activeTab === "about" && <AboutTab channel={channel} />}
    </>
  );
}

/* ────────────────────── Videos Tab ────────────────────── */

function VideosTab({
  videos,
  channelName,
}: {
  videos: PublicChannelVideo[];
  channelName: string;
}) {
  const t = useTranslations("Studio.channel");
  const locale = useLocale();

  if (videos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/30 bg-card p-10 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-sm border border-secondary/20 bg-secondary/10">
          <span className="material-symbols-outlined text-secondary">movie</span>
        </div>
        <h3 className="font-headline text-xl font-bold text-foreground">
          {t("videosEmpty.title")}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("videosEmpty.description")}
        </p>
        <Link
          href="/studio/upload"
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-primary px-5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <span className="material-symbols-outlined text-base">add_circle</span>
          {t("videosEmpty.cta")}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-6 text-sm text-muted-foreground">
        {t("videosPublished", { count: videos.length, channel: channelName })}
      </p>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {videos.map((video) => (
          <Link
            key={video.id}
            href={`/watch/${video.id}`}
            className="group overflow-hidden rounded-lg border border-border/20 bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40"
          >
            <div className="relative aspect-video overflow-hidden bg-muted">
              <VideoThumbnail
                src={getReadyPublicThumbnailUrl(video.thumbnailUrl, video.thumbnailStatus, video.id)}
                alt={video.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <span className="rounded-sm bg-black/70 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-foreground">
                  {video.category}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="line-clamp-2 font-headline text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                {video.title}
              </h3>
              <p className="mt-2 text-xs font-bold text-muted-foreground">
                {formatDate(video.publishedAt, locale)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────── Membership Tab ────────────────────── */

function MembershipTab({ channel }: { channel: PublicChannelDetail }) {
  const t = useTranslations("Studio.channel");
  const eligibility = channel.membershipEligibility;
  const tiers = [...channel.membershipTiers].sort(
    (a, b) => a.level - b.level || a.priceCoin - b.priceCoin
  );

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* Eligibility */}
      <div className="space-y-6 lg:col-span-5">
        <div className="rounded-lg border border-border/20 bg-card p-6 shadow-lg">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">
            {t("membershipEligibility.label")}
          </p>
          <h3 className="mt-2 font-headline text-xl font-black text-foreground">
            {eligibility.isEligible
              ? t("membershipEligibility.eligible")
              : t("membershipEligibility.notEligible")}
          </h3>

          <div className="mt-6 space-y-4">
            <EligibilityRow
              label={t("membershipEligibility.readyVideos")}
              current={eligibility.readyVideoCount}
              required={eligibility.minReadyVideoCount}
              met={eligibility.readyVideoCount >= eligibility.minReadyVideoCount}
            />
            <EligibilityRow
              label={t("membershipEligibility.totalViews")}
              current={eligibility.totalVideoViews}
              required={eligibility.minTotalVideoViews}
              met={eligibility.totalVideoViews >= eligibility.minTotalVideoViews}
            />
          </div>

          {eligibility.missingRequirements.length > 0 && (
            <div className="mt-6 rounded-md border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-500">
                {t("membershipEligibility.missingLabel")}
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                {eligibility.missingRequirements.map((req) => (
                  <li key={req}>{req}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Review status */}
        <div className="rounded-lg border border-border/20 bg-card p-6 shadow-lg">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">
            {t("membershipReview.label")}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <ReviewStatusBadge status={channel.membershipReviewStatus} />
          </div>
          {channel.membershipRejectionReason && (
            <p className="mt-3 rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              {channel.membershipRejectionReason}
            </p>
          )}
        </div>
      </div>

      {/* Tiers */}
      <div className="lg:col-span-7">
        <div className="rounded-lg border border-border/20 bg-card p-6 shadow-lg">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">
            {t("tiers.label")}
          </p>
          <h3 className="mt-2 font-headline text-xl font-black text-foreground">
            {t("tiers.title")}
          </h3>

          {tiers.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-border/30 bg-muted/40 p-8 text-center">
              <p className="text-sm text-muted-foreground">{t("tiers.empty")}</p>
              <Link
                href="/studio/memberships/edit"
                className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-sm bg-primary px-5 text-xs font-black uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
              >
                {t("tiers.createCta")}
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {tiers.map((tier) => (
                <TierCard key={tier.id} tier={tier} />
              ))}
              <Link
                href="/studio/memberships/edit"
                className="inline-flex min-h-10 items-center gap-2 rounded-sm border border-primary/30 bg-primary/10 px-5 text-xs font-black uppercase tracking-widest text-primary transition-colors hover:bg-primary/20"
              >
                {t("tiers.manageCta")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EligibilityRow({
  label,
  current,
  required,
  met,
}: {
  label: string;
  current: number;
  required: number;
  met: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`font-headline text-sm font-black ${met ? "text-emerald-500" : "text-amber-500"}`}>
          {current.toLocaleString()} / {required.toLocaleString()}
        </span>
        <span className={`material-symbols-outlined text-base ${met ? "text-emerald-500" : "text-amber-500"}`}>
          {met ? "check_circle" : "pending"}
        </span>
      </div>
    </div>
  );
}

function ReviewStatusBadge({ status }: { status: string }) {
  const t = useTranslations("Studio.channel.membershipReview");

  const config: Record<string, { label: string; color: string; icon: string }> = {
    not_requested: {
      label: t("notRequested"),
      color: "border-muted-foreground/30 bg-muted/40 text-muted-foreground",
      icon: "remove_circle_outline",
    },
    pending: {
      label: t("pending"),
      color: "border-amber-500/30 bg-amber-500/10 text-amber-500",
      icon: "schedule",
    },
    approved: {
      label: t("approved"),
      color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
      icon: "verified",
    },
    rejected: {
      label: t("rejected"),
      color: "border-destructive/30 bg-destructive/10 text-destructive",
      icon: "cancel",
    },
  };

  const { label, color, icon } = config[status] || config.not_requested;

  return (
    <span className={`inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 text-xs font-black uppercase tracking-widest ${color}`}>
      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
        {icon}
      </span>
      {label}
    </span>
  );
}

function TierCard({ tier }: { tier: PublicMembershipTier }) {
  const t = useTranslations("Studio.channel.tiers");

  return (
    <article className="rounded-lg border border-border/20 bg-background/60 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Level {tier.level}
          </p>
          <h4 className="mt-1 font-headline text-lg font-black text-foreground">
            {tier.name}
          </h4>
        </div>
        <div className="text-right">
          <p className="font-headline text-2xl font-black text-foreground">
            {tier.priceCoin.toLocaleString()}
          </p>
          <p className="text-xs font-bold text-secondary">AC / {t("month")}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span
          className={`inline-flex items-center rounded-sm px-2 py-1 text-[10px] font-black uppercase tracking-widest ${
            tier.isAcceptingNew
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
              : "border border-muted-foreground/30 bg-muted/40 text-muted-foreground"
          }`}
        >
          {tier.isAcceptingNew ? t("accepting") : t("closed")}
        </span>
      </div>
    </article>
  );
}

/* ────────────────────── About Tab ────────────────────── */

function AboutTab({ channel }: { channel: PublicChannelDetail }) {
  const t = useTranslations("Studio.channel");
  const locale = useLocale();

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="rounded-lg border border-border/20 bg-card p-6 shadow-lg">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">
          {t("about.channelInfo")}
        </p>

        <div className="mt-6 space-y-5">
          <InfoRow label={t("about.channelName")} value={channel.name} />
          <InfoRow
            label={t("about.bio")}
            value={channel.bio || t("noBio")}
          />
          <InfoRow label={t("about.channelId")} value={channel.id} mono />
          <InfoRow label={t("about.userId")} value={channel.userId} mono />
          <InfoRow
            label={t("about.createdAt")}
            value={formatDate(channel.createdAt, locale)}
          />
          <InfoRow
            label={t("about.updatedAt")}
            value={formatDate(channel.updatedAt, locale)}
          />
        </div>
      </div>

      <div className="rounded-lg border border-border/20 bg-card p-6 shadow-lg">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">
          {t("about.statusInfo")}
        </p>

        <div className="mt-6 space-y-5">
          <InfoRow label={t("about.channelStatus")} value={channel.status} />
          <InfoRow
            label={t("about.eligibleForMembership")}
            value={channel.isEligibleForMembership ? t("about.yes") : t("about.no")}
          />
          <InfoRow
            label={t("about.membershipClosedByAdmin")}
            value={channel.isMembershipClosedByAdmin ? t("about.yes") : t("about.no")}
          />
          <InfoRow
            label={t("about.reviewStatus")}
            value={channel.membershipReviewStatus}
          />
          {channel.membershipRequestedAt && (
            <InfoRow
              label={t("about.requestedAt")}
              value={formatDate(channel.membershipRequestedAt, locale)}
            />
          )}
          {channel.membershipReviewedAt && (
            <InfoRow
              label={t("about.reviewedAt")}
              value={formatDate(channel.membershipReviewedAt, locale)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </dt>
      <dd className={`mt-1 text-sm text-foreground ${mono ? "font-mono text-xs break-all" : "leading-relaxed"}`}>
        {value}
      </dd>
    </div>
  );
}
