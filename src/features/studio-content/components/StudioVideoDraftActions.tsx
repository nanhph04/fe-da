"use client";

import { useRef, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import {
  mediaService,
  type SubmitUploadBody,
  type OwnerVideoDetailResponse,
} from "@/features/watch/services/mediaService";
import { getErrorMessage } from "@/shared/api/client";

interface StudioVideoDraftActionsProps {
  video: OwnerVideoDetailResponse;
  onChanged: () => void;
}

const DEFAULT_CONFIRM_RESOLUTIONS: SubmitUploadBody["resolutions"] = ["720p"];

function getConfirmResolutions(video: OwnerVideoDetailResponse): SubmitUploadBody["resolutions"] {
  const allowedResolutions = new Set<SubmitUploadBody["resolutions"][number]>([
    "480p",
    "720p",
    "1080p",
  ]);
  const selectedResolutions = (video.resolutions ?? []).filter(
    (resolution): resolution is SubmitUploadBody["resolutions"][number] =>
      allowedResolutions.has(resolution as SubmitUploadBody["resolutions"][number])
  );

  return selectedResolutions.length > 0 ? selectedResolutions : DEFAULT_CONFIRM_RESOLUTIONS;
}

export function StudioVideoDraftActions({ video, onChanged }: StudioVideoDraftActionsProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const t = useTranslations("Studio");
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
      if (!video.uploadId) {
        setError(t("content.draftActions.errors.missingSession"));
        return;
      }

      const response = await mediaService.submitUpload(video.id, video.uploadId, {
        resolutions: getConfirmResolutions(video),
      });

      if (!(response.success || response.statusCode === 200 || response.statusCode === 201)) {
        setError(response.message || t("content.draftActions.errors.confirmFailed"));
        return;
      }

      setMessage(t("content.draftActions.messages.confirmSuccess"));
      onChanged();
    } catch (err) {
      setError(getErrorMessage(err, t("content.draftActions.errors.confirmFailed")));
    } finally {
      setActiveAction(null);
    }
  };

  const handleResumeUpload = async (file: File | null) => {
    if (!file) {
      return;
    }

    if (!video.uploadId) {
      setError(t("content.draftActions.errors.missingSession"));
      return;
    }

    setActiveAction("replace");
    setUploadProgress(0);
    setError(null);
    setMessage(null);

    try {
      await mediaService.uploadResumableVideoFile({
        videoId: video.id,
        uploadId: video.uploadId,
        file,
        partSizeBytes: video.partSizeBytes || 5 * 1024 * 1024,
        onProgress: setUploadProgress,
      });

      setMessage(t("content.draftActions.messages.resumeSuccess"));
      onChanged();
    } catch (err) {
      setError(getErrorMessage(err, t("content.draftActions.errors.resumeFailed")));
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
      const response = await mediaService.cancelUpload(video.id, video.uploadId || "");
      if (!response.success) {
        setError(response.message || t("content.draftActions.errors.cancelFailed"));
        return;
      }

      setMessage(t("content.draftActions.messages.cancelSuccess"));
      router.push("/studio/content");
    } catch (err) {
      setError(getErrorMessage(err, t("content.draftActions.errors.cancelFailed")));
    } finally {
      setActiveAction(null);
    }
  };

  return (
    <article className="rounded-lg border border-secondary/30 bg-secondary/10 p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="font-label text-xs font-bold uppercase tracking-[0.24em] text-secondary">
            {t("content.draftActions.draftLabel")}
          </p>
          <h2 className="font-headline text-2xl font-extrabold tracking-tight text-foreground">
            {t("content.draftActions.title")}
          </h2>
          <p className="font-body text-sm leading-6 text-muted-foreground">
            {t("content.draftActions.description")}
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
              void handleResumeUpload(file);
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
            {t("content.draftActions.resumeUpload")}
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
            {t("content.draftActions.confirmUpload")}
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
            {t("content.draftActions.cancelUpload")}
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
            {t("content.draftActions.uploading", { progress: uploadProgress })}
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
