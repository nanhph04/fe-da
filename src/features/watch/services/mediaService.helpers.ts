export const READY_THUMBNAIL_STATUS = "ready";

function encodeVideoPathId(videoId: string) {
  return encodeURIComponent(videoId);
}

export function buildPublicVideoThumbnailUrl(videoId: string) {
  return `/api/media/videos/${encodeVideoPathId(videoId)}/thumbnail`;
}

export function buildOwnerVideoThumbnailUrl(videoId: string) {
  return `/api/media/studio/videos/${encodeVideoPathId(videoId)}/thumbnail`;
}

export function getReadyThumbnailUrl(thumbnailUrl?: string | null, thumbnailStatus?: string | null) {
  return thumbnailUrl && thumbnailStatus === READY_THUMBNAIL_STATUS ? thumbnailUrl : null;
}

export function getReadyPublicVideoThumbnailUrl(
  videoId?: string | null,
  thumbnailUrl?: string | null,
  thumbnailStatus?: string | null
) {
  if (thumbnailStatus !== READY_THUMBNAIL_STATUS) {
    return null;
  }

  return videoId ? buildPublicVideoThumbnailUrl(videoId) : thumbnailUrl || null;
}

export function getReadyOwnerVideoThumbnailUrl(
  videoId?: string | null,
  thumbnailUrl?: string | null,
  thumbnailStatus?: string | null
) {
  if (thumbnailStatus !== READY_THUMBNAIL_STATUS) {
    return null;
  }

  return videoId ? buildOwnerVideoThumbnailUrl(videoId) : thumbnailUrl || null;
}

export const buildQueryString = (params?: Record<string, string | number | undefined>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const toCommaSeparated = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(",");
  }

  return value;
};
