"use client";

import { useRef } from "react";

interface UploadProgressCardProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function UploadProgressCard({ file, onFileSelect }: UploadProgressCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="w-full rounded-lg border border-[#262528] bg-[#131315] p-5 shadow-xl md:w-80">
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="sr-only"
        onChange={event => onFileSelect(event.target.files?.[0] ?? null)}
      />

      {!file ? (
        <div className="flex flex-col gap-3">
          <span className="text-center font-headline text-sm font-medium text-zinc-400">
            Select video file to begin
          </span>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full border border-dashed border-zinc-600 bg-[#262528] py-2 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#3d3d40]"
          >
            Browse Files
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-green-500">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span className="font-headline text-xs font-bold uppercase tracking-widest">
                File Ready
              </span>
            </div>
            <p className="truncate font-headline text-sm font-semibold text-zinc-200" title={file.name}>
              {file.name}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {formatFileSize(file.size)} {file.type ? `· ${file.type}` : ""}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex-1 rounded-sm bg-[#262528] py-2 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#3d3d40]"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onFileSelect(null)}
              className="rounded-sm border border-border/40 px-3 py-2 text-xs font-bold uppercase tracking-widest text-zinc-400 transition-colors hover:text-white"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
