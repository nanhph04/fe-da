"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { profileService } from "../services/profile.service";
import type { ProfileClientDataState, ProfileUser } from "../types/profile.types";
import { HeroProfile } from "./HeroProfile";
import { ProfileTabs } from "./ProfileTabs";

interface ProfileFeatureProps {
  initialUser: ProfileUser;
}

const initialDataState: ProfileClientDataState = {
  status: "idle",
  wallet: null,
  transactions: [],
  memberships: [],
  ownerVideos: [],
  errors: {},
};

export function ProfileFeature({ initialUser }: ProfileFeatureProps) {
  const { user } = useAuth();
  const effectiveUser = (user || initialUser) as ProfileUser;
  const [data, setData] = useState<ProfileClientDataState>(initialDataState);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setData(current => ({ ...current, status: "loading", errors: {} }));
      const nextData = await profileService.loadClientData(effectiveUser.isCreator);
      if (!cancelled) {
        setData(nextData);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [effectiveUser.isCreator]);

  return (
    <main className="min-h-screen bg-background px-4 pb-20 pt-24 md:pl-72 md:pr-8 lg:px-8 lg:pl-72">
      <div className="mx-auto max-w-6xl space-y-8">
        <HeroProfile user={effectiveUser} />

        {data.status === "loading" ? (
          <div className="flex min-h-64 items-center justify-center rounded-lg border border-border/20 bg-card">
            <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Đang tải dữ liệu hồ sơ...
            </div>
          </div>
        ) : (
          <ProfileTabs user={effectiveUser} data={data} />
        )}
      </div>
    </main>
  );
}
