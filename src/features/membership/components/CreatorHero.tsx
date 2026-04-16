export function CreatorHero() {
  return (
    <section className="relative w-full h-[400px] rounded-xl overflow-hidden mb-16 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e10] via-[#0e0e10]/40 to-transparent z-10"></div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        className="w-full h-full object-cover" 
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWncoIv8Fez2MojYN5CRu4jPolhXI01BoiI-FHMIruVRPTzmrh5a-M9iLpF4J6dS3GYe-JNQ2Eswz8HgcmhqjjQ3kiZDK6ntriwdvCVgkx5Ym_PITVIUUMMj2SZYf5u_Ox2pHBQUDuVCXcFjgCCqoxFcVZe_c0VDbyGOAUsj42JCWY-m--XNeoUZd5Vrno54yYJXbu5Sa1qie0hnwrRcIEVaBxx4OAG6Hcn9Toirzxc7Rv0HvBNrFz6wVAW0PvdgBt94FJhBLqgEQq" 
        alt="Creator Banner" 
      />
      
      <div className="absolute bottom-0 left-0 p-10 z-20 flex items-end gap-8">
        <div className="w-32 h-32 rounded-lg border-4 border-[#0e0e10] shadow-2xl overflow-hidden bg-[#19191c]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzuQBWVG30Ho8IEVRKrKUIlVgB0KAUHzO65tNKSMZqDznQosVu8STfpoAr-ZwNHlcU636CLO_3QzvU_A_wBS_J5YwPAiOtWTs00TnUa6aKUch9wCNB-wnAfln3vuy8t13jii-ROeqaWmBKJ6dptpILesiAMpeXYY6UamODNjvxnE6_niyUiq2bvA7k_9xtmDh1E7V7HkMncPAdyCxIqklsvTVE9tPJsPJFHXHa6YoWzEX1w7XpSqvccWjAS_ExKef1_5DE02vfPYCY" 
            alt="CinemaLabs Avatar" 
          />
        </div>
        
        <div className="pb-2">
          <div className="flex items-center gap-3">
            <h1 className="font-headline text-5xl font-black -tracking-widest text-[#f9f5f8] uppercase italic">CinemaLabs</h1>
            <span className="material-symbols-outlined text-[#fdc003]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          </div>
          <p className="text-zinc-400 mt-2 font-medium tracking-wide flex items-center gap-2">
            <span>4.2M Subscribers</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#48474a]"></span>
            <span>Premium Studio Member</span>
          </p>
        </div>
      </div>
    </section>
  );
}
