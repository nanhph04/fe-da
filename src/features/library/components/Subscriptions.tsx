"use client";

import { Link } from "@/i18n/routing";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  mediaService,
  type AutoRenewMembershipResponse,
  type UserMembershipResponse,
} from "@/features/watch/services/mediaService";
import { createAsyncState, isAsyncError, isAsyncLoading, isAsyncSuccess } from "@/shared/api/async-state";
import { getErrorMessage } from "@/shared/api/client";

type AutoRenewActionStatus = "loading" | "success" | "error";

type AutoRenewActionState = {
  status: AutoRenewActionStatus;
  message: string | null;
};

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "A";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatDate(value: string | null, locale: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getMembershipCardTone(
  membership: UserMembershipResponse,
  isAutoRenewDisabled: boolean,
) {
  if (!membership.isActive) {
    return {
      labelKey: "status.expired",
      icon: "schedule",
      badgeClassName: "border-border/30 bg-muted/40 text-muted-foreground",
      accentClassName: "from-muted-foreground/20",
    };
  }

  if (isAutoRenewDisabled) {
    return {
      labelKey: "status.accessUntil",
      icon: "event_available",
      badgeClassName: "border-secondary/30 bg-secondary/10 text-secondary",
      accentClassName: "from-secondary/20",
    };
  }

  return {
    labelKey: "status.active",
    icon: "verified",
    badgeClassName: "border-primary/30 bg-primary/10 text-primary",
    accentClassName: "from-primary/20",
  };
}

const MEMBERSHIP_LIST_LIMIT = 5;

interface SubscriptionsProps {
  refreshKey?: number;
}

export function Subscriptions({ refreshKey = 0 }: SubscriptionsProps) {
  const t = useTranslations("Library.Subscriptions");
  const locale = useLocale();
  const [state, setState] = useState(() =>
    createAsyncState<UserMembershipResponse[]>([])
  );
  const [failedAvatarUrls, setFailedAvatarUrls] = useState<Set<string>>(new Set());
  const [renewalRecords, setRenewalRecords] = useState<Record<string, AutoRenewMembershipResponse>>({});
  const [autoRenewActions, setAutoRenewActions] = useState<Record<string, AutoRenewActionState>>({});

  const formatCoinAmount = (value: number) =>
    new Intl.NumberFormat(locale).format(value);

  const formatExpiryDate = (value: string | null, isActive: boolean) => {
    const formattedDate = formatDate(value, locale);

    if (!value) {
      return isActive ? t("expiry.active") : t("expiry.noExpiry");
    }

    if (!formattedDate) {
      return isActive ? t("expiry.active") : t("expiry.unknown");
    }

    return isActive
      ? t("expiry.expires", { date: formattedDate })
      : t("expiry.expired", { date: formattedDate });
  };

  const getAccessUntilText = (value: string | null) => {
    const formattedDate = formatDate(value, locale);

    if (!formattedDate) {
      return t("autoRenew.accessUntilFallback");
    }

    return t("autoRenew.accessUntilDate", { date: formattedDate });
  };

  const getAutoRenewStatusText = (
    membership: UserMembershipResponse,
    renewalRecord?: AutoRenewMembershipResponse,
  ) => {
    if (!membership.isActive) {
      return t("autoRenew.statusInactive");
    }

    if (renewalRecord?.autoRenewEnabled === false || renewalRecord?.renewalStatus === "disabled") {
      return t("autoRenew.statusDisabled");
    }

    return t("autoRenew.statusEnabled");
  };

  useEffect(() => {
    let isMounted = true;

    async function loadMemberships() {
      try {
        setState((current) => ({ ...current, status: "loading", error: null }));
        const response = await mediaService.getMyMemberships({ page: 1, limit: MEMBERSHIP_LIST_LIMIT });
        if (isMounted && response.success && response.data) {
          setState({ status: "success", data: response.data, error: null });
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load memberships", err);
          setState({
            status: "error",
            data: [],
            error: getErrorMessage(err, t("errors.loadFailed")),
          });
        }
      }
    }

    void loadMemberships();

    return () => {
      isMounted = false;
    };
  }, [refreshKey, t]);

  const cancelAutoRenew = async (membership: UserMembershipResponse) => {
    const membershipRecordId = membership.membershipId;

    if (!membership.isActive) {
      return;
    }

    setAutoRenewActions((current) => ({
      ...current,
      [membershipRecordId]: { status: "loading", message: null },
    }));

    try {
      const response = await mediaService.updateMembershipAutoRenew(membershipRecordId, false);

      if (!response.success || !response.data) {
        throw new Error(response.mess || t("errors.cancelFailed"));
      }

      setRenewalRecords((current) => ({
        ...current,
        [membershipRecordId]: response.data,
      }));
      setAutoRenewActions((current) => ({
        ...current,
        [membershipRecordId]: {
          status: "success",
          message: getAccessUntilText(response.data.expiryDate ?? membership.expiryDate),
        },
      }));
    } catch (err) {
      console.error("Failed to cancel membership auto-renew", err);
      setAutoRenewActions((current) => ({
        ...current,
        [membershipRecordId]: {
          status: "error",
          message: getErrorMessage(err, t("errors.cancelFailedRetry")),
        },
      }));
    }
  };

  const items = state.data;
  const isLoading = isAsyncLoading(state);
  const isError = isAsyncError(state);
  const isEmpty = isAsyncSuccess(state) && items.length === 0;
  const hasItems = isAsyncSuccess(state) && items.length > 0;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="font-headline text-xs font-black uppercase tracking-[0.24em] text-secondary">
            {t("eyebrow")}
          </p>
          <h2 className="text-balance font-headline text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
            {t("title")}
          </h2>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-md border border-border/30 bg-card px-3 py-2 text-xs font-semibold text-muted-foreground">
          <span className="material-symbols-outlined text-[18px] text-secondary" aria-hidden="true">
            local_activity
          </span>
          {isLoading ? t("loadingCount") : t("channelCount", { count: items.length })}
        </div>
      </div>

      <div className="space-y-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-lg border border-border/30 bg-card p-4"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-secondary/30 via-border/30 to-transparent" />
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-muted" />
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-14 animate-pulse rounded-md bg-muted/70" />
                      <div className="h-14 animate-pulse rounded-md bg-muted/70" />
                      <div className="h-14 animate-pulse rounded-md bg-muted/70" />
                    </div>
                    <div className="h-20 animate-pulse rounded-md bg-muted/60" />
                  </div>
                </div>
              </div>
            ))
          : null}

        {isError ? (
          <div className="rounded-lg border border-destructive/30 bg-card p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <span className="material-symbols-outlined" aria-hidden="true">
                  error
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="font-headline text-lg font-bold text-foreground">
                  {t("errorTitle")}
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">{state.error}</p>
              </div>
            </div>
          </div>
        ) : null}

        {isEmpty ? (
          <div className="relative overflow-hidden rounded-lg border border-border/30 bg-card p-6">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-secondary/40 via-border/30 to-transparent" />
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-md space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-secondary/25 bg-secondary/10 text-secondary">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    subscriptions
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-headline text-xl font-bold text-foreground">
                    {t("emptyTitle")}
                  </h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {t("emptyDescription")}
                  </p>
                </div>
              </div>
              <Link
                href="/"
                className="inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-4 py-2 font-headline text-xs font-black uppercase tracking-[0.18em] text-primary-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring/70"
              >
                {t("emptyCta")}
              </Link>
            </div>
          </div>
        ) : null}

        {hasItems
          ? items.map((membership) => {
              const avatarFailed = membership.channelAvatarUrl
                ? failedAvatarUrls.has(membership.channelAvatarUrl)
                : false;
              const showAvatar = Boolean(membership.channelAvatarUrl && !avatarFailed);
              const renewalRecord = renewalRecords[membership.membershipId];
              const actionState = autoRenewActions[membership.membershipId];
              const isCancelling = actionState?.status === "loading";
              const isAutoRenewDisabled =
                renewalRecord?.autoRenewEnabled === false || renewalRecord?.renewalStatus === "disabled";
              const canCancelAutoRenew = membership.isActive && !isAutoRenewDisabled;
              const tone = getMembershipCardTone(membership, isAutoRenewDisabled);

              return (
                <article
                  key={membership.membershipId}
                  className={cn(
                    "group relative overflow-hidden rounded-lg border border-border/30 bg-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted/30",
                    !membership.isActive && "opacity-85",
                  )}
                >
                  <div
                    className={cn(
                      "absolute inset-x-0 top-0 h-px bg-gradient-to-r via-border/40 to-transparent",
                      tone.accentClassName,
                    )}
                  />
                  <div className="space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-border/40 bg-gradient-to-br from-muted to-background text-sm font-black text-foreground transition-colors group-hover:border-primary/50">
                          {showAvatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              alt={membership.channelName}
                              src={membership.channelAvatarUrl || ""}
                              className="h-full w-full object-cover"
                              onError={() => {
                                if (!membership.channelAvatarUrl) return;
                                setFailedAvatarUrls((current) => new Set(current).add(membership.channelAvatarUrl || ""));
                              }}
                            />
                          ) : (
                            <span>{getInitials(membership.channelName)}</span>
                          )}
                        </div>

                        <div className="min-w-0 space-y-2">
                          <div className="min-w-0">
                            <h4 className="truncate font-headline text-base font-extrabold tracking-tight text-foreground">
                              {membership.channelName}
                            </h4>
                            <p className="text-xs leading-5 text-muted-foreground">
                              {t("tierLine", { level: membership.tierLevel, tierName: membership.tierName })}
                            </p>
                          </div>
                          <p className={cn("text-xs font-semibold", membership.isActive ? "text-secondary" : "text-muted-foreground")}>
                            {formatExpiryDate(membership.expiryDate, membership.isActive)}
                          </p>
                        </div>
                      </div>

                      <span
                        className={cn(
                          "inline-flex h-8 w-fit shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-[10px] font-black uppercase tracking-[0.16em]",
                          tone.badgeClassName,
                        )}
                      >
                        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                          {tone.icon}
                        </span>
                        {t(tone.labelKey)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-md border border-border/20 bg-background/55 p-3">
                        <p className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                          {t("metricLevel")}
                        </p>
                        <p className="mt-1 font-headline text-base font-black text-foreground">
                          {t("levelShort", { level: membership.tierLevel })}
                        </p>
                      </div>
                      <div className="rounded-md border border-border/20 bg-background/55 p-3">
                        <p className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                          {t("metricPlan")}
                        </p>
                        <p className="mt-1 truncate font-headline text-sm font-bold text-foreground">
                          {membership.tierName}
                        </p>
                      </div>
                      <div className="rounded-md border border-border/20 bg-background/55 p-3">
                        <p className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                          {t("metricPrice")}
                        </p>
                        <p className="mt-1 font-headline text-sm font-black text-secondary">
                          {t("price", { amount: formatCoinAmount(membership.priceCoin) })}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-md border border-border/25 bg-background/60 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary/10 text-secondary">
                          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                            autorenew
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <p className="font-headline text-sm font-bold text-foreground">
                            {getAutoRenewStatusText(membership, renewalRecord)}
                          </p>
                          <p className="text-xs leading-5 text-muted-foreground">
                            {isAutoRenewDisabled
                              ? getAccessUntilText(renewalRecord?.expiryDate ?? membership.expiryDate)
                              : membership.isActive
                                ? t("autoRenew.enabledDescription")
                                : t("autoRenew.inactiveDescription")}
                          </p>
                          {actionState?.status === "error" && actionState.message ? (
                            <p className="rounded-sm border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs leading-relaxed text-destructive">
                              {actionState.message}
                            </p>
                          ) : null}
                          {actionState?.status === "success" && actionState.message ? (
                            <p className="rounded-sm border border-secondary/20 bg-secondary/10 px-3 py-2 text-xs leading-relaxed text-secondary">
                              {actionState.message}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        disabled={!canCancelAutoRenew || isCancelling}
                        onClick={() => void cancelAutoRenew(membership)}
                        className="inline-flex min-h-11 items-center justify-center rounded-sm border border-destructive/30 bg-destructive/10 px-3 py-2 font-headline text-[11px] font-black uppercase tracking-[0.16em] text-destructive transition-all duration-200 hover:-translate-y-0.5 hover:bg-destructive hover:text-destructive-foreground active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring/70 disabled:cursor-not-allowed disabled:border-border/20 disabled:bg-muted disabled:text-muted-foreground disabled:hover:translate-y-0"
                      >
                        {isCancelling
                          ? t("actions.cancelling")
                          : isAutoRenewDisabled
                            ? t("actions.cancelled")
                            : t("actions.cancel")}
                      </button>
                      <Link
                        href={`/creator/${membership.channelId}/join`}
                        className="inline-flex min-h-11 items-center justify-center rounded-sm border border-border/40 bg-background px-3 py-2 font-headline text-[11px] font-black uppercase tracking-[0.16em] text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-muted active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring/70"
                      >
                        {t("actions.manage")}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })
          : null}
      </div>
    </section>
  );
}
