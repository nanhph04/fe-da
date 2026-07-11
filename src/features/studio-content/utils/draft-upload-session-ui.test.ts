import { getDraftUploadSessionUiState } from "./draft-upload-session-ui";

describe("getDraftUploadSessionUiState", () => {
  it("marks completed draft sessions as confirmable", () => {
    expect(
      getDraftUploadSessionUiState({
        uploadId: "upload-1",
        uploadSessionStatus: "completed",
      })
    ).toEqual({
      state: "completed",
      noticeKey: "content.notices.draftUploadCompleted",
      statusKey: "content.uploadSessionStatus.completed",
      canResume: true,
      canConfirm: true,
    });
  });

  it("marks active draft sessions as resumable but not confirmable", () => {
    expect(
      getDraftUploadSessionUiState({
        uploadId: "upload-1",
        uploadSessionStatus: "active",
      })
    ).toMatchObject({
      state: "active",
      noticeKey: "content.notices.draftUploadActive",
      statusKey: "content.uploadSessionStatus.active",
      canResume: true,
      canConfirm: false,
    });
  });

  it("marks drafts without upload id as missing session", () => {
    expect(
      getDraftUploadSessionUiState({
        uploadId: null,
        uploadSessionStatus: null,
      })
    ).toMatchObject({
      state: "missing",
      noticeKey: "content.notices.draftUploadMissingSession",
      statusKey: "content.uploadSessionStatus.missing",
      canResume: false,
      canConfirm: false,
    });
  });
});
