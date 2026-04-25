"use client";
import { useState, useEffect } from "react";
import { UploadFormData } from "./StudioUploadFeature";

interface UploadStep1DetailsProps {
  formData: UploadFormData;
  updateFormData: (data: Partial<UploadFormData>) => void;
  onNext: () => void;
}

export function UploadStep1Details({ formData, updateFormData, onNext }: UploadStep1DetailsProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  // Fake upload progress (Mocking file reading)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isUploading && uploadProgress < 100) {
      interval = setInterval(() => {
        setUploadProgress(prev => {
          const next = prev + Math.floor(Math.random() * 10) + 5;
          if (next >= 100) {
            setUploadComplete(true);
            setIsUploading(false);
            return 100;
          }
          return next;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isUploading, uploadProgress]);

  const handleStartUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadComplete(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 pb-32 w-full animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header & Progress Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <span className="text-secondary font-headline font-bold text-xs uppercase tracking-[0.2em] mb-2 block">New Upload</span>
          <h1 className="text-4xl md:text-5xl font-extrabold font-headline text-[#f9f5f8] tracking-tighter">Video Details</h1>
        </div>
        
        {/* Upload Progress Card */}
        <div className="w-full md:w-80 bg-[#131315] p-5 rounded-lg border border-[#262528] shadow-xl">
          {(!isUploading && !uploadComplete) && (
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium font-headline text-zinc-400 text-center">Select file to begin</span>
              <button onClick={handleStartUpload} className="w-full bg-[#262528] hover:bg-[#3d3d40] text-white text-xs font-bold py-2 rounded transition-colors uppercase tracking-widest border border-dashed border-zinc-600">
                Browse Files
              </button>
            </div>
          )}
          
          {(isUploading || uploadComplete) && (
            <>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium font-headline text-zinc-400 truncate w-3/4">cinematic_sequence_v2.mp4</span>
                <span className="text-sm font-bold text-[#ff8e80] font-headline">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-[#19191c] h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${uploadComplete ? 'bg-green-500' : 'bg-gradient-to-r from-[#ff8e80] to-[#ff7668]'}`} 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-zinc-500 mt-2 flex items-center gap-1">
                {uploadComplete ? (
                  <><span className="material-symbols-outlined text-[12px] text-green-500">check_circle</span> Upload complete</>
                ) : (
                  <><span className="material-symbols-outlined text-[12px]">timer</span> Processing...</>
                )}
              </p>
            </>
          )}
        </div>
      </header>

      {/* Bento Layout for Content Inputs */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 transition-opacity duration-500 ${!uploadComplete && !isUploading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        
        {/* Primary Details Column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Video Title */}
          <div className="group">
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 group-focus-within:text-[#ff8e80] transition-colors">Video Title</label>
            <input 
              type="text" 
              maxLength={200}
              value={formData.title}
              onChange={e => updateFormData({ title: e.target.value })}
              className="w-full bg-transparent border-0 border-b-2 border-zinc-700 focus:border-[#ff8e80] focus:ring-0 text-xl font-semibold font-headline py-4 px-0 transition-all placeholder-zinc-700 text-[#f9f5f8] outline-none" 
            />
            <div className="flex justify-end mt-1">
              <span className="text-[10px] text-zinc-600">{formData.title.length} / 200</span>
            </div>
          </div>

          {/* Description (Rich Text Simulation) */}
          <div className="bg-[#131315] rounded-xl p-6 border border-[#262528]">
            <div className="flex items-center justify-between mb-4 border-b border-[#262528] pb-4">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Description</label>
            </div>
            <textarea 
              className="w-full bg-transparent border-0 focus:ring-0 text-zinc-300 font-body leading-relaxed min-h-[200px] resize-none outline-none" 
              placeholder="Tell viewers about your video..."
              value={formData.description}
              onChange={e => updateFormData({ description: e.target.value })}
            />
          </div>

          {/* Access Level Selection */}
          <section className="space-y-6">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-[#fdc003]">lock_open</span> Video Access Level
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="relative cursor-pointer group">
                <input 
                  type="radio" 
                  name="access_level" 
                  className="peer sr-only" 
                  checked={formData.visibility === "public"} 
                  onChange={() => updateFormData({ visibility: "public" })} 
                />
                <div className="h-full p-6 rounded-xl bg-[#131315] border border-[#262528] peer-checked:border-[#ff8e80] peer-checked:bg-[#19191c] transition-all hover:bg-[#19191c]/50">
                  <div className="flex justify-between items-start mb-4">
                    <span className="material-symbols-outlined text-zinc-500 peer-checked:text-[#ff8e80]">public</span>
                    <div className="w-4 h-4 rounded-full border-2 border-zinc-600 peer-checked:border-[#ff8e80] peer-checked:bg-[#ff8e80] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                    </div>
                  </div>
                  <h4 className="font-headline font-bold text-white mb-1">Public</h4>
                  <p className="text-xs text-zinc-400">Available to everyone on your public feed.</p>
                </div>
              </label>
              
              <label className="relative cursor-pointer group">
                <input 
                  type="radio" 
                  name="access_level" 
                  className="peer sr-only" 
                  checked={formData.visibility === "private"} 
                  onChange={() => updateFormData({ visibility: "private" })} 
                />
                <div className="h-full p-6 rounded-xl bg-[#131315] border border-[#262528] peer-checked:border-zinc-400 peer-checked:bg-[#19191c] transition-all hover:bg-[#19191c]/50">
                  <div className="flex justify-between items-start mb-4">
                    <span className="material-symbols-outlined text-zinc-400" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                    <div className="w-4 h-4 rounded-full border-2 border-zinc-600 peer-checked:border-zinc-400 peer-checked:bg-zinc-400 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-black hidden peer-checked:block"></div>
                    </div>
                  </div>
                  <h4 className="font-headline font-bold text-white mb-1">Private</h4>
                  <p className="text-xs text-zinc-400">Only visible to you or those with link.</p>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Secondary Metadata Column */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Tạm ẩn: Chưa có API hỗ trợ thumbnail rời lúc init-upload */}
          {/* 
          <div className="bg-[#19191c] rounded-xl overflow-hidden shadow-2xl border border-[#262528]">
            <div className="aspect-video relative group bg-zinc-800 flex items-center justify-center">
              {uploadComplete ? (
                <>
                  <img src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=600" alt="Thumbnail preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-white border border-white/30 hover:bg-white/30 transition-colors">Change Thumbnail</button>
                  </div>
                </>
              ) : (
                <span className="material-symbols-outlined text-zinc-600 text-4xl">video_file</span>
              )}
            </div>
          </div> 
          */}

          {/* Category & Tags */}
          <div className="space-y-6 bg-[#131315] p-6 rounded-xl border border-[#262528]">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Category</label>
              <select 
                value={formData.categories[0] || ""}
                onChange={e => updateFormData({ categories: [e.target.value] })}
                className="w-full bg-[#19191c] border-0 rounded-lg text-sm text-zinc-200 font-medium py-3 px-4 focus:ring-1 focus:ring-[#ff8e80] transition-all outline-none"
              >
                <option value="Cinematic Travel">Cinematic Travel</option>
                <option value="Documentary">Documentary</option>
                <option value="Experimental">Experimental</option>
                <option value="Vlog">Vlog</option>
              </select>
            </div>

            {/* Tạm ẩn: API hiện tại không có tags */}
            {/*
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Tags</label>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-[#1f1f22] text-zinc-300 px-3 py-1 rounded-full text-[10px] flex items-center gap-1">Iceland <span className="material-symbols-outlined text-[12px] cursor-pointer">close</span></span>
              </div>
              <input type="text" placeholder="Add more tags..." className="w-full bg-transparent border-b border-zinc-700 focus:border-[#ff8e80] focus:ring-0 text-sm py-2 text-white outline-none" />
            </div>
            */}
          </div>
        </div>
      </div>

      {/* Footer Action Bar */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 h-20 bg-[#131315]/80 backdrop-blur-2xl border-t border-[#262528] z-50 px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Status</span>
            <span className={`text-xs font-bold flex items-center gap-1 ${uploadComplete ? 'text-green-500' : isUploading ? 'text-[#ff8e80]' : 'text-zinc-500'}`}>
              {!uploadComplete && !isUploading && "Draft"}
              {isUploading && <span className="w-2 h-2 rounded-full bg-[#ff8e80] animate-pulse"></span>}
              {isUploading && "Uploading..."}
              {uploadComplete && <span className="material-symbols-outlined text-[14px]">check</span>}
              {uploadComplete && "Saved"}
            </span>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onNext}
            disabled={!uploadComplete}
            className={`px-8 py-2.5 font-bold text-sm rounded-sm transition-all active:scale-95 ${uploadComplete ? 'bg-gradient-to-r from-[#ff8e80] to-[#ff7668] text-[#650003] hover:shadow-[0_0_20px_rgba(255,142,128,0.3)]' : 'bg-zinc-800 text-zinc-500 pointer-events-none'}`}
          >
            Next: Pricing & Monetization
          </button>
        </div>
      </div>
    </div>
  );
}
