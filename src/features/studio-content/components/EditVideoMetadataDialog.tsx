"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  mediaService,
  type CategoryResponse,
  type OwnerVideoDetailResponse,
  type TagResponse,
  type UpdateVideoMetadataBody,
} from "@/features/watch/services/mediaService";
import { getErrorMessage } from "@/shared/api/client";

interface EditVideoMetadataDialogProps {
  videoId: string;
  onClose: () => void;
  onSaved: () => void;
}

type VideoVisibility = NonNullable<UpdateVideoMetadataBody["visibility"]>;

const normalizeLookupValue = (value?: string | null) => value?.trim().toLowerCase() ?? "";

function normalizeEditableVisibility(value?: string | null): VideoVisibility {
  return value === "public" ? "public" : "private";
}

function resolveCategoryId(video: OwnerVideoDetailResponse, categories: CategoryResponse[]) {
  if (video.categoryId) {
    return video.categoryId;
  }

  const categoryValue = normalizeLookupValue(video.category);
  return categories.find(category =>
    normalizeLookupValue(category.name) === categoryValue || normalizeLookupValue(category.slug) === categoryValue
  )?.id ?? "";
}

function resolveTagIds(video: OwnerVideoDetailResponse, tags: TagResponse[]) {
  if (Array.isArray(video.tagIds) && video.tagIds.length > 0) {
    return video.tagIds.filter(Boolean);
  }

  const videoTags = new Set((video.tags ?? []).map(normalizeLookupValue).filter(Boolean));
  return tags
    .filter(tag => videoTags.has(normalizeLookupValue(tag.name)) || videoTags.has(normalizeLookupValue(tag.slug)))
    .map(tag => tag.id);
}

export function EditVideoMetadataDialog({ videoId, onClose, onSaved }: EditVideoMetadataDialogProps) {
  const [metadata, setMetadata] = useState<OwnerVideoDetailResponse | null>(null);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [tags, setTags] = useState<TagResponse[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<VideoVisibility>("private");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadMetadata = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [metadataRes, categoriesRes, tagsRes] = await Promise.all([
          mediaService.getOwnerVideoDetail(videoId),
          mediaService.getCategories(),
          mediaService.getTags(),
        ]);

        if (!isActive) {
          return;
        }

        const loadedCategories = categoriesRes.success && categoriesRes.data ? categoriesRes.data.items : [];
        const loadedTags = tagsRes.success && tagsRes.data ? tagsRes.data.items : [];

        setCategories(loadedCategories);
        setTags(loadedTags);

        if (metadataRes.success && metadataRes.data) {
          setMetadata(metadataRes.data);
          setTitle(metadataRes.data.title ?? "");
          setDescription(metadataRes.data.description ?? "");
          setThumbnailUrl(metadataRes.data.thumbnailUrl ?? "");
          setCategoryId(resolveCategoryId(metadataRes.data, loadedCategories));
          setTagIds(resolveTagIds(metadataRes.data, loadedTags));
          setVisibility(normalizeEditableVisibility(metadataRes.data.visibility));
          return;
        }

        setError(metadataRes.mess || "Không tải được dữ liệu video.");
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

  const selectedCategoryName = useMemo(() => {
    return categories.find(category => category.id === categoryId)?.name;
  }, [categories, categoryId]);

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
        categoryId: categoryId || undefined,
        tagIds,
        visibility,
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
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border/30 bg-card shadow-2xl shadow-black/50">
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
              <label htmlFor="video-visibility" className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Visibility
              </label>
              <select
                id="video-visibility"
                value={visibility}
                onChange={event => setVisibility(event.target.value as VideoVisibility)}
                className="h-10 w-full rounded-md border border-border/40 bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/60"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Public videos can be discovered by viewers. Private videos stay hidden from public discovery.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="video-category" className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Category
              </label>
              <select
                id="video-category"
                value={categoryId}
                onChange={event => setCategoryId(event.target.value)}
                className="h-10 w-full rounded-md border border-border/40 bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/60"
              >
                <option value="">Keep current category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Current category: {metadata?.category || "Unknown"}{selectedCategoryName ? ` -> ${selectedCategoryName}` : ""}
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Tags
              </span>
              <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto rounded-md border border-border/30 bg-background p-3">
                {tags.length > 0 ? (
                  tags.map(tag => {
                    const selected = tagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => {
                          setTagIds(current =>
                            selected ? current.filter(item => item !== tag.id) : [...current, tag.id]
                          );
                        }}
                        className={`rounded-sm border px-3 py-1.5 text-xs font-bold transition-colors ${
                          selected
                            ? "border-primary/70 bg-primary/10 text-primary"
                            : "border-border/30 text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        #{tag.slug}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-xs text-muted-foreground">Không có tag active.</p>
                )}
              </div>
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
