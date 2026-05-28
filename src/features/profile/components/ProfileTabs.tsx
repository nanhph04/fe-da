"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { ProfileClientDataState, ProfileUser } from "../types/profile.types";
import { AccountInfo } from "./AccountInfo";
import { ActiveMemberships } from "./ActiveMemberships";
import { ProfileCreatorVideos } from "./ProfileCreatorVideos";
import { WalletHistoryMini } from "./WalletHistoryMini";

interface ProfileTabsProps {
  user: ProfileUser;
  data: ProfileClientDataState;
}

type ProfileTab = "overview" | "videos";

export function ProfileTabs({ user, data }: ProfileTabsProps) {
  const t = useTranslations("ProfilePage.tabs");
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");

  const tabButtonClass = (tab: ProfileTab) =>
    `border-b-2 pb-4 font-headline text-sm font-bold uppercase tracking-widest transition-colors ${
      activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
    }`;

  return (
    <>
      <div className="flex gap-8 border-b border-border/20">
        <button type="button" onClick={() => setActiveTab("overview")} className={tabButtonClass("overview")}>
          {t("overview")}
        </button>
        <button type="button" onClick={() => setActiveTab("videos")} className={tabButtonClass("videos")}>
          {t("videos")}
        </button>
      </div>

      {activeTab === "overview" ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-7">
            <AccountInfo user={user} />
            <WalletHistoryMini wallet={data.wallet} transactions={data.transactions} error={data.errors.wallet || data.errors.transactions} />
          </div>
          <div className="lg:col-span-5">
            <ActiveMemberships memberships={data.memberships} error={data.errors.memberships} />
          </div>
        </div>
      ) : (
        <ProfileCreatorVideos videos={data.ownerVideos} error={data.errors.ownerVideos} />
      )}
    </>
  );
}
