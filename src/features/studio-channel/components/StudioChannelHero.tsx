"use client";

import { useState } from "react";
import { Edit2, ExternalLink, Eye, Film, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { useRouter } from "next/navigation";
import { EditChannelDialog } from "@/features/channel/components/EditChannelDialog";
import type { PublicChannelDetail } from "@/features/watch/services/publicMedia.types";

interface StudioChannelHeroProps {
  channel: PublicChannelDetail;
}

function getInitials(value: string) {
  const cleaned = value.trim();
  if (cleaned.length === 0) return "V";
  return cleaned.charAt(0).toUpperCase();
}

function getMembershipStatusLabel(
  channel: PublicChannelDetail,
  t: (key: string) => string
) {
  if (channel.isMembershipClosedByAdmin) return t("stats.membershipClosed");
  if (channel.membershipReviewStatus === "approved") return t("stats.membershipActive");
  if (channel.membershipReviewStatus === "pending") return t("stats.membershipPending");
  if (channel.membershipReviewStatus === "rejected") return t("stats.membershipRejected");
  return t("stats.membershipNotRequested");
}

function getMembershipStatusColor(channel: PublicChannelDetail) {
  if (channel.isMembershipClosedByAdmin) return "text-destructive";
  if (channel.membershipReviewStatus === "approved") return "text-emerald-500";
  if (channel.membershipReviewStatus === "pending") return "text-amber-500";
  if (channel.membershipReviewStatus === "rejected") return "text-destructive";
  return "text-muted-foreground";
}

export function StudioChannelHero({ channel }: StudioChannelHeroProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const t = useTranslations("Studio.channel");
  const totalVideos = channel.videoCount ?? channel.publicVideos.length;
  const totalViews = channel.membershipEligibility?.totalVideoViews ?? 0;
  const totalTiers = channel.membershipTiers.length;

  return (
    <section className="relative overflow-hidden rounded-lg border border-border/20 bg-card shadow-2xl">
      {/* Banner */}
      <div className="relative h-56 overflow-hidden bg-muted md:h-72 lg:h-80">
        {channel.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={channel.bannerUrl}
            alt={`${channel.name} banner`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(229,9,20,0.32),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(245,158,11,0.2),transparent_28%),linear-gradient(135deg,var(--card),var(--background))]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />
      </div>

      {/* Profile Info */}
      <div className="relative -mt-20 flex flex-col gap-6 p-6 md:flex-row md:items-end md:p-10">
        {/* Avatar */}
        <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border-4 border-background bg-muted text-2xl font-black text-foreground shadow-2xl md:h-32 md:w-32">
          {channel.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={channel.avatarUrl}
              alt={channel.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{getInitials(channel.name)}</span>
          )}
        </div>

        {/* Name + Actions */}
        <div className="min-w-0 flex-1 pb-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-headline text-3xl font-black uppercase italic tracking-tighter text-foreground md:text-5xl">
                {channel.name}
              </h1>
              {channel.status === "active" && (
                <span
                  aria-label={t("verified")}
                  className="material-symbols-outlined text-secondary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => setIsEditOpen(true)}
                variant="outline"
                className="gap-2 border-border/60 text-sm font-semibold shadow-md transition-all hover:bg-muted"
              >
                <Edit2 className="h-4 w-4" />
                {t("editChannel")}
              </Button>
              <Link
                href={`/channel/${channel.id}`}
                className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border/60 bg-background px-4 text-sm font-semibold text-foreground shadow-md transition-all hover:bg-muted"
              >
                <ExternalLink className="h-4 w-4" />
                {t("viewPublic")}
              </Link>
            </div>
          </div>

          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-foreground/80 md:text-base">
            {channel.bio || t("noBio")}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 border-t border-border/10 p-6 md:grid-cols-4 md:p-10 md:pt-6">
        <StatCard
          icon={<Film className="h-5 w-5 text-primary" />}
          label={t("stats.totalVideos")}
          value={totalVideos.toLocaleString()}
        />
        <StatCard
          icon={<Eye className="h-5 w-5 text-secondary" />}
          label={t("stats.totalViews")}
          value={totalViews.toLocaleString()}
        />
        <StatCard
          icon={<Star className="h-5 w-5 text-amber-500" />}
          label={t("stats.membershipTiers")}
          value={totalTiers.toString()}
        />
        <div className="rounded-lg border border-border/20 bg-background/60 p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-emerald-500">
              shield
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {t("stats.membershipStatus")}
            </span>
          </div>
          <p className={`font-headline text-lg font-black ${getMembershipStatusColor(channel)}`}>
            {getMembershipStatusLabel(channel, t)}
          </p>
        </div>
      </div>

      <EditChannelDialog
        channel={channel}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSaved={() => router.refresh()}
      />
    </section>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border/20 bg-background/60 p-4">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="font-headline text-2xl font-black text-foreground">{value}</p>
    </div>
  );
}
