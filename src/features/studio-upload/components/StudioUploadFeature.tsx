"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { UploadStep1Details } from "./UploadStep1Details";
import { UploadStep2Monetization } from "./UploadStep2Monetization";
import { UploadStep3Review } from "./UploadStep3Review";
import { studioUploadService } from "../services/studioUploadService";
import { getErrorMessage } from "@/shared/api/client";
import {
  createEmptyUploadDraftForm,
  isEmptyUploadDraftForm,
  UPLOAD_DRAFT_FORM_STORAGE_KEY,
} from "../utils/upload-draft-storage";

export type UploadResolution = "480p" | "720p" | "1080p";

export interface DraftUploadSession {
  videoId: string;
  status: string;
  rawFileKey: string;
  bucket: string;
  uploadId: string;
  partSizeBytes: number;
  expiresAt: string;
  thumbnailObjectKey: string | null;
  thumbnailBucket: string | null;
  thumbnailUploadUrl: string | null;
}

export interface UploadFormData {
  title: string;
  description: string;
  categoryId: string;
  tagIds: string[];
  resolutions: UploadResolution[];
  visibility: "public" | "private";
  price: number;
  requiredTierLevel: number | null;
  file: File | null;
  thumbnailFile: File | null;
  thumbnailPreviewUrl: string | null;
  draftUpload: DraftUploadSession | null;
  rawUploadCompleted: boolean;
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

export function StudioUploadFeature() {
  const t = useTranslations("Studio.upload");
  const [currentStep, setCurrentStep] = useState(1);
  const emptyDraftForm = createEmptyUploadDraftForm();
  const [formData, setFormData] = useState<UploadFormData>({
    ...emptyDraftForm,
    requiredTierLevel: null,
    file: null,
    thumbnailFile: null,
    thumbnailPreviewUrl: null,
    draftUpload: null,
    rawUploadCompleted: false,
  });
  const [isUploadingRaw, setIsUploadingRaw] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDraftPersistenceEnabled, setIsDraftPersistenceEnabled] = useState(true);

  useEffect(() => {
    return () => {
      if (formData.thumbnailPreviewUrl) {
        URL.revokeObjectURL(formData.thumbnailPreviewUrl);
      }
    };
  }, [formData.thumbnailPreviewUrl]);

  // Khôi phục dữ liệu từ localStorage khi mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(UPLOAD_DRAFT_FORM_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({
          ...prev,
          title: parsed.title ?? prev.title,
          description: parsed.description ?? prev.description,
          categoryId: parsed.categoryId ?? prev.categoryId,
          tagIds: parsed.tagIds ?? prev.tagIds,
          resolutions: parsed.resolutions ?? prev.resolutions,
          visibility: parsed.visibility ?? prev.visibility,
          price: parsed.price ?? prev.price,
          requiredTierLevel: parsed.requiredTierLevel ?? prev.requiredTierLevel,
        }));
      }
    } catch (e) {
      console.warn("Failed to restore upload draft form from localStorage", e);
    }
  }, []);

  // Tự động lưu dữ liệu form vào localStorage khi có thay đổi
  useEffect(() => {
    const dataToSave = {
      title: formData.title,
      description: formData.description,
      categoryId: formData.categoryId,
      tagIds: formData.tagIds,
      resolutions: formData.resolutions,
      visibility: formData.visibility,
      price: formData.price,
      requiredTierLevel: formData.requiredTierLevel,
    };
    if (!isDraftPersistenceEnabled || isEmptyUploadDraftForm(dataToSave)) {
      localStorage.removeItem(UPLOAD_DRAFT_FORM_STORAGE_KEY);
      return;
    }

    localStorage.setItem(UPLOAD_DRAFT_FORM_STORAGE_KEY, JSON.stringify(dataToSave));
  }, [
    formData.title,
    formData.description,
    formData.categoryId,
    formData.tagIds,
    formData.resolutions,
    formData.visibility,
    formData.price,
    formData.requiredTierLevel,
    isDraftPersistenceEnabled,
  ]);

  // Cảnh báo khi người dùng f5 hoặc đóng tab nếu đang có file hoặc đang tải lên
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (formData.file || formData.draftUpload) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formData.file, formData.draftUpload]);

  const updateFormData = useCallback((data: Partial<UploadFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  const resetBackgroundUploadState = useCallback(() => {
    setIsUploadingRaw(false);
    setUploadProgress(0);
    setUploadError(null);
  }, []);

  const clearUploadDraftFormStorage = useCallback(() => {
    setIsDraftPersistenceEnabled(false);
    localStorage.removeItem(UPLOAD_DRAFT_FORM_STORAGE_KEY);
  }, []);

  const startBackgroundUpload = useCallback(async () => {
    if (!formData.file) {
      return false;
    }

    if (formData.draftUpload && formData.rawUploadCompleted) {
      return true;
    }

    if (isUploadingRaw) {
      return true;
    }

    setIsUploadingRaw(true);
    setUploadProgress(0);
    setUploadError(null);

    let draftUpload = formData.draftUpload;

    if (!draftUpload) {
      const thumbnailExtension = formData.thumbnailFile ? getThumbnailExtension(formData.thumbnailFile) : null;

      if (formData.thumbnailFile && !thumbnailExtension) {
        setIsUploadingRaw(false);
        setUploadError(t("step1.errors.invalidThumbnailType"));
        return false;
      }

      try {
        const initResponse = await studioUploadService.initUpload({
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
          setIsUploadingRaw(false);
          setUploadError(initResponse.message || t("step1.errors.createDraftFailed"));
          return false;
        }

        draftUpload = initResponse.data;
        updateFormData({ draftUpload, rawUploadCompleted: false });
      } catch (err) {
        setIsUploadingRaw(false);
        setUploadError(getErrorMessage(err, t("step1.errors.createDraftFailed")));
        return false;
      }
    }

    const file = formData.file;
    const activeDraftUpload = draftUpload;

    void studioUploadService.uploadResumableVideoFile({
      videoId: activeDraftUpload.videoId,
      uploadId: activeDraftUpload.uploadId,
      file,
      partSizeBytes: activeDraftUpload.partSizeBytes,
      onProgress: setUploadProgress,
    }).then(() => {
      updateFormData({ draftUpload: activeDraftUpload, rawUploadCompleted: true });
      setUploadProgress(100);
      setUploadError(null);
    }).catch((err) => {
      setUploadError(getErrorMessage(err, t("step1.errors.uploadVideoFailed")));
      updateFormData({ rawUploadCompleted: false });
    }).finally(() => {
      setIsUploadingRaw(false);
    });

    return true;
  }, [formData, isUploadingRaw, t, updateFormData]);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Stepper UI - Ẩn khi step 3 vì stepper nằm trong component */}
      {currentStep < 3 && (
        <div className="max-w-6xl mx-auto px-8 pt-12 pb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${currentStep >= 1 ? 'bg-primary text-black ring-4 ring-primary/20' : 'bg-muted text-muted-foreground'}`}>1</span>
              <span className={`text-sm font-headline ${currentStep >= 1 ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>{t("stepper.details")}</span>
            </div>
            <div className={`w-12 h-[1px] ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${currentStep >= 2 ? 'bg-primary text-black ring-4 ring-primary/20' : 'bg-muted text-muted-foreground'}`}>2</span>
              <span className={`text-sm font-headline ${currentStep >= 2 ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>{t("stepper.pricing")}</span>
            </div>
            <div className={`w-12 h-[1px] ${currentStep >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`flex items-center gap-2 ${currentStep < 3 ? 'opacity-40' : ''}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${currentStep >= 3 ? 'bg-primary text-black ring-4 ring-primary/20' : 'bg-muted text-muted-foreground'}`}>3</span>
              <span className={`text-sm font-headline ${currentStep >= 3 ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>{t("stepper.publish")}</span>
            </div>
          </div>
        </div>
      )}

      {/* Render Steps */}
      {currentStep === 1 && (
        <UploadStep1Details 
          formData={formData}
          updateFormData={updateFormData}
          isUploadingRaw={isUploadingRaw}
          uploadProgress={uploadProgress}
          uploadError={uploadError}
          onStartBackgroundUpload={startBackgroundUpload}
          onResetBackgroundUploadState={resetBackgroundUploadState}
          onNext={() => setCurrentStep(2)} 
        />
      )}
      
      {currentStep === 2 && (
        <UploadStep2Monetization 
          formData={formData}
          updateFormData={updateFormData}
          isUploadingRaw={isUploadingRaw}
          uploadProgress={uploadProgress}
          uploadError={uploadError}
          onPrev={() => setCurrentStep(1)} 
          onNext={() => setCurrentStep(3)} 
        />
      )}
      
      {currentStep === 3 && (
        <UploadStep3Review 
          formData={formData}
          updateFormData={updateFormData}
          isUploadingRaw={isUploadingRaw}
          uploadProgress={uploadProgress}
          uploadError={uploadError}
          onClearDraftStorage={clearUploadDraftFormStorage}
          onPrev={() => setCurrentStep(2)} 
        />
      )}
    </div>
  );
}
