"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";

interface UploadProgressCardProps {
  file: File | null;
  isReplacing?: boolean;
  isUploading?: boolean;
  isUploaded?: boolean;
  uploadProgress?: number;
  replaceError?: string | null;
  uploadError?: string | null;
  onFileSelect: (file: File | null) => void;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function UploadProgressCard({
  file,
  isReplacing = false,
  isUploading = false,
  isUploaded = false,
  uploadProgress = 0,
  replaceError,
  uploadError,
  onFileSelect,
}: UploadProgressCardProps) {
  const t = useTranslations("Studio.upload");
  const inputRef = useRef<HTMLInputElement>(null);

  const openFilePicker = () => {
    if (!isReplacing && !isUploading) {
      inputRef.current?.click();
    }
  };

  return (
    <div className="w-full rounded-lg border border-border bg-card p-5 shadow-xl md:w-80">
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="sr-only"
        disabled={isReplacing || isUploading}
        onChange={event => {
          onFileSelect(event.target.files?.[0] ?? null);
          event.currentTarget.value = "";
        }}
      />

      {!file ? (
        <div className="flex flex-col gap-3">
          <span className="text-center font-headline text-sm font-medium text-muted-foreground">
            {t("step1.fields.selectFileHint")}
          </span>
          <button
            type="button"
            onClick={openFilePicker}
            disabled={isReplacing || isUploading}
            className="w-full border border-dashed border-border bg-muted py-2 text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t("step1.fields.browseFiles")}
          </button>
          {replaceError ? <p className="text-xs text-destructive">{replaceError}</p> : null}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="min-w-0">
            <div className={`mb-2 flex items-center gap-2 ${isUploaded ? "text-secondary" : "text-green-500"}`}>
              <span className={`material-symbols-outlined text-[18px] ${isUploading ? "animate-spin" : ""}`}>
                {isUploading ? "progress_activity" : isUploaded ? "cloud_done" : "check_circle"}
              </span>
              <span className="font-headline text-xs font-bold uppercase tracking-widest">
                {isUploading
                  ? t("step1.fields.uploadingRawFile")
                  : isReplacing
                    ? t("step1.fields.replacingFile")
                    : isUploaded
                      ? t("step1.fields.uploadedToStorage")
                      : t("step1.fields.fileReady")}
              </span>
            </div>
            <p className="truncate font-headline text-sm font-semibold text-zinc-200" title={file.name}>
              {file.name}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatFileSize(file.size)} {file.type ? `· ${file.type}` : ""}
            </p>
            {isUploading || isUploaded ? (
              <div className="mt-3 space-y-1">
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-secondary transition-[width] duration-300"
                    style={{ width: `${isUploaded ? 100 : uploadProgress}%` }}
                  />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {isUploaded
                    ? t("step1.fields.rawVideoUploaded")
                    : t("step1.fields.percentUploaded", { progress: uploadProgress })}
                </p>
              </div>
            ) : null}
            {replaceError ? <p className="mt-2 text-xs text-destructive">{replaceError}</p> : null}
            {uploadError ? <p className="mt-2 text-xs text-destructive">{uploadError}</p> : null}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={openFilePicker}
              disabled={isReplacing || isUploading}
              className="flex-1 rounded-sm bg-muted py-2 text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isReplacing ? t("step1.fields.replacing") : t("step1.fields.replace")}
            </button>
            <button
              type="button"
              onClick={() => onFileSelect(null)}
              disabled={isReplacing || isUploading}
              className="rounded-sm border border-border/40 px-3 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t("step1.fields.clear")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
