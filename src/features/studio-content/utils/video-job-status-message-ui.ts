export type VideoJobStatusMessageUi =
  | {
      type: "translation";
      key: "content.preview.statusMessage.waitingForModeration";
    }
  | {
      type: "raw";
      message: string;
    };

export function getVideoJobStatusMessageUi(message: string): VideoJobStatusMessageUi {
  if (message === "Video is waiting for moderation") {
    return {
      type: "translation",
      key: "content.preview.statusMessage.waitingForModeration",
    };
  }

  return {
    type: "raw",
    message,
  };
}
