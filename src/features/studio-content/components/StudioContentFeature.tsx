"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  date: string;
  views: string;
  comments: string;
  likes: string;
  visibility: "Public" | "Private" | "Premium";
  status: "Published" | "Draft";
}

const MOCK_VIDEOS: VideoItem[] = [
  {
    id: "1",
    title: "The Ethereal Horizon: A Cinematic Journey Through Iceland",
    thumbnail: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=200",
    date: "Oct 24, 2023",
    views: "1.2M",
    comments: "4.5K",
    likes: "89K",
    visibility: "Public",
    status: "Published"
  },
  {
    id: "2",
    title: "Neon City Nights - Cyberpunk B-Roll",
    thumbnail: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=200",
    date: "Oct 18, 2023",
    views: "850K",
    comments: "2.1K",
    likes: "45K",
    visibility: "Premium",
    status: "Published"
  },
  {
    id: "3",
    title: "Echoes of Silence (Short Film)",
    thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=200",
    date: "Oct 10, 2023",
    views: "--",
    comments: "--",
    likes: "--",
    visibility: "Private",
    status: "Draft"
  }
];

export function StudioContentFeature() {
  const [videos, setVideos] = useState<VideoItem[]>(MOCK_VIDEOS);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this video?")) {
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
          {videos.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">
              No videos found. Upload a video to get started.
            </div>
          ) : (
            videos.map(video => (
              <div key={video.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[#19191c] transition-colors group">
                {/* Video Info */}
                <div className="col-span-5 flex gap-4 pl-4 items-center">
                  <div className="w-24 aspect-video rounded bg-zinc-800 overflow-hidden flex-shrink-0 border border-[#262528]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={video.thumbnail} alt="thumb" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-headline font-bold text-sm text-white truncate group-hover:text-[#ff8e80] transition-colors cursor-pointer">{video.title}</h3>
                    <div className="flex gap-2 mt-1">
                      {video.status === 'Draft' ? (
                        <span className="text-[10px] font-bold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">DRAFT</span>
                      ) : (
                        <span className="text-[10px] font-bold text-zinc-500">{video.status}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Visibility */}
                <div className="col-span-2 flex items-center">
                  <span className={`flex items-center gap-1.5 text-xs font-bold ${
                    video.visibility === 'Public' ? 'text-green-500' : 
                    video.visibility === 'Premium' ? 'text-[#fdc003]' : 'text-zinc-500'
                  }`}>
                    <span className="material-symbols-outlined text-[14px]">
                      {video.visibility === 'Public' ? 'public' : video.visibility === 'Premium' ? 'workspace_premium' : 'visibility_off'}
                    </span>
                    {video.visibility}
                  </span>
                </div>

                {/* Date */}
                <div className="col-span-1 text-center text-xs text-zinc-400">{video.date}</div>

                {/* Metrics */}
                <div className="col-span-1 text-center text-xs text-white font-medium">{video.views}</div>
                <div className="col-span-1 text-center text-xs text-white font-medium">{video.likes}</div>

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
            ))
          )}
        </div>
      </div>
    </section>
  );
}
