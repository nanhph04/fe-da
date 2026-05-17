"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProfileUser } from "../types/profile.types";
import { formatProfileDate, getAvatarFallbackUrl } from "../utils/profile-formatters";
import { AvatarUploadButton } from "./AvatarUploadButton";
import { EditProfileDialog } from "./EditProfileDialog";

interface HeroProfileProps {
  user: ProfileUser;
}

export function HeroProfile({ user }: HeroProfileProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const displayName = user.displayName || user.email || "Velvet Viewer";

  return (
    <section className="relative overflow-hidden rounded-lg border border-border/20 bg-card p-8 shadow-2xl md:p-12">
      <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/10 to-transparent" aria-hidden="true" />
      <div className="relative z-10 flex flex-col items-center gap-8 md:flex-row md:items-end">
        <div className="relative">
          <div className="h-32 w-32 overflow-hidden rounded-lg bg-muted shadow-2xl ring-4 ring-background md:h-40 md:w-40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="h-full w-full object-cover"
              src={user.avatarUrl || getAvatarFallbackUrl(displayName)}
              alt={`Avatar của ${displayName}`}
            />
          </div>
          <AvatarUploadButton />
        </div>

        <div className="flex-grow text-center md:text-left">
          <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <h1 className="font-headline text-4xl font-black tracking-tighter text-foreground md:text-5xl">
              {displayName}
            </h1>
            {user.isCreator && (
              <span className="inline-flex items-center justify-center rounded-sm border border-secondary/20 bg-secondary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-secondary">
                Creator
              </span>
            )}
          </div>

          <p className="mb-6 text-sm font-medium text-muted-foreground">
            Thành viên từ {formatProfileDate(user.createdAt)}
          </p>

          {user.bio && <p className="mb-6 max-w-2xl text-sm leading-relaxed text-foreground/80">{user.bio}</p>}

          <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
            <div className="rounded-lg border-l-4 border-primary bg-background px-6 py-3 shadow-lg">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Account Role</p>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <span className="font-headline text-2xl font-black capitalize text-foreground">{user.role || "viewer"}</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="min-h-11 rounded-sm px-8 text-sm font-black uppercase tracking-wider shadow-[0px_10px_30px_rgba(229,9,20,0.25)]"
            >
              Chỉnh sửa hồ sơ
            </Button>
          </div>
        </div>
      </div>

      <EditProfileDialog user={user} open={isEditOpen} onOpenChange={setIsEditOpen} />
    </section>
  );
}
