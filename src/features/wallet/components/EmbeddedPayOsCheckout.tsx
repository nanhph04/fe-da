"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2, ShieldCheck, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/shared/api/client";
import { useLocale } from "next-intl";
import { DepositService } from "../services/depositService";
import type { Deposit, DepositPackage } from "../types/wallet.types";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  getPersistedSession,
  setPersistedSession,
  clearPersistedSession,
} from "@/shared/utils/idempotency";

interface EmbeddedPayOsCheckoutProps {
  selectedPackage: DepositPackage;
  onClose?: () => void;
}

const walletNumberFormatter = new Intl.NumberFormat("vi-VN");

function formatWalletNumber(value: number) {
  return walletNumberFormatter.format(value);
}

function createPaymentAttemptKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `deposit-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getValidCheckoutUrl(checkoutUrl: string) {
  const paymentUrl = new URL(checkoutUrl);

  if (!paymentUrl.protocol.startsWith("http")) {
    throw new Error("Backend tra checkoutUrl khong hop le.");
  }

  return paymentUrl.toString();
}

export function EmbeddedPayOsCheckout({
  selectedPackage,
  onClose,
}: EmbeddedPayOsCheckoutProps) {
  const paymentAttemptKeyRef = useRef<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [deposit, setDeposit] = useState<Deposit | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();
  const { user } = useAuth();
  const userId = user?.userId || "guest";

  useEffect(() => {
    paymentAttemptKeyRef.current = null;
    setCheckoutUrl("");
    setDeposit(null);
    setIsProcessing(false);
    setError(null);
  }, [selectedPackage.id]);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);
    setCheckoutUrl("");
    setDeposit(null);

    const storageKey = `deposit-attempt:${userId}:${selectedPackage.id}`;

    if (!paymentAttemptKeyRef.current) {
      const persisted = getPersistedSession(storageKey);
      if (persisted) {
        paymentAttemptKeyRef.current = persisted.idempotencyKey;
      } else {
        paymentAttemptKeyRef.current = createPaymentAttemptKey();
        setPersistedSession(storageKey, { idempotencyKey: paymentAttemptKeyRef.current, requestId: "" });
      }
    }

    try {
      const returnUrl = `${window.location.origin}/${locale}/wallet/success`;
      const cancelUrl = `${window.location.origin}/${locale}/wallet`;

      const createdDeposit = await DepositService.createDeposit(
        selectedPackage.id,
        paymentAttemptKeyRef.current,
        returnUrl,
        cancelUrl
      );

      if (!createdDeposit.checkoutUrl) {
        throw new Error("Backend chua tra checkoutUrl cho giao dich PayOS.");
      }

      const paymentUrl = getValidCheckoutUrl(createdDeposit.checkoutUrl);
      setDeposit(createdDeposit);
      setCheckoutUrl(paymentUrl);
      clearPersistedSession(storageKey);
      window.location.assign(paymentUrl);
    } catch (err) {
      // Giữ nguyên key trong ref và sessionStorage để cho phép người dùng retry
      setIsProcessing(false);
      setError(getErrorMessage(err, "Khong the tao thanh toan PayOS. Vui long thu lai."));
    }
  };

  const resetPayment = () => {
    const storageKey = `deposit-attempt:${userId}:${selectedPackage.id}`;
    clearPersistedSession(storageKey);
    paymentAttemptKeyRef.current = null;
    setCheckoutUrl("");
    setDeposit(null);
    setIsProcessing(false);
    setError(null);
  };

  const handleClose = () => {
    resetPayment();
    onClose?.();
  };

  return (
    <section className="relative overflow-hidden rounded-lg border border-border/20 bg-card shadow-2xl">
      <div className="flex flex-col justify-between gap-4 border-b border-border/20 bg-muted px-6 py-5 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">
            PayOS Hosted Checkout
          </p>
          <h3 className="font-headline text-2xl font-extrabold tracking-tight text-foreground">
            {selectedPackage.name} - {formatWalletNumber(selectedPackage.totalCoinAmount)} AC
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-sm bg-secondary/10 px-3 py-1 text-sm font-bold text-secondary">
            {formatWalletNumber(selectedPackage.moneyAmount)} VND
          </span>
          {onClose ? (
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-border/40 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Close payment panel"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      {isProcessing ? (
        <div className="absolute inset-0 z-50 flex min-h-[420px] items-center justify-center bg-card/90">
          <div className="space-y-4 text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-secondary" aria-hidden="true" />
            <h4 className="font-headline text-xl font-bold text-foreground">
              Creating PayOS checkout...
            </h4>
            <p className="text-sm text-muted-foreground">Please do not close this panel.</p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-5">
          <div className="rounded-lg border-l-4 border-secondary bg-background/40 p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-secondary">
              Selected Package
            </p>
            <p className="mt-2 font-headline text-3xl font-black text-foreground">
              {formatWalletNumber(selectedPackage.totalCoinAmount)} AC
            </p>
            {selectedPackage.bonusCoinAmount > 0 ? (
              <p className="mt-2 text-sm font-bold text-secondary">
                + {formatWalletNumber(selectedPackage.bonusCoinAmount)} bonus coins
              </p>
            ) : null}
            <div className="mt-5 border-t border-border/30 pt-5">
              <p className="text-sm text-muted-foreground">Total payable</p>
              <p className="font-headline text-xl font-bold text-foreground">
                {formatWalletNumber(selectedPackage.moneyAmount)} VND
              </p>
            </div>
          </div>

          <div className="space-y-4 rounded-lg bg-background/40 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 h-5 w-5 text-primary" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold text-foreground">Hosted by PayOS</p>
                <p className="text-xs text-muted-foreground">
                  You will continue on the official PayOS payment page.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ExternalLink className="mt-1 h-5 w-5 text-primary" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold text-foreground">Webhook verified</p>
                <p className="text-xs text-muted-foreground">
                  Aura Coins are added after backend confirmation.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="rounded-lg border border-border/20 bg-background/40 p-8 text-center">
            <span className="material-symbols-outlined text-6xl text-secondary">
              qr_code_scanner
            </span>
            <h4 className="mt-4 font-headline text-2xl font-bold text-foreground">
              Continue to PayOS
            </h4>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              We will create a deposit request and send you to the hosted PayOS checkout page.
            </p>

            {error ? (
              <div className="mx-auto mt-6 flex max-w-md items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-left text-sm text-destructive">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <p>{error}</p>
              </div>
            ) : null}

            {checkoutUrl && !isProcessing ? (
              <div className="mx-auto mt-6 max-w-md rounded-lg border border-border/30 bg-muted p-4 text-sm text-muted-foreground">
                <p>Payment page is ready.</p>
                {deposit ? (
                  <p className="mt-2 text-xs font-bold uppercase tracking-widest text-secondary">
                    Reference: {deposit.paymentCode || deposit.id}
                  </p>
                ) : null}
                <a
                  href={checkoutUrl}
                  className="mt-3 inline-flex font-bold text-secondary hover:text-secondary/80"
                >
                  Open PayOS checkout
                </a>
              </div>
            ) : null}

            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="mt-8 w-full max-w-sm bg-secondary py-7 text-base font-black uppercase tracking-widest text-secondary-foreground shadow-[0px_10px_30px_rgba(245,158,11,0.3)] transition-all hover:bg-secondary/90 active:scale-95"
            >
              {isProcessing ? (
                <Loader2 className="mr-3 h-5 w-5 animate-spin" aria-hidden="true" />
              ) : (
                <ExternalLink className="mr-3 h-5 w-5" aria-hidden="true" />
              )}
              Continue to PayOS
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
