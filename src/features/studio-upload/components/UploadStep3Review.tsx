"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export function UploadStep3Review({ formData, updateFormData, onPrev }: UploadStep3ReviewProps) {
  const router = useRouter();
  const [isChecked1, setIsChecked1] = useState(false);
  const [isChecked2, setIsChecked2] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishStage, setPublishStage] = useState<"idle" | "metadata" | "thumbnail" | "confirming">("idle");

  const canPublish = isChecked1 && isChecked2 && !!formData.draftUpload && formData.rawUploadCompleted;

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
        setError(metadataResponse.mess || "Failed to update draft metadata");
        return;
      }

      if (formData.thumbnailFile && (!draftUpload.thumbnailUploadUrl || !draftUpload.thumbnailObjectKey)) {
        setError("Media service did not return a thumbnail upload URL. Remove the custom thumbnail or try again.");
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
      const confirmResponse = await mediaService.confirmUpload(draftUpload.videoId, {
        resolutions: formData.resolutions,
        thumbnailObjectKey: thumbnailObjectKey ?? undefined,
      });

      if (!(confirmResponse.success || confirmResponse.code === 201 || confirmResponse.code === 200)) {
        setError(confirmResponse.mess || "Failed to confirm upload");
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/studio/content");
      }, 2000);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "An error occurred during upload"));
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
        <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-foreground mb-2">Upload Submitted</h1>
        <p className="text-muted-foreground">Video đã được gửi sang pipeline xử lý và kiểm duyệt.</p>
        <p className="text-muted-foreground text-sm mt-4">Redirecting to Content Library...</p>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Page Header */}
      <div className="px-12 py-10">
        <div className="mb-10 max-w-5xl mx-auto">
          <h1 className="font-display text-3xl tracking-tight font-bold text-on-surface mb-2">
            Publishing Pipeline
          </h1>
          <p className="font-body text-sm text-on-surface-variant">
            Configure release parameters and final checks before going live.
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
                Vui lòng quay lại bước Details để chọn video file trước khi publish.
              </div>
            ) : null}

            {/* Declarations — compact inline */}
            <div className={`bg-surface-container-low rounded-xl p-5 flex flex-col gap-3 transition-opacity ${isPublishing ? 'opacity-20 pointer-events-none' : ''}`}>
              <h4 className="font-headline text-sm font-semibold text-on-surface">Terms & Declarations</h4>
              
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
                  I confirm compliance with <span className="text-primary">Aura Cinematic Community Guidelines</span>
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
                  I understand Aura DRM will be applied to prevent unauthorized redistribution
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
              Back to Pricing
            </button>
          </aside>
        </div>
      </div>

      {/* Publishing Overlay */}
      {isPublishing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full max-w-sm space-y-4 rounded-lg border border-border/30 bg-card p-8 text-center shadow-2xl">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h3 className="font-headline font-bold text-xl text-on-surface">Publishing your Masterpiece...</h3>
            <p className="text-sm text-muted-foreground">
              {publishStage === "metadata" && "Syncing final metadata..."}
              {publishStage === "thumbnail" && "Uploading custom thumbnail..."}
              {publishStage === "confirming" && "Confirming upload for processing..."}
            </p>
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
