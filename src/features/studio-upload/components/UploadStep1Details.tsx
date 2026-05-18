"use client";

import { useRef, useState } from "react";
import type { UploadFormData } from "./StudioUploadFeature";
import { mediaService } from "@/features/watch/services/mediaService";
import { getErrorMessage } from "@/shared/api/client";
import { CategorySection } from "./upload-step-1/CategorySection";
import { ResolutionSection } from "./upload-step-1/ResolutionSection";
import { TagSection } from "./upload-step-1/TagSection";
import { UploadProgressCard } from "./upload-step-1/UploadProgressCard";
import { useUploadStep1State } from "./upload-step-1/use-upload-step1-state";

interface UploadStep1DetailsProps {
  formData: UploadFormData;
  updateFormData: (data: Partial<UploadFormData>) => void;
  onNext: () => void;
}

function getThumbnailExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "jpg" || extension === "jpeg" || extension === "png" || extension === "webp") {
    return extension;
  }

  if (file.type === "image/jpeg") {
    return "jpg";
  }

  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  return null;
}

export function UploadStep1Details({
  formData,
  updateFormData,
  onNext,
}: UploadStep1DetailsProps) {
  const { categories, tags } = useUploadStep1State();
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [isReplacingFile, setIsReplacingFile] = useState(false);
  const [replaceError, setReplaceError] = useState<string | null>(null);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [isUploadingRaw, setIsUploadingRaw] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleThumbnailSelect = (file: File | null) => {
    if (!file) {
      if (formData.thumbnailPreviewUrl) {
        URL.revokeObjectURL(formData.thumbnailPreviewUrl);
      }

      updateFormData({ thumbnailFile: null, thumbnailPreviewUrl: null });
      setThumbnailError(null);
      return;
    }

    const isAllowedType = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
    const isAllowedSize = file.size <= 5 * 1024 * 1024;

    if (!isAllowedType) {
      setThumbnailError("Thumbnail must be a JPG, PNG, or WEBP image.");
      return;
    }

    if (!isAllowedSize) {
      setThumbnailError("Thumbnail must be 5MB or smaller.");
      return;
    }

    if (formData.thumbnailPreviewUrl) {
      URL.revokeObjectURL(formData.thumbnailPreviewUrl);
    }

    if (formData.draftUpload) {
      void mediaService.cancelUpload(formData.draftUpload.videoId).catch(() => undefined);
    }

    updateFormData({
      thumbnailFile: file,
      thumbnailPreviewUrl: URL.createObjectURL(file),
      draftUpload: null,
      rawUploadCompleted: false,
    });
    setThumbnailError(null);
  };

  const handleFileSelect = async (file: File | null) => {
    if (!file) {
      if (!formData.draftUpload) {
        updateFormData({ file: null, rawUploadCompleted: false });
        setReplaceError(null);
        setUploadError(null);
        setUploadProgress(0);
        return;
      }

      setIsReplacingFile(true);
      setReplaceError(null);

      try {
        const res = await mediaService.cancelUpload(formData.draftUpload.videoId);
        if (res.success) {
          updateFormData({ file: null, draftUpload: null, rawUploadCompleted: false });
          setUploadProgress(0);
          return;
        }

        setReplaceError(res.mess || "Không thể hủy draft upload hiện tại.");
      } catch (err) {
        setReplaceError(getErrorMessage(err, "Không thể hủy draft upload. Vui lòng thử lại."));
      } finally {
        setIsReplacingFile(false);
      }
      return;
    }

    if (!formData.draftUpload) {
      updateFormData({ file, rawUploadCompleted: false });
      setReplaceError(null);
      setUploadError(null);
      setUploadProgress(0);
      return;
    }

    setIsReplacingFile(true);
    setReplaceError(null);

    try {
      const res = await mediaService.replaceUpload(formData.draftUpload.videoId);
      if (res.success && res.data) {
        updateFormData({
          file,
          draftUpload: { ...formData.draftUpload, ...res.data },
          rawUploadCompleted: false,
        });
        setUploadError(null);
        setUploadProgress(0);
        return;
      }

      setReplaceError(res.mess || "Không thể tạo upload URL mới cho video thay thế.");
    } catch (err) {
      setReplaceError(getErrorMessage(err, "Không thể đổi file video. Vui lòng thử lại."));
    } finally {
      setIsReplacingFile(false);
    }
  };

  const canContinue =
    !!formData.file &&
    formData.title.trim().length > 0 &&
    formData.categoryId.trim().length > 0 &&
    formData.resolutions.length > 0;

  const handleNext = async () => {
    if (!canContinue || !formData.file || isUploadingRaw) {
      return;
    }

    if (formData.draftUpload && formData.rawUploadCompleted) {
      onNext();
      return;
    }

    setIsUploadingRaw(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      let draftUpload = formData.draftUpload;

      if (!draftUpload) {
        const thumbnailExtension = formData.thumbnailFile ? getThumbnailExtension(formData.thumbnailFile) : null;

        if (formData.thumbnailFile && !thumbnailExtension) {
          setThumbnailError("Thumbnail must be a JPG, PNG, or WEBP image.");
          return;
        }

        const initResponse = await mediaService.initUpload({
          title: formData.title.trim(),
          description: formData.description.trim(),
          categoryId: formData.categoryId,
          tagIds: formData.tagIds,
          visibility: formData.visibility,
          price: formData.price,
          requiredTierLevel: formData.requiredTierLevel,
          thumbnailExtension: thumbnailExtension ?? undefined,
        });

        if (!(initResponse.success || initResponse.code === 201) || !initResponse.data) {
          setUploadError(initResponse.mess || "Không thể tạo draft upload.");
          return;
        }

        draftUpload = initResponse.data;
        updateFormData({ draftUpload, rawUploadCompleted: false });
      }

      await mediaService.uploadRawVideoFile({
        uploadUrl: draftUpload.uploadUrl,
        file: formData.file,
        onProgress: setUploadProgress,
      });

      updateFormData({ draftUpload, rawUploadCompleted: true });
      onNext();
    } catch (err) {
      setUploadError(getErrorMessage(err, "Không thể upload video. Vui lòng thử lại."));
      updateFormData({ rawUploadCompleted: false });
    } finally {
      setIsUploadingRaw(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl animate-in fade-in slide-in-from-right-4 p-8 pb-32 duration-500">
      <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="mb-2 block font-headline text-xs font-bold uppercase tracking-[0.2em] text-secondary">
            New Upload
          </span>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
            Video Details
          </h1>
        </div>

        <UploadProgressCard
          file={formData.file}
          isReplacing={isReplacingFile}
          isUploading={isUploadingRaw}
          isUploaded={formData.rawUploadCompleted}
          uploadProgress={uploadProgress}
          replaceError={replaceError}
          uploadError={uploadError}
          onFileSelect={handleFileSelect}
        />
      </header>

      <input
        ref={thumbnailInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={event => {
          handleThumbnailSelect(event.target.files?.[0] ?? null);
          event.currentTarget.value = "";
        }}
      />

      <div className="grid grid-cols-1 gap-8 transition-opacity duration-500 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <div className="group">
            <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors group-focus-within:text-primary">
              Video Title
            </label>
            <input
              type="text"
              maxLength={200}
              value={formData.title}
              onChange={e => updateFormData({ title: e.target.value })}
              className="w-full border-0 border-b-2 border-border/50 bg-transparent px-0 py-4 font-headline text-xl font-semibold text-foreground outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary focus:ring-0"
            />
            <div className="mt-1 flex justify-end">
              <span className="text-[10px] text-muted-foreground/50">
                {formData.title.length} / 200
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-border/30 bg-card p-6">
            <div className="mb-4 flex items-center justify-between border-b border-border/30 pb-4">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Description
              </label>
            </div>
            <textarea
              className="min-h-[200px] w-full resize-none border-0 bg-transparent font-body leading-relaxed text-foreground/80 outline-none focus:ring-0"
              placeholder="Tell viewers about your video..."
              value={formData.description}
              onChange={e => updateFormData({ description: e.target.value })}
            />
          </div>

          <ResolutionSection
            resolutions={formData.resolutions}
            updateFormData={updateFormData}
          />
        </div>

        <div className="space-y-8 lg:col-span-4">
          <div className="rounded-lg border border-border/30 bg-card p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-headline text-sm font-bold text-foreground">Custom Thumbnail</p>
                <p className="mt-1 text-xs text-muted-foreground">Optional JPG, PNG, or WEBP up to 5MB.</p>
              </div>
              {formData.thumbnailFile ? (
                <button
                  type="button"
                  onClick={() => handleThumbnailSelect(null)}
                  className="rounded-sm border border-border/40 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
                >
                  Clear
                </button>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => thumbnailInputRef.current?.click()}
              className="group relative flex aspect-video w-full overflow-hidden rounded-sm border border-dashed border-border/50 bg-muted text-left transition-colors hover:border-primary/60"
            >
              {formData.thumbnailPreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={formData.thumbnailPreviewUrl}
                  alt="Selected thumbnail preview"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              ) : (
                <span className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <span className="material-symbols-outlined text-4xl" aria-hidden="true">add_photo_alternate</span>
                  <span className="font-headline text-xs font-bold uppercase tracking-widest">Choose thumbnail</span>
                </span>
              )}
            </button>
            {formData.thumbnailFile ? (
              <p className="mt-3 truncate text-xs text-muted-foreground" title={formData.thumbnailFile.name}>
                {formData.thumbnailFile.name}
              </p>
            ) : null}
            {thumbnailError ? <p className="mt-3 text-xs text-destructive">{thumbnailError}</p> : null}
          </div>

          <CategorySection
            categories={categories}
            selectedCategoryId={formData.categoryId}
            onChange={categoryId => updateFormData({ categoryId })}
          />

          <TagSection
            tags={tags}
            selectedTagIds={formData.tagIds}
            onChange={tagIds => updateFormData({ tagIds })}
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-between border-t border-border bg-card/80 px-8 backdrop-blur-2xl md:left-64">
        <div className="flex items-center gap-4">
          <div className="hidden flex-col sm:flex">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Status
            </span>
            <span
              className={`flex items-center gap-1 text-xs font-bold ${
                formData.file ? "text-green-500" : "text-muted-foreground"
              }`}
            >
              {formData.file ? (
                <span className="material-symbols-outlined text-[14px]">check</span>
              ) : null}
              {formData.rawUploadCompleted ? "Raw uploaded" : formData.file ? "File selected" : "Draft"}
            </span>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => void handleNext()}
            disabled={!canContinue || isUploadingRaw}
            className={`rounded-sm px-8 py-2.5 text-sm font-bold transition-all active:scale-95 ${
              canContinue && !isUploadingRaw
                ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:shadow-[0_0_20px_rgba(255,142,128,0.3)]"
                : "pointer-events-none bg-muted text-muted-foreground"
            }`}
          >
            {isUploadingRaw ? `Uploading ${uploadProgress}%` : formData.rawUploadCompleted ? "Next: Pricing & Monetization" : "Upload & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
