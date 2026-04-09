import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0e0e10]">
      {/* TopNavBar */}
      <header className="absolute top-0 w-full z-50 flex justify-between items-center px-8 py-8">
        <div 
          className="text-2xl font-black text-red-600 uppercase tracking-tighter" 
          style={{ fontFamily: 'var(--font-headline)' }}
        >
          Aura Cinematic
        </div>
        <div 
          className="font-bold tracking-tight text-zinc-400 hover:text-white transition-colors duration-300 cursor-pointer" 
          style={{ fontFamily: 'var(--font-headline)' }}
        >
          Help
        </div>
      </header>

      {/* Cinematic Background with Tonal Depth */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 opacity-20 grayscale brightness-50 bg-cover bg-center" 
          style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuCqTDRHMKMPvk9xqQrk4DEF-2An9GDUaqJQRpkU-YwV71u9nAE47K5gPr58Luqvwgmn_DXqqBJL3UQx4vAlshv_DWgOnREa-PHM6Xy-py5QWKCneIxjI5p5shxD4vbmoTEatuukvovlRmpeGV6uBlRg0s_7xuLE57eUy8oATWgUXEDyA3ZlbWOF0cELXdrUg4XxnPVamIswb_2KACqvj1GXOTYblobKswobv6nYvkVeVzy4zSQ1as-oAfLpH__6ZKHo1Jlesh-bomMZ)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e10] via-[#0e0e10]/80 to-transparent"></div>
        <div 
          className="absolute inset-0" 
          style={{ background: 'radial-gradient(circle at 50% -20%, rgba(255, 142, 128, 0.15) 0%, rgba(14, 14, 16, 0) 70%)' }}
        ></div>
      </div>

      {/* Auth Canvas */}
      <div className="relative z-10 w-full max-w-md px-6">
        {children}
      </div>

      {/* Footer Links */}
      <div className="fixed bottom-0 w-full flex justify-center gap-8 py-10 z-40 opacity-50 bg-transparent">
        <a className="font-['Inter'] text-xs font-medium uppercase tracking-widest text-zinc-600 hover:text-zinc-300 transition-colors" href="#">Privacy Policy</a>
        <a className="font-['Inter'] text-xs font-medium uppercase tracking-widest text-zinc-600 hover:text-zinc-300 transition-colors" href="#">Terms of Service</a>
        <a className="font-['Inter'] text-xs font-medium uppercase tracking-widest text-zinc-600 hover:text-zinc-300 transition-colors" href="#">Cookie Preferences</a>
      </div>
    </div>
  );
}
