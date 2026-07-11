import { getVideoJobStatusMessageUi } from "./video-job-status-message-ui";

describe("getVideoJobStatusMessageUi", () => {
  it("maps the backend moderation waiting message to a translation key", () => {
    expect(getVideoJobStatusMessageUi("Video is waiting for moderation")).toEqual({
      type: "translation",
      key: "content.preview.statusMessage.waitingForModeration",
    });
  });

  it("keeps unknown backend messages as raw text", () => {
    expect(getVideoJobStatusMessageUi("Custom pipeline message")).toEqual({
      type: "raw",
      message: "Custom pipeline message",
    });
  });
});
