"use client";

import { useState } from "react";
import { MediaCard } from "@/features/home/components/MediaCard";

const mockResults = {
  query: "cinematic",
  results: [
    { id: "1", title: "Cinematic Dreams", creator: "Studio Velvet", views: "2.4M", level: 1, imageUrl: "https://images.unsplash.com/photo-1536440132228-1ce5fe87afda?w=400&q=80", duration: "1:45:30" },
    { id: "2", title: "The Art of Cinema", creator: "Film Academy", views: "890K", level: 2, imageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=80", duration: "52:18" },
    { id: "3", title: "Cinematic Journey", creator: "Travel Films", views: "1.2M", level: 1, imageUrl: "https://images.unsplash.com/photo-1478720568477-152d9b944e37?w=400&q=80", duration: "1:12:45" },
    { id: "4", title: "Behind the Lens", creator: "Indie Pro", views: "567K", level: 3, imageUrl: "https://images.unsplash.com/photo-1440404653325-ed123b367a68?w=400&q=80", duration: "48:32" },
    { id: "5", title: "Cinema Stories", creator: "Storytelling Co", views: "3.1M", level: 2, imageUrl: "https://images.unsplash.com/photo-1598899134739-24c46f58a8cc?w=400&q=80", duration: "2:15:00" },
    { id: "6", title: "Frame by Frame", creator: "Animation Lab", views: "780K", level: 1, imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&q=80", duration: "1:38:22" },
  ],
  categories: ["All", "Films", "Documentaries", "Shorts", "Tutorials"],
  durationFilters: ["Any", "Under 10 min", "10-30 min", "30-60 min", "Over 60 min"],
  sortBy: [{ label: "Relevance", value: "relevance" }, { label: "Newest", value: "newest" }, { label: "Most Popular", value: "popular" }],
};

export function SearchFeature({ initialQuery = "" }: { initialQuery?: string }) {
  const [query] = useState(initialQuery || mockResults.query);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDuration, setSelectedDuration] = useState("Any");
  const [sortBy, setSortBy] = useState("relevance");

  return (
    <div className="pt-24 min-h-screen bg-[#0e0e10]">
      <div className="max-w-7xl mx-auto px-8 pb-16">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-headline text-white mb-2">
            Search Results
          </h1>
          <p className="text-zinc-500">
            Found <span className="text-[#ff8e80] font-bold">{mockResults.results.length}</span> results for &quot;{query}&quot;
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 pb-8 border-b border-zinc-800">
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-white px-4 py-2 rounded-sm text-sm focus:border-[#ff8e80] outline-none"
          >
            {mockResults.categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select 
            value={selectedDuration}
            onChange={(e) => setSelectedDuration(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-white px-4 py-2 rounded-sm text-sm focus:border-[#ff8e80] outline-none"
          >
            {mockResults.durationFilters.map(dur => (
              <option key={dur} value={dur}>{dur}</option>
            ))}
          </select>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-white px-4 py-2 rounded-sm text-sm focus:border-[#ff8e80] outline-none"
          >
            {mockResults.sortBy.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {mockResults.results.map((video) => (
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
            Load More Results
          </button>
        </div>
      </div>
    </div>
  );
}
