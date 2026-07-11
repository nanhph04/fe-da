import type { UploadResolution } from "../components/StudioUploadFeature";

export const UPLOAD_DRAFT_FORM_STORAGE_KEY = "studio-upload-draft-form";

export type StoredUploadDraftForm = {
  title: string;
  description: string;
  categoryId: string;
  tagIds: string[];
  resolutions: UploadResolution[];
  visibility: "public" | "private";
  price: number;
  requiredTierLevel: number | null;
};

export function createEmptyUploadDraftForm(): StoredUploadDraftForm {
  return {
    title: "",
    description: "",
    categoryId: "",
    tagIds: [],
    resolutions: ["720p"],
    visibility: "public",
    price: 0,
    requiredTierLevel: null,
  };
}

export function isEmptyUploadDraftForm(form: StoredUploadDraftForm) {
  return (
    form.title.trim().length === 0 &&
    form.description.trim().length === 0 &&
    form.categoryId.trim().length === 0 &&
    form.tagIds.length === 0 &&
    form.resolutions.length === 1 &&
    form.resolutions[0] === "720p" &&
    form.visibility === "public" &&
    form.price === 0 &&
    form.requiredTierLevel === null
  );
}
