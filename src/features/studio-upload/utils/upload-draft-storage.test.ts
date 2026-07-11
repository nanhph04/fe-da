import {
  createEmptyUploadDraftForm,
  isEmptyUploadDraftForm,
} from "./upload-draft-storage";

describe("upload draft storage", () => {
  it("treats the initial upload form as empty", () => {
    expect(isEmptyUploadDraftForm(createEmptyUploadDraftForm())).toBe(true);
  });

  it("detects restored metadata as non-empty", () => {
    expect(
      isEmptyUploadDraftForm({
        ...createEmptyUploadDraftForm(),
        title: "Old title",
      })
    ).toBe(false);
  });
});
