"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { mediaService } from "@/features/watch/services/mediaService";
import { fetchSSE } from "@/shared/api/client";

interface ProcessingProgressTrackerProps {
  videoId: string;
  initialStatus: string;
  onComplete?: () => void;
  onRefreshStatus?: () => void;
}

interface ProgressEventPayload {
  percent?: number;
  message?: string;
  terminal?: boolean;
}

const TERMINAL_STATUSES = new Set(["ready", "failed", "rejected"]);
const STALLED_TIMEOUT_MS = 30000;

export function ProcessingProgressTracker({
  videoId,
  initialStatus,
  onComplete,
  onRefreshStatus,
}: ProcessingProgressTrackerProps) {
  const [percent, setPercent] = useState(0);
  const [message, setMessage] = useState("Đang kết nối tiến độ xử lý...");
  const [streamEnded, setStreamEnded] = useState(false);
  const [streamIssue, setStreamIssue] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasCompletedRef = useRef(false);
  const percentRef = useRef(0);
  const isInitiallyTerminal = TERMINAL_STATUSES.has(initialStatus);
  const isTerminal = isInitiallyTerminal || streamEnded;
  const hasIssue = !!streamIssue;

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
    setPercent(0);
    setStreamEnded(false);
    setStreamIssue(null);
    setMessage("Đang kết nối lại tiến độ xử lý...");
    setRetryToken(value => value + 1);
    onRefreshStatus?.();
  };

  useEffect(() => {
    if (isInitiallyTerminal) {
      return;
    }

    let isActive = true;
    const stalledTimer = window.setTimeout(() => {
      if (isActive && percentRef.current === 0) {
        setStreamIssue("Không nhận được tiến độ xử lý. Backend chưa trả trạng thái mới nhất.");
        onRefreshStatus?.();
      }
    }, STALLED_TIMEOUT_MS);

    abortControllerRef.current = new AbortController();

    const startStream = async () => {
      const url = mediaService.getVideoProgressStreamUrl(videoId);

      await fetchSSE(
        url,
        {
          requireAuth: true,
          signal: abortControllerRef.current?.signal,
        },
        (data: unknown) => {
          if (!isActive || typeof data !== "object" || data === null) {
            return;
          }

          const payload = data as ProgressEventPayload;

          if (typeof payload.percent === "number") {
            percentRef.current = payload.percent;
            setPercent(payload.percent);
            if (payload.percent > 0) {
              setStreamIssue(null);
            }
          }

          if (typeof payload.message === "string" && payload.message.length > 0) {
            setMessage(payload.message);
          }

          if (payload.terminal) {
            setStreamEnded(true);
            abortControllerRef.current?.abort();
            completeOnce();
          }
        },
        () => {
          if (isActive && !isTerminal && !hasCompletedRef.current) {
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
  }, [videoId, isInitiallyTerminal, isTerminal, completeOnce, onRefreshStatus, retryToken]);

  if (isTerminal) {
    return null;
  }

  return (
    <div
      className={`mt-3 flex w-full max-w-sm flex-col gap-2 rounded-md border p-3 shadow-md ${
        hasIssue ? "border-secondary/30 bg-secondary/10" : "border-[#262528] bg-[#131315]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={`mr-2 line-clamp-1 flex-1 text-xs font-medium ${hasIssue ? "text-secondary" : "text-zinc-300"}`}
          title={streamIssue ?? message}
        >
          {streamIssue ?? message}
        </span>
        <span className={`whitespace-nowrap text-xs font-bold ${hasIssue ? "text-secondary" : "text-[#ff8e80]"}`}>
          {Math.round(percent)}%
        </span>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[#262528]">
        <div
          className={`absolute inset-y-0 left-0 transition-all duration-300 ease-in-out ${hasIssue ? "bg-secondary" : "bg-[#ff8e80]"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {hasIssue ? (
        <button
          type="button"
          onClick={handleRetry}
          className="mt-1 w-fit rounded-sm border border-secondary/30 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-secondary transition-colors hover:bg-secondary/10"
        >
          Tải lại trạng thái
        </button>
      ) : null}
    </div>
  );
}
