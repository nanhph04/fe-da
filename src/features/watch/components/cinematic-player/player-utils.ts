import type Player from "video.js/dist/types/player";

export type MediaSourceDescriptor = {
  src: string;
  type: string;
};

export type QualityLevelLike = {
  enabled: boolean;
  height?: number;
  width?: number;
  bitrate?: number;
  id?: string;
  label?: string;
};

export type QualityLevelListLike = {
  length: number;
  [index: number]: QualityLevelLike;
  on?: (eventName: string, callback: () => void) => void;
  off?: (eventName: string, callback: () => void) => void;
};

export function getQualityLevelResolutions(qualityLevels: QualityLevelListLike) {
  const heights = new Set<number>();

  for (let index = 0; index < qualityLevels.length; index += 1) {
    const height = qualityLevels[index]?.height;

    if (typeof height === "number" && Number.isFinite(height) && height > 0) {
      heights.add(Math.round(height));
    }
  }

  return Array.from(heights)
    .sort((left, right) => right - left)
    .map((height) => `${height}p`);
}

export const SEEK_STEP_SECONDS = 5;

const HLS_MIME_TYPES = [
  "application/x-mpegURL",
  "application/vnd.apple.mpegurl",
];

export function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.isContentEditable
  );
}

export function normalizeMediaPath(value: string) {
  return value.split("?")[0]?.toLowerCase() ?? value.toLowerCase();
}

export function inferSourceType(src: string) {
  const mediaPath = normalizeMediaPath(src);

  if (mediaPath.endsWith(".m3u8")) {
    return HLS_MIME_TYPES[0];
  }

  if (mediaPath.endsWith(".mp4")) {
    return "video/mp4";
  }

  if (mediaPath.endsWith(".webm")) {
    return "video/webm";
  }

  if (mediaPath.endsWith(".ogg") || mediaPath.endsWith(".ogv")) {
    return "video/ogg";
  }

  return HLS_MIME_TYPES[0];
}

export function buildMediaSource(src: string): MediaSourceDescriptor {
  return {
    src,
    type: inferSourceType(src),
  };
}

export function redactUrlForLogs(rawUrl: string) {
  try {
    const base =
      typeof window !== "undefined" ? window.location.origin : "http://localhost";
    const url = new URL(rawUrl, base);
    if (url.searchParams.has("token")) {
      url.searchParams.set("token", "[redacted]");
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return rawUrl.replace(/token=[^&]+/i, "token=[redacted]");
  }
}

export function createPlaybackErrorMessage(
  source: MediaSourceDescriptor,
  error: ReturnType<Player["error"]>
) {
  if (!error) {
    return "Video playback failed.";
  }

  if (error.code === 4) {
    return `Unable to load this video source. Verify the HLS manifest or media format for ${redactUrlForLogs(source.src)}.`;
  }

  if (error.message?.trim()) {
    return error.message;
  }

  return `Video playback failed with code ${error.code}.`;
}

export function buildPlaybackDiagnostic(
  source: MediaSourceDescriptor | null,
  error: ReturnType<Player["error"]>
) {
  return {
    source: source ? redactUrlForLogs(source.src) : undefined,
    type: source?.type,
    code: error?.code ?? null,
    message: error?.message ?? null,
  };
}
