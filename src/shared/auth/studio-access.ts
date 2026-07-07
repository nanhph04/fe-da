export const LOCKED_STUDIO_REASON = "channel-locked";
export const LOCKED_STUDIO_QUERY = `studioBlocked=${LOCKED_STUDIO_REASON}`;

export const LOCKED_CHANNEL_TOAST_TITLE = "Kênh đã bị khóa";
export const LOCKED_CHANNEL_TOAST_DESCRIPTION =
  "Kênh của bạn đã bị quản trị viên khóa. Bạn không thể vào Creator Studio lúc này.";
export const LOCKED_CHANNEL_REDIRECT_DESCRIPTION =
  "Kênh của bạn đã bị quản trị viên khóa. Bạn đã được chuyển sang giao diện người xem.";

export function isLockedChannelStatus(status?: string | null) {
  return !!status && status.toLowerCase() !== "active";
}

export function buildLockedStudioRedirectPath(channelId?: string | null) {
  if (!channelId) {
    return `/library?${LOCKED_STUDIO_QUERY}`;
  }

  return `/channel/${encodeURIComponent(channelId)}?${LOCKED_STUDIO_QUERY}`;
}

export type StudioChannelStatus = {
  channelId?: string | null;
  status?: string | null;
};

export function getLockedStudioRedirectPathFromChannel(channel?: StudioChannelStatus | null) {
  if (!isLockedChannelStatus(channel?.status)) {
    return null;
  }

  return buildLockedStudioRedirectPath(channel?.channelId);
}
