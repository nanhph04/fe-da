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

export const SEEK_STEP_SECONDS = 5;
export const PLAYBACK_TOKEN_REFRESH_BUFFER_SECONDS = 30;

const HLS_MIME_TYPES = [
  "application/x-mpegURL",
  "application/vnd.apple.mpegurl",
];

export function getQualityLevelResolutions(qualityLevels: QualityLevelListLike): string[] {
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

function decodeBase64Url(value: string): string {
  const normalizedValue = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddingLength = (4 - (normalizedValue.length % 4)) % 4;
  const paddedValue = normalizedValue + "=".repeat(paddingLength);

  return atob(paddedValue);
}

export function getPlaybackTokenFromSource(src: string): string | null {
  try {
    const base =
      typeof window !== "undefined" ? window.location.origin : "http://localhost";
    const url = new URL(src, base);

    return url.searchParams.get("token");
  } catch {
    const tokenMatch = src.match(/[?&]token=([^&#]+)/i);
    return tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
  }
}

export function getPlaybackTokenExpirySeconds(token: string): number | null {
  const [encodedPayload] = token.split(".");

  if (!encodedPayload) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as {
      exp?: unknown;
    };

    if (typeof payload.exp !== "number" || !Number.isFinite(payload.exp)) {
      return null;
    }

    return payload.exp;
  } catch {
    return null;
  }
}

export function getPlaybackTokenExpiryMs(token: string): number | null {
  const expirySeconds = getPlaybackTokenExpirySeconds(token);

  if (expirySeconds === null) {
    return null;
  }

  return expirySeconds * 1000;
}

export function replacePlaybackTokenInSource(src: string, token: string): string {
  try {
    const isAbsoluteUrl = /^https?:\/\//i.test(src);
    const base =
      typeof window !== "undefined" ? window.location.origin : "http://localhost";
    const url = new URL(src, base);

    url.searchParams.set("token", token);

    if (isAbsoluteUrl) {
      return url.toString();
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    if (/[?&]token=/i.test(src)) {
      return src.replace(/([?&]token=)[^&#]*/i, `$1${encodeURIComponent(token)}`);
    }

    return src.includes("?")
      ? `${src}&token=${encodeURIComponent(token)}`
      : `${src}?token=${encodeURIComponent(token)}`;
  }
}

export function shouldRefreshPlaybackToken(token: string): boolean {
  const expiryMs = getPlaybackTokenExpiryMs(token);

  if (expiryMs === null) {
    return false;
  }

  return (
    expiryMs <= Date.now() + PLAYBACK_TOKEN_REFRESH_BUFFER_SECONDS * 1000
  );
}

export function isTypingTarget(target: EventTarget | null): boolean {
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

export function normalizeMediaPath(value: string): string {
  return value.split("?")[0]?.toLowerCase() ?? value.toLowerCase();
}

export function inferSourceType(src: string): string {
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

export function redactUrlForLogs(rawUrl: string): string {
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
): string {
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
): {
  source?: string;
  type?: string;
  code: number | null;
  message: string | null;
} {
  return {
    source: source ? redactUrlForLogs(source.src) : undefined,
    type: source?.type,
    code: error?.code ?? null,
    message: error?.message ?? null,
  };
}
