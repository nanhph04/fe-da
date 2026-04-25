"use client";

import { useEffect, useState } from "react";
import { mediaService } from "@/features/watch/services/mediaService";
import Link from "next/link";

import { DiscoveryVideoResponse } from "@/features/watch/services/mediaService";

export function DiscoveryFeature() {
  const [latestVideos, setLatestVideos] = useState<DiscoveryVideoResponse[]>([]);
  const [subscribedVideos, setSubscribedVideos] = useState<DiscoveryVideoResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDiscovery() {
        // Fetch Latest Videos
        try {
          const latestRes = await mediaService.getLatestVideos({ limit: 10 });
          if (latestRes.success && latestRes.data) {
            setLatestVideos(latestRes.data);
          }
        } catch (err) {
          console.error("Failed to load latest videos", err);
        }

        // Fetch Subscribed Videos (Có thể lỗi 401 nếu chưa login)
        try {
          const subscribedRes = await mediaService.getSubscribedVideos({ limit: 10 });
          if (subscribedRes.success && subscribedRes.data) {
            setSubscribedVideos(subscribedRes.data);
          }
        } catch (err) {
          console.error("Failed to load subscribed videos", err);
        }
        
        setLoading(false);
    }
    fetchDiscovery();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pl-64 flex justify-center text-zinc-500">
        <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="md:pl-64 pt-24 min-h-screen bg-[#0e0e10]">
      <div className="max-w-7xl mx-auto px-8 pb-16 space-y-16 animate-in fade-in duration-500">
        
        {/* Latest Videos Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-[#ff8e80]">whatshot</span>
            <h2 className="text-2xl font-bold font-headline text-white tracking-wide">Latest Releases</h2>
          </div>
          
          {latestVideos.length === 0 ? (
            <p className="text-zinc-500">No recent videos found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestVideos.map(video => (
                <Link href={`/watch/${video.id}`} key={video.id} className="group flex flex-col gap-3 cursor-pointer">
                  <div className="aspect-video bg-[#131315] rounded-xl overflow-hidden border border-[#262528] relative group-hover:border-[#ff8e80]/50 transition-colors">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={video.thumbnailUrl || "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=600"} 
                      alt={video.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-[10px] font-bold text-white">
                      HD
                    </div>
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-[#f9f5f8] line-clamp-2 leading-snug group-hover:text-[#ff8e80] transition-colors">{video.title}</h3>
                    <p className="text-xs text-zinc-400 mt-1">{video.channel?.name || "Unknown Channel"}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-zinc-500 font-medium">
                      <span>{video.metrics?.viewsCount || 0} views</span>
                      <span>•</span>
                      <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Subscribed Channels Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-[#ff8e80]">subscriptions</span>
            <h2 className="text-2xl font-bold font-headline text-white tracking-wide">From Your Subscriptions</h2>
          </div>
          
          {subscribedVideos.length === 0 ? (
            <p className="text-zinc-500">Subscribe to channels to see their latest videos here.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {subscribedVideos.map(video => (
                <Link href={`/watch/${video.id}`} key={video.id} className="group flex flex-col gap-3 cursor-pointer">
                  <div className="aspect-video bg-[#131315] rounded-xl overflow-hidden border border-[#262528] relative group-hover:border-[#ff8e80]/50 transition-colors">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={video.thumbnailUrl || "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=600"} 
                      alt={video.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-[#f9f5f8] line-clamp-2 leading-snug group-hover:text-[#ff8e80] transition-colors">{video.title}</h3>
                    <p className="text-xs text-zinc-400 mt-1">{video.channel?.name || "Unknown Channel"}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
