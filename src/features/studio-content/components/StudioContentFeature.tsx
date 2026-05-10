"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { mediaService, DiscoveryVideoResponse } from "@/features/watch/services/mediaService";
import { ProcessingProgressTracker } from "./ProcessingProgressTracker";

function getVisibilityTone(video: DiscoveryVideoResponse) {
  if (video.visibility === "public") {
    return "text-emerald-400";
  }

  if (video.price > 0 || video.requiredTierLevel) {
    return "text-secondary";
  }

  return "text-muted-foreground";
}

export function StudioContentFeature() {
  const [videos, setVideos] = useState<DiscoveryVideoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVideos = async () => {
    try {
      const res = await mediaService.getOwnerVideos();
      if (res.success && res.data) {
        setVideos(res.data);
      }
    } catch (err) {
      console.error("Failed to load owner videos", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this video?")) {
      setVideos(videos.filter((video) => video.id !== id));
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 p-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">Creator Gallery</p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">Content Library</h1>
          <p className="mt-2 max-w-2xl font-body text-sm text-muted-foreground">
            Manage uploads, organize releases, and monitor performance across every access tier.
          </p>
        </div>

        <button className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-6 py-3 font-headline text-sm font-semibold text-primary-foreground shadow-[0_10px_20px_rgba(229,9,20,0.2)] transition-opacity hover:opacity-90">
          <span className="material-symbols-outlined" aria-hidden="true">add</span>
          New Upload
        </button>
      </header>

      <div className="flex items-center gap-8 border-b border-border/30">
        {[
          ["Videos", videos.length],
          ["Drafts", videos.filter((video) => video.status === "draft").length],
          ["Processing", videos.filter((video) => ["processing", "pending_moderation", "moderating"].includes(video.status)).length],
        ].map(([label, count], index) => (
          <button
            key={label}
            type="button"
            className={`pb-4 font-headline text-sm font-semibold transition-colors ${
              index === 0 ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
            <span className="ml-2 rounded bg-card px-1.5 py-0.5 font-body text-xs text-muted-foreground">{count}</span>
          </button>
        ))}
      </div>

      <div className="flex w-full flex-col gap-4">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 font-label text-xs uppercase tracking-wider text-muted-foreground">
          <div className="col-span-12 md:col-span-5">Video</div>
          <div className="hidden text-center md:col-span-2 md:block">Visibility</div>
          <div className="hidden text-center md:col-span-1 md:block">Level</div>
          <div className="hidden text-right md:col-span-2 md:block">Performance</div>
          <div className="col-span-12 text-right md:col-span-2">Actions</div>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-border/30 bg-card p-12 text-center text-muted-foreground">Loading videos...</div>
        ) : videos.length === 0 ? (
          <div className="rounded-lg border border-border/30 bg-card p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-muted-foreground">video_library</span>
            <h2 className="mt-4 font-headline text-xl font-bold text-foreground">No videos found</h2>
            <p className="mt-2 font-body text-sm text-muted-foreground">Upload a video to start building your gallery.</p>
          </div>
        ) : (
          videos.map((video) => {
            const isDraftOrProcessing = ["draft", "processing", "pending_moderation"].includes(video.status);
            const visibilityLabel = video.visibility.charAt(0).toUpperCase() + video.visibility.slice(1);
            const formattedDate = video.createdAt ? new Date(video.createdAt).toLocaleDateString() : "--";
            const thumbUrl = video.thumbnailUrl;
            const levelLabel = video.requiredTierLevel ? `LV${video.requiredTierLevel}` : video.price > 0 ? "PPV" : "Free";

            return (
              <article
                key={video.id}
                className="group relative grid grid-cols-12 items-center gap-4 overflow-hidden rounded-lg bg-card px-6 py-4 transition-colors hover:bg-muted/40"
              >
                {video.requiredTierLevel === 3 ? <div className="absolute inset-0 rounded-lg border border-secondary/10" /> : null}

                <div className="col-span-12 flex items-center gap-4 md:col-span-5">
                  <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-background">
                    <div
                      aria-label={video.title}
                      role="img"
                      className="h-full w-full bg-cover bg-center opacity-80 transition-opacity group-hover:opacity-100"
                      style={
                        thumbUrl
                          ? { backgroundImage: `url(${thumbUrl})` }
                          : undefined
                      }
                    />
                    {!thumbUrl ? (
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(229,9,20,0.22),transparent_35%),linear-gradient(135deg,rgba(31,31,34,0.95),rgba(14,14,16,1))]" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate pr-4 font-headline text-base font-semibold text-foreground transition-colors group-hover:text-primary">
                      {video.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className={`font-label text-xs ${isDraftOrProcessing ? "text-muted-foreground" : "text-foreground"}`}>
                        {video.status.toUpperCase()}
                      </span>
                      <span className="font-label text-xs text-muted-foreground">• {formattedDate}</span>
                    </div>
                    {["pending_moderation", "moderating", "processing"].includes(video.status) && (
                      <ProcessingProgressTracker videoId={video.id} initialStatus={video.status} onComplete={fetchVideos} />
                    )}
                  </div>
                </div>

                <div className="hidden justify-center md:col-span-2 md:flex">
                  <span className={`inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 font-body text-xs font-medium ${getVisibilityTone(video)}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {visibilityLabel}
                  </span>
                </div>

                <div className="hidden justify-center md:col-span-1 md:flex">
                  <span className="rounded border border-border/30 bg-card px-2 py-1 font-headline text-xs font-bold text-foreground">
                    {levelLabel}
                  </span>
                </div>

                <div className="hidden flex-col text-right md:col-span-2 md:flex">
                  <span className="font-headline font-semibold text-foreground">
                    {video.viewCount?.toLocaleString() || "0"} <span className="font-body text-xs font-normal text-muted-foreground">views</span>
                  </span>
                  <span className="font-body text-xs text-muted-foreground">Likes pending</span>
                </div>

                <div className="col-span-12 flex justify-end gap-2 md:col-span-2">
                  <Button variant="ghost" className="h-8 w-8 rounded-full p-0 text-muted-foreground hover:text-foreground">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </Button>
                  <Button variant="ghost" className="h-8 w-8 rounded-full p-0 text-muted-foreground hover:text-secondary">
                    <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                  </Button>
                  <Button variant="ghost" onClick={() => handleDelete(video.id)} className="h-8 w-8 rounded-full p-0 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </Button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
