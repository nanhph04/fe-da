"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Mock data based on typical Velvet Gallery categories
const INITIAL_CATEGORIES = [
  { id: "1", name: "Cinematic Shorts", description: "High quality short films", videoCount: 142, status: "active" },
  { id: "2", name: "Documentaries", description: "In-depth true stories", videoCount: 89, status: "active" },
  { id: "3", name: "Music Videos", description: "Official music releases", videoCount: 304, status: "active" },
  { id: "4", name: "Independent", description: "Indie filmmaker showcase", videoCount: 56, status: "hidden" },
];

export function CategoryManagementFeature() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-8 p-8 md:p-12 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#f9f5f8] tracking-tight font-headline">Category Management</h1>
          <p className="text-[#adaaaa] mt-1 text-lg">Organize and curate content genres across the platform.</p>
        </div>
        <Button className="bg-[#e11d48] hover:bg-[#be123c] text-white px-6 py-2 h-auto text-md font-bold rounded-md shadow-[0_0_15px_rgba(225,29,72,0.3)] transition-all">
          <span className="material-symbols-outlined mr-2">add</span>
          Create Category
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4 bg-[#1a1a1a] p-4 rounded-xl border border-[#262626]">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#adaaaa]">search</span>
          <Input 
            className="w-full bg-[#131313] border-[#262626] rounded-md py-6 pl-12 pr-5 text-[#f9f5f8] focus-visible:ring-[#e11d48]" 
            placeholder="Search categories by name or description..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-[50px] px-6 bg-transparent border-[#262626] text-[#adaaaa] hover:text-white hover:bg-[#20201f]">
          <span className="material-symbols-outlined mr-2">filter_list</span>
          Filter
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCategories.map(category => (
          <div key={category.id} className="bg-[#131313] p-6 rounded-xl border border-[#262626] hover:border-[#484847] hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-[#f9f5f8]">{category.name}</h3>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full ${category.status === 'active' ? 'bg-[#1a1a1a] text-[#f59e0b]' : 'bg-[#1a1a1a] text-[#adaaaa]'}`}>
                  {category.status}
                </span>
                <button className="text-[#adaaaa] hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-xl">more_vert</span>
                </button>
              </div>
            </div>
            
            <p className="text-[#adaaaa] text-sm mb-6 line-clamp-2 h-10">
              {category.description}
            </p>
            
            <div className="flex justify-between items-center pt-4 border-t border-[#262626]">
              <div className="flex items-center text-[#adaaaa] text-sm">
                <span className="material-symbols-outlined text-lg mr-2">movie</span>
                {category.videoCount} Videos
              </div>
              
              <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-[#adaaaa] hover:text-[#f59e0b] transition-colors" title="Edit">
                  <span className="material-symbols-outlined">edit</span>
                </button>
                <button className="text-[#adaaaa] hover:text-[#e11d48] transition-colors" title="Delete">
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredCategories.length === 0 && (
          <div className="col-span-full py-12 text-center bg-[#131313] rounded-xl border border-[#262626]">
            <span className="material-symbols-outlined text-4xl text-[#adaaaa] mb-4">category</span>
            <h3 className="text-xl font-bold text-[#f9f5f8]">No categories found</h3>
            <p className="text-[#adaaaa] mt-2">Try adjusting your search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}
