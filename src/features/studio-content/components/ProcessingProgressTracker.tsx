"use client";

import { useEffect, useState, useRef } from "react";
import { mediaService } from "@/features/watch/services/mediaService";
import { fetchSSE } from "@/shared/utils/apiClient";

interface ProcessingProgressTrackerProps {
  videoId: string;
  initialStatus: string;
  onComplete?: () => void;
}

export function ProcessingProgressTracker({
  videoId,
  initialStatus,
  onComplete,
}: ProcessingProgressTrackerProps) {
  const [percent, setPercent] = useState<number>(0);
  const [message, setMessage] = useState<string>("Bắt đầu kết nối...");
  const [isTerminal, setIsTerminal] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Nếu status ban đầu đã là dạng kết thúc, không cần thiết lập stream
    if (initialStatus === "ready" || initialStatus === "failed" || initialStatus === "rejected") {
      setIsTerminal(true);
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
        (data: any) => {
          if (!isActive) return;
          
          if (typeof data === "object" && data !== null) {
            if (typeof data.percent === "number") {
              setPercent(data.percent);
            }
            if (data.message) {
              setMessage(data.message);
            }
            if (data.terminal) {
              setIsTerminal(true);
              abortControllerRef.current?.abort();
              if (onComplete) onComplete();
            }
          }
        },
        () => {
          // onEnd
          if (isActive && !isTerminal) {
            if (onComplete) onComplete();
          }
        },
        (err) => {
          if (isActive) {
            setMessage("Đang chờ phản hồi...");
          }
        }
      );
    };

    startStream();

    return () => {
      isActive = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [videoId, initialStatus, isTerminal, onComplete]);

  if (isTerminal) return null;

  return (
    <div className="mt-3 flex flex-col gap-2 rounded-md border border-[#262528] bg-[#131315] p-3 shadow-md w-full max-w-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-300 line-clamp-1 flex-1 mr-2" title={message}>
          {message}
        </span>
        <span className="text-xs font-bold text-[#ff8e80] whitespace-nowrap">
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
