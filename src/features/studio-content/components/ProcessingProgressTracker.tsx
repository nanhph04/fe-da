"use client";

import {
  getVideoJobStatusLabel,
  getVideoStatusFailureReason,
} from "@/shared/hooks/use-video-status-events";

interface ProcessingProgressTrackerProps {
  initialStatus: string;
  jobStatus?: string | null;
  jobStatusMessage?: string | null;
  failureReason?: string | null;
  moderationDetails?: Record<string, unknown> | null;
  onRefreshStatus?: () => void;
}

function normalizeStatus(status?: string | null) {
  return status?.toLowerCase() || "unknown";
}

function getToneClass(status: string) {
  if (status === "succeeded" || status === "ready") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }

  if (status === "failed" || status === "rejected") {
    return "border-destructive/30 bg-destructive/10 text-destructive";
  }

  if (status === "waiting" || status === "processing" || status === "pending_moderation" || status === "pending_manual_review") {
    return "border-secondary/30 bg-secondary/10 text-secondary";
  }

  return "border-border/40 bg-muted text-muted-foreground";
}

export function ProcessingProgressTracker({
  initialStatus,
  jobStatus,
  jobStatusMessage,
  failureReason,
  moderationDetails,
  onRefreshStatus,
}: ProcessingProgressTrackerProps) {
  const normalizedStatus = normalizeStatus(jobStatus ?? initialStatus);
  const toneClass = getToneClass(normalizedStatus);
  const label = jobStatus ? getVideoJobStatusLabel(jobStatus) : normalizedStatus.replaceAll("_", " ").toUpperCase();
  const isFailed = normalizedStatus === "failed" || normalizedStatus === "rejected";
  const isSucceeded = normalizedStatus === "succeeded";
  const message = isFailed
    ? getVideoStatusFailureReason({ failureReason: failureReason ?? null, moderationDetails: moderationDetails ?? null }) || jobStatusMessage || "Video xử lý thất bại."
    : jobStatusMessage || (isSucceeded ? "Video đã xử lý xong." : "Video đang được xử lý. Hệ thống sẽ tự cập nhật khi có thay đổi.");

  return (
    <div className={`mt-3 max-w-sm rounded-md border p-3 text-xs ${toneClass}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold uppercase tracking-widest">
          {label}
        </span>
        {onRefreshStatus ? (
          <button
            type="button"
            onClick={onRefreshStatus}
            className="rounded-sm border border-current/30 px-2 py-1 font-bold uppercase tracking-widest transition-colors hover:bg-current/10"
          >
            Refresh
          </button>
        ) : null}
      </div>
      <p className={`mt-2 ${isFailed ? "text-destructive/90" : "text-muted-foreground"}`}>
        {message}
      </p>
    </div>
  );
}
