"use client";

import { Link } from "@/i18n/routing";
import type { PaymentResponse } from "@/features/wallet/types/wallet.types";
import type { Wallet } from "@/features/wallet/types/wallet.types";
import type { PublicChannelDetail, PublicMembershipTier } from "@/features/watch/services/publicMediaService";

export type MembershipPaymentStatus = "idle" | "processing" | "success" | "error";

export interface MembershipPaymentState {
  status: MembershipPaymentStatus;
  error: string | null;
  response: PaymentResponse | null;
}

interface CheckoutOverlayProps {
  channel: PublicChannelDetail;
  tier: PublicMembershipTier;
  wallet: Wallet | null;
  walletLoading: boolean;
  walletError: string | null;
  paymentState: MembershipPaymentState;
  onClose: () => void;
  onConfirm: () => void;
  onRetryWallet: () => void;
}

const numberFormatter = new Intl.NumberFormat("vi-VN");

function formatCoins(value: number) {
  return numberFormatter.format(value);
}

function getBalanceAfter(wallet: Wallet | null, tier: PublicMembershipTier) {
  if (!wallet) {
    return null;
  }

  return wallet.balance - tier.priceCoin;
}

export function CheckoutOverlay({
  channel,
  tier,
  wallet,
  walletLoading,
  walletError,
  paymentState,
  onClose,
  onConfirm,
  onRetryWallet,
}: CheckoutOverlayProps) {
  const balanceAfter = getBalanceAfter(wallet, tier);
  const hasInsufficientBalance = wallet ? wallet.balance < tier.priceCoin : false;
  const isProcessing = paymentState.status === "processing";
  const isSuccess = paymentState.status === "success";
  const canConfirm = Boolean(wallet) && !walletLoading && !walletError && !hasInsufficientBalance && !isProcessing && !isSuccess;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-background/80 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-md flex-col bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/20 bg-background p-8">
          <h2 className="font-headline text-2xl font-black uppercase italic tracking-tighter text-foreground">
            Checkout
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng thanh toán membership"
            className="text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
          >
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-8">
          <div className="mb-8">
            <div className="mb-6 font-headline text-xs font-bold uppercase tracking-[0.3em] text-primary">
              Chi tiết đăng ký
            </div>
            <div className="flex items-center gap-4 rounded-lg border border-border/10 bg-background p-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-sm font-black text-foreground">
                {channel.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="h-full w-full object-cover"
                    src={channel.avatarUrl}
                    alt={channel.name}
                  />
                ) : (
                  <span>{channel.name.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div>
                <div className="pb-1 font-headline font-black uppercase italic text-foreground">{channel.name}</div>
                <div className="text-sm font-bold text-primary">
                  Level {tier.level} {tier.name} Membership
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Giá mỗi tháng</span>
              <div className="flex items-center gap-1 font-headline font-bold text-foreground">
                <span>{formatCoins(tier.priceCoin)}</span>
                <span className="text-xs text-secondary">AC</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Phí nền tảng</span>
              <div className="flex items-center gap-1 font-headline font-bold text-foreground">
                <span>0</span>
                <span className="text-xs text-secondary">AC</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/20 pt-6">
              <span className="font-headline text-lg font-bold text-foreground">Tổng thanh toán</span>
              <div className="flex items-center gap-1">
                <span className="font-headline text-3xl font-black text-foreground">{formatCoins(tier.priceCoin)}</span>
                <span className="font-headline font-bold text-secondary">AC</span>
              </div>
            </div>
          </div>

          <div className="mt-12 rounded-lg border border-border/10 bg-background p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Số dư ví</span>
              <span className="font-headline font-bold text-foreground">
                {walletLoading ? "Đang tải..." : wallet ? `${formatCoins(wallet.balance)} AC` : "--"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Sau khi mua</span>
              <span className={hasInsufficientBalance ? "font-bold text-destructive" : "font-bold text-secondary"}>
                {balanceAfter === null ? "--" : `${formatCoins(Math.max(balanceAfter, 0))} AC`}
              </span>
            </div>
            {hasInsufficientBalance ? (
              <p className="mt-4 text-xs leading-relaxed text-destructive">
                Số dư hiện tại chưa đủ để thanh toán gói này. Vui lòng nạp thêm Aura Coins trước khi xác nhận.
              </p>
            ) : null}
            {walletError ? (
              <p className="mt-4 text-xs leading-relaxed text-destructive">{walletError}</p>
            ) : null}
          </div>

          {paymentState.status === "error" && paymentState.error ? (
            <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm leading-relaxed text-destructive">
              {paymentState.error}
            </div>
          ) : null}

          {isSuccess ? (
            <div className="mt-6 rounded-lg border border-secondary/30 bg-secondary/10 p-5">
              <div className="flex items-center gap-3 text-secondary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">
                  check_circle
                </span>
                <p className="font-headline text-lg font-black text-foreground">Thanh toán thành công</p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Membership đang được đồng bộ vào thư viện của bạn. Nếu chưa thấy ngay, hãy mở lại trang gói hội viên sau vài giây.
              </p>
              {paymentState.response ? (
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-md bg-background p-3">
                    <p className="uppercase tracking-widest text-muted-foreground">Creator nhận</p>
                    <p className="mt-1 font-headline text-lg font-black text-foreground">
                      {formatCoins(paymentState.response.creatorCoins)} AC
                    </p>
                  </div>
                  <div className="rounded-md bg-background p-3">
                    <p className="uppercase tracking-widest text-muted-foreground">Platform</p>
                    <p className="mt-1 font-headline text-lg font-black text-foreground">
                      {formatCoins(paymentState.response.systemCoins)} AC
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="border-t border-border/30 bg-muted p-8">
          {walletError ? (
            <button
              type="button"
              onClick={onRetryWallet}
              className="inline-flex min-h-14 w-full items-center justify-center rounded-sm bg-primary px-4 py-4 font-headline text-xs font-black uppercase tracking-[0.2em] text-primary-foreground transition-all hover:opacity-90 active:scale-95"
            >
              Tải lại số dư
            </button>
          ) : hasInsufficientBalance ? (
            <Link
              href="/wallet"
              className="inline-flex min-h-14 w-full items-center justify-center rounded-sm bg-secondary px-4 py-4 font-headline text-xs font-black uppercase tracking-[0.2em] text-secondary-foreground transition-all hover:opacity-90 active:scale-95"
            >
              Nạp thêm Aura Coins
            </Link>
          ) : isSuccess ? (
            <Link
              href="/library/subscriptions"
              className="inline-flex min-h-14 w-full items-center justify-center rounded-sm bg-primary px-4 py-4 font-headline text-xs font-black uppercase tracking-[0.2em] text-primary-foreground transition-all hover:opacity-90 active:scale-95"
            >
              Xem gói hội viên
            </Link>
          ) : (
            <button
              type="button"
              disabled={!canConfirm}
              onClick={onConfirm}
              className="inline-flex min-h-14 w-full items-center justify-center rounded-sm bg-primary px-4 py-4 font-headline text-xs font-black uppercase tracking-[0.2em] text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
            >
              {isProcessing
                ? "Đang xử lý..."
                : walletLoading || !wallet
                  ? "Đang tải ví..."
                  : "Xác nhận đăng ký"}
            </button>
          )}
          <p className="mt-4 text-center text-[10px] leading-relaxed text-muted-foreground">
            Bằng cách xác nhận, bạn đồng ý thanh toán bằng Aura Coins và bật tự động gia hạn theo quy định membership.
          </p>
        </div>
      </div>
    </div>
  );
}
