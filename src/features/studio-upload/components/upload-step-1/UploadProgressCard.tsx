interface UploadProgressCardProps {
  isUploading: boolean;
  uploadComplete: boolean;
  uploadProgress: number;
  onStartUpload: () => void;
}

export function UploadProgressCard({
  isUploading,
  uploadComplete,
  uploadProgress,
  onStartUpload,
}: UploadProgressCardProps) {
  return (
    <div className="w-full rounded-lg border border-[#262528] bg-[#131315] p-5 shadow-xl md:w-80">
      {!isUploading && !uploadComplete ? (
        <div className="flex flex-col gap-3">
          <span className="text-center font-headline text-sm font-medium text-zinc-400">
            Select file to begin
          </span>
          <button
            onClick={onStartUpload}
            className="w-full border border-dashed border-zinc-600 bg-[#262528] py-2 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#3d3d40]"
          >
            Browse Files
          </button>
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between">
            <span className="w-3/4 truncate font-headline text-sm font-medium text-zinc-400">
              cinematic_sequence_v2.mp4
            </span>
            <span className="font-headline text-sm font-bold text-[#ff8e80]">
              {uploadProgress}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#19191c]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                uploadComplete
                  ? "bg-green-500"
                  : "bg-gradient-to-r from-[#ff8e80] to-[#ff7668]"
              }`}
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="mt-2 flex items-center gap-1 text-[10px] text-zinc-500">
            {uploadComplete ? (
              <>
                <span className="material-symbols-outlined text-[12px] text-green-500">
                  check_circle
                </span>
                Upload complete
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[12px]">timer</span>
                Processing...
              </>
            )}
          </p>
        </>
      )}
    </div>
  );
}
