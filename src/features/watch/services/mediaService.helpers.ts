export const READY_THUMBNAIL_STATUS = "ready";

export function getReadyThumbnailUrl(thumbnailUrl?: string | null, thumbnailStatus?: string | null) {
  return thumbnailUrl && thumbnailStatus === READY_THUMBNAIL_STATUS ? thumbnailUrl : null;
}

export function getReadyPublicVideoThumbnailUrl(
  videoId?: string | null,
  thumbnailUrl?: string | null,
  thumbnailStatus?: string | null
) {
  void videoId;
  return getReadyThumbnailUrl(thumbnailUrl, thumbnailStatus);
}

export function getReadyOwnerVideoThumbnailUrl(
  videoId?: string | null,
  thumbnailUrl?: string | null,
  thumbnailStatus?: string | null
) {
  void videoId;
  return getReadyThumbnailUrl(thumbnailUrl, thumbnailStatus);
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
