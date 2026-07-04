"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import type { UploadFormData } from "./StudioUploadFeature";
import { mediaService } from "@/features/watch/services/mediaService";
import { getErrorMessage } from "@/shared/api/client";

import { VideoSummaryCard } from "./upload-step-3/VideoSummaryCard";
import { PreflightChecks } from "./upload-step-3/PreflightChecks";
import { PublishActions } from "./upload-step-3/PublishActions";
import { ScheduleRelease } from "./upload-step-3/ScheduleRelease";
import { ProgressStepper } from "./upload-step-3/ProgressStepper";
import { VisibilityOptions } from "./upload-step-3/VisibilityOptions";

interface UploadStep3ReviewProps {
  formData: UploadFormData;
  updateFormData: (data: Partial<UploadFormData>) => void;
  onPrev: () => void;
}

type DeclarationDialog = "guidelines" | "drm";

export function UploadStep3Review({ formData, updateFormData, onPrev }: UploadStep3ReviewProps) {
  const t = useTranslations("Studio.upload");
  const router = useRouter();
  const [isChecked1, setIsChecked1] = useState(false);
  const [isChecked2, setIsChecked2] = useState(false);
  const [activeDeclarationDialog, setActiveDeclarationDialog] = useState<DeclarationDialog | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishStage, setPublishStage] = useState<"idle" | "metadata" | "thumbnail" | "confirming">("idle");

  const canPublish = isChecked1 && isChecked2 && !!formData.draftUpload && formData.rawUploadCompleted;
  const activeDeclarationContent = activeDeclarationDialog === "guidelines"
    ? {
        title: t("step3.declarations.guidelinesDialog.title"),
        body: t("step3.declarations.guidelinesDialog.body"),
      }
    : activeDeclarationDialog === "drm"
      ? {
          title: t("step3.declarations.drmDialog.title"),
          body: t("step3.declarations.drmDialog.body"),
        }
      : null;

  const handlePublish = async () => {
    if (!canPublish || !formData.draftUpload) return;
    setIsPublishing(true);
    setError(null);

    try {
      const draftUpload = formData.draftUpload;

      setPublishStage("metadata");
      const metadataResponse = await mediaService.updateVideoMetadata(draftUpload.videoId, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        categoryId: formData.categoryId,
        tagIds: formData.tagIds,
        visibility: formData.visibility,
        price: formData.price,
        requiredTierLevel: formData.requiredTierLevel,
      });

      if (!metadataResponse.success) {
        setError(metadataResponse.message || t("step3.errors.updateMetadataFailed"));
        return;
      }

      if (formData.thumbnailFile && (!draftUpload.thumbnailUploadUrl || !draftUpload.thumbnailObjectKey)) {
        setError(t("step3.errors.missingThumbnailUrl"));
        return;
      }

      const thumbnailObjectKey = formData.thumbnailFile ? draftUpload.thumbnailObjectKey : null;

      if (formData.thumbnailFile && draftUpload.thumbnailUploadUrl) {
        setPublishStage("thumbnail");
        await mediaService.uploadPresignedFile({
          uploadUrl: draftUpload.thumbnailUploadUrl,
          file: formData.thumbnailFile,
        });
      }

      setPublishStage("confirming");
      const confirmResponse = await mediaService.submitUpload(draftUpload.videoId, draftUpload.uploadId, {
        resolutions: formData.resolutions,
        thumbnailObjectKey: thumbnailObjectKey ?? undefined,
      });

      if (!(confirmResponse.success || confirmResponse.statusCode === 201 || confirmResponse.statusCode === 200)) {
        setError(confirmResponse.message || t("step3.errors.submitUploadFailed"));
        return;
      }

      setIsSuccess(true);
      try {
        localStorage.removeItem("studio-upload-draft-form");
      } catch (e) {
        // Ignore errors if localStorage is disabled
      }
      setTimeout(() => {
        router.push("/studio/content");
      }, 2000);
    } catch (err: unknown) {
      setError(getErrorMessage(err, t("step3.errors.genericUploadError")));
    } finally {
      setPublishStage("idle");
      setIsPublishing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-4xl mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-green-500 text-6xl">check_circle</span>
        </div>
        <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-foreground mb-2">{t("step3.success.title")}</h1>
        <p className="text-muted-foreground">{t("step3.success.message")}</p>
        <p className="text-muted-foreground text-sm mt-4">{t("step3.success.redirect")}</p>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Page Header */}
      <div className="px-12 py-10">
        <div className="mb-10 max-w-5xl mx-auto">
          <h1 className="font-display text-3xl tracking-tight font-bold text-on-surface mb-2">
            {t("step3.title")}
          </h1>
          <p className="font-body text-sm text-on-surface-variant">
            {t("step3.description")}
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-10 max-w-5xl mx-auto items-start">
          {/* Left Column */}
          <div className="flex-1 flex flex-col gap-10">
            <ProgressStepper currentStep={3} />
            <VisibilityOptions
              value={formData.visibility}
              onChange={(v) => updateFormData({ visibility: v })}
            />
            <ScheduleRelease />
          </div>

          {/* Right Column (sticky) */}
          <aside className="w-full lg:w-[340px] shrink-0 flex flex-col gap-6 lg:sticky lg:top-24">
            <VideoSummaryCard formData={formData} />
            <PreflightChecks />

            {!formData.file ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {t("step3.errors.selectFileFirst")}
              </div>
            ) : null}

            {/* Declarations — compact inline */}
            <div className={`bg-surface-container-low rounded-xl p-5 flex flex-col gap-3 transition-opacity ${isPublishing ? 'opacity-20 pointer-events-none' : ''}`}>
              <h4 className="font-headline text-sm font-semibold text-on-surface">{t("step3.declarations.title")}</h4>
              
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-start pt-0.5">
                  <input 
                    type="checkbox" 
                    className="peer sr-only" 
                    checked={isChecked1} 
                    onChange={() => setIsChecked1(!isChecked1)} 
                  />
                  <div className="w-4 h-4 rounded border-2 border-outline-variant/30 bg-transparent peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-[12px] text-black opacity-0 peer-checked:opacity-100 font-bold">check</span>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant group-hover:text-on-surface transition-colors">
                  {t.rich("step3.declarations.guidelines", {
                    link: (chunks) => (
                      <button
                        type="button"
                        className="text-left text-primary underline underline-offset-4 transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        onClick={(event) => {
                          event.preventDefault();
                          setActiveDeclarationDialog("guidelines");
                        }}
                      >
                        {chunks}
                      </button>
                    ),
                  })}
                </p>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-start pt-0.5">
                  <input 
                    type="checkbox" 
                    className="peer sr-only" 
                    checked={isChecked2} 
                    onChange={() => setIsChecked2(!isChecked2)} 
                  />
                  <div className="w-4 h-4 rounded border-2 border-outline-variant/30 bg-transparent peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-[12px] text-black opacity-0 peer-checked:opacity-100 font-bold">check</span>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant group-hover:text-on-surface transition-colors">
                  {t.rich("step3.declarations.drm", {
                    link: (chunks) => (
                      <button
                        type="button"
                        className="text-left text-primary underline underline-offset-4 transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        onClick={(event) => {
                          event.preventDefault();
                          setActiveDeclarationDialog("drm");
                        }}
                      >
                        {chunks}
                      </button>
                    ),
                  })}
                </p>
              </label>
            </div>

            <PublishActions
              canPublish={canPublish}
              isPublishing={isPublishing}
              onPublish={handlePublish}
            />

            <button
              type="button"
              onClick={onPrev}
              disabled={isPublishing}
              className="w-full rounded-sm border border-outline-variant/30 py-3 font-headline text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("step3.actions.back")}
            </button>
          </aside>
        </div>
      </div>

      {/* Publishing Overlay */}
      {isPublishing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full max-w-sm space-y-4 rounded-lg border border-border/30 bg-card p-8 text-center shadow-2xl">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h3 className="font-headline font-bold text-xl text-on-surface">{t("step3.overlay.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {publishStage === "metadata" && t("step3.overlay.metadata")}
              {publishStage === "thumbnail" && t("step3.overlay.thumbnail")}
              {publishStage === "confirming" && t("step3.overlay.confirming")}
            </p>
          </div>
        </div>
      )}

      {activeDeclarationContent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="declaration-dialog-title"
        >
          <div className="w-full max-w-md rounded-xl border border-border/40 bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <h3 id="declaration-dialog-title" className="font-headline text-xl font-bold text-on-surface">
                {activeDeclarationContent.title}
              </h3>
              <button
                type="button"
                onClick={() => setActiveDeclarationDialog(null)}
                className="rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={t("step3.declarations.closeDialog")}
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <p className="whitespace-pre-line text-sm leading-6 text-on-surface-variant">
              {activeDeclarationContent.body}
            </p>
            <button
              type="button"
              onClick={() => setActiveDeclarationDialog(null)}
              className="mt-6 w-full rounded-sm bg-primary py-3 font-headline text-sm font-bold text-on-primary transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {t("step3.declarations.closeDialog")}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-red-600/10 border border-red-600/30 rounded-lg px-6 py-3 z-50">
          <p className="text-sm text-red-500 font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
