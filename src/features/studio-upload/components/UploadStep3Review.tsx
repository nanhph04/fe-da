interface UploadStep3ReviewProps {
  onPrev: () => void;
}

export function UploadStep3Review({ onPrev }: UploadStep3ReviewProps) {
  return (
    <div className="max-w-4xl mx-auto p-8 pb-32 w-full animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Page Header */}
      <div className="mb-12 text-center">
        <span className="material-symbols-outlined text-6xl text-[#ff8e80] mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-[#f9f5f8] mb-2">Ready to Publish</h1>
        <p className="text-zinc-400 max-w-lg mx-auto">Please review your video details one last time. Once published, notifications will be sent to your subscribers.</p>
      </div>

      <div className="space-y-8">
        {/* Summary Card */}
        <div className="bg-[#131315] rounded-xl overflow-hidden border border-[#262528] shadow-2xl">
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-64 aspect-video rounded-lg overflow-hidden flex-shrink-0 border border-[#262528]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=600" alt="Thumbnail" className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-xl font-bold font-headline text-white mb-1">The Ethereal Horizon: A Cinematic Journey Through Iceland</h3>
                <p className="text-sm text-zinc-400 line-clamp-2">Exploring the southern coast of Iceland during the late autumn transition. This film captures the raw power of the Atlantic and the silent majesty of the glacial plateaus. All shots captured in 8K RAW.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#262528]">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Access Level</span>
                  <span className="text-sm font-bold text-white flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-[#ff8e80]">public</span> Level 1: Free
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Price</span>
                  <span className="text-sm font-bold text-[#fdc003] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">monetization_on</span> 500 AC
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Declarations */}
        <div className="bg-[#19191c] p-6 md:p-8 rounded-xl border border-red-900/20 shadow-[0_0_30px_rgba(255,0,0,0.02)]">
          <h3 className="text-sm font-bold font-headline text-white uppercase tracking-widest mb-6">Terms & Declarations</h3>
          
          <div className="space-y-4">
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="relative flex items-start pt-0.5">
                <input type="checkbox" className="peer sr-only" />
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
                <input type="checkbox" className="peer sr-only" />
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
        <button onClick={onPrev} className="px-6 py-2.5 text-sm font-bold text-zinc-400 hover:text-white transition-colors">Back</button>
        <div className="flex gap-4">
          <button className="px-6 py-2.5 text-sm font-bold text-zinc-300 hover:text-white transition-colors border border-zinc-800 rounded-sm">Save Draft</button>
          <button className="px-8 py-2.5 border border-transparent bg-red-600 text-white font-bold text-sm rounded-sm hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all active:scale-95 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">publish</span> Publish Video
          </button>
        </div>
      </div>
    </div>
  );
}
