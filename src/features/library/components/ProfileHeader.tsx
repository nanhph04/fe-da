"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { WalletService } from "@/features/wallet/services/walletService";
import type { Wallet } from "@/features/wallet/types/wallet.types";
import { createAsyncState, isAsyncLoading } from "@/shared/api/async-state";
import { getErrorMessage } from "@/shared/api/client";

function formatMemberSince(value?: string) {
  if (!value) {
    return "Chưa rõ ngày tham gia";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Chưa rõ ngày tham gia";
  }

  return `Thành viên từ ${date.getFullYear()}`;
}

function getStatusLabel(role?: string, isCreator?: boolean) {
  if (role === "admin") {
    return "Quản trị viên";
  }

  if (isCreator || role === "creator") {
    return "Nhà sáng tạo";
  }

  return "Người xem";
}

interface ProfileHeaderProps {
  refreshKey?: number;
}

export function ProfileHeader({ refreshKey = 0 }: ProfileHeaderProps) {
  const { user } = useAuth();
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
            error: getErrorMessage(error, "Không thể tải số dư ví."),
          });
        }
      }
    }

    void loadWallet();

    return () => {
      isMounted = false;
    };
  }, [user, refreshKey]);

  const displayName = user?.displayName || user?.email || "Tài khoản của bạn";
  const walletLabel = walletState.data
    ? `${walletState.data.balance.toLocaleString()} AC`
    : walletState.error || "Chưa có dữ liệu";

  return (
    <section className="flex flex-col items-start justify-between gap-8 border-b border-border/20 pb-12 md:flex-row md:items-end">
      <div className="space-y-4">
        <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-foreground md:text-7xl">
          {displayName}
        </h1>
        <div className="flex flex-wrap items-center gap-4">
          <span className="rounded border border-secondary/30 bg-secondary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-secondary">
            {getStatusLabel(user?.role, user?.isCreator)}
          </span>
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="material-symbols-outlined text-zinc-500">calendar_today</span>
            <span className="text-sm font-medium">{formatMemberSince(user?.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 rounded-lg border border-border/20 bg-card p-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Số dư Aura
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
          Nạp coin
        </Link>
      </div>
    </section>
  );
}
