"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { mediaService, DiscoveryVideoResponse } from "@/features/watch/services/mediaService";
import { ProcessingProgressTracker } from "./ProcessingProgressTracker";

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
      // NOTE: API Delete chưa được định nghĩa trong API docs hiện tại
      // Tạm thời chỉ filter UI
      setVideos(videos.filter(v => v.id !== id));
    }
  };

  return (
    <section className="p-8 space-y-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-headline text-[#f9f5f8]">Content Management</h1>
          <p className="text-zinc-500 font-medium mt-1">Manage all your uploaded videos and drafts.</p>
        </div>
        
        <div className="flex bg-[#19191c] rounded-md p-1 border border-[#48474a]/20 w-fit">
          <button className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded transition-all bg-[#ff8e80] text-[#650003]">
            Videos
          </button>
          <button className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded transition-all text-zinc-500 hover:text-white">
            Shorts
          </button>
          <button className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded transition-all text-zinc-500 hover:text-white">
            Live
          </button>
        </div>
      </div>

      <div className="bg-[#131315] rounded-xl border border-[#262528] overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#262528] bg-[#19191c] text-xs font-bold text-zinc-500 uppercase tracking-widest">
          <div className="col-span-5 pl-4">Video</div>
          <div className="col-span-2">Visibility</div>
          <div className="col-span-1 text-center">Date</div>
          <div className="col-span-1 text-center">Views</div>
          <div className="col-span-1 text-center">Likes</div>
          <div className="col-span-2 text-right pr-4">Actions</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-[#262528]">
          {isLoading ? (
            <div className="p-12 text-center text-zinc-500">Loading videos...</div>
          ) : videos.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">
              No videos found. Upload a video to get started.
            </div>
          ) : (
            videos.map(video => {
              const isDraftOrProcessing = ["draft", "processing", "pending_moderation"].includes(video.status);
              const visibilityLabel = video.visibility.charAt(0).toUpperCase() + video.visibility.slice(1);
              const formattedDate = video.createdAt ? new Date(video.createdAt).toLocaleDateString() : "--";
              const thumbUrl = video.thumbnailUrl || "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=200";

              return (
              <div key={video.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[#19191c] transition-colors group">
                {/* Video Info */}
                <div className="col-span-5 flex gap-4 pl-4 items-center">
                  <div className="w-24 aspect-video rounded bg-zinc-800 overflow-hidden flex-shrink-0 border border-[#262528] self-start mt-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumbUrl} alt="thumb" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 w-full flex-1 pr-4">
                    <h3 className="font-headline font-bold text-sm text-white truncate group-hover:text-[#ff8e80] transition-colors cursor-pointer">{video.title}</h3>
                    <div className="flex gap-2 mt-1">
                      {isDraftOrProcessing ? (
                        <span className="text-[10px] font-bold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">{video.status.toUpperCase()}</span>
                      ) : (
                        <span className="text-[10px] font-bold text-zinc-500">{video.status.toUpperCase()}</span>
                      )}
                    </div>
                    {["pending_moderation", "moderating", "processing"].includes(video.status) && (
                      <ProcessingProgressTracker
                        videoId={video.id}
                        initialStatus={video.status}
                        onComplete={fetchVideos}
                      />
                    )}
                  </div>
                </div>

                {/* Visibility */}
                <div className="col-span-2 flex items-center">
                  <span className={`flex items-center gap-1.5 text-xs font-bold ${
                    video.visibility === 'public' ? 'text-green-500' : 
                    (video.price > 0 || video.requiredTierLevel) ? 'text-[#fdc003]' : 'text-zinc-500'
                  }`}>
                    <span className="material-symbols-outlined text-[14px]">
                      {video.visibility === 'public' ? 'public' : (video.price > 0 || video.requiredTierLevel) ? 'workspace_premium' : 'visibility_off'}
                    </span>
                    {visibilityLabel}
                  </span>
                </div>

                {/* Date */}
                <div className="col-span-1 text-center text-xs text-zinc-400">{formattedDate}</div>

                {/* Metrics */}
                <div className="col-span-1 text-center text-xs text-white font-medium">{video.viewCount?.toLocaleString() || "0"}</div>
                <div className="col-span-1 text-center text-xs text-white font-medium">--</div>

                {/* Actions */}
                <div className="col-span-2 flex justify-end gap-2 pr-4">
                  <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-500 hover:text-white rounded-full">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </Button>
                  <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-500 hover:text-[#ff8e80] rounded-full">
                    <span className="material-symbols-outlined text-[18px]">insights</span>
                  </Button>
                  <Button variant="ghost" onClick={() => handleDelete(video.id)} className="h-8 w-8 p-0 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </Button>
                </div>
              </div>
            )})
          )}
        </div>
      </div>
    </section>
  );
}
