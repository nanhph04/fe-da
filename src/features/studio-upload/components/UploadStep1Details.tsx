interface UploadStep1DetailsProps {
  onNext: () => void;
}

export function UploadStep1Details({ onNext }: UploadStep1DetailsProps) {
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
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium font-headline text-zinc-400">Uploading: cinematic_sequence_v2.mp4</span>
            <span className="text-sm font-bold text-[#ff8e80] font-headline">80%</span>
          </div>
          <div className="w-full bg-[#19191c] h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-[#ff8e80] to-[#ff7668] h-full w-[80%] rounded-full"></div>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">timer</span> 2 minutes remaining
          </p>
        </div>
      </header>

      {/* Bento Layout for Content Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Primary Details Column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Video Title */}
          <div className="group">
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 group-focus-within:text-[#ff8e80] transition-colors">Video Title</label>
            <input type="text" defaultValue="The Ethereal Horizon: A Cinematic Journey Through Iceland" 
                   className="w-full bg-transparent border-0 border-b-2 border-zinc-700 focus:border-[#ff8e80] focus:ring-0 text-xl font-semibold font-headline py-4 px-0 transition-all placeholder-zinc-700 text-[#f9f5f8]" />
            <div className="flex justify-end mt-1">
              <span className="text-[10px] text-zinc-600">58 / 100</span>
            </div>
          </div>

          {/* Description (Rich Text Simulation) */}
          <div className="bg-[#131315] rounded-xl p-6 border border-[#262528]">
            <div className="flex items-center justify-between mb-4 border-b border-[#262528] pb-4">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Description</label>
              <div className="flex gap-4">
                <button className="material-symbols-outlined text-zinc-500 hover:text-white">format_bold</button>
                <button className="material-symbols-outlined text-zinc-500 hover:text-white">format_italic</button>
                <button className="material-symbols-outlined text-zinc-500 hover:text-white">link</button>
                <button className="material-symbols-outlined text-zinc-500 hover:text-white">format_list_bulleted</button>
              </div>
            </div>
            <textarea 
              className="w-full bg-transparent border-0 focus:ring-0 text-zinc-300 font-body leading-relaxed min-h-[200px] resize-none outline-none" 
              placeholder="Tell viewers about your video..."
              defaultValue="Exploring the southern coast of Iceland during the late autumn transition. This film captures the raw power of the Atlantic and the silent majesty of the glacial plateaus. All shots captured in 8K RAW."
            />
          </div>

          {/* Access Level Selection */}
          <section className="space-y-6">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-[#fdc003]">lock_open</span> Video Access Level
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="relative cursor-pointer group">
                <input type="radio" name="access_level" className="peer sr-only" defaultChecked />
                <div className="h-full p-6 rounded-xl bg-[#131315] border border-[#262528] peer-checked:border-[#ff8e80] peer-checked:bg-[#19191c] transition-all hover:bg-[#19191c]/50">
                  <div className="flex justify-between items-start mb-4">
                    <span className="material-symbols-outlined text-zinc-500 peer-checked:text-[#ff8e80]">public</span>
                    <div className="w-4 h-4 rounded-full border-2 border-zinc-600 peer-checked:border-[#ff8e80] peer-checked:bg-[#ff8e80] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                    </div>
                  </div>
                  <h4 className="font-headline font-bold text-white mb-1">Level 1: Free</h4>
                  <p className="text-xs text-zinc-400">Available to everyone on your public feed.</p>
                </div>
              </label>
              
              <label className="relative cursor-pointer group">
                <input type="radio" name="access_level" className="peer sr-only" />
                <div className="h-full p-6 rounded-xl bg-[#131315] border border-[#262528] peer-checked:border-[#fdc003] peer-checked:bg-[#19191c] transition-all hover:bg-[#19191c]/50">
                  <div className="flex justify-between items-start mb-4">
                    <span className="material-symbols-outlined text-[#fdc003]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                    <div className="w-4 h-4 rounded-full border-2 border-zinc-600 peer-checked:border-[#fdc003] peer-checked:bg-[#fdc003] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-black hidden peer-checked:block"></div>
                    </div>
                  </div>
                  <h4 className="font-headline font-bold text-white mb-1">Level 2: Premium</h4>
                  <p className="text-xs text-zinc-400">Restricted to Silver & Gold members only.</p>
                </div>
              </label>

              <label className="relative cursor-pointer group">
                <input type="radio" name="access_level" className="peer sr-only" />
                <div className="h-full p-6 rounded-xl bg-[#131315] border border-[#262528] peer-checked:border-red-500 peer-checked:bg-[#19191c] transition-all hover:bg-[#19191c]/50">
                  <div className="flex justify-between items-start mb-4">
                    <span className="material-symbols-outlined text-red-500" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                    <div className="w-4 h-4 rounded-full border-2 border-zinc-600 peer-checked:border-red-500 peer-checked:bg-red-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white hidden peer-checked:block"></div>
                    </div>
                  </div>
                  <h4 className="font-headline font-bold text-white mb-1">Level 3: Exclusive</h4>
                  <p className="text-xs text-zinc-400">Top-tier Platinum members only.</p>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Secondary Metadata Column */}
        <div className="lg:col-span-4 space-y-8">
          {/* Preview Card */}
          <div className="bg-[#19191c] rounded-xl overflow-hidden shadow-2xl border border-[#262528]">
            <div className="aspect-video relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=600" alt="Thumbnail preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-white">Change Thumbnail</button>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-[10px] font-bold text-white">12:44</div>
            </div>
            <div className="p-4 bg-[#1f1f22]">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Video Link</p>
                  <p className="text-xs text-[#ff8e80] truncate block w-48">https://gallery.tv/v/ethereal_horizon_8k</p>
                </div>
                <button className="material-symbols-outlined text-zinc-400 hover:text-white">content_copy</button>
              </div>
            </div>
          </div>

          {/* Category & Tags */}
          <div className="space-y-6 bg-[#131315] p-6 rounded-xl border border-[#262528]">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Category</label>
              <select className="w-full bg-[#19191c] border-0 rounded-lg text-sm text-zinc-200 font-medium py-3 px-4 focus:ring-1 focus:ring-[#ff8e80] transition-all outline-none">
                <option>Cinematic Travel</option>
                <option>Documentary</option>
                <option>Experimental</option>
                <option>Vlog</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Tags</label>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-[#1f1f22] text-zinc-300 px-3 py-1 rounded-full text-[10px] flex items-center gap-1">Iceland <span className="material-symbols-outlined text-[12px] cursor-pointer">close</span></span>
                <span className="bg-[#1f1f22] text-zinc-300 px-3 py-1 rounded-full text-[10px] flex items-center gap-1">Cinematic <span className="material-symbols-outlined text-[12px] cursor-pointer">close</span></span>
                <span className="bg-[#1f1f22] text-zinc-300 px-3 py-1 rounded-full text-[10px] flex items-center gap-1">8K <span className="material-symbols-outlined text-[12px] cursor-pointer">close</span></span>
              </div>
              <input type="text" placeholder="Add more tags..." className="w-full bg-transparent border-b border-zinc-700 focus:border-[#ff8e80] focus:ring-0 text-sm py-2 text-white outline-none" />
            </div>
          </div>

          {/* Aura CTA Card */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-[#ff8e80]/10 to-transparent border border-[#ff8e80]/20">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-[#ff8e80]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <span className="text-xs font-bold text-white uppercase tracking-widest">Aura Boost</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed mb-4">Your video title is strong. Adding &#39;Icelandic Nature&#39; to your tags could increase visibility by 14%.</p>
            <button className="w-full py-2 bg-[#2d2d30] hover:bg-[#3d3d40] text-white text-[10px] font-bold uppercase tracking-widest transition-colors rounded">Optimize Metadata</button>
          </div>
        </div>
      </div>

      {/* Footer Action Bar */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 h-20 bg-[#131315]/80 backdrop-blur-2xl border-t border-[#262528] z-50 px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Status</span>
            <span className="text-xs font-bold text-[#ff8e80] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#ff8e80] animate-pulse"></span> Uploading...
            </span>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2.5 text-sm font-bold text-zinc-300 hover:text-white transition-colors">Save Draft</button>
          <button onClick={onNext} className="px-8 py-2.5 bg-gradient-to-r from-[#ff8e80] to-[#ff7668] text-[#650003] font-bold text-sm rounded-sm hover:shadow-[0_0_20px_rgba(255,142,128,0.3)] transition-all active:scale-95">
            Next: Pricing & Monetization
          </button>
        </div>
      </div>
    </div>
  );
}
