"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2, ShieldCheck, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/shared/api/client";
import { useLocale, useTranslations } from "next-intl";
import { DepositService } from "../services/depositService";
import type { Deposit, DepositPackage } from "../types/wallet.types";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  getPersistedSession,
  setPersistedSession,
  clearPersistedSession,
} from "@/shared/utils/idempotency";
import { useRouter } from "@/i18n/routing";
import { usePayOS } from "@payos/payos-checkout";

// Monkey-patch JSON.parse to prevent @payos/payos-checkout from throwing
// "Uncaught SyntaxError: "[object Object]" is not valid JSON" when it receives
// a pre-parsed JavaScript object in window message events.
if (typeof window !== "undefined") {
  const originalJSONParse = JSON.parse;
  JSON.parse = function (text: any, reviver?: any) {
    if (typeof text === "object" && text !== null) {
      return text;
    }
    return originalJSONParse(text, reviver);
  } as any;
}

interface EmbeddedPayOsCheckoutProps {
  selectedPackage: DepositPackage;
  onClose?: () => void;
}

const PAYOS_CHECKOUT_CONTAINER_ID = "payos-checkout-container";

const walletNumberFormatter = new Intl.NumberFormat("vi-VN");

function formatWalletNumber(value: number) {
  return walletNumberFormatter.format(value);
}

function getPayOsIframe() {
  if (typeof document === "undefined") {
    return null;
  }

  return document.getElementById(PAYOS_CHECKOUT_CONTAINER_ID)?.querySelector("iframe") ?? null;
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
  const t = useTranslations("Wallet.EmbeddedCheckout");
  const { user } = useAuth();
  const userId = user?.userId || "guest";

  const router = useRouter();
  const depositRef = useRef<Deposit | null>(null);
  const selectedPackageRef = useRef(selectedPackage);

  useEffect(() => {
    depositRef.current = deposit;
  }, [deposit]);

  useEffect(() => {
    selectedPackageRef.current = selectedPackage;
  }, [selectedPackage]);

  useEffect(() => {
    paymentAttemptKeyRef.current = null;
    setCheckoutUrl("");
    setDeposit(null);
    setIsProcessing(false);
    setError(null);
  }, [selectedPackage.id]);

  const { open, exit } = usePayOS({
    RETURN_URL: typeof window !== "undefined" ? `${window.location.origin}/wallet/success` : "",
    ELEMENT_ID: PAYOS_CHECKOUT_CONTAINER_ID,
    CHECKOUT_URL: checkoutUrl,
    embedded: true,
    onSuccess: () => {
      const pkg = selectedPackageRef.current;
      const dep = depositRef.current;
      const successUrl = `/wallet/success?amount=${pkg.totalCoinAmount}&bonus=${pkg.bonusCoinAmount}&paid=${pkg.moneyAmount}&packageName=${encodeURIComponent(pkg.name)}&referenceId=${dep?.paymentCode || dep?.id || ""}`;
      router.push(successUrl);
    },
    onCancel: () => {
      resetPayment();
    },
    onExit: () => {
      resetPayment();
    },
  });

  const openRef = useRef(open);
  const exitRef = useRef(exit);

  useEffect(() => {
    openRef.current = open;
    exitRef.current = exit;
  }, [open, exit]);

  useEffect(() => {
    if (checkoutUrl) {
      openRef.current();
    }
  }, [checkoutUrl]);

  useEffect(() => {
    return () => {
      if (getPayOsIframe()) {
        try {
          exitRef.current();
        } catch {
          // PayOS cleanup is best-effort because the iframe may already be removed.
        }
      }
    };
  }, []);

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
      const createdDeposit = await DepositService.createDeposit(
        selectedPackage.id,
        paymentAttemptKeyRef.current ?? undefined
      );

      if (!createdDeposit.checkoutUrl) {
        throw new Error("Backend chua tra checkoutUrl cho giao dich PayOS.");
      }

      const paymentUrl = getValidCheckoutUrl(createdDeposit.checkoutUrl);
      setDeposit(createdDeposit);
      setCheckoutUrl(paymentUrl);
      clearPersistedSession(storageKey);
      setIsProcessing(false);
    } catch (err) {
      // Giữ nguyên key trong ref và sessionStorage để cho phép người dùng retry
      setIsProcessing(false);
      setError(getErrorMessage(err, t("errors.createPaymentFailed")));
    }
  };

  const resetPayment = () => {
    if (getPayOsIframe()) {
      try {
        exitRef.current();
      } catch {
        // PayOS cleanup is best-effort because the iframe may already be removed.
      }
    }
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

  const content = (
    <section className="relative min-h-[100dvh] overflow-hidden rounded-none border border-border/20 bg-card shadow-2xl sm:min-h-0 sm:rounded-lg">
      <div className="flex flex-row items-start justify-between gap-3 border-b border-border/20 bg-muted px-4 py-4 sm:px-6 sm:py-5 md:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">
            {t("hostedCheckout")}
          </p>
          <h3 className="font-headline text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            {selectedPackage.name} - {formatWalletNumber(selectedPackage.totalCoinAmount)} AC
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="rounded-sm bg-secondary/10 px-3 py-1 text-sm font-bold text-secondary">
            {formatWalletNumber(selectedPackage.moneyAmount)} VND
          </span>
          {onClose ? (
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-border/40 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={t("closePanel")}
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
              {t("creatingCheckout")}
            </h4>
            <p className="text-sm text-muted-foreground">{t("dontClosePanel")}</p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 p-4 sm:gap-6 sm:p-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4 sm:space-y-5">
          <div className="rounded-lg border-l-4 border-secondary bg-background/40 p-4 sm:p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-secondary">
              {t("selectedPackage")}
            </p>
            <p className="mt-2 font-headline text-2xl font-black text-foreground sm:text-3xl">
              {formatWalletNumber(selectedPackage.totalCoinAmount)} AC
            </p>
            {selectedPackage.bonusCoinAmount > 0 ? (
              <p className="mt-2 text-sm font-bold text-secondary">
                {t("bonusCoins", { amount: formatWalletNumber(selectedPackage.bonusCoinAmount) })}
              </p>
            ) : null}
            <div className="mt-5 border-t border-border/30 pt-5">
              <p className="text-sm text-muted-foreground">{t("totalPayable")}</p>
              <p className="font-headline text-xl font-bold text-foreground">
                {formatWalletNumber(selectedPackage.moneyAmount)} VND
              </p>
            </div>
          </div>

          <div className="grid gap-3 rounded-lg bg-background/40 p-4 sm:gap-4 sm:p-5 md:grid-cols-2 xl:grid-cols-1">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 h-5 w-5 text-primary" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold text-foreground">{t("hostedByPayOS")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("hostedDescription")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ExternalLink className="mt-1 h-5 w-5 text-primary" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold text-foreground">{t("webhookVerified")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("webhookDescription")}
                </p>
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          {checkoutUrl && !isProcessing ? (
            <div className="rounded-lg border border-border/20 bg-background/40 p-3 sm:p-4 md:p-6">
              <style dangerouslySetInnerHTML={{ __html: `
                #payos-checkout-container > iframe {
                  display: block;
                  width: 100% !important;
                  height: 100% !important;
                  min-height: 100% !important;
                  border: 0;
                  transform: scale(1.04);
                  transform-origin: top center;
                }

                @media (min-width: 640px) {
                  #payos-checkout-container > iframe {
                    transform: scale(1.12);
                  }
                }
              `}} />
              <div
                id={PAYOS_CHECKOUT_CONTAINER_ID}
                className="h-[520px] w-full overflow-hidden rounded-lg border border-border/10 bg-background/30 sm:h-[620px] md:h-[680px]"
              />
              <div className="mt-4 flex flex-col gap-3 border-t border-border/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                {deposit ? (
                  <span className="text-sm font-semibold text-muted-foreground">
                    {t("codeLabel")}<strong className="font-mono text-lg font-black text-foreground md:text-xl">{deposit.paymentCode || deposit.id}</strong>
                  </span>
                ) : <span />}
                <Button
                  variant="outline"
                  onClick={resetPayment}
                  className="w-full rounded-sm border-border bg-transparent text-sm font-bold text-foreground transition-all hover:bg-muted sm:w-auto"
                >
                  {t("cancel")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-border/20 bg-background/40 p-8 text-center">
              <span className="material-symbols-outlined text-6xl text-secondary">
                qr_code_scanner
              </span>
              <h4 className="mt-4 font-headline text-2xl font-bold text-foreground">
                {t("continueToPayOS")}
              </h4>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                {t("continueDescription")}
              </p>

              {error ? (
                <div className="mx-auto mt-6 flex max-w-md items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-left text-sm text-destructive">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                  <p>{error}</p>
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
                {t("continueToPayOS")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );

  if (onClose) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-0 backdrop-blur-sm sm:p-4 md:p-6"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
      >
        <div className="relative min-h-[100dvh] w-full sm:my-auto sm:min-h-0 sm:max-w-5xl">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
