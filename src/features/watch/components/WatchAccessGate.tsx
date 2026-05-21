"use client";

import { Link } from "@/i18n/routing";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { PaymentService } from "@/features/wallet/services/paymentService";
import { WalletService } from "@/features/wallet/services/walletService";
import type { PaymentResponse, Wallet } from "@/features/wallet/types/wallet.types";
import { getErrorMessage } from "@/shared/api/client";
import {
  createIdempotencyKey,
  createRandomId,
  getPersistedSession,
  setPersistedSession,
  clearPersistedSession,
} from "@/shared/utils/idempotency";
import type { PublicMembershipTier } from "../services/publicMediaService";

export interface WatchAccessData {
  channelId: string;
  channelName: string;
  channelOwnerId: string | null;
  membershipTiers: PublicMembershipTier[];
  priceCoin: number;
  requiredTierLevel: number | null;
}

interface WatchAccessGateProps {
  videoId: string;
  poster?: string;
  title?: string;
  access: WatchAccessData;
  purchaseCompleted?: boolean;
  onUnlocked: () => void;
}

type PurchaseStatus = "idle" | "processing" | "success" | "error";

interface VideoPurchaseSession {
  idempotencyKey: string;
  requestId: string;
}

function createVideoPurchaseSession(userId: string, videoId: string): VideoPurchaseSession {
  const paymentIntentId = createRandomId();

  return {
    idempotencyKey: createIdempotencyKey("video", userId, videoId, paymentIntentId),
    requestId: `video-unlock:${paymentIntentId}`,
  };
}

function formatCoins(value: number) {
  return `${value.toLocaleString("vi-VN")} AC`;
}

function getTierLabel(level: number) {
  if (level === 1) return "Standard";
  if (level === 2) return "Premium";
  if (level === 3) return "Exclusive";
  return `Level ${level}`;
}

function findRecommendedMembershipTier(
  tiers: PublicMembershipTier[],
  requiredTierLevel: number | null,
) {
  const acceptingTiers = [...tiers]
    .filter((tier) => tier.isAcceptingNew)
    .sort((a, b) => a.level - b.level || a.priceCoin - b.priceCoin);

  if (!requiredTierLevel) {
    return null;
  }

  return acceptingTiers.find((tier) => tier.level >= requiredTierLevel) ?? null;
}

function getAccessDescription(access: WatchAccessData) {
  if (access.priceCoin > 0 && access.requiredTierLevel) {
    return `Video này cần mua lẻ hoặc membership từ Lv${access.requiredTierLevel} của kênh.`;
  }

  if (access.priceCoin > 0) {
    return "Video này đang khóa theo lượt mua. Mở khóa một lần để xem lại trong thư viện đã mua.";
  }

  if (access.requiredTierLevel) {
    return `Video này dành cho thành viên từ Lv${access.requiredTierLevel} của kênh.`;
  }

  return "Media service từ chối quyền phát video này. Kiểm tra quyền mua hoặc membership để tiếp tục.";
}

export function WatchAccessGate({
  videoId,
  poster,
  title,
  access,
  purchaseCompleted = false,
  onUnlocked,
}: WatchAccessGateProps) {
  const { user, isAuthenticated } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<PurchaseStatus>("idle");
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSession, setPurchaseSession] = useState<VideoPurchaseSession | null>(null);

  const recommendedTier = useMemo(
    () => findRecommendedMembershipTier(access.membershipTiers, access.requiredTierLevel),
    [access.membershipTiers, access.requiredTierLevel],
  );

  const membershipHref = access.channelId
    ? recommendedTier
      ? `/creator/${access.channelId}/join?tier=${recommendedTier.id}`
      : `/creator/${access.channelId}/join`
    : null;

  const loadWallet = useCallback(async () => {
    if (!isAuthenticated) {
      return null;
    }

    setWalletLoading(true);
    setWalletError(null);

    try {
      const currentWallet = await WalletService.getMyWallet();
      setWallet(currentWallet);
      return currentWallet;
    } catch (err) {
      const message = getErrorMessage(err, "Không thể tải số dư ví.");
      setWalletError(message);
      return null;
    } finally {
      setWalletLoading(false);
    }
  }, [isAuthenticated]);

  const handlePurchaseVideo = useCallback(async () => {
    if (!isAuthenticated || !user) {
      return;
    }

    if (access.priceCoin <= 0) {
      setPurchaseStatus("error");
      setPurchaseError("Video này chưa có giá mua lẻ từ API.");
      return;
    }

    if (!access.channelId || !access.channelOwnerId) {
      setPurchaseStatus("error");
      setPurchaseError("Thiếu thông tin kênh để thanh toán video.");
      return;
    }

    let currentWallet = wallet;
    if (!currentWallet) {
      currentWallet = await loadWallet();
    }

    if (!currentWallet) {
      setPurchaseStatus("error");
      setPurchaseError("Không thể kiểm tra số dư Aura Coins. Vui lòng thử lại.");
      return;
    }

    if (currentWallet.balance < access.priceCoin) {
      setPurchaseStatus("error");
      setPurchaseError("Số dư Aura Coins chưa đủ để mua video này.");
      return;
    }

    const storageKey = `video-purchase:${user.userId}:${videoId}`;
    let activeSession = purchaseSession;
    if (!activeSession) {
      const persisted = getPersistedSession(storageKey);
      if (persisted) {
        activeSession = persisted;
      } else {
        activeSession = createVideoPurchaseSession(user.userId, videoId);
        setPersistedSession(storageKey, activeSession);
      }
      setPurchaseSession(activeSession);
    }

    setPurchaseStatus("processing");
    setPurchaseError(null);

    try {
      const response: PaymentResponse = await PaymentService.createPayment(
        {
          serviceType: "video",
          serviceId: videoId,
          channelId: access.channelId,
          channelOwnerId: access.channelOwnerId,
          coinAmount: access.priceCoin,
          metadata: {
            videoTitle: title,
            channelName: access.channelName,
            thumbnailUrl: poster,
          },
        },
        activeSession.idempotencyKey,
        user.userId,
        activeSession.requestId,
      );

      setWallet((current) =>
        current
          ? {
            ...current,
            balance: Math.max(current.balance - response.coinAmount, 0),
          }
          : current,
      );
      
      clearPersistedSession(storageKey);
      setPurchaseStatus("success");
      onUnlocked();
    } catch (err) {
      setPurchaseStatus("error");
      setPurchaseError(getErrorMessage(err, "Thanh toán video thất bại. Vui lòng thử lại."));
    }
  }, [access, isAuthenticated, loadWallet, onUnlocked, poster, purchaseSession, title, user, videoId, wallet]);

  useEffect(() => {
    setPurchaseSession(null);
    setPurchaseStatus("idle");
    setPurchaseError(null);
    setWallet(null);
    setWalletError(null);
  }, [videoId]);

  useEffect(() => {
    if (!isAuthenticated || access.priceCoin <= 0 || wallet || walletLoading) {
      return;
    }

    void loadWallet();
  }, [access.priceCoin, isAuthenticated, loadWallet, wallet, walletLoading]);

  const canBuyVideo = access.priceCoin > 0 && Boolean(access.channelId && access.channelOwnerId);
  const hasPurchaseOption = access.priceCoin > 0;
  const hasMembershipOption = Boolean(membershipHref);
  const hasInsufficientBalance = Boolean(wallet && wallet.balance < access.priceCoin);
  const isPurchaseProcessing = purchaseStatus === "processing";
  const purchaseAlreadyCompleted = purchaseCompleted || purchaseStatus === "success";
  const isPurchaseDisabled =
    purchaseAlreadyCompleted || isPurchaseProcessing || walletLoading || !canBuyVideo || hasInsufficientBalance;

  return (
    <div className="relative min-h-[760px] overflow-hidden rounded-lg border border-border bg-card shadow-2xl sm:min-h-[680px] md:aspect-video md:min-h-0">
      {poster ? (
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center opacity-30 blur-sm"
          style={{ backgroundImage: `url(${poster})` }}
          aria-hidden="true"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-b from-background/75 via-background/95 to-background" />
      <div className="absolute inset-x-0 top-0 h-40 bg-secondary/10 blur-3xl" aria-hidden="true" />
      <div className="relative z-10 flex min-h-[760px] flex-col px-4 py-5 text-center sm:min-h-[680px] sm:px-6 md:h-full md:min-h-0 md:overflow-y-auto md:py-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mx-auto mb-3 flex h-10 w-16 items-center justify-center rounded-full border border-secondary/30 bg-secondary/10 text-secondary shadow-lg shadow-secondary/10">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              lock
            </span>
          </div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-secondary">
            Nội dung giới hạn quyền xem
          </p>
          <h2 className="mt-2 text-balance font-headline text-2xl font-extrabold tracking-tight text-foreground md:text-3xl lg:text-4xl">
            Mở khóa để tiếp tục xem
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
            {getAccessDescription(access)}
          </p>
        </div>

        <div className="mx-auto mt-5 grid w-full max-w-4xl flex-1 gap-4 md:grid-cols-2 md:items-stretch">
          {hasPurchaseOption ? (
            <article className="flex min-h-0 flex-col rounded-lg border border-secondary/30 bg-card/95 p-4 text-left shadow-xl shadow-background/40 lg:p-5">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-secondary">Mua lẻ</p>
                </div>
                <span className="material-symbols-outlined text-2xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  toll
                </span>
              </div>

              {!canBuyVideo ? (
                <p className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  Thiếu thông tin thanh toán video từ API.
                </p>
              ) : null}

              <div className="mt-5">
                {purchaseAlreadyCompleted ? (
                  <button
                    type="button"
                    onClick={onUnlocked}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-sm bg-secondary px-4 py-3 text-xs font-black uppercase tracking-widest text-secondary-foreground transition-all duration-300 hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Tải lại trình phát
                  </button>
                ) : hasInsufficientBalance ? (
                  <Link
                    href="/wallet"
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-sm bg-secondary px-4 py-3 text-xs font-black uppercase tracking-widest text-secondary-foreground transition-all duration-300 hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Nạp Aura Coins
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handlePurchaseVideo}
                    disabled={isPurchaseDisabled}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-sm bg-primary px-4 py-3 text-xs font-black uppercase tracking-widest text-primary-foreground transition-all duration-300 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {isPurchaseProcessing ? "Đang xử lý..." : `Mua video ${formatCoins(access.priceCoin)}`}
                  </button>
                )}
              </div>
            </article>
          ) : null}

          {membershipHref ? (
            <article className="flex min-h-0 flex-col rounded-lg border border-border/30 bg-card/95 p-4 text-left shadow-xl shadow-background/40 lg:p-5">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Membership</p>
                </div>
                <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  workspace_premium
                </span>
              </div>

              {/* <p className="mb-4 text-sm leading-6 text-muted-foreground">
                {recommendedTier
                  ? `Phù hợp nếu bạn muốn xem thêm các video khóa cùng cấp của ${access.channelName}.`
                  : `Mở trang membership của ${access.channelName} để chọn gói phù hợp.`}
              </p> */}

              <Link
                href={membershipHref}
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-sm border border-primary/50 bg-background px-4 py-3 text-xs font-black uppercase tracking-widest text-foreground transition-all duration-300 hover:border-primary hover:text-primary active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Đăng ký membership
              </Link>
            </article>
          ) : null}
        </div>

        {!hasPurchaseOption && !hasMembershipOption ? (
          <div className="mx-auto mt-5 max-w-xl rounded-lg border border-border/30 bg-card p-5 text-sm leading-6 text-muted-foreground">
            Chưa có lựa chọn mua lẻ hoặc gói membership phù hợp được trả về từ API. Bạn có thể thử lại sau hoặc quay về thư viện.
          </div>
        ) : null}

        {purchaseAlreadyCompleted ? (
          <p className="mx-auto mt-4 rounded-md border border-secondary/30 bg-secondary/10 px-4 py-2 text-sm font-bold text-secondary">
            Đã mở khóa video. Đang tải lại trình phát...
          </p>
        ) : null}

        {purchaseError ? (
          <p className="mx-auto mt-4 max-w-xl rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {purchaseError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
