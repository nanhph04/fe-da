"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { UploadFormData } from "./StudioUploadFeature";
import { mediaService, type MetadataSuggestionsResponse } from "@/features/watch/services/mediaService";
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
  const t = useTranslations("Studio.upload");
  const { categories, tags, isLoadingTaxonomy, taxonomyError } = useUploadStep1State();
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [isReplacingFile, setIsReplacingFile] = useState(false);
  const [replaceError, setReplaceError] = useState<string | null>(null);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [isUploadingRaw, setIsUploadingRaw] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // AI Suggestions States
  const locale = useLocale();
  const [showAiModal, setShowAiModal] = useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [suggestionsResult, setSuggestionsResult] = useState<MetadataSuggestionsResponse | null>(null);
  const [aiTone, setAiTone] = useState<"natural" | "professional" | "seo">("natural");
  const [aiLanguage, setAiLanguage] = useState<"vi" | "en">((locale === "en" ? "en" : "vi") as "vi" | "en");
  const [aiError, setAiError] = useState<string | null>(null);

  const handleOpenAiSuggestions = () => {
    if (!formData.title.trim()) {
      alert("Vui lòng nhập tiêu đề video trước để AI có thông tin gợi ý.");
      return;
    }
    if (!formData.categoryId) {
      alert("Vui lòng chọn thể loại video trước để AI phân tích chính xác hơn.");
      return;
    }
    setAiError(null);
    setSuggestionsResult(null);
    setShowAiModal(true);
  };

  const handleGenerateSuggestions = async () => {
    setIsGeneratingSuggestions(true);
    setAiError(null);
    try {
      const response = await mediaService.getMetadataSuggestions({
        title: formData.title.trim(),
        description: formData.description.trim(),
        categoryId: formData.categoryId,
        tagIds: formData.tagIds,
        language: aiLanguage,
        tone: aiTone,
        maxDescriptionLength: 1200,
      });

      if (response.success && response.data) {
        setSuggestionsResult(response.data);
      } else {
        setAiError(response.message || "Không thể tạo gợi ý nội dung.");
      }
    } catch (err) {
      setAiError(getErrorMessage(err, "Đã xảy ra lỗi trong quá trình kết nối với AI."));
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const handleApplyTitle = (suggestedTitle: string) => {
    updateFormData({ title: suggestedTitle });
  };

  const handleApplyDescription = (suggestedDesc: string, hashtags: string[]) => {
    const hashtagStr = hashtags.length > 0 ? `\n\n${hashtags.join(" ")}` : "";
    updateFormData({ description: `${suggestedDesc}${hashtagStr}` });
  };

  const handleApplyAll = (suggestedTitle: string, suggestedDesc: string, hashtags: string[]) => {
    const hashtagStr = hashtags.length > 0 ? `\n\n${hashtags.join(" ")}` : "";
    updateFormData({
      title: suggestedTitle,
      description: `${suggestedDesc}${hashtagStr}`,
    });
    setShowAiModal(false);
  };

  const handleApplyTag = (tagId: string) => {
    if (!formData.tagIds.includes(tagId)) {
      updateFormData({ tagIds: [...formData.tagIds, tagId] });
    }
  };

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
      setThumbnailError(t("step1.errors.invalidThumbnailType"));
      return;
    }

    if (!isAllowedSize) {
      setThumbnailError(t("step1.errors.invalidThumbnailSize"));
      return;
    }

    if (formData.thumbnailPreviewUrl) {
      URL.revokeObjectURL(formData.thumbnailPreviewUrl);
    }

    if (formData.draftUpload) {
      void mediaService.cancelUpload(formData.draftUpload.videoId, formData.draftUpload.uploadId).catch(() => undefined);
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
        const res = await mediaService.cancelUpload(formData.draftUpload.videoId, formData.draftUpload.uploadId);
        if (res.success) {
          updateFormData({ file: null, draftUpload: null, rawUploadCompleted: false });
          setUploadProgress(0);
          return;
        }

        setReplaceError(res.message || t("step1.errors.cancelDraftFailed"));
      } catch (err) {
        setReplaceError(getErrorMessage(err, t("step1.errors.cancelDraftRetry")));
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
      // Hủy session upload cũ của bản nháp trước khi đổi sang file mới
      const res = await mediaService.cancelUpload(formData.draftUpload.videoId, formData.draftUpload.uploadId);
      if (res.success) {
        updateFormData({
          file,
          draftUpload: null,
          rawUploadCompleted: false,
        });
        setUploadError(null);
        setUploadProgress(0);
        return;
      }

      setReplaceError(res.message || t("step1.errors.replaceFileFailed"));
    } catch (err) {
      setReplaceError(getErrorMessage(err, t("step1.errors.replaceFileRetry")));
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
          setThumbnailError(t("step1.errors.invalidThumbnailType"));
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
          fileName: formData.file.name,
          fileSize: formData.file.size,
          fileLastModified: new Date(formData.file.lastModified).toISOString(),
          thumbnailExtension: thumbnailExtension ?? undefined,
        });

        if (!(initResponse.success || initResponse.statusCode === 201) || !initResponse.data) {
          setUploadError(initResponse.message || t("step1.errors.createDraftFailed"));
          return;
        }

        draftUpload = initResponse.data;
        updateFormData({ draftUpload, rawUploadCompleted: false });
      }

      await mediaService.uploadResumableVideoFile({
        videoId: draftUpload.videoId,
        uploadId: draftUpload.uploadId,
        file: formData.file,
        partSizeBytes: draftUpload.partSizeBytes,
        onProgress: setUploadProgress,
      });

      updateFormData({ draftUpload, rawUploadCompleted: true });
      onNext();
    } catch (err) {
      setUploadError(getErrorMessage(err, t("step1.errors.uploadVideoFailed")));
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
            {t("step1.label")}
          </span>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
            {t("step1.title")}
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
              {t("step1.fields.title")}
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
                {t("step1.fields.description")}
              </label>
              <button
                type="button"
                onClick={handleOpenAiSuggestions}
                className="inline-flex items-center gap-1.5 rounded bg-primary/10 border border-primary/20 px-3 py-1.5 font-headline text-[10px] font-bold uppercase tracking-widest text-primary transition-all duration-200 hover:bg-primary/20 active:scale-95"
              >
                <span className="material-symbols-outlined text-xs">psychology</span>
                Gợi ý bằng AI
              </button>
            </div>
            <textarea
              className="min-h-[200px] w-full resize-none border-0 bg-transparent font-body leading-relaxed text-foreground/80 outline-none focus:ring-0"
              placeholder={t("step1.fields.descriptionPlaceholder")}
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
                <p className="font-headline text-sm font-bold text-foreground">{t("step1.fields.thumbnail")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("step1.fields.thumbnailHint")}</p>
              </div>
              {formData.thumbnailFile ? (
                <button
                  type="button"
                  onClick={() => handleThumbnailSelect(null)}
                  className="rounded-sm border border-border/40 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("step1.fields.clear")}
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
                  <span className="font-headline text-xs font-bold uppercase tracking-widest">{t("step1.fields.thumbnailChoose")}</span>
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
            isLoading={isLoadingTaxonomy}
            error={taxonomyError}
            onChange={categoryId => updateFormData({ categoryId })}
          />

          <TagSection
            tags={tags}
            selectedTagIds={formData.tagIds}
            isLoading={isLoadingTaxonomy}
            error={taxonomyError}
            onChange={tagIds => updateFormData({ tagIds })}
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-between border-t border-border bg-card/80 px-8 backdrop-blur-2xl md:left-64">
        <div className="flex items-center gap-4">
          <div className="hidden flex-col sm:flex">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {t("step1.bottomBar.status")}
            </span>
            <span
              className={`flex items-center gap-1 text-xs font-bold ${
                formData.file ? "text-green-500" : "text-muted-foreground"
              }`}
            >
              {formData.file ? (
                <span className="material-symbols-outlined text-[14px]">check</span>
              ) : null}
              {formData.rawUploadCompleted
                ? t("step1.bottomBar.rawUploaded")
                : formData.file
                  ? t("step1.bottomBar.fileSelected")
                  : t("step1.bottomBar.draft")}
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
            {isUploadingRaw
              ? t("step1.bottomBar.uploading", { progress: uploadProgress })
              : formData.rawUploadCompleted
                ? t("step1.bottomBar.nextBtn")
                : t("step1.bottomBar.uploadBtn")}
          </button>
        </div>
      </div>

      {showAiModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-border/40 bg-card shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <header className="flex items-center justify-between border-b border-border/30 bg-muted/40 px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">psychology</span>
                <div>
                  <h3 className="font-headline text-lg font-bold text-foreground">Gợi ý thông tin bằng AI</h3>
                  <p className="font-body text-xs text-muted-foreground">Tự động tối ưu tiêu đề, mô tả và tag của video</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="rounded p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Configuration parameters */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 rounded-lg border border-border/20 bg-muted/20 p-4">
                <div className="space-y-2">
                  <label className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Ngôn ngữ gợi ý
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAiLanguage("vi")}
                      className={`rounded-sm py-2 font-headline text-xs font-bold transition-all ${
                        aiLanguage === "vi"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Tiếng Việt
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiLanguage("en")}
                      className={`rounded-sm py-2 font-headline text-xs font-bold transition-all ${
                        aiLanguage === "en"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Giọng điệu / Phong cách
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setAiTone("natural")}
                      className={`rounded-sm py-2 font-headline text-[11px] font-bold transition-all ${
                        aiTone === "natural"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Tự nhiên
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiTone("professional")}
                      className={`rounded-sm py-2 font-headline text-[11px] font-bold transition-all ${
                        aiTone === "professional"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Chuyên nghiệp
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiTone("seo")}
                      className={`rounded-sm py-2 font-headline text-[11px] font-bold transition-all ${
                        aiTone === "seo"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Chuẩn SEO
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={isGeneratingSuggestions}
                onClick={handleGenerateSuggestions}
                className="w-full py-3 bg-gradient-to-r from-primary to-primary/95 text-primary-foreground font-headline text-sm font-bold uppercase tracking-wider rounded-sm hover:shadow-[0_0_20px_rgba(255,142,128,0.3)] transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isGeneratingSuggestions ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                    Đang xử lý thông tin...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">insights</span>
                    Tạo gợi ý bằng AI
                  </>
                )}
              </button>

              {aiError && (
                <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">error</span>
                  <span>{aiError}</span>
                </div>
              )}

              {isGeneratingSuggestions && (
                <div className="space-y-4 py-4 animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-10 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-24 bg-muted rounded"></div>
                </div>
              )}

              {suggestionsResult && !isGeneratingSuggestions && (
                <div className="space-y-6 border-t border-border/30 pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Tiêu đề gợi ý
                      </label>
                      <button
                        type="button"
                        onClick={() => handleApplyTitle(suggestionsResult.title)}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">content_copy</span>
                        Áp dụng tiêu đề
                      </button>
                    </div>
                    <div className="rounded-md border border-border/30 bg-muted/40 p-4 font-headline text-sm font-semibold text-foreground">
                      {suggestionsResult.title}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Mô tả gợi ý
                      </label>
                      <button
                        type="button"
                        onClick={() => handleApplyDescription(suggestionsResult.description, suggestionsResult.hashtags)}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">content_copy</span>
                        Áp dụng mô tả & hashtags
                      </button>
                    </div>
                    <div className="rounded-md border border-border/30 bg-muted/40 p-4 font-body text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed max-h-[160px] overflow-y-auto">
                      {suggestionsResult.description}
                    </div>
                  </div>

                  {suggestionsResult.hashtags?.length > 0 && (
                    <div className="space-y-2">
                      <label className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Hashtags đề xuất
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {suggestionsResult.hashtags.map((hashtag: string, idx: number) => (
                          <span
                            key={idx}
                            className="inline-flex rounded-sm bg-primary/10 border border-primary/20 px-2 py-0.5 font-mono text-xs text-primary"
                          >
                            {hashtag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {suggestionsResult.suggestedTags?.length > 0 && (
                    <div className="space-y-3">
                      <label className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground block">
                        Thẻ tag đề xuất phù hợp
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {suggestionsResult.suggestedTags.map((tag) => {
                          const isAdded = formData.tagIds.includes(tag.id);
                          return (
                            <button
                              key={tag.id}
                              type="button"
                              disabled={isAdded}
                              onClick={() => handleApplyTag(tag.id)}
                              className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 font-headline text-[10px] font-bold uppercase tracking-widest transition-all ${
                                isAdded
                                  ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 cursor-default"
                                  : "border border-border/40 bg-muted text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-muted/60"
                              }`}
                            >
                              <span className="material-symbols-outlined text-xs">
                                {isAdded ? "check" : "add"}
                              </span>
                              {tag.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 font-mono">
                    <span className="material-symbols-outlined text-xs">settings_biscuit</span>
                    <span>
                      Model: {suggestionsResult.model} ({suggestionsResult.provider})
                    </span>
                  </div>
                </div>
              )}
            </div>

            <footer className="flex gap-4 border-t border-border/30 bg-muted/40 p-6">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="flex-1 py-3 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
              >
                Hủy
              </button>
              {suggestionsResult && (
                <button
                  type="button"
                  onClick={() =>
                    handleApplyAll(suggestionsResult.title, suggestionsResult.description, suggestionsResult.hashtags)
                  }
                  className="flex-[2] rounded-sm bg-gradient-to-r from-primary to-primary/90 text-primary-foreground py-3 font-headline text-sm font-bold uppercase tracking-wider transition-opacity hover:opacity-95"
                >
                  Áp dụng tất cả
                </button>
              )}
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
