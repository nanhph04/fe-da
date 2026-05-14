"use client";

interface ProcessingProgressTrackerProps {
  initialStatus: string;
  jobStatus?: string | null;
  jobStatusMessage?: string | null;
  onRefreshStatus?: () => void;
}

export function ProcessingProgressTracker({
  initialStatus,
  jobStatus,
  jobStatusMessage,
  onRefreshStatus,
}: ProcessingProgressTrackerProps) {
  return (
    <div className="mt-3 max-w-sm rounded-md border border-secondary/30 bg-secondary/10 p-3 text-xs text-secondary">
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold uppercase tracking-widest">
          {(jobStatus || initialStatus).replaceAll("_", " ")}
        </span>
        {onRefreshStatus ? (
          <button
            type="button"
            onClick={onRefreshStatus}
            className="rounded-sm border border-secondary/30 px-2 py-1 font-bold uppercase tracking-widest transition-colors hover:bg-secondary/10"
          >
            Refresh
          </button>
        ) : null}
      </div>
      <p className="mt-2 text-muted-foreground">
        {jobStatusMessage || "Video dang duoc xu ly. Nhan Refresh de cap nhat trang thai moi nhat."}
      </p>
    </div>
  );
}
