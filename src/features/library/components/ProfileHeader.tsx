"use client";

import { Link } from "@/i18n/routing";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { WalletService } from "@/features/wallet/services/walletService";
import type { Wallet } from "@/features/wallet/types/wallet.types";
import { createAsyncState, isAsyncLoading } from "@/shared/api/async-state";
import { getErrorMessage } from "@/shared/api/client";
import { useTranslations } from "next-intl";

type TFunction = ReturnType<typeof useTranslations>;

function formatMemberSince(value: string | undefined, t: TFunction) {
  if (!value) {
    return t("memberSinceUnknown");
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return t("memberSinceUnknown");
  }

  return t("memberSince", { year: date.getFullYear() });
}

function getStatusLabel(role: string | undefined, isCreator: boolean | undefined, t: TFunction) {
  if (role === "admin") {
    return t("roleAdmin");
  }

  if (isCreator || role === "creator") {
    return t("roleCreator");
  }

  return t("roleViewer");
}

interface ProfileHeaderProps {
  refreshKey?: number;
}

export function ProfileHeader({ refreshKey = 0 }: ProfileHeaderProps) {
  const { user } = useAuth();
  const t = useTranslations("LibraryPage");
  const [walletState, setWalletState] = useState(() =>
    createAsyncState<Wallet | null>(null)
  );

  useEffect(() => {
    let isMounted = true;

    async function loadWallet() {
      setWalletState((current) => ({ ...current, status: "loading", error: null }));

      if (!user) {
        setWalletState({ status: "success", data: null, error: null });
        return;
      }

      try {
        const data = await WalletService.getMyWallet();
        if (isMounted) {
          setWalletState({ status: "success", data, error: null });
        }
      } catch (error) {
        if (isMounted) {
          setWalletState({
            status: "error",
            data: null,
            error: getErrorMessage(error, t("loadWalletFailed")),
          });
        }
      }
    }

    void loadWallet();

    return () => {
      isMounted = false;
    };
  }, [user, refreshKey, t]);

  const displayName = user?.displayName || user?.email || t("myAccount");
  const walletLabel = walletState.data
    ? `${walletState.data.balance.toLocaleString()} AC`
    : walletState.error || t("noData");

  return (
    <section className="flex flex-col items-start justify-between gap-8 border-b border-border/20 pb-12 md:flex-row md:items-end">
      <div className="space-y-4">
        <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-foreground md:text-7xl">
          {displayName}
        </h1>
        <div className="flex flex-wrap items-center gap-4">
          <span className="rounded border border-secondary/30 bg-secondary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-secondary">
            {getStatusLabel(user?.role, user?.isCreator, t)}
          </span>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="material-symbols-outlined text-muted-foreground">calendar_today</span>
            <span className="text-sm font-medium">{formatMemberSince(user?.createdAt, t)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 rounded-lg border border-border/20 bg-card p-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {t("auraBalance")}
          </span>
          <div className="flex items-center gap-2 font-headline text-3xl font-black text-secondary">
            {isAsyncLoading(walletState) ? "..." : walletLabel}
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>toll</span>
          </div>
        </div>
        <Link
          href="/wallet"
          className="rounded-sm bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
        >
          {t("topUp")}
        </Link>
      </div>
    </section>
  );
}
