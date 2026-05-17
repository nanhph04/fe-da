export default function StudioLoading() {
  return (
    <div className="flex-1 min-h-[calc(100vh-80px)] w-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 border-4 border-[#fdc003]/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-[#fdc003] rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <span className="material-symbols-outlined text-[#fdc003] text-[20px]">stars</span>
          </div>
        </div>
        <p className="text-[#fdc003] font-headline font-bold uppercase tracking-widest text-sm animate-pulse">
          Loading Creator Studio
        </p>
      </div>
    </div>
  );
}
