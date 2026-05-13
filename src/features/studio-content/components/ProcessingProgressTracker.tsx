"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { mediaService, type VideoProgressResponse } from "@/features/watch/services/mediaService";
import { fetchSSE } from "@/shared/api/client";

interface ProcessingProgressTrackerProps {
  videoId: string;
  initialStatus: string;
  onComplete?: () => void;
  onRefreshStatus?: () => void;
}

const TERMINAL_STATUSES = new Set(["ready", "failed", "rejected"]);
const STALLED_TIMEOUT_MS = 30000;

const isProgressPayload = (data: unknown): data is VideoProgressResponse => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const payload = data as Partial<VideoProgressResponse>;
  return typeof payload.percent === "number" && typeof payload.message === "string";
};

const unwrapProgressPayload = (data: unknown) => {
  if (isProgressPayload(data)) {
    return data;
  }

  if (typeof data === "object" && data !== null && "data" in data) {
    const nestedData = (data as { data?: unknown }).data;
    if (isProgressPayload(nestedData)) {
      return nestedData;
    }
  }

  return null;
};

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

export function ProcessingProgressTracker({
  videoId,
  initialStatus,
  onComplete,
  onRefreshStatus,
}: ProcessingProgressTrackerProps) {
  const [percent, setPercent] = useState(0);
  const [message, setMessage] = useState("Đang tải snapshot tiến độ xử lý...");
  const [stage, setStage] = useState(initialStatus);
  const [streamEnded, setStreamEnded] = useState(false);
  const [streamIssue, setStreamIssue] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasCompletedRef = useRef(false);
  const percentRef = useRef(0);
  const isInitiallyTerminal = TERMINAL_STATUSES.has(initialStatus);
  const isTerminal = isInitiallyTerminal || streamEnded;
  const hasIssue = !!streamIssue;

  const applyProgress = useCallback((payload: VideoProgressResponse) => {
    const nextPercent = clampPercent(payload.percent);
    percentRef.current = nextPercent;
    setPercent(nextPercent);
    setMessage(payload.message || "Đang xử lý video...");
    setStage(payload.stage || initialStatus);

    if (nextPercent > 0) {
      setStreamIssue(null);
    }
  }, [initialStatus]);

  const completeOnce = useCallback(() => {
    if (hasCompletedRef.current) {
      return;
    }

    hasCompletedRef.current = true;
    onComplete?.();
  }, [onComplete]);

  const handleRetry = () => {
    abortControllerRef.current?.abort();
    hasCompletedRef.current = false;
    percentRef.current = 0;
    setPercent(0);
    setStage(initialStatus);
    setStreamEnded(false);
    setStreamIssue(null);
    setMessage("Đang kết nối lại tiến độ xử lý...");
    setRetryToken(value => value + 1);
    onRefreshStatus?.();
  };

  useEffect(() => {
    if (isInitiallyTerminal || streamEnded) {
      return;
    }

    let isActive = true;
    abortControllerRef.current = new AbortController();

    const stalledTimer = window.setTimeout(() => {
      if (isActive && percentRef.current === 0) {
        setStreamIssue("Chưa nhận được tiến độ xử lý mới. Đang giữ snapshot hiện tại.");
        onRefreshStatus?.();
      }
    }, STALLED_TIMEOUT_MS);

    const startStream = async () => {
      try {
        const snapshot = await mediaService.getVideoProgress(videoId);
        if (!isActive) {
          return;
        }

        if (snapshot.success && snapshot.data) {
          applyProgress(snapshot.data);

          if (snapshot.data.terminal) {
            setStreamEnded(true);
            completeOnce();
            return;
          }
        } else {
          setStreamIssue(snapshot.mess || "Không tải được snapshot tiến độ xử lý.");
        }
      } catch {
        if (isActive) {
          setStreamIssue("Không tải được snapshot tiến độ xử lý. Sẽ thử nghe SSE trực tiếp.");
        }
      }

      const url = mediaService.getVideoProgressStreamUrl(videoId);

      await fetchSSE(
        url,
        {
          requireAuth: true,
          signal: abortControllerRef.current?.signal,
        },
        (data: unknown, event: string) => {
          if (!isActive) {
            return;
          }

          const payload = unwrapProgressPayload(data);
          if (!payload) {
            return;
          }

          applyProgress(payload);

          if (payload.terminal || event === "end") {
            setStreamEnded(true);
            abortControllerRef.current?.abort();
            completeOnce();
          }
        },
        () => {
          if (isActive && !hasCompletedRef.current && !streamEnded) {
            setStreamIssue("Luồng tiến độ đã ngắt trước khi có trạng thái hoàn tất.");
            onRefreshStatus?.();
          }
        },
        () => {
          if (isActive) {
            setStreamIssue("Không nhận được tiến độ xử lý. Backend hoặc SSE đang không phản hồi.");
            setMessage("Đang chờ phản hồi...");
            onRefreshStatus?.();
          }
        }
      );
    };

    void startStream();

    return () => {
      isActive = false;
      window.clearTimeout(stalledTimer);
      abortControllerRef.current?.abort();
    };
  }, [videoId, initialStatus, isInitiallyTerminal, applyProgress, completeOnce, onRefreshStatus, retryToken, streamEnded]);

  if (isTerminal) {
    return null;
  }

  return (
    <div
      className={`mt-3 flex w-full max-w-sm flex-col gap-2 rounded-md border p-3 shadow-md ${
        hasIssue ? "border-secondary/30 bg-secondary/10" : "border-border/30 bg-card"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={`mr-2 line-clamp-1 flex-1 text-xs font-medium ${hasIssue ? "text-secondary" : "text-muted-foreground"}`}
          title={streamIssue ?? message}
        >
          {streamIssue ?? message}
        </span>
        <span className={`whitespace-nowrap text-xs font-bold ${hasIssue ? "text-secondary" : "text-primary"}`}>
          {Math.round(percent)}%
        </span>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`absolute inset-y-0 left-0 transition-all duration-300 ease-in-out ${hasIssue ? "bg-secondary" : "bg-primary"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex items-center justify-between gap-3 text-[11px] font-medium text-muted-foreground">
        <span className="uppercase tracking-widest">{stage.replaceAll("_", " ")}</span>
        {hasIssue ? (
          <button
            type="button"
            onClick={handleRetry}
            className="rounded-sm border border-secondary/30 px-3 py-1 font-bold uppercase tracking-widest text-secondary transition-colors hover:bg-secondary/10"
          >
            Tải lại trạng thái
          </button>
        ) : null}
      </div>
    </div>
  );
}
