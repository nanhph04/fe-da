import {
  buildLockedStudioRedirectPath,
  getLockedStudioRedirectPathFromChannel,
  isLockedChannelStatus,
} from "./studio-access";

describe("studio access helpers", () => {
  it("treats non-active channel statuses as locked", () => {
    expect(isLockedChannelStatus("suspended")).toBe(true);
    expect(isLockedChannelStatus("inactive")).toBe(true);
    expect(isLockedChannelStatus("ACTIVE")).toBe(false);
    expect(isLockedChannelStatus(undefined)).toBe(false);
  });

  it("redirects locked creators to their viewer channel when channel id is available", () => {
    expect(buildLockedStudioRedirectPath("channel-1")).toBe(
      "/channel/channel-1?studioBlocked=channel-locked",
    );
  });

  it("falls back to library when channel id is unavailable", () => {
    expect(buildLockedStudioRedirectPath()).toBe("/library?studioBlocked=channel-locked");
  });

  it("returns a redirect target only when the current studio channel is locked", () => {
    expect(
      getLockedStudioRedirectPathFromChannel({ channelId: "channel-1", status: "suspended" }),
    ).toBe("/channel/channel-1?studioBlocked=channel-locked");
    expect(
      getLockedStudioRedirectPathFromChannel({ channelId: "channel-1", status: "active" }),
    ).toBeNull();
    expect(getLockedStudioRedirectPathFromChannel(null)).toBeNull();
  });
});
