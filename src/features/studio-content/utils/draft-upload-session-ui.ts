type DraftUploadSessionSource = {
  uploadId?: string | null;
  uploadSessionStatus?: string | null;
};

export type DraftUploadSessionUiState = {
  state: "active" | "completed" | "missing";
  noticeKey:
    | "content.notices.draftUploadActive"
    | "content.notices.draftUploadCompleted"
    | "content.notices.draftUploadMissingSession";
  statusKey:
    | "content.uploadSessionStatus.active"
    | "content.uploadSessionStatus.completed"
    | "content.uploadSessionStatus.missing";
  canResume: boolean;
  canConfirm: boolean;
};

export function getDraftUploadSessionUiState(
  video: DraftUploadSessionSource
): DraftUploadSessionUiState {
  if (!video.uploadId) {
    return {
      state: "missing",
      noticeKey: "content.notices.draftUploadMissingSession",
      statusKey: "content.uploadSessionStatus.missing",
      canResume: false,
      canConfirm: false,
    };
  }

  if (video.uploadSessionStatus?.toLowerCase() === "completed") {
    return {
      state: "completed",
      noticeKey: "content.notices.draftUploadCompleted",
      statusKey: "content.uploadSessionStatus.completed",
      canResume: true,
      canConfirm: true,
    };
  }

  return {
    state: "active",
    noticeKey: "content.notices.draftUploadActive",
    statusKey: "content.uploadSessionStatus.active",
    canResume: true,
    canConfirm: false,
  };
}
