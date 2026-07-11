import { getUploadWizardStatus } from "./upload-wizard-status";

describe("getUploadWizardStatus", () => {
  it("allows publish only after a draft exists and the raw upload is complete", () => {
    expect(
      getUploadWizardStatus({
        hasDraftUpload: true,
        rawUploadCompleted: true,
        isUploadingRaw: false,
        uploadError: null,
      })
    ).toMatchObject({ state: "completed", canConfirmUpload: true });
  });

  it("keeps publish disabled while the raw upload is still running", () => {
    expect(
      getUploadWizardStatus({
        hasDraftUpload: true,
        rawUploadCompleted: false,
        isUploadingRaw: true,
        uploadError: null,
      })
    ).toMatchObject({ state: "uploading", canConfirmUpload: false });
  });

  it("surfaces failed background uploads as not publishable", () => {
    expect(
      getUploadWizardStatus({
        hasDraftUpload: true,
        rawUploadCompleted: false,
        isUploadingRaw: false,
        uploadError: "Network error",
      })
    ).toMatchObject({ state: "failed", canConfirmUpload: false });
  });
});
