"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { getErrorMessage } from "@/shared/api/client";
import type { ApiPagination } from "@/shared/api/types";

import { adminChannelService } from "../services/adminUserService";
import type {
  AdminChannelListItem,
  AdminChannelListParams,
  AdminChannelsSummary,
  AdminChannelStatus,
  AdminMembershipReviewStatus,
} from "../types/admin-user.types";

const initialPagination: ApiPagination = { page: 1, limit: 20, total: 0, totalPages: 0 };
const statusFilters: Array<{ translationKey: "all" | AdminChannelStatus; value: AdminChannelStatus | "all" }> = [
  { translationKey: "all", value: "all" },
  { translationKey: "active", value: "active" },
  { translationKey: "inactive", value: "inactive" },
  { translationKey: "suspended", value: "suspended" },
];

type SummaryTone = "default" | "secondary" | "success" | "danger" | "muted";

function getIntlLocale(locale: string) {
  return locale === "en" ? "en-US" : "vi-VN";
}

function formatCount(value: number | null | undefined, numberFormatter: Intl.NumberFormat) {
  if (typeof value !== "number") {
    return "-";
  }

  return numberFormatter.format(value);
}

function formatDate(value: string | null | undefined, locale: string, fallback: string) {
  if (!value) {
    return fallback;
  }

  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function getChannelStatusLabel(status: string, t: ReturnType<typeof useTranslations>) {
  if (status === "active" || status === "inactive" || status === "suspended") {
    return t(`statuses.${status}`);
  }

  return status.replace(/_/g, " ");
}

function getMembershipReviewLabel(status: AdminMembershipReviewStatus, t: ReturnType<typeof useTranslations>) {
  return t(`reviewStatuses.${status}`);
}

function getInitials(name: string) {
  const cleaned = name.trim();
  return cleaned.charAt(0).toUpperCase() || "C";
}

function getStatusTone(status: string) {
  if (status === "active") {
    return "text-emerald-400";
  }

  if (status === "inactive") {
    return "text-secondary";
  }

  return "text-primary";
}

function getStatusIcon(status: string) {
  if (status === "active") {
    return "verified";
  }

  if (status === "inactive") {
    return "pause_circle";
  }

  return "block";
}

function getReviewTone(status: AdminMembershipReviewStatus) {
  if (status === "approved") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  }

  if (status === "pending") {
    return "border-secondary/30 bg-secondary/10 text-secondary";
  }

  if (status === "rejected") {
    return "border-primary/30 bg-primary/10 text-primary";
  }

  return "border-border/30 bg-muted text-muted-foreground";
}

function buildSummaryCards(summary: AdminChannelsSummary | null, t: ReturnType<typeof useTranslations>, numberFormatter: Intl.NumberFormat) {
  return [
    {
      label: t("summary.totalChannels"),
      value: formatCount(summary?.totalChannels, numberFormatter),
      detail: summary ? t("summary.activeIn30Days", { count: formatCount(summary.activeCreators30d, numberFormatter) }) : t("summary.mediaServiceUnavailable"),
      icon: "tv",
      tone: "default",
    },
    {
      label: t("summary.membershipReady"),
      value: formatCount(summary?.eligibleForMembership, numberFormatter),
      detail: summary ? t("summary.approvedToSellTiers", { count: formatCount(summary?.membershipApproved, numberFormatter) }) : t("summary.waiting"),
      icon: "workspace_premium",
      tone: "secondary",
    },
    {
      label: t("summary.reviewQueue"),
      value: formatCount(summary?.membershipPendingReview, numberFormatter),
      detail: summary ? t("summary.rejectedHistorically", { count: formatCount(summary?.membershipRejected, numberFormatter) }) : t("summary.adminApprovalQueue"),
      icon: "pending_actions",
      tone: "danger",
    },
    {
      label: t("summary.membershipClosed"),
      value: formatCount(summary?.membershipClosedByAdmin, numberFormatter),
      detail: summary ? t("summary.uploadingNow", { count: formatCount(summary.uploadingNow, numberFormatter) }) : t("summary.noChannelMetrics"),
      icon: "admin_panel_settings",
      tone: "muted",
    },
  ] satisfies Array<{
    label: string;
    value: string;
    detail: string;
    icon: string;
    tone: SummaryTone;
  }>;
}

function getSummaryToneClass(tone: SummaryTone) {
  if (tone === "secondary") {
    return "border-l-secondary text-secondary";
  }

  if (tone === "success") {
    return "border-l-emerald-500 text-emerald-400";
  }

  if (tone === "danger") {
    return "border-l-primary text-primary";
  }

  if (tone === "muted") {
    return "border-l-muted text-muted-foreground";
  }

  return "border-l-border text-foreground";
}

export function ChannelManagementFeature() {
  const t = useTranslations("Admin.channels");
  const locale = useLocale();
  const numberFormatter = useMemo(() => new Intl.NumberFormat(getIntlLocale(locale)), [locale]);
  const dateFallback = t("fallbacks.notRecorded");

  const [summary, setSummary] = useState<AdminChannelsSummary | null>(null);
  const [channels, setChannels] = useState<AdminChannelListItem[]>([]);
  const [pagination, setPagination] = useState<ApiPagination>(initialPagination);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [ownerInput, setOwnerInput] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [status, setStatus] = useState<AdminChannelStatus | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actingChannelId, setActingChannelId] = useState<string | null>(null);
  const [rejectChannelId, setRejectChannelId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const queryParams = useMemo<AdminChannelListParams>(
    () => ({
      page,
      limit: pagination.limit || 20,
      status: status === "all" ? undefined : status,
      ownerId: ownerId || undefined,
      q: search || undefined,
    }),
    [ownerId, page, pagination.limit, search, status]
  );

  const loadSummary = useCallback(async () => {
    setIsSummaryLoading(true);
    setSummaryError(null);

    try {
      const data = await adminChannelService.getSummary();
      setSummary(data);
    } catch (err) {
      setSummary(null);
      setSummaryError(getErrorMessage(err, t("errors.summaryFailed")));
    } finally {
      setIsSummaryLoading(false);
    }
  }, [t]);

  const loadChannels = useCallback(async (params: AdminChannelListParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await adminChannelService.getChannels(params);
      setChannels(data.items);
      setPagination(data.pagination);
    } catch (err) {
      setChannels([]);
      setPagination(initialPagination);
      setError(getErrorMessage(err, t("errors.loadFailed")));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsSummaryLoading(true);
      setSummaryError(null);

      try {
        const data = await adminChannelService.getSummary();
        if (!cancelled) {
          setSummary(data);
        }
      } catch (err) {
        if (!cancelled) {
          setSummary(null);
          setSummaryError(getErrorMessage(err, t("errors.summaryFailed")));
        }
      } finally {
        if (!cancelled) {
          setIsSummaryLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [t]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await adminChannelService.getChannels(queryParams);
        if (!cancelled) {
          setChannels(data.items);
          setPagination(data.pagination);
        }
      } catch (err) {
        if (!cancelled) {
          setChannels([]);
          setPagination(initialPagination);
          setError(getErrorMessage(err, t("errors.loadFailed")));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [queryParams, t]);

  const refreshData = useCallback(async () => {
    await Promise.all([loadSummary(), loadChannels(queryParams)]);
  }, [loadChannels, loadSummary, queryParams]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
    setOwnerId(ownerInput.trim());
  };

  const handleStatusAction = async (channel: AdminChannelListItem) => {
    const action = channel.status === "suspended" ? "unlock" : "lock";
    setActionError(null);
    setActingChannelId(channel.id);

    try {
      await adminChannelService.updateStatus(channel.id, { action });
      await refreshData();
    } catch (err) {
      setActionError(getErrorMessage(err, action === "lock" ? t("errors.lockFailed") : t("errors.unlockFailed")));
    } finally {
      setActingChannelId(null);
    }
  };

  const handleMembershipAvailability = async (channel: AdminChannelListItem) => {
    const action = channel.isMembershipClosedByAdmin ? "open" : "close";
    setActionError(null);
    setActingChannelId(channel.id);

    try {
      await adminChannelService.updateMembershipAvailability(channel.id, { action });
      await refreshData();
    } catch (err) {
      setActionError(getErrorMessage(err, action === "close" ? t("errors.closeMembershipFailed") : t("errors.openMembershipFailed")));
    } finally {
      setActingChannelId(null);
    }
  };

  const handleApproveReview = async (channelId: string) => {
    setActionError(null);
    setActingChannelId(channelId);

    try {
      await adminChannelService.decideMembershipReview(channelId, { action: "approve" });
      await refreshData();
    } catch (err) {
      setActionError(getErrorMessage(err, t("errors.approveReviewFailed")));
    } finally {
      setActingChannelId(null);
    }
  };

  const handleRejectReview = async (channelId: string) => {
    const reason = rejectReason.trim();
    if (!reason) {
      setActionError(t("errors.rejectReasonRequired"));
      return;
    }

    setActionError(null);
    setActingChannelId(channelId);

    try {
      await adminChannelService.decideMembershipReview(channelId, { action: "reject", reason });
      setRejectChannelId(null);
      setRejectReason("");
      await refreshData();
    } catch (err) {
      setActionError(getErrorMessage(err, t("errors.rejectReviewFailed")));
    } finally {
      setActingChannelId(null);
    }
  };

  const summaryCards = buildSummaryCards(summary, t, numberFormatter);
  const showingFrom = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const showingTo = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-border/30 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">{t("header.eyebrow")}</p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">{t("header.title")}</h1>
          <p className="mt-2 max-w-2xl font-body text-sm text-muted-foreground">
            {isLoading ? t("header.loading") : t("header.summary", { count: formatCount(pagination.total, numberFormatter) })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refreshData()}
          disabled={isLoading || isSummaryLoading}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-border/40 bg-muted px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">refresh</span>
          {t("actions.refresh")}
        </button>
      </header>

      {summaryError ? (
        <div className="rounded-lg border border-secondary/30 bg-secondary/10 p-4 font-body text-sm text-secondary">
          {summaryError}
        </div>
      ) : null}

      {actionError ? (
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 font-body text-sm text-primary">
          {actionError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(item => (
          <article key={item.label} className={`group relative min-h-36 overflow-hidden rounded-lg border border-border/30 border-l-4 bg-card p-6 ${getSummaryToneClass(item.tone)}`}>
            <span className="material-symbols-outlined pointer-events-none absolute bottom-4 right-4 text-6xl opacity-10 transition-opacity group-hover:opacity-20" aria-hidden="true">
              {item.icon}
            </span>
            <div className="relative z-10 flex h-full flex-col justify-between gap-4">
              <p className="font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.label}</p>
              <div>
                <h2 className="font-headline text-4xl font-black leading-none tabular-nums text-foreground">{isSummaryLoading ? "-" : item.value}</h2>
                <p className="mt-3 max-w-[15rem] font-body text-xs leading-5 text-muted-foreground">{item.detail}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-border/30 bg-card">
        <div className="space-y-4 border-b border-border/30 bg-background px-6 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-headline text-lg font-bold text-foreground">{t("directory.title")}</h2>
              <p className="mt-1 font-body text-xs text-muted-foreground">
                {t("directory.description")}
              </p>
            </div>
            <form className="grid w-full gap-2 sm:grid-cols-[1fr_1fr_auto] lg:w-[42rem]" onSubmit={handleSearchSubmit}>
              <label className="sr-only" htmlFor="admin-channel-search">{t("filters.searchLabel")}</label>
              <input
                id="admin-channel-search"
                className="min-h-11 rounded-sm border border-border/30 bg-input px-3 py-2 font-body text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                placeholder={t("filters.searchPlaceholder")}
                value={searchInput}
                onChange={event => setSearchInput(event.target.value)}
              />
              <label className="sr-only" htmlFor="admin-channel-owner">{t("filters.ownerLabel")}</label>
              <input
                id="admin-channel-owner"
                className="min-h-11 rounded-sm border border-border/30 bg-input px-3 py-2 font-body text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                placeholder={t("filters.ownerPlaceholder")}
                value={ownerInput}
                onChange={event => setOwnerInput(event.target.value)}
              />
              <button className="min-h-11 rounded-sm bg-primary px-4 font-headline text-xs font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90" type="submit">
                {t("actions.search")}
              </button>
            </form>
          </div>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map(item => {
              const isActive = status === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setPage(1);
                    setStatus(item.value);
                  }}
                  className={`rounded-sm px-4 py-2 font-label text-xs font-bold uppercase tracking-widest transition-colors ${
                    isActive
                      ? "border border-border/40 bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  {t(`filters.statuses.${item.translationKey}`)}
                </button>
              );
            })}
          </div>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={() => void loadChannels(queryParams)} t={t} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border/30 bg-background text-[10px] uppercase tracking-widest text-muted-foreground">
                    <th className="px-6 py-4 font-semibold">{t("table.channel")}</th>
                    <th className="px-6 py-4 font-semibold">{t("table.owner")}</th>
                    <th className="px-6 py-4 font-semibold">{t("table.membership")}</th>
                    <th className="px-6 py-4 font-semibold">{t("table.status")}</th>
                    <th className="px-6 py-4 text-right font-semibold">{t("table.updated")}</th>
                    <th className="px-6 py-4 text-right font-semibold">{t("table.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {isLoading ? (
                    <ChannelSkeletonRows />
                  ) : channels.length === 0 ? (
                    <tr>
                      <td className="px-6 py-14" colSpan={6}>
                        <EmptyState t={t} />
                      </td>
                    </tr>
                  ) : (
                    channels.map(channel => (
                      <ChannelRow
                        key={channel.id}
                        channel={channel}
                        actingChannelId={actingChannelId}
                        rejectChannelId={rejectChannelId}
                        rejectReason={rejectReason}
                        locale={locale}
                        dateFallback={dateFallback}
                        t={t}
                        onRejectReasonChange={setRejectReason}
                        onStartReject={channelId => {
                          setActionError(null);
                          setRejectReason("");
                          setRejectChannelId(channelId);
                        }}
                        onCancelReject={() => {
                          setRejectChannelId(null);
                          setRejectReason("");
                        }}
                        onApproveReview={handleApproveReview}
                        onRejectReview={handleRejectReview}
                        onStatusAction={handleStatusAction}
                        onMembershipAvailability={handleMembershipAvailability}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 border-t border-border/30 bg-background px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {t("pagination.summary", { from: showingFrom, to: showingTo, total: formatCount(pagination.total, numberFormatter) })}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage(current => Math.max(1, current - 1))}
                  disabled={isLoading || pagination.page <= 1}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border/30 text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={t("pagination.previous")}
                >
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">chevron_left</span>
                </button>
                <span className="rounded-sm border border-primary/30 bg-primary/10 px-3 py-2 font-mono text-xs text-primary">
                  {pagination.page} / {Math.max(1, pagination.totalPages)}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(current => Math.min(Math.max(1, pagination.totalPages), current + 1))}
                  disabled={isLoading || pagination.page >= pagination.totalPages}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border/30 text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={t("pagination.next")}
                >
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">chevron_right</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function ChannelRow({
  channel,
  actingChannelId,
  rejectChannelId,
  rejectReason,
  locale,
  dateFallback,
  t,
  onRejectReasonChange,
  onStartReject,
  onCancelReject,
  onApproveReview,
  onRejectReview,
  onStatusAction,
  onMembershipAvailability,
}: {
  channel: AdminChannelListItem;
  actingChannelId: string | null;
  rejectChannelId: string | null;
  rejectReason: string;
  locale: string;
  dateFallback: string;
  t: ReturnType<typeof useTranslations>;
  onRejectReasonChange: (value: string) => void;
  onStartReject: (channelId: string) => void;
  onCancelReject: () => void;
  onApproveReview: (channelId: string) => Promise<void>;
  onRejectReview: (channelId: string) => Promise<void>;
  onStatusAction: (channel: AdminChannelListItem) => Promise<void>;
  onMembershipAvailability: (channel: AdminChannelListItem) => Promise<void>;
}) {
  const isActing = actingChannelId === channel.id;
  const isRejecting = rejectChannelId === channel.id;
  const canReview = channel.isEligibleForMembership && channel.membershipReviewStatus === "pending";
  const canToggleMembership = channel.membershipReviewStatus === "approved";

  return (
    <tr className="group align-top transition-colors hover:bg-muted/40">
      <td className="px-6 py-4">
        <div className="flex items-start gap-4">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border/30 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.22),transparent_35%),linear-gradient(135deg,hsl(var(--muted)),hsl(var(--background)))] font-headline text-xs font-bold text-primary">
            {channel.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={channel.avatarUrl} alt={t("avatarAlt", { channel: channel.name })} className="h-full w-full object-cover" />
            ) : (
              getInitials(channel.name)
            )}
          </div>
          <div className="min-w-0">
            <p className="max-w-[260px] truncate font-headline text-sm font-bold text-foreground">{channel.name}</p>
            <p className="mt-1 max-w-[280px] truncate font-body text-xs text-muted-foreground">{channel.bio || t("fallbacks.noBio")}</p>
            <p className="mt-1 break-all font-mono text-[10px] text-muted-foreground">{channel.id}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-1 font-mono text-[10px] text-muted-foreground">
          <p className="max-w-[180px] break-all text-xs text-foreground/80">{channel.userId}</p>
          <p>{t("table.created", { date: formatDate(channel.createdAt, locale, dateFallback) })}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-2">
          <span className={`inline-flex rounded-sm border px-2 py-1 font-label text-[10px] font-bold uppercase tracking-widest ${getReviewTone(channel.membershipReviewStatus)}`}>
            {getMembershipReviewLabel(channel.membershipReviewStatus, t)}
          </span>
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-sm border px-2 py-0.5 font-label text-[10px] font-bold uppercase tracking-widest ${channel.isEligibleForMembership ? "border-emerald-500/30 text-emerald-400" : "border-border/30 text-muted-foreground"}`}>
              {channel.isEligibleForMembership ? t("membership.eligible") : t("membership.notEligible")}
            </span>
            <span className={`rounded-sm border px-2 py-0.5 font-label text-[10px] font-bold uppercase tracking-widest ${channel.isMembershipClosedByAdmin ? "border-primary/30 text-primary" : "border-border/30 text-muted-foreground"}`}>
              {channel.isMembershipClosedByAdmin ? t("membership.adminClosed") : t("membership.open")}
            </span>
          </div>
          {channel.membershipRejectionReason ? (
            <p className="max-w-[240px] text-xs text-primary">{channel.membershipRejectionReason}</p>
          ) : null}
          {isRejecting ? (
            <div className="space-y-2 pt-2">
              <label className="sr-only" htmlFor={`reject-channel-${channel.id}`}>{t("reject.reasonLabel")}</label>
              <textarea
                id={`reject-channel-${channel.id}`}
                className="min-h-20 w-64 rounded-sm border border-border/30 bg-input px-3 py-2 font-body text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                placeholder={t("reject.reasonPlaceholder")}
                value={rejectReason}
                onChange={event => onRejectReasonChange(event.target.value)}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void onRejectReview(channel.id)}
                  disabled={isActing}
                  className="rounded-sm bg-primary px-3 py-2 font-label text-[10px] font-bold uppercase tracking-widest text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t("actions.confirmReject")}
                </button>
                <button
                  type="button"
                  onClick={onCancelReject}
                  disabled={isActing}
                  className="rounded-sm border border-border/30 px-3 py-2 font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t("actions.cancel")}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`flex items-center gap-1.5 font-label text-[10px] font-bold uppercase tracking-widest ${getStatusTone(channel.status)}`}>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">{getStatusIcon(channel.status)}</span>
          {getChannelStatusLabel(channel.status, t)}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <p className="font-mono text-xs text-muted-foreground">{formatDate(channel.updatedAt, locale, dateFallback)}</p>
        <p className="mt-1 font-mono text-[10px] text-muted-foreground">{t("table.reviewed", { date: formatDate(channel.membershipReviewedAt || channel.membershipRequestedAt, locale, dateFallback) })}</p>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex min-w-[280px] flex-wrap justify-end gap-2">
          {canReview ? (
            <>
              <button
                type="button"
                onClick={() => void onApproveReview(channel.id)}
                disabled={isActing}
                className="inline-flex items-center gap-1 rounded-sm bg-primary px-3 py-2 font-label text-[10px] font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">check</span>
                {t("actions.approve")}
              </button>
              <button
                type="button"
                onClick={() => onStartReject(channel.id)}
                disabled={isActing || isRejecting}
                className="inline-flex items-center gap-1 rounded-sm border border-border/30 px-3 py-2 font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">close</span>
                {t("actions.reject")}
              </button>
            </>
          ) : null}
          <button
            type="button"
            onClick={() => void onMembershipAvailability(channel)}
            disabled={isActing || !canToggleMembership}
            className="inline-flex items-center gap-1 rounded-sm border border-border/30 px-3 py-2 font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:border-secondary hover:text-secondary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">card_membership</span>
            {channel.isMembershipClosedByAdmin ? t("actions.openMembership") : t("actions.closeMembership")}
          </button>
          <button
            type="button"
            onClick={() => void onStatusAction(channel)}
            disabled={isActing}
            className="inline-flex items-center gap-1 rounded-sm border border-border/30 px-3 py-2 font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">lock</span>
            {channel.status === "suspended" ? t("actions.unlock") : t("actions.lock")}
          </button>
        </div>
      </td>
    </tr>
  );
}

function ChannelSkeletonRows() {
  return Array.from({ length: 5 }).map((_, index) => (
    <tr key={index} className="animate-pulse">
      <td className="px-6 py-4" colSpan={6}>
        <div className="h-16 rounded-sm bg-muted/60" />
      </td>
    </tr>
  ));
}

function ErrorState({ message, onRetry, t }: { message: string; onRetry: () => void; t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-10 text-center">
      <span className="material-symbols-outlined text-4xl text-primary" aria-hidden="true">error</span>
      <div>
        <h2 className="font-headline text-lg font-bold text-foreground">{t("errors.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
      <button className="rounded-sm bg-primary px-4 py-2 font-headline text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90" type="button" onClick={onRetry}>
        {t("actions.retry")}
      </button>
    </div>
  );
}

function EmptyState({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 text-center">
      <span className="material-symbols-outlined text-4xl text-muted-foreground" aria-hidden="true">tv_off</span>
      <div>
        <h2 className="font-headline text-lg font-bold text-foreground">{t("empty.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("empty.description")}</p>
      </div>
    </div>
  );
}
