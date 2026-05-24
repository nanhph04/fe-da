"use client";

import { Link } from "@/i18n/routing";
import { getErrorMessage } from "@/shared/api/client";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { adminContentService } from "../services/adminContentService";
import type {
  AdminVideoItem,
  AdminVideoPreview,
} from "../types/admin-content.types";

function formatTimestamp(seconds: number | null | undefined) {
  if (typeof seconds !== "number" || !Number.isFinite(seconds)) {
    return "N/A";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function getModerationNumber(
  details: Record<string, unknown> | null,
  key: string,
) {
  const value = details?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getModerationText(
  details: Record<string, unknown> | null,
  key: string,
) {
  const value = details?.[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function formatPercent(value: number | null) {
  return value === null ? "N/A" : `${Math.round(value * 100)}%`;
}

export function ContentModerationDetailFeature() {
  const params = useParams();
  const id = params.id as string;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [video, setVideo] = useState<AdminVideoItem | null>(null);
  const [preview, setPreview] = useState<AdminVideoPreview | null>(null);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadModerationDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [videoData, previewData] = await Promise.all([
          adminContentService.getVideo(id),
          adminContentService.getVideoPreview(id),
        ]);

        if (!cancelled) {
          setVideo(videoData);
          setPreview(previewData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, "Khong the tai chi tiet kiem duyet."));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadModerationDetail();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const moderationDetails =
    preview?.moderationDetails ?? video?.moderationDetails ?? null;
  const evidenceTimestampSeconds =
    preview?.evidenceTimestampSeconds ??
    getModerationNumber(moderationDetails, "evidenceTimestampSeconds");
  const confidence = getModerationNumber(moderationDetails, "confidence");
  const nsfwScore = getModerationNumber(moderationDetails, "nsfwScore");
  const safeScore = getModerationNumber(moderationDetails, "safeScore");
  const sampledFrameCount = getModerationNumber(
    moderationDetails,
    "sampledFrameCount",
  );
  const label = getModerationText(moderationDetails, "label") ?? "nsfw";
  const reason =
    getModerationText(moderationDetails, "reason") ??
    video?.errorMessage ??
    "Manual review required";
  const canModerate = video?.status === "pending_manual_review";

  const seekToEvidence = () => {
    if (videoRef.current && typeof evidenceTimestampSeconds === "number") {
      videoRef.current.currentTime = evidenceTimestampSeconds;
    }
  };

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      const updated = await adminContentService.moderateVideo(id, {
        action: "approve",
      });
      setVideo(updated);
      setActionMessage("Video approved and queued for processing.");
    } catch (err) {
      setError(getErrorMessage(err, "Khong the approve video."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    const reasonText = notes.trim();
    if (!reasonText) {
      setError("Nhap ly do reject truoc khi tu choi video.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const updated = await adminContentService.moderateVideo(id, {
        action: "reject",
        reason: reasonText,
      });
      setVideo(updated);
      setActionMessage("Video rejected.");
    } catch (err) {
      setError(getErrorMessage(err, "Khong the reject video."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-border/30 pb-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/content/review"
            className="flex h-10 w-10 items-center justify-center rounded border border-border/30 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Back to moderation queue"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              arrow_back
            </span>
          </Link>
          <div>
            <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">
              Moderation Detail
            </p>
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground">
              {video?.title ?? id}
            </h1>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {video?.id ?? id}
            </p>
          </div>
        </div>
        <span className="w-fit rounded-sm border border-primary/30 bg-primary/10 px-3 py-1 font-label text-xs font-bold uppercase tracking-widest text-primary">
          {video?.status ?? "loading"}
        </span>
      </header>

      {error ? (
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 font-body text-sm text-primary">
          {error}
        </div>
      ) : null}

      {actionMessage ? (
        <div className="rounded-lg border border-secondary/30 bg-secondary/10 p-4 font-body text-sm text-secondary">
          {actionMessage}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="overflow-hidden rounded-sm border border-border/30 bg-background">
            {isLoading ? (
              <div className="flex aspect-video items-center justify-center font-body text-sm text-muted-foreground">
                Loading preview...
              </div>
            ) : preview?.previewUrl ? (
              <video
                ref={videoRef}
                src={preview.previewUrl}
                controls
                className="aspect-video w-full bg-black"
                onLoadedMetadata={seekToEvidence}
              />
            ) : (
              <div className="flex aspect-video items-center justify-center p-6 text-center font-body text-sm text-muted-foreground">
                Raw preview is not available for this video.
              </div>
            )}
          </div>

          <article className="rounded-lg border border-border/30 bg-card p-6">
            <h2 className="mb-2 font-headline text-lg font-bold text-foreground">
              {video?.title ?? "Video"}
            </h2>
            <p className="mb-4 font-body text-sm leading-relaxed text-muted-foreground">
              {video?.description || "No description."}
            </p>
            <div className="grid grid-cols-1 gap-4 border-t border-border/30 pt-4 md:grid-cols-3">
              <div>
                <p className="font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Owner
                </p>
                <p className="mt-1 font-mono text-sm text-foreground">
                  {video?.ownerId ?? "N/A"}
                </p>
              </div>
              <div>
                <p className="font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Category
                </p>
                <p className="mt-1 font-mono text-sm text-foreground">
                  {video?.category ?? "N/A"}
                </p>
              </div>
              <div>
                <p className="font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Evidence Time
                </p>
                <button
                  type="button"
                  onClick={seekToEvidence}
                  className="mt-1 font-mono text-sm text-primary underline-offset-4 hover:underline"
                >
                  {formatTimestamp(evidenceTimestampSeconds)}
                </button>
              </div>
            </div>
          </article>
        </div>

        <aside className="space-y-6 lg:col-span-4">
          <div className="sticky top-28 rounded-lg border border-primary/30 bg-primary/10 p-6">
            <h2 className="mb-6 font-headline text-xl font-bold uppercase tracking-widest text-primary">
              Review Judgement
            </h2>
            <div className="space-y-6">
              <div className="border-l-2 border-primary pl-3 font-mono text-xs leading-5 text-primary">
                <p>Reason: {reason}</p>
                <p>Label: {label}</p>
                <p>Confidence: {formatPercent(confidence)}</p>
                <p>NSFW: {formatPercent(nsfwScore)}</p>
                <p>Safe: {formatPercent(safeScore)}</p>
                <p>Sampled frames: {sampledFrameCount ?? "N/A"}</p>
              </div>
              <div>
                <label className="mb-3 block font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Mod Notes
                </label>
                <textarea
                  className="min-h-[120px] w-full rounded-sm border border-primary/30 bg-background p-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                  placeholder="Required for rejection..."
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  disabled={!canModerate || isSubmitting}
                />
              </div>
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-sm bg-secondary py-3 font-headline text-xs font-bold uppercase tracking-widest text-secondary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!canModerate || isSubmitting}
                  onClick={handleApprove}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    check_circle
                  </span>
                  Approve and Process
                </button>
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-sm bg-primary py-3 font-headline text-xs font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!canModerate || isSubmitting}
                  onClick={handleReject}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    block
                  </span>
                  Reject Video
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
