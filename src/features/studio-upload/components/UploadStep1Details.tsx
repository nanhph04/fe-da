"use client";

import type { UploadFormData } from "./StudioUploadFeature";
import { AccessLevelSection } from "./upload-step-1/AccessLevelSection";
import { CategorySection } from "./upload-step-1/CategorySection";
import { ResolutionSection } from "./upload-step-1/ResolutionSection";
import { UploadProgressCard } from "./upload-step-1/UploadProgressCard";
import { useUploadStep1State } from "./upload-step-1/use-upload-step1-state";

interface UploadStep1DetailsProps {
  formData: UploadFormData;
  updateFormData: (data: Partial<UploadFormData>) => void;
  onNext: () => void;
}

export function UploadStep1Details({
  formData,
  updateFormData,
  onNext,
}: UploadStep1DetailsProps) {
  const { categories } = useUploadStep1State();

  const canContinue =
    !!formData.file &&
    formData.title.trim().length > 0 &&
    formData.categories.length > 0 &&
    formData.resolutions.length > 0;

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
          onFileSelect={file => updateFormData({ file })}
        />
      </header>

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
              <span className="text-[10px] text-zinc-600">
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
              className="min-h-[200px] w-full resize-none border-0 bg-transparent font-body leading-relaxed text-zinc-300 outline-none focus:ring-0"
              placeholder="Tell viewers about your video..."
              value={formData.description}
              onChange={e => updateFormData({ description: e.target.value })}
            />
          </div>

          <AccessLevelSection
            visibility={formData.visibility}
            updateFormData={updateFormData}
          />

          <ResolutionSection
            resolutions={formData.resolutions}
            updateFormData={updateFormData}
          />
        </div>

        <div className="space-y-8 lg:col-span-4">
          <CategorySection
            categories={categories}
            selectedCategories={formData.categories}
            onChange={selectedCategories =>
              updateFormData({ categories: selectedCategories })
            }
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-between border-t border-[#262528] bg-[#131315]/80 px-8 backdrop-blur-2xl md:left-64">
        <div className="flex items-center gap-4">
          <div className="hidden flex-col sm:flex">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">
              Status
            </span>
            <span
              className={`flex items-center gap-1 text-xs font-bold ${
                formData.file ? "text-green-500" : "text-zinc-500"
              }`}
            >
              {formData.file ? (
                <span className="material-symbols-outlined text-[14px]">check</span>
              ) : null}
              {formData.file ? "File selected" : "Draft"}
            </span>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={onNext}
            disabled={!canContinue}
            className={`rounded-sm px-8 py-2.5 text-sm font-bold transition-all active:scale-95 ${
              canContinue
                ? "bg-gradient-to-r from-[#ff8e80] to-[#ff7668] text-[#650003] hover:shadow-[0_0_20px_rgba(255,142,128,0.3)]"
                : "pointer-events-none bg-zinc-800 text-zinc-500"
            }`}
          >
            Next: Pricing & Monetization
          </button>
        </div>
      </div>
    </div>
  );
}
