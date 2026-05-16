"use client";

import { AlertCircle, CheckCircle2, Filter, RefreshCw, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { getErrorMessage } from "@/shared/api/client";

import { adminMembershipReviewService } from "../services/adminMembershipReviewService";
import type { AdminMembershipReviewItem, MembershipReviewStatus } from "../types/admin-verification.types";

const reviewTabs: Array<{ label: string; value: MembershipReviewStatus }> = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const numberFormatter = new Intl.NumberFormat("en-US");

export function VerificationQueueFeature() {
  const [activeStatus, setActiveStatus] = useState<MembershipReviewStatus>("pending");
  const [reviews, setReviews] = useState<AdminMembershipReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingChannelId, setActingChannelId] = useState<string | null>(null);
  const [rejectChannelId, setRejectChannelId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await adminMembershipReviewService.getReviews(activeStatus);
      setReviews(data);
    } catch (err) {
      setReviews([]);
      setError(getErrorMessage(err, "Không thể tải danh sách duyệt membership."));
    } finally {
      setIsLoading(false);
    }
  }, [activeStatus]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await adminMembershipReviewService.getReviews(activeStatus);
        if (!cancelled) {
          setReviews(data);
        }
      } catch (err) {
        if (!cancelled) {
          setReviews([]);
          setError(getErrorMessage(err, "Không thể tải danh sách duyệt membership."));
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
  }, [activeStatus]);

  const stats = useMemo(() => {
    const priority = reviews.filter(item => item.totalVideoViews >= item.minTotalVideoViews * 2).length;
    const avgReadyVideos = reviews.length
      ? Math.round(reviews.reduce((total, item) => total + item.readyVideoCount, 0) / reviews.length)
      : 0;

    return {
      inQueue: reviews.length,
      avgReadyVideos,
      priority,
    };
  }, [reviews]);

  const handleApprove = async (channelId: string) => {
    setActionError(null);
    setActingChannelId(channelId);

    try {
      await adminMembershipReviewService.decideReview(channelId, { action: "approve" });
      setReviews(current => current.filter(item => item.channelId !== channelId));
    } catch (err) {
      setActionError(getErrorMessage(err, "Không thể approve membership review."));
    } finally {
      setActingChannelId(null);
    }
  };

  const handleReject = async (channelId: string) => {
    const reason = rejectReason.trim();
    if (!reason) {
      setActionError("Vui lòng nhập lý do từ chối.");
      return;
    }

    setActionError(null);
    setActingChannelId(channelId);

    try {
      await adminMembershipReviewService.decideReview(channelId, { action: "reject", reason });
      setReviews(current => current.filter(item => item.channelId !== channelId));
      setRejectChannelId(null);
      setRejectReason("");
    } catch (err) {
      setActionError(getErrorMessage(err, "Không thể reject membership review."));
    } finally {
      setActingChannelId(null);
    }
  };

  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-border/30 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">Membership Review</p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">Creator Membership Queue</h1>
          <p className="mt-2 max-w-2xl font-body text-sm text-muted-foreground">
            Approve eligible channels before creators can publish paid membership tiers.
          </p>
        </div>
        <div className="flex items-center rounded-sm border border-border/30 bg-card p-1">
          {reviewTabs.map(tab => (
            <button
              key={tab.value}
              className={`rounded-sm px-4 py-2 font-headline text-xs font-bold transition-colors ${
                activeStatus === tab.value ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              type="button"
              onClick={() => {
                setActiveStatus(tab.value);
                setRejectChannelId(null);
                setActionError(null);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Stat label="Current View" value={numberFormatter.format(stats.inQueue)} tone="primary" />
        <Stat label="Avg. Ready Videos" value={numberFormatter.format(stats.avgReadyVideos)} tone="secondary" />
        <article className="rounded-lg border border-primary/30 bg-primary/10 p-6 md:col-span-2">
          <p className="mb-2 font-label text-[10px] font-bold uppercase tracking-widest text-primary">High Momentum Channels</p>
          <h2 className="font-headline text-4xl font-black text-foreground">{numberFormatter.format(stats.priority)}</h2>
          <p className="mt-1 font-mono text-xs text-muted-foreground">Channels with at least 2x the minimum view requirement.</p>
        </article>
      </div>

      {actionError ? (
        <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm text-primary">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <p>{actionError}</p>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-border/30 bg-card">
        <div className="flex items-center justify-between border-b border-border/30 bg-background px-6 py-4">
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="font-mono text-xs font-bold text-foreground/80">Status: {activeStatus.toUpperCase()}</span>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-sm border border-border/40 px-3 py-2 font-headline text-xs font-bold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            type="button"
            onClick={() => void loadReviews()}
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Refresh
          </button>
        </div>

        {isLoading ? <ReviewSkeleton /> : null}
        {!isLoading && error ? <ErrorState message={error} onRetry={loadReviews} /> : null}
        {!isLoading && !error && reviews.length === 0 ? <EmptyState status={activeStatus} /> : null}
        {!isLoading && !error && reviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border/30 bg-background text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="px-6 py-4">Channel</th>
                  <th className="px-6 py-4">Requested</th>
                  <th className="px-6 py-4 text-right">Ready Videos</th>
                  <th className="px-6 py-4 text-right">Total Views</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {reviews.map(review => (
                  <ReviewRow
                    key={review.channelId}
                    actingChannelId={actingChannelId}
                    rejectChannelId={rejectChannelId}
                    rejectReason={rejectReason}
                    review={review}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onRejectReasonChange={setRejectReason}
                    onStartReject={channelId => {
                      setRejectChannelId(channelId);
                      setRejectReason("");
                      setActionError(null);
                    }}
                    onCancelReject={() => {
                      setRejectChannelId(null);
                      setRejectReason("");
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ReviewRow({
  review,
  actingChannelId,
  rejectChannelId,
  rejectReason,
  onApprove,
  onReject,
  onRejectReasonChange,
  onStartReject,
  onCancelReject,
}: {
  review: AdminMembershipReviewItem;
  actingChannelId: string | null;
  rejectChannelId: string | null;
  rejectReason: string;
  onApprove: (channelId: string) => Promise<void>;
  onReject: (channelId: string) => Promise<void>;
  onRejectReasonChange: (reason: string) => void;
  onStartReject: (channelId: string) => void;
  onCancelReject: () => void;
}) {
  const isActing = actingChannelId === review.channelId;
  const isRejecting = rejectChannelId === review.channelId;
  const canDecide = review.membershipReviewStatus === "pending";

  return (
    <tr className="group align-top transition-colors hover:bg-muted/40">
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-border/30 bg-muted font-headline text-xs font-bold text-primary">
            {getInitials(review.name)}
          </div>
          <div>
            <p className="font-headline font-bold text-foreground">{review.name}</p>
            <p className="font-mono text-xs text-muted-foreground">{review.channelId}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{formatDate(review.membershipRequestedAt)}</td>
      <td className="px-6 py-4 text-right font-headline font-bold text-foreground">
        {numberFormatter.format(review.readyVideoCount)} / {numberFormatter.format(review.minReadyVideoCount)}
      </td>
      <td className="px-6 py-4 text-right font-headline font-bold text-foreground">
        {numberFormatter.format(review.totalVideoViews)} / {numberFormatter.format(review.minTotalVideoViews)}
      </td>
      <td className="px-6 py-4 text-center">
        <StatusBadge status={review.membershipReviewStatus} />
        {review.membershipRejectionReason ? <p className="mt-2 max-w-[180px] text-xs text-muted-foreground">{review.membershipRejectionReason}</p> : null}
      </td>
      <td className="px-6 py-4 text-right">
        {isRejecting ? (
          <div className="ml-auto max-w-[280px] space-y-2">
            <label className="sr-only" htmlFor={`reject-reason-${review.channelId}`}>Reject reason</label>
            <textarea
              id={`reject-reason-${review.channelId}`}
              className="min-h-20 w-full rounded-sm border border-border/40 bg-background p-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              placeholder="Policy issue or missing context..."
              value={rejectReason}
              onChange={event => onRejectReasonChange(event.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button className="rounded-sm border border-border/40 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground" type="button" onClick={onCancelReject}>
                Cancel
              </button>
              <button className="rounded-sm bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={isActing} onClick={() => void onReject(review.channelId)}>
                {isActing ? "Rejecting" : "Confirm Reject"}
              </button>
            </div>
          </div>
        ) : canDecide ? (
          <div className="flex justify-end gap-2">
            <button className="inline-flex items-center gap-2 rounded-sm border border-border/40 px-3 py-2 font-headline text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={isActing} onClick={() => onStartReject(review.channelId)}>
              <XCircle className="h-3.5 w-3.5" aria-hidden="true" /> Reject
            </button>
            <button className="inline-flex items-center gap-2 rounded-sm bg-primary px-3 py-2 font-headline text-xs font-bold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={isActing} onClick={() => void onApprove(review.channelId)}>
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> {isActing ? "Approving" : "Approve"}
            </button>
          </div>
        ) : (
          <span className="font-mono text-xs text-muted-foreground">No action</span>
        )}
      </td>
    </tr>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "primary" | "secondary" }) {
  return (
    <article className={`rounded-lg border border-border/30 border-l-4 bg-card p-6 ${tone === "primary" ? "border-l-primary" : "border-l-secondary"}`}>
      <p className="mb-2 font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <h2 className="font-headline text-4xl font-black text-foreground">{value}</h2>
    </article>
  );
}

function StatusBadge({ status }: { status: MembershipReviewStatus }) {
  const className =
    status === "approved"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
      : status === "rejected"
        ? "border-primary/30 bg-primary/10 text-primary"
        : "border-secondary/30 bg-secondary/10 text-secondary";

  return <span className={`rounded-sm border px-3 py-1 font-label text-[10px] font-bold uppercase tracking-widest ${className}`}>{status}</span>;
}

function ReviewSkeleton() {
  return (
    <div className="space-y-3 p-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="h-16 rounded-sm border border-border/20 bg-muted/40" />
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-10 text-center">
      <AlertCircle className="h-8 w-8 text-primary" aria-hidden="true" />
      <div>
        <h2 className="font-headline text-lg font-bold text-foreground">Không thể tải hàng đợi</h2>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
      <button className="rounded-sm bg-primary px-4 py-2 font-headline text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90" type="button" onClick={onRetry}>
        Thử lại
      </button>
    </div>
  );
}

function EmptyState({ status }: { status: MembershipReviewStatus }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-10 text-center">
      <CheckCircle2 className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <div>
        <h2 className="font-headline text-lg font-bold text-foreground">Không có channel nào</h2>
        <p className="mt-1 text-sm text-muted-foreground">Không có membership review ở trạng thái {status}.</p>
      </div>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map(part => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
