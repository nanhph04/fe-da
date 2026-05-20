"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { fetchSSE } from "@/shared/api/client";

export const VIDEO_STATUS_CHANGED_EVENT = "video.status.changed";
export const VIDEO_STATUS_EVENTS_URL = "/api/media/videos/events/stream";

export type VideoJobStatus = "waiting" | "processing" | "succeeded" | "failed" | "rejected";

export type VideoStatusChangedPayload = {
  videoId: string;
  userId: string;
  status: string;
  jobStatus: VideoJobStatus;
  jobStatusMessage: string;
  failureReason: string | null;
  thumbnailStatus: string;
  thumbnailUrl: string | null;
  moderationDetails: Record<string, unknown> | null;
  updatedAt: string;
};

export type VideoStatusConnectionState = "idle" | "connecting" | "open" | "error";
export type VideoStatusEventListener = (payload: VideoStatusChangedPayload) => void;

export type UseVideoStatusEventsOptions = {
  enabled?: boolean;
  onStatusChanged?: VideoStatusEventListener;
  onError?: (event: Event) => void;
};

type VideoStatusEventsContextValue = {
  connectionState: VideoStatusConnectionState;
  latestEvent: VideoStatusChangedPayload | null;
  subscribe: (listener: VideoStatusEventListener) => () => void;
};

export type VideoStatusEventsProviderProps = {
  children: ReactNode;
  enabled?: boolean;
};

const VIDEO_JOB_STATUS_LABELS: Record<VideoJobStatus, string> = {
  waiting: "Đang chờ duyệt/chờ xử lý",
  processing: "Đang xử lý video",
  succeeded: "Xử lý xong",
  failed: "Lỗi xử lý",
  rejected: "Video bị từ chối",
};

const VIDEO_JOB_STATUSES = new Set<VideoJobStatus>([
  "waiting",
  "processing",
  "succeeded",
  "failed",
  "rejected",
]);

const VideoStatusEventsContext = createContext<VideoStatusEventsContextValue | null>(null);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readRequiredString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === "string" ? value : null;
}

function readNullableString(record: Record<string, unknown>, key: string) {
  const value = record[key];

  if (value === null) {
    return null;
  }

  return typeof value === "string" ? value : undefined;
}

export function isVideoJobStatus(value: unknown): value is VideoJobStatus {
  return typeof value === "string" && VIDEO_JOB_STATUSES.has(value as VideoJobStatus);
}

export function getVideoJobStatusLabel(status?: string | null) {
  const normalizedStatus = status?.toLowerCase();

  if (isVideoJobStatus(normalizedStatus)) {
    return VIDEO_JOB_STATUS_LABELS[normalizedStatus];
  }

  return normalizedStatus ? normalizedStatus.replaceAll("_", " ") : "Chưa có trạng thái xử lý";
}

export function getModerationDetailsReason(details?: Record<string, unknown> | null) {
  if (!details) {
    return null;
  }

  const reason = details.reason;
  return typeof reason === "string" && reason.trim() ? reason : null;
}

export function getVideoStatusFailureReason(payload: Pick<VideoStatusChangedPayload, "failureReason" | "moderationDetails">) {
  return payload.failureReason || getModerationDetailsReason(payload.moderationDetails);
}

export function parseVideoStatusChangedData(data: string): VideoStatusChangedPayload | null {
  let parsed: unknown;

  try {
    parsed = JSON.parse(data);
  } catch {
    return null;
  }

  if (!isRecord(parsed)) {
    return null;
  }

  const videoId = readRequiredString(parsed, "videoId");
  const userId = readRequiredString(parsed, "userId");
  const status = readRequiredString(parsed, "status");
  const rawJobStatus = readRequiredString(parsed, "jobStatus")?.toLowerCase();
  const jobStatusMessage = readRequiredString(parsed, "jobStatusMessage");
  const thumbnailStatus = readRequiredString(parsed, "thumbnailStatus");
  const updatedAt = readRequiredString(parsed, "updatedAt");
  const failureReason = readNullableString(parsed, "failureReason");
  const thumbnailUrl = readNullableString(parsed, "thumbnailUrl");
  const moderationDetailsValue = parsed.moderationDetails;

  if (
    !videoId ||
    !userId ||
    !status ||
    !isVideoJobStatus(rawJobStatus) ||
    jobStatusMessage === null ||
    !thumbnailStatus ||
    !updatedAt ||
    failureReason === undefined ||
    thumbnailUrl === undefined
  ) {
    return null;
  }

  if (moderationDetailsValue !== null && !isRecord(moderationDetailsValue)) {
    return null;
  }

  return {
    videoId,
    userId,
    status: status.toLowerCase(),
    jobStatus: rawJobStatus,
    jobStatusMessage,
    failureReason,
    thumbnailStatus: thumbnailStatus.toLowerCase(),
    thumbnailUrl,
    moderationDetails: moderationDetailsValue,
    updatedAt,
  };
}

export function useVideoStatusEvents({
  enabled = true,
  onStatusChanged,
  onError,
}: UseVideoStatusEventsOptions = {}) {
  const [connectionState, setConnectionState] = useState<VideoStatusConnectionState>("idle");
  const onStatusChangedRef = useRef(onStatusChanged);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onStatusChangedRef.current = onStatusChanged;
  }, [onStatusChanged]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const abortController = new AbortController();

    const connect = async () => {
      try {
        await fetchSSE(
          VIDEO_STATUS_EVENTS_URL,
          {
            requireAuth: true,
            signal: abortController.signal,
          },
          (data, event) => {
            setConnectionState("open");
            if (event === VIDEO_STATUS_CHANGED_EVENT) {
              const payload = parseVideoStatusChangedData(typeof data === 'string' ? data : JSON.stringify(data));
              if (payload) {
                onStatusChangedRef.current?.(payload);
              }
            }
          },
          () => {
            // connection closed normally
          },
          (error) => {
            setConnectionState("error");
            onErrorRef.current?.(error as Event);
          }
        );
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setConnectionState("error");
        onErrorRef.current?.(error as Event);
      }
    };

    void connect();

    return () => {
      abortController.abort();
    };
  }, [enabled]);

  return { connectionState: enabled ? connectionState : "idle" };
}

export function VideoStatusEventsProvider({ children, enabled = true }: VideoStatusEventsProviderProps) {
  const listenersRef = useRef<Set<VideoStatusEventListener>>(new Set());
  const [latestEvent, setLatestEvent] = useState<VideoStatusChangedPayload | null>(null);

  const publishEvent = useCallback((payload: VideoStatusChangedPayload) => {
    setLatestEvent(payload);
    listenersRef.current.forEach(listener => listener(payload));
  }, []);

  const { connectionState } = useVideoStatusEvents({
    enabled,
    onStatusChanged: publishEvent,
  });

  const subscribe = useCallback((listener: VideoStatusEventListener) => {
    listenersRef.current.add(listener);

    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const value = useMemo<VideoStatusEventsContextValue>(() => ({
    connectionState,
    latestEvent,
    subscribe,
  }), [connectionState, latestEvent, subscribe]);

  return (
    <VideoStatusEventsContext.Provider value={value}>
      {children}
    </VideoStatusEventsContext.Provider>
  );
}

export function useVideoStatusEventSubscription(
  listener: VideoStatusEventListener,
  enabled = true
) {
  const context = useContext(VideoStatusEventsContext);
  const listenerRef = useRef(listener);

  useEffect(() => {
    listenerRef.current = listener;
  }, [listener]);

  useEffect(() => {
    if (!context || !enabled) {
      return;
    }

    return context.subscribe(payload => listenerRef.current(payload));
  }, [context, enabled]);

  return {
    connectionState: context?.connectionState ?? "idle",
    latestEvent: context?.latestEvent ?? null,
  };
}
