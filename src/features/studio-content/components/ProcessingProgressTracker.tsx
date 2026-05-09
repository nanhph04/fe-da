"use client";

import { useEffect, useRef, useState } from "react";
import { mediaService } from "@/features/watch/services/mediaService";
import { fetchSSE } from "@/shared/api/client";

interface ProcessingProgressTrackerProps {
  videoId: string;
  initialStatus: string;
  onComplete?: () => void;
}

interface ProgressEventPayload {
  percent?: number;
  message?: string;
  terminal?: boolean;
}

const TERMINAL_STATUSES = new Set(["ready", "failed", "rejected"]);

export function ProcessingProgressTracker({
  videoId,
  initialStatus,
  onComplete,
}: ProcessingProgressTrackerProps) {
  const [percent, setPercent] = useState(0);
  const [message, setMessage] = useState("Bat dau ket noi...");
  const [streamEnded, setStreamEnded] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isInitiallyTerminal = TERMINAL_STATUSES.has(initialStatus);
  const isTerminal = isInitiallyTerminal || streamEnded;

  useEffect(() => {
    if (isInitiallyTerminal) {
      return;
    }

    let isActive = true;
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
            setPercent(payload.percent);
          }

          if (typeof payload.message === "string" && payload.message.length > 0) {
            setMessage(payload.message);
          }

          if (payload.terminal) {
            setStreamEnded(true);
            abortControllerRef.current?.abort();
            onComplete?.();
          }
        },
        () => {
          if (isActive && !isTerminal) {
            onComplete?.();
          }
        },
        () => {
          if (isActive) {
            setMessage("Dang cho phan hoi...");
          }
        }
      );
    };

    void startStream();

    return () => {
      isActive = false;
      abortControllerRef.current?.abort();
    };
  }, [videoId, isInitiallyTerminal, isTerminal, onComplete]);

  if (isTerminal) {
    return null;
  }

  return (
    <div className="mt-3 flex w-full max-w-sm flex-col gap-2 rounded-md border border-[#262528] bg-[#131315] p-3 shadow-md">
      <div className="flex items-center justify-between">
        <span className="mr-2 line-clamp-1 flex-1 text-xs font-medium text-zinc-300" title={message}>
          {message}
        </span>
        <span className="whitespace-nowrap text-xs font-bold text-[#ff8e80]">
          {Math.round(percent)}%
        </span>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[#262528]">
        <div
          className="absolute inset-y-0 left-0 bg-[#ff8e80] transition-all duration-300 ease-in-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
