export type UploadWizardStatusState = "idle" | "draft" | "uploading" | "completed" | "failed";

export type UploadWizardStatusInput = {
  hasDraftUpload: boolean;
  rawUploadCompleted: boolean;
  isUploadingRaw: boolean;
  uploadError: string | null;
};

export type UploadWizardStatus = {
  state: UploadWizardStatusState;
  canConfirmUpload: boolean;
};

export function getUploadWizardStatus({
  hasDraftUpload,
  rawUploadCompleted,
  isUploadingRaw,
  uploadError,
}: UploadWizardStatusInput): UploadWizardStatus {
  if (rawUploadCompleted && hasDraftUpload) {
    return { state: "completed", canConfirmUpload: true };
  }

  if (uploadError) {
    return { state: "failed", canConfirmUpload: false };
  }

  if (isUploadingRaw) {
    return { state: "uploading", canConfirmUpload: false };
  }

  if (hasDraftUpload) {
    return { state: "draft", canConfirmUpload: false };
  }

  return { state: "idle", canConfirmUpload: false };
}
