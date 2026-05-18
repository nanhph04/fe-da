"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  mediaService,
  type ConfirmUploadBody,
  type OwnerVideoDetailResponse,
} from "@/features/watch/services/mediaService";
import { getErrorMessage } from "@/shared/api/client";

interface StudioVideoDraftActionsProps {
  video: OwnerVideoDetailResponse;
  onChanged: () => void;
}

const DEFAULT_CONFIRM_RESOLUTIONS: ConfirmUploadBody["resolutions"] = ["720p", "1080p"];

function getConfirmResolutions(video: OwnerVideoDetailResponse): ConfirmUploadBody["resolutions"] {
  const allowedResolutions = new Set<ConfirmUploadBody["resolutions"][number]>([
    "480p",
    "720p",
    "1080p",
  ]);
  const selectedResolutions = (video.resolutions ?? []).filter(
    (resolution): resolution is ConfirmUploadBody["resolutions"][number] =>
      allowedResolutions.has(resolution as ConfirmUploadBody["resolutions"][number])
  );

  return selectedResolutions.length > 0 ? selectedResolutions : DEFAULT_CONFIRM_RESOLUTIONS;
}

export function StudioVideoDraftActions({ video, onChanged }: StudioVideoDraftActionsProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<"confirm" | "replace" | "cancel" | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const isBusy = activeAction !== null;

  const handleConfirmUpload = async () => {
    setActiveAction("confirm");
    setError(null);
    setMessage(null);

    try {
      const response = await mediaService.confirmUpload(video.id, {
        resolutions: getConfirmResolutions(video),
      });

      if (!(response.success || response.code === 200 || response.code === 201)) {
        setError(response.mess || "Khong the confirm-upload video draft.");
        return;
      }

      setMessage("Da confirm-upload. Video se chuyen sang hang doi xu ly.");
      onChanged();
    } catch (err) {
      setError(getErrorMessage(err, "Khong the confirm-upload video draft."));
    } finally {
      setActiveAction(null);
    }
  };

  const handleReplaceUpload = async (file: File | null) => {
    if (!file) {
      return;
    }

    setActiveAction("replace");
    setUploadProgress(0);
    setError(null);
    setMessage(null);

    try {
      const replaceResponse = await mediaService.replaceUpload(video.id);
      if (!replaceResponse.success || !replaceResponse.data) {
        setError(replaceResponse.mess || "Khong the tao upload URL moi cho draft.");
        return;
      }

      await mediaService.uploadRawVideoFile({
        uploadUrl: replaceResponse.data.uploadUrl,
        file,
        onProgress: setUploadProgress,
      });

      setMessage("Da upload file thay the. Bam Confirm upload de dua video vao hang doi xu ly.");
      onChanged();
    } catch (err) {
      setError(getErrorMessage(err, "Khong the upload file thay the cho draft."));
    } finally {
      setActiveAction(null);
      setUploadProgress(0);
    }
  };

  const handleCancelUpload = async () => {
    setActiveAction("cancel");
    setError(null);
    setMessage(null);

    try {
      const response = await mediaService.cancelUpload(video.id);
      if (!response.success) {
        setError(response.mess || "Khong the huy upload draft.");
        return;
      }

      setMessage("Da huy upload draft.");
      router.push("/studio/content");
    } catch (err) {
      setError(getErrorMessage(err, "Khong the huy upload draft."));
    } finally {
      setActiveAction(null);
    }
  };

  return (
    <article className="rounded-lg border border-secondary/30 bg-secondary/10 p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="font-label text-xs font-bold uppercase tracking-[0.24em] text-secondary">
            Draft upload
          </p>
          <h2 className="font-headline text-2xl font-extrabold tracking-tight text-foreground">
            Hoan tat hoac huy ban nhap nay
          </h2>
          <p className="font-body text-sm leading-6 text-muted-foreground">
            Video dang o trang thai draft. Ban co the upload file thay the, confirm-upload de bat dau xu ly,
            hoac huy upload neu khong tiep tuc.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="sr-only"
            disabled={isBusy}
            onChange={event => {
              const file = event.target.files?.[0] ?? null;
              event.currentTarget.value = "";
              void handleReplaceUpload(file);
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isBusy}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-secondary/40 px-4 font-headline text-sm font-bold text-secondary transition-colors hover:bg-secondary/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className={`material-symbols-outlined text-[18px] ${activeAction === "replace" ? "animate-spin" : ""}`} aria-hidden="true">
              {activeAction === "replace" ? "progress_activity" : "upload_file"}
            </span>
            Replace file
          </button>
          <button
            type="button"
            onClick={() => void handleConfirmUpload()}
            disabled={isBusy}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-primary px-4 font-headline text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              {activeAction === "confirm" ? "hourglass_top" : "check_circle"}
            </span>
            Confirm upload
          </button>
          <button
            type="button"
            onClick={() => void handleCancelUpload()}
            disabled={isBusy}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-destructive/40 px-4 font-headline text-sm font-bold text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              {activeAction === "cancel" ? "hourglass_top" : "delete"}
            </span>
            Cancel upload
          </button>
        </div>
      </div>

      {activeAction === "replace" ? (
        <div className="mt-5 space-y-2">
          <div className="h-1.5 overflow-hidden rounded-full bg-background/70">
            <div
              className="h-full rounded-full bg-secondary transition-[width] duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="font-label text-[10px] font-bold uppercase tracking-widest text-secondary">
            Uploading {uploadProgress}%
          </p>
        </div>
      ) : null}

      {message ? (
        <p className="mt-5 rounded-sm border border-secondary/30 bg-background/40 px-3 py-2 text-sm text-secondary">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="mt-5 rounded-sm border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </article>
  );
}
