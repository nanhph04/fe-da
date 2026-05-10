"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadFormData } from "./StudioUploadFeature";
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

  const canPublish = isChecked1 && isChecked2;

  const handlePublish = async () => {
    if (!canPublish) return;
    setIsPublishing(true);
    setError(null);
    
    try {
      // Gọi API initUpload (channelId được tự động nhận dạng bởi backend qua Auth Token)
      const res = await mediaService.initUpload({
        title: formData.title,
        description: formData.description,
        categories: formData.categories,
        visibility: formData.visibility,
        price: formData.price,
        requiredTierLevel: formData.requiredTierLevel
      });

      if (res.success || res.code === 201) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/studio");
        }, 2000);
      } else {
        setError(res.mess || "Failed to initialize upload");
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, "An error occurred during upload"));
    } finally {
      setIsPublishing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-4xl mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-green-500 text-6xl">check_circle</span>
        </div>
        <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-[#f9f5f8] mb-2">Upload Draft Created</h1>
        <p className="text-zinc-400">Thong tin video va cau hinh upload da duoc gui sang media service.</p>
        <p className="text-zinc-500 text-sm mt-4">Redirecting to Dashboard...</p>
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
        <div className="fixed inset-0 z-50 bg-[#0e0e10]/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h3 className="font-headline font-bold text-xl text-on-surface">Publishing your Masterpiece...</h3>
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
