"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadFormData } from "./StudioUploadFeature";
import { mediaService } from "@/features/watch/services/mediaService";

interface UploadStep3ReviewProps {
  formData: UploadFormData;
  onPrev: () => void;
}

export function UploadStep3Review({ formData, onPrev }: UploadStep3ReviewProps) {
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
    } catch (err: any) {
      setError(err.mess || err.message || "An error occurred during upload");
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
        <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-[#f9f5f8] mb-2">Video Upload Initialized!</h1>
        <p className="text-zinc-400">Your video is now being processed by Aura Studio.</p>
        <p className="text-zinc-500 text-sm mt-4">Redirecting to Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 pb-32 w-full animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Page Header */}
      <div className="mb-12 text-center">
        <span className="material-symbols-outlined text-6xl text-[#ff8e80] mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-[#f9f5f8] mb-2">Ready to Publish</h1>
        <p className="text-zinc-400 max-w-lg mx-auto">Please review your video details one last time. Once published, notifications will be sent to your subscribers.</p>
      </div>

      <div className="space-y-8 relative">
        {isPublishing && (
           <div className="absolute inset-0 z-50 bg-[#0e0e10]/80 backdrop-blur-sm rounded-xl flex items-center justify-center min-h-[400px]">
             <div className="text-center space-y-4">
               <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
               <h3 className="font-headline font-bold text-xl text-white">Publishing your Masterpiece...</h3>
             </div>
           </div>
        )}

        {/* Summary Card */}
        <div className={`bg-[#131315] rounded-xl overflow-hidden border border-[#262528] shadow-2xl transition-opacity ${isPublishing ? 'opacity-20 pointer-events-none' : ''}`}>
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-64 aspect-video rounded-lg overflow-hidden flex-shrink-0 border border-[#262528]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=600" alt="Thumbnail" className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-xl font-bold font-headline text-white mb-1">{formData.title}</h3>
                <p className="text-sm text-zinc-400 line-clamp-2">{formData.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#262528]">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Access Level</span>
                  <span className="text-sm font-bold text-white flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-[#ff8e80]">{formData.visibility === 'public' ? 'public' : 'lock'}</span> 
                    {formData.visibility === 'public' ? 'Public' : 'Private'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Price</span>
                  <span className="text-sm font-bold text-[#fdc003] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">monetization_on</span> {formData.price} AC
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-600/10 border border-red-600/30 rounded-lg">
            <p className="text-sm text-red-500 font-medium">{error}</p>
          </div>
        )}

        {/* Declarations */}
        <div className={`bg-[#19191c] p-6 md:p-8 rounded-xl border border-red-900/20 shadow-[0_0_30px_rgba(255,0,0,0.02)] transition-opacity ${isPublishing ? 'opacity-20 pointer-events-none' : ''}`}>
          <h3 className="text-sm font-bold font-headline text-white uppercase tracking-widest mb-6">Terms & Declarations</h3>
          
          <div className="space-y-4">
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="relative flex items-start pt-0.5">
                <input type="checkbox" className="peer sr-only" checked={isChecked1} onChange={() => setIsChecked1(!isChecked1)} />
                <div className="w-5 h-5 rounded border-2 border-zinc-600 bg-transparent peer-checked:bg-[#ff8e80] peer-checked:border-[#ff8e80] transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined text-black text-[14px] opacity-0 peer-checked:opacity-100 font-bold">check</span>
                </div>
              </div>
              <p className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">
                I confirm that this video complies with the <span className="text-[#ff8e80] hover:underline">Aura Cinematic Community Guidelines</span>. It contains no illegal, explicit, or copyright-infringing material.
              </p>
            </label>

            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="relative flex items-start pt-0.5">
                <input type="checkbox" className="peer sr-only" checked={isChecked2} onChange={() => setIsChecked2(!isChecked2)} />
                <div className="w-5 h-5 rounded border-2 border-zinc-600 bg-transparent peer-checked:bg-[#ff8e80] peer-checked:border-[#ff8e80] transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined text-black text-[14px] opacity-0 peer-checked:opacity-100 font-bold">check</span>
                </div>
              </div>
              <p className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">
                I understand that Aura DRM will be automatically applied to this content to prevent unauthorized downloading or redistribution.
              </p>
            </label>
          </div>
        </div>
      </div>

      {/* Footer Action Bar */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 h-20 bg-[#131315]/80 backdrop-blur-2xl border-t border-[#262528] z-50 px-8 flex items-center justify-between">
        <button onClick={onPrev} disabled={isPublishing} className="px-6 py-2.5 text-sm font-bold text-zinc-400 hover:text-white transition-colors disabled:opacity-50">Back</button>
        <div className="flex gap-4">
          <button disabled={isPublishing} className="px-6 py-2.5 text-sm font-bold text-zinc-300 hover:text-white transition-colors border border-zinc-800 rounded-sm disabled:opacity-50">Save Draft</button>
          <button 
            onClick={handlePublish}
            disabled={!canPublish || isPublishing}
            className={`px-8 py-2.5 border border-transparent font-bold text-sm rounded-sm transition-all active:scale-95 flex items-center gap-2 ${canPublish && !isPublishing ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed pointer-events-none'}`}
          >
            <span className="material-symbols-outlined text-[18px]">publish</span> Publish Video
          </button>
        </div>
      </div>
    </div>
  );
}
