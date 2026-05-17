export function VideoSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="group flex flex-col gap-3">
          <div className="aspect-video bg-accent rounded-xl overflow-hidden border border-border relative animate-pulse"></div>
          <div>
            <div className="h-4 bg-accent rounded-md w-3/4 animate-pulse mb-2"></div>
            <div className="h-3 bg-accent rounded-md w-1/2 animate-pulse mb-3"></div>
            <div className="flex items-center gap-2">
              <div className="h-2 bg-accent rounded-md w-1/4 animate-pulse"></div>
              <div className="h-2 bg-accent rounded-md w-1/4 animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
