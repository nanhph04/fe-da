"use client";

import { useState } from "react";
import { UploadStep1Details } from "./UploadStep1Details";
import { UploadStep2Monetization } from "./UploadStep2Monetization";
import { UploadStep3Review } from "./UploadStep3Review";

export type UploadResolution = "480p" | "720p" | "1080p";

export interface DraftUploadSession {
  videoId: string;
  status: string;
  rawFileKey: string;
  bucket: string;
  uploadUrl: string;
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
  draftUpload: DraftUploadSession | null;
}

export function StudioUploadFeature() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<UploadFormData>({
    title: "",
    description: "",
    categoryId: "",
    tagIds: [],
    resolutions: ["720p", "1080p"],
    visibility: "public",
    price: 0,
    requiredTierLevel: null,
    file: null,
    draftUpload: null,
  });

  const updateFormData = (data: Partial<UploadFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  return (
    <div className="min-h-screen bg-[#0e0e10]">
      {/* Top Stepper UI - Ẩn khi step 3 vì stepper nằm trong component */}
      {currentStep < 3 && (
        <div className="max-w-6xl mx-auto px-8 pt-12 pb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${currentStep >= 1 ? 'bg-[#ff8e80] text-black ring-4 ring-[#ff8e80]/20' : 'bg-zinc-800 text-zinc-400'}`}>1</span>
              <span className={`text-sm font-headline ${currentStep >= 1 ? 'text-white font-bold' : 'text-zinc-500'}`}>Details</span>
            </div>
            <div className={`w-12 h-[1px] ${currentStep >= 2 ? 'bg-[#ff8e80]' : 'bg-zinc-800'}`}></div>
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${currentStep >= 2 ? 'bg-[#ff8e80] text-black ring-4 ring-[#ff8e80]/20' : 'bg-zinc-800 text-zinc-400'}`}>2</span>
              <span className={`text-sm font-headline ${currentStep >= 2 ? 'text-white font-bold' : 'text-zinc-500'}`}>Pricing & Payout</span>
            </div>
            <div className={`w-12 h-[1px] ${currentStep >= 3 ? 'bg-[#ff8e80]' : 'bg-zinc-800'}`}></div>
            <div className={`flex items-center gap-2 ${currentStep < 3 ? 'opacity-40' : ''}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${currentStep >= 3 ? 'bg-[#ff8e80] text-black ring-4 ring-[#ff8e80]/20' : 'bg-zinc-800 text-zinc-400'}`}>3</span>
              <span className={`text-sm font-headline ${currentStep >= 3 ? 'text-white font-bold' : 'text-zinc-500'}`}>Publish</span>
            </div>
          </div>
        </div>
      )}

      {/* Render Steps */}
      {currentStep === 1 && (
        <UploadStep1Details 
          formData={formData}
          updateFormData={updateFormData}
          onNext={() => setCurrentStep(2)} 
        />
      )}
      
      {currentStep === 2 && (
        <UploadStep2Monetization 
          formData={formData}
          updateFormData={updateFormData}
          onPrev={() => setCurrentStep(1)} 
          onNext={() => setCurrentStep(3)} 
        />
      )}
      
      {currentStep === 3 && (
        <UploadStep3Review 
          formData={formData}
          updateFormData={updateFormData}
          onPrev={() => setCurrentStep(2)} 
        />
      )}
    </div>
  );
}
