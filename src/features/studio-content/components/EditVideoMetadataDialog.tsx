"use client";

import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { mediaService, type VideoMetadataResponse } from "@/features/watch/services/mediaService";
import { getErrorMessage } from "@/shared/api/client";

interface EditVideoMetadataDialogProps {
  videoId: string;
  onClose: () => void;
  onSaved: () => void;
}

export function EditVideoMetadataDialog({ videoId, onClose, onSaved }: EditVideoMetadataDialogProps) {
  const [metadata, setMetadata] = useState<VideoMetadataResponse | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadMetadata = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await mediaService.getVideoMetadata(videoId);
        if (!isActive) {
          return;
        }

        if (res.success && res.data) {
          setMetadata(res.data);
          setTitle(res.data.title ?? "");
          setDescription(res.data.description ?? "");
          setThumbnailUrl(res.data.thumbnailUrl ?? "");
          return;
        }

        setError(res.mess || "Không tải được dữ liệu video.");
      } catch (err) {
        if (isActive) {
          setError(getErrorMessage(err, "Không tải được dữ liệu video."));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadMetadata();

    return () => {
      isActive = false;
    };
  }, [videoId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Tiêu đề video không được để trống.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const res = await mediaService.updateVideoMetadata(videoId, {
        title: trimmedTitle,
        description: description.trim(),
        thumbnailUrl: thumbnailUrl.trim() || null,
      });

      if (res.success && res.data) {
        onSaved();
        return;
      }

      setError(res.mess || "Không lưu được metadata video.");
    } catch (err) {
      setError(getErrorMessage(err, "Không lưu được metadata video."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-lg border border-border/30 bg-card shadow-2xl shadow-black/50">
        <div className="flex items-start justify-between gap-4 border-b border-border/30 p-6">
          <div>
            <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">Video Metadata</p>
            <h2 className="font-headline text-2xl font-extrabold tracking-tight text-foreground">Edit video details</h2>
            {metadata ? (
              <p className="mt-1 text-xs text-muted-foreground">Current status: {metadata.status}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close metadata editor"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 text-sm text-muted-foreground">Đang tải dữ liệu video...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 p-6">
            <div className="space-y-2">
              <label htmlFor="video-title" className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Title
              </label>
              <Input
                id="video-title"
                value={title}
                onChange={event => setTitle(event.target.value)}
                maxLength={200}
                className="border-border/40 bg-background text-foreground focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="video-description" className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Description
              </label>
              <Textarea
                id="video-description"
                value={description}
                onChange={event => setDescription(event.target.value)}
                className="min-h-32 resize-none border-border/40 bg-background text-foreground focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="video-thumbnail" className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Thumbnail URL
              </label>
              <Input
                id="video-thumbnail"
                value={thumbnailUrl}
                onChange={event => setThumbnailUrl(event.target.value)}
                placeholder="https://..."
                className="border-border/40 bg-background text-foreground focus-visible:ring-primary"
              />
              <p className="text-xs text-muted-foreground">Chỉ cập nhật URL thumbnail vì service hiện tại chưa có upload thumbnail riêng.</p>
            </div>

            {error ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <div className="flex justify-end gap-3 border-t border-border/30 pt-5">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
