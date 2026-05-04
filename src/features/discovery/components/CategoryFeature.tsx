"use client";

import { MediaCard } from "@/features/home/components/MediaCard";

const mockCategoryData = {
  "action": { name: "Action", description: "High-octane action films that keep you on the edge of your seat." },
  "drama": { name: "Drama", description: "Compelling stories that explore the depths of human emotion." },
  "comedy": { name: "Comedy", description: "Light-hearted entertainment to brighten your day." },
  "documentary": { name: "Documentary", description: "Real stories told by real people." },
  "horror": { name: "Horror", description: "Spine-chilling thrills and chills." },
};

const mockVideos = [
  { id: "1", title: "Action-packed", creator: "Studio Velvet", views: "2.4M", imageUrl: "https://images.unsplash.com/photo-1536440132228-1ce5fe87afda?w=400&q=80", duration: "1:45:30" },
  { id: "2", title: "The Chase", creator: "Film Academy", views: "890K", imageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=80", duration: "52:18" },
  { id: "3", title: "Velocity", creator: "Travel Films", views: "1.2M", imageUrl: "https://images.unsplash.com/photo-1478720568477-152d9b944e37?w=400&q=80", duration: "1:12:45" },
  { id: "4", title: "Adrenaline", creator: "Indie Pro", views: "567K", imageUrl: "https://images.unsplash.com/photo-1440404653325-ed123b367a68?w=400&q=80", duration: "48:32" },
  { id: "5", title: "Rush Hour", creator: "Storytelling Co", views: "3.1M", imageUrl: "https://images.unsplash.com/photo-1598899134739-24c46f58a8cc?w=400&q=80", duration: "2:15:00" },
  { id: "6", title: "Explosion", creator: "Animation Lab", views: "780K", imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&q=80", duration: "1:38:22" },
];

export function CategoryFeature({ slug }: { slug: string }) {
  const category = mockCategoryData[slug as keyof typeof mockCategoryData] || mockCategoryData["action"];
  const videos = mockVideos;

  return (
    <div className="pt-24 min-h-screen bg-[#0e0e10]">
      <div className="max-w-7xl mx-auto px-8 pb-16">
        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-headline text-white mb-2">{category.name}</h1>
          <p className="text-zinc-500 max-w-2xl">{category.description}</p>
          <p className="text-zinc-600 text-sm mt-2">{videos.length} videos in this category</p>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {videos.map((video) => (
            <MediaCard 
              key={video.id}
              title={video.title}
              creator={video.creator}
              views={video.views}
              imageUrl={video.imageUrl}
              duration={video.duration}
            />
          ))}
        </div>

        {/* Load More */}
        <div className="mt-12 text-center">
          <button className="px-8 py-3 bg-zinc-900 border border-zinc-800 text-white font-bold text-sm rounded-sm hover:border-[#ff8e80] transition-colors">
            Load More
          </button>
        </div>
      </div>
    </div>
  );
}