"use client";

import { useState } from "react";
import { Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { EditChannelDialog } from "./EditChannelDialog";
import type { PublicChannelDetail } from "@/features/watch/services/publicMedia.types";

interface ChannelHeroProps {
  channel: PublicChannelDetail;
  isOwner?: boolean;
  isLockedOwner?: boolean;
}

function getInitials(value: string) {
  const cleaned = value.trim();
  if (cleaned.length === 0) {
    return "V";
  }

  return cleaned.charAt(0).toUpperCase();
}

export function ChannelHero({ channel, isOwner, isLockedOwner }: ChannelHeroProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const totalVideos = channel.videoCount ?? channel.publicVideos.length;
  const totalViews = channel.membershipEligibility?.totalVideoViews ?? 0;
  const canManageChannel = isOwner && !isLockedOwner;

  return (
    <section className="relative overflow-hidden rounded-lg border border-border/20 bg-card shadow-2xl">
      <div className="relative h-80 overflow-hidden bg-muted md:h-[420px]">
        {channel.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={channel.bannerUrl} alt={`${channel.name} banner`} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(229,9,20,0.32),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(245,158,11,0.2),transparent_28%),linear-gradient(135deg,var(--card),var(--background))]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />
      </div>

      <div className="relative -mt-28 flex flex-col gap-6 p-6 md:flex-row md:items-end md:p-10">
        <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border-4 border-background bg-muted text-2xl font-black text-foreground shadow-2xl md:h-32 md:w-32">
          {channel.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={channel.avatarUrl} alt={channel.name} className="h-full w-full object-cover" />
          ) : (
            <span>{getInitials(channel.name)}</span>
          )}
        </div>

        <div className="min-w-0 flex-1 pb-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-headline text-4xl font-black uppercase italic tracking-tighter text-foreground md:text-6xl">
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

            {canManageChannel && (
              <Button
                onClick={() => setIsEditOpen(true)}
                variant="outline"
                className="gap-2 border-border/60 hover:bg-muted text-sm font-semibold transition-all shadow-md shrink-0"
              >
                <Edit2 className="h-4 w-4" />
                Tùy chỉnh kênh
              </Button>
            )}
          </div>
          
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-medium text-muted-foreground">
            <span>{totalVideos.toLocaleString()} video</span>
            <span className="h-1.5 w-1.5 rounded-full bg-border" aria-hidden="true" />
            <span>{totalViews.toLocaleString()} lượt xem</span>
            {channel.isMembershipClosedByAdmin ? (
              <span className="rounded-sm border border-destructive/40 bg-destructive/10 px-2 py-1 text-xs font-black uppercase tracking-widest text-destructive">
                Membership đóng
              </span>
            ) : null}
          </div>
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-foreground/80 md:text-base">
            {channel.bio || "Kênh chưa cập nhật phần giới thiệu."}
          </p>
        </div>
      </div>

      {canManageChannel ? (
        <EditChannelDialog
          channel={channel}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSaved={() => router.refresh()}
        />
      ) : null}
    </section>
  );
}
