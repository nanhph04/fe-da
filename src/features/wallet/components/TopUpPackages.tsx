"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DepositService } from "../services/depositService";
import type { DepositPackage } from "../types/wallet.types";

interface TopUpPackagesProps {
  initialPackages?: DepositPackage[];
  onSelectPackage?: (depositPackage: DepositPackage) => void;
}

const sortPackages = (packages: DepositPackage[]) =>
  [...packages].sort((a, b) => a.sortOrder - b.sortOrder);

function getNumberLocale(locale: string) {
  return locale === "en" ? "en-US" : "vi-VN";
}

export function TopUpPackages({ initialPackages, onSelectPackage }: TopUpPackagesProps) {
  const t = useTranslations("Wallet.TopUpPackages");
  const locale = useLocale();
  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(getNumberLocale(locale)),
    [locale]
  );
  const [packages, setPackages] = useState<DepositPackage[]>(
    initialPackages ? sortPackages(initialPackages) : []
  );
  const [loading, setLoading] = useState(!initialPackages);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const formatWalletNumber = (value: number) => numberFormatter.format(value);

  useEffect(() => {
    if (initialPackages) {
      setPackages(sortPackages(initialPackages));
      setLoading(false);
      setHasError(false);
      return;
    }

    let isMounted = true;

    const fetchPackages = async () => {
      setLoading(true);
      setHasError(false);

      try {
        const data = await DepositService.getDepositPackages();

        if (isMounted) {
          setPackages(sortPackages(data));
        }
      } catch {
        if (isMounted) {
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchPackages();

    return () => {
      isMounted = false;
    };
  }, [initialPackages, retryCount]);

  return (
    <section className="space-y-8">
      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-headline text-xl font-bold text-foreground">{t("title")}</h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4" role="status" aria-label={t("loadingLabel")}>
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-80 animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      ) : hasError ? (
        <div className="rounded-lg border border-destructive/30 bg-card p-6 text-center">
          <h3 className="font-headline text-lg font-bold text-foreground">{t("errorTitle")}</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            {t("errorDescription")}
          </p>
          <Button
            type="button"
            onClick={() => setRetryCount((current) => current + 1)}
            className="mt-5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {t("retry")}
          </Button>
        </div>
      ) : packages.length === 0 ? (
        <div className="rounded-lg border border-border/20 bg-card p-6 text-center">
          <h3 className="font-headline text-lg font-bold text-foreground">{t("emptyTitle")}</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            {t("emptyDescription")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {packages.map((pkg, index) => {
            const isPopular = pkg.code.toUpperCase().includes("PRO") || index === 2;
            const packageName = t("packageName", {
              amount: formatWalletNumber(pkg.moneyAmount),
            });

            return (
              <Card
                key={pkg.id}
                className={`group relative overflow-hidden border-border/20 bg-card/60 transition-all duration-300 hover:bg-card ${
                  isPopular
                    ? "border-secondary/30 ring-1 ring-secondary/20 shadow-lg shadow-secondary/10"
                    : ""
                }`}
              >
                {isPopular ? (
                  <div className="absolute top-0 right-0 z-10 rounded-bl-lg bg-secondary px-3 py-1 text-[10px] font-black uppercase text-secondary-foreground">
                    {t("popularBadge")}
                  </div>
                ) : null}
                <CardContent className="flex h-full flex-col items-center p-6 text-center">
                  <h3 className="mb-1 font-headline text-lg font-bold text-foreground">{packageName}</h3>
                  <p className="mb-4 text-2xl font-bold text-secondary">
                    {formatWalletNumber(pkg.totalCoinAmount)} {t("coinUnit")}
                    {pkg.bonusCoinAmount > 0 ? (
                      <span className="ml-1 text-xs font-medium text-muted-foreground">
                        {t("bonusAmount", { amount: formatWalletNumber(pkg.bonusCoinAmount) })}
                      </span>
                    ) : null}
                  </p>

                  <div className="mb-6 flex h-32 items-center justify-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border border-secondary/30 bg-gradient-to-br from-secondary/20 to-transparent transition-transform duration-500 group-hover:scale-110">
                      <span
                        className="material-symbols-outlined text-4xl text-secondary"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                        aria-hidden="true"
                      >
                        monetization_on
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto flex w-full flex-col gap-4 border-t border-white/5 pt-4">
                    <span className="font-headline text-lg font-bold text-foreground">
                      {formatWalletNumber(pkg.moneyAmount)} {t("currencyUnit")}
                    </span>
                    <Button
                      type="button"
                      onClick={() => onSelectPackage?.(pkg)}
                      className={`w-full font-bold transition-colors active:scale-95 ${
                        isPopular
                          ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                    >
                      {t("buyNow")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
