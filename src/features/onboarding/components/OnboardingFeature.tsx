import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function OnboardingFeature() {
  return (
    <div className="bg-[#0e0e10] text-[#f9f5f8] min-h-screen flex flex-col items-center justify-center relative overflow-x-hidden pt-24 pb-12">
      {/* Background Cinematic Layer */}
      <div className="fixed inset-0 z-0 bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          className="w-full h-full object-cover opacity-20 blur-sm" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCc0awPNg2padXqW3KRRlLy86UFjQm37q3ChOzynRQgStdOGAqgyiLgUX1wkVrb7tmcdiHspcnwScDstHxAch1KOI2_Ls6Iqlk2aTJD1KcUC7gzFJW6CuzhLCxt5vvLyJICVhuxloBoATcQOdeEbVWpQJTd_T-F4kOJ0obEEOyByVVvW5loPfx0Ir4Am2xIWnZZtFhL-YM9ali71sbRDQrk9OSAtuPm3nfhBmO2OTb7uYpWnGLmY5aCVc5seNtl6B6xcNASAnmUT3dA" 
          alt="Cinematic Background" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e10] via-[#0e0e10]/80 to-[#0e0e10]/40"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,142,128,0.08)_0%,transparent_70%)]"></div>
      </div>

      {/* Navigation Shell */}
      <nav className="fixed top-0 w-full flex justify-between items-center px-8 py-6 z-50">
        <div className="text-2xl font-bold tracking-tighter text-red-600 font-headline">Aura Stream</div>
        <div className="flex gap-6 items-center">
          <button className="text-zinc-500 hover:text-[#ff8e80] transition-colors">
            <span className="material-symbols-outlined">help</span>
          </button>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="relative z-10 w-full max-w-2xl px-6">
        <div className="bg-[#19191c]/70 backdrop-blur-xl border border-[#48474a]/10 rounded-xl p-8 md:p-12 shadow-2xl">
          <header className="text-center mb-10">
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-3">Complete Your Profile</h1>
            <p className="text-zinc-400 text-sm tracking-wide">Curate your cinematic identity for the gallery.</p>
          </header>

          <form className="space-y-10">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group cursor-pointer">
                <div className="w-32 h-32 rounded-full border-2 border-[#ff8e80]/20 p-1 flex items-center justify-center overflow-hidden bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    className="w-full h-full object-cover rounded-full group-hover:opacity-40 transition-opacity" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsLUnwi_TPNYlWBbZvwuqO5pBGCLXihu5LobkjpWyCPMR7irPROecTQ12m6JhYVCoXCCxxP1jsc7GKJgt0_KDqcoLRD0mFc-aY-1hClcqv-G1ewbiASlyfMbl6UrgqKOYRqQ43H6VBF_a9tWdCFV7stgSxDmUSPX1D52jb_qaRYKh7RP5IeO1B9m0OX-jOSaX0l2FMZB5wbpQR-OQdA0wxSuKFYZUt8avvMszoZiBqzmJDbcWrt4yJhCzxgQ-9n7c-tfyLBsxRM0F1" 
                    alt="Current Avatar" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-[#ff8e80] text-3xl">add_a_photo</span>
                  </div>
                </div>
              </div>
              <label className="text-xs font-bold uppercase tracking-widest text-[#ff8e80]/80">Change Portrait</label>
            </div>

            {/* Identity Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-headline text-xs font-bold tracking-widest uppercase text-zinc-500 px-1">Display Name</label>
                <Input className="bg-black/50 border-[#48474a]/20 h-12 text-[#f9f5f8] shadow-inner focus-visible:ring-[#ff8e80]" placeholder="e.g. CinemaLover99" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-headline text-xs font-bold tracking-widest uppercase text-zinc-500 px-1">Full Name</label>
                <Input className="bg-black/50 border-[#48474a]/20 h-12 text-[#f9f5f8] shadow-inner focus-visible:ring-[#ff8e80]" placeholder="e.g. Julian Vane" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-headline text-xs font-bold tracking-widest uppercase text-zinc-500 px-1">Phone Number</label>
                <Input className="bg-black/50 border-[#48474a]/20 h-12 text-[#f9f5f8] shadow-inner focus-visible:ring-[#ff8e80]" placeholder="+1 (555) 000-0000" type="tel" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-headline text-xs font-bold tracking-widest uppercase text-zinc-500 px-1">Gender</label>
                <select className="bg-black/50 border border-[#48474a]/20 h-12 rounded-md px-3 text-[#f9f5f8] shadow-inner focus:ring-[#ff8e80] focus:outline-none appearance-none">
                  <option disabled selected value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="font-headline text-xs font-bold tracking-widest uppercase text-zinc-500 px-1">Bio</label>
                <textarea className="w-full bg-black/50 border border-[#48474a]/20 rounded-md px-3 py-3 text-[#f9f5f8] placeholder:text-zinc-600 focus:outline-[#ff8e80] transition-all resize-none shadow-inner" placeholder="Tell us about your cinematic taste..." rows={3}></textarea>
              </div>
            </div>

            {/* Content Preferences */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[#48474a]/30"></div>
                <span className="font-headline text-xs font-bold tracking-widest uppercase text-zinc-500 px-2">Content Preferences</span>
                <div className="h-px flex-1 bg-[#48474a]/30"></div>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                {['Action', 'Drama', 'Sci-Fi', 'Noir', 'Documentary', 'Horror', 'Indie', 'Comedy'].map((genre, idx) => (
                  <button 
                    key={genre}
                    type="button"
                    className={`px-5 py-2 rounded-full border text-xs font-bold tracking-tight transition-all duration-300 ${
                      idx % 3 === 0 
                      ? 'border-[#ff8e80]/40 bg-[#ff8e80]/10 text-[#ff8e80] hover:bg-[#ff8e80] hover:text-black' 
                      : 'border-[#48474a]/30 bg-[#131315] text-zinc-400 hover:border-[#ff8e80]/50 hover:text-white'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-6 flex flex-col gap-4">
              <Button className="w-full h-14 bg-gradient-to-br from-[#ff8e80] to-[#ff7668] text-[#4f0002] font-black tracking-widest uppercase shadow-lg shadow-[#ff8e80]/20 hover:brightness-110">
                Save & Continue
              </Button>
              <Button variant="ghost" className="w-full h-12 text-zinc-500 hover:bg-transparent hover:text-white uppercase tracking-widest text-xs font-bold">
                Skip for now
              </Button>
            </div>
          </form>
        </div>
      </main>
      
      <footer className="relative z-10 w-full max-w-2xl mt-12 flex justify-center gap-8 opacity-40">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">lock</span>
          <span className="text-[10px] font-bold tracking-widest uppercase">Secure Session</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">verified_user</span>
          <span className="text-[10px] font-bold tracking-widest uppercase">Vault Protected</span>
        </div>
      </footer>
    </div>
  );
}
