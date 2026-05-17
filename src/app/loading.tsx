export default function Loading() {
  return (
    <div className="flex-1 min-h-screen bg-background flex items-center justify-center -mt-20">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 border-4 border-red-600/30 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-red-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-red-500 font-headline font-bold uppercase tracking-widest text-sm animate-pulse">
          Loading Gallery...
        </p>
      </div>
    </div>
  );
}
