"use client";
import { UploadFormData } from "./StudioUploadFeature";

interface UploadStep2MonetizationProps {
  formData: UploadFormData;
  updateFormData: (data: Partial<UploadFormData>) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function UploadStep2Monetization({ formData, updateFormData, onPrev, onNext }: UploadStep2MonetizationProps) {
  return (
    <div className="max-w-6xl mx-auto p-8 pb-32 w-full animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Page Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-[#f9f5f8] mb-2">Monetization Strategy</h1>
        <p className="text-zinc-400 max-w-2xl">Configure how viewers access your content and how your earnings are distributed. Aura Cinematic uses a transparent Aura Coin (AC) system for all transactions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Pricing Left Column */}
        <div className="lg:col-span-7 space-y-8">
          {/* Price Input Section */}
          <section className="bg-[#131315] p-8 rounded-xl space-y-6 border border-[#262528]">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-lg font-bold font-headline text-white">Video Listing Price</h3>
                <p className="text-sm text-zinc-400">Set the access fee in Aura Coins (set to 0 for Free)</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#fdc003] font-bold uppercase tracking-widest">Premium Content</span>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[#fdc003] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
              </div>
              <input 
                type="number" 
                value={formData.price}
                onChange={e => updateFormData({ price: Number(e.target.value) })}
                min={0}
                className="w-full bg-black/50 border border-zinc-800 rounded-lg py-6 pl-16 pr-24 text-4xl font-extrabold font-headline text-white focus:ring-2 focus:ring-[#fdc003]/50 transition-all outline-none" 
              />
              <div className="absolute inset-y-0 right-6 flex items-center">
                <span className="text-zinc-500 font-bold font-headline text-xl">AC</span>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button type="button" onClick={() => updateFormData({ price: 0 })} className={`px-4 py-2 rounded text-xs font-bold transition-colors border ${formData.price === 0 ? 'bg-[#fdc003]/20 border-[#fdc003]/50 text-[#fdc003]' : 'bg-[#19191c] text-zinc-400 hover:text-white border-zinc-800'}`}>Free</button>
              <button type="button" onClick={() => updateFormData({ price: 100 })} className={`px-4 py-2 rounded text-xs font-bold transition-colors border ${formData.price === 100 ? 'bg-[#fdc003]/20 border-[#fdc003]/50 text-[#fdc003]' : 'bg-[#19191c] text-zinc-400 hover:text-white border-zinc-800'}`}>100 AC</button>
              <button type="button" onClick={() => updateFormData({ price: 500 })} className={`px-4 py-2 rounded text-xs font-bold transition-colors border ${formData.price === 500 ? 'bg-[#fdc003]/20 border-[#fdc003]/50 text-[#fdc003]' : 'bg-[#19191c] text-zinc-400 hover:text-white border-zinc-800'}`}>500 AC</button>
              <button type="button" onClick={() => updateFormData({ price: 1000 })} className={`px-4 py-2 rounded text-xs font-bold transition-colors border ${formData.price === 1000 ? 'bg-[#fdc003]/20 border-[#fdc003]/50 text-[#fdc003]' : 'bg-[#19191c] text-zinc-400 hover:text-white border-zinc-800'}`}>1,000 AC</button>
            </div>
          </section>

          {/* Tier Required Section */}
          <section className="bg-[#131315] p-8 rounded-xl border border-[#262528] space-y-4">
            <div>
               <h3 className="text-lg font-bold font-headline text-white">Required Membership Tier</h3>
               <p className="text-sm text-zinc-400">Optional. Only allow users with this tier level to access.</p>
            </div>
            <select 
               value={formData.requiredTierLevel || ""}
               onChange={e => updateFormData({ requiredTierLevel: e.target.value ? Number(e.target.value) : null })}
               className="w-full bg-[#19191c] border-0 rounded-lg text-sm text-zinc-200 font-medium py-3 px-4 focus:ring-1 focus:ring-[#ff8e80] transition-all outline-none"
            >
               <option value="">None (Available to all)</option>
               <option value="1">Tier Level 1</option>
               <option value="2">Tier Level 2</option>
               <option value="3">Tier Level 3</option>
            </select>
          </section>
        </div>

        {/* Summary Right Column (Earnings Breakdown) */}
        <div className="lg:col-span-5 sticky top-28">
          <div className="bg-[#1f1f22] rounded-xl overflow-hidden shadow-2xl border border-[#262528]">
            <div className="h-2 bg-gradient-to-r from-[#ff8e80] to-[#fdc003]"></div>
            <div className="p-8">
              <h3 className="text-xl font-bold font-headline text-white mb-8">Earnings Breakdown</h3>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center text-zinc-400">
                  <span className="text-sm">Gross Price ({formData.price} AC)</span>
                  <span className="font-headline text-white">{formData.price * 100} VND</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-400">Platform Fee</span>
                    <span className="px-1.5 py-0.5 bg-zinc-800 text-[10px] font-bold rounded text-zinc-400">10%</span>
                  </div>
                  <span className="font-headline text-red-500">- {formData.price * 10} VND</span>
                </div>
                
                <div className="h-[1px] bg-zinc-800"></div>
                
                <div className="pt-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs font-bold text-[#fdc003] uppercase tracking-widest mb-1">Estimated Net</p>
                      <p className="text-4xl font-extrabold font-headline text-white">{formData.price * 90} VND</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-500 italic">Per purchase</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#fdc003]/10 p-4 rounded-lg border border-[#fdc003]/20 mt-4">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-[#fdc003] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                    <p className="text-xs text-[#fdc003] leading-relaxed">
                      Your content is protected by <strong className="font-bold">Aura DRM</strong>. Payments are settled automatically to your Wallet.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action Bar */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 h-20 bg-[#131315]/80 backdrop-blur-2xl border-t border-[#262528] z-50 px-8 flex items-center justify-between">
        <button onClick={onPrev} className="px-6 py-2.5 text-sm font-bold text-zinc-400 hover:text-white transition-colors">Back</button>
        <button onClick={onNext} className="px-8 py-2.5 bg-gradient-to-r from-[#ff8e80] to-[#ff7668] text-[#650003] font-bold text-sm rounded-sm hover:shadow-[0_0_20px_rgba(255,142,128,0.3)] transition-all active:scale-95">
          Next: Review & Publish
        </button>
      </div>
    </div>
  );
}
