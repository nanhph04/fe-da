"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

type TopUpSuccessFeatureProps = {
  amount?: number;
  bonusAmount?: number;
  paidAmount?: number;
  packageName?: string;
  referenceId?: string;
};

function getNumberLocale(locale: string) {
  return locale === "en" ? "en-US" : "vi-VN";
}

export function TopUpSuccessFeature({
  amount,
  bonusAmount,
  paidAmount,
  packageName,
  referenceId,
}: TopUpSuccessFeatureProps) {
  const t = useTranslations("Wallet.TopUpSuccess");
  const locale = useLocale();
  const walletNumberFormatter = useMemo(
    () => new Intl.NumberFormat(getNumberLocale(locale)),
    [locale]
  );
  const formatWalletNumber = (value: number) => walletNumberFormatter.format(value);
  const coinAmountLabel = (value: number) =>
    t("coinAmount", { amount: formatWalletNumber(value) });
  const packageLabel =
    packageName?.trim() ||
    (typeof amount === "number"
      ? typeof bonusAmount === "number" && bonusAmount > 0
        ? t("packageWithBonus", {
            amount: coinAmountLabel(amount),
            bonus: formatWalletNumber(bonusAmount),
          })
        : coinAmountLabel(amount)
      : t("packageFallback"));

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background font-body text-foreground antialiased">
      <header className="fixed top-0 z-50 flex w-full items-center justify-between bg-background/40 px-6 py-4 backdrop-blur-xl">
        <div className="font-headline text-2xl font-extrabold tracking-tight text-primary">Velvet Gallery</div>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-2xl text-muted-foreground">account_circle</span>
        </div>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-4 pt-24 pb-12">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] h-[50%] w-[50%] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute -right-[10%] -bottom-[10%] h-[40%] w-[40%] rounded-full bg-secondary/5 blur-[100px]" />
        </div>

        <div className="z-10 mx-auto flex w-full max-w-xl flex-col items-center">
          <div className="relative mb-8">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/10 shadow-[0_0_50px_rgba(229,9,20,0.18)]">
              <span className="material-symbols-outlined text-6xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
          </div>

          <div className="mb-10 text-center">
            <h1 className="mb-3 font-headline text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">{t("title")}</h1>
            <p className="text-lg text-muted-foreground">{t("description")}</p>
          </div>

          <div className="relative mb-6 flex w-full flex-col items-center justify-center overflow-hidden rounded-lg border-t border-primary/10 bg-card p-6">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
            <span className="mb-1 font-headline text-xs font-bold uppercase tracking-widest text-secondary">{t("coinsAdded")}</span>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
              <span className="font-headline text-4xl font-extrabold tracking-tight md:text-5xl">
                {typeof amount === "number" ? coinAmountLabel(amount) : t("completed")}
              </span>
            </div>
          </div>

          <div className="mb-12 w-full rounded-lg bg-card/80 p-6 shadow-2xl">
            <h3 className="mb-6 font-headline text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("transactionDetails")}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 py-2">
                <span className="font-medium text-muted-foreground">{t("package")}</span>
                <span className="text-right font-headline font-semibold text-foreground">{packageLabel}</span>
              </div>
              {typeof paidAmount === "number" ? (
                <div className="flex items-center justify-between gap-4 py-2">
                  <span className="font-medium text-muted-foreground">{t("amountPaid")}</span>
                  <span className="text-right font-headline font-semibold text-foreground">{t("currencyAmount", { amount: formatWalletNumber(paidAmount) })}</span>
                </div>
              ) : null}
              {referenceId ? (
                <div className="flex items-center justify-between gap-4 py-2">
                  <span className="font-medium text-muted-foreground">{t("orderId")}</span>
                  <span className="text-right font-mono text-sm text-foreground">#{referenceId}</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex w-full flex-col gap-4">
            <Link href="/library" passHref>
              <Button className="w-full rounded-sm bg-gradient-to-br from-primary to-primary/75 py-4 font-headline font-bold text-primary-foreground transition-all hover:brightness-110 active:scale-95">
                <span className="material-symbols-outlined mr-2">explore</span>
                {t("exploreContent")}
              </Button>
            </Link>
            <Link href="/wallet" passHref>
              <Button variant="outline" className="w-full rounded-sm border-border bg-transparent py-4 font-headline font-bold text-foreground transition-all hover:bg-muted active:scale-95">
                {t("viewWalletHistory")}
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="mt-auto py-8 text-center">
        <p className="text-xs text-muted-foreground">{t("secureReceipt")}</p>
      </footer>
    </div>
  );
}
