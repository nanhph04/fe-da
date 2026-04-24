"use client";

import { useState } from "react";
import { HeroProfile } from "./HeroProfile";
import { AccountInfo } from "./AccountInfo";
import { WalletHistoryMini } from "./WalletHistoryMini";
import { ActiveMemberships } from "./ActiveMemberships";

// Mock Data for "Videos" Tab if it was a Creator
const MockVideos = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
     {[1, 2, 3].map(i => (
       <div key={i} className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
         <div className="aspect-video bg-zinc-800 relative">
            <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 text-xs font-mono font-bold text-white rounded">15:20</div>
         </div>
         <div className="p-4">
           <h3 className="text-white font-bold mb-1 line-clamp-1">Cinematic B-Roll {i}</h3>
           <p className="text-zinc-500 text-xs">2 days ago • 1.2M views</p>
         </div>
       </div>
     ))}
  </div>
);

export function ProfileFeature() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <main className="md:pl-64 pt-24 pb-12 px-8 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        <HeroProfile />
        
        {/* Profile Tabs Navigation */}
        <div className="flex border-b border-zinc-800 gap-8">
           <button 
             onClick={() => setActiveTab('overview')}
             className={`pb-4 font-headline uppercase tracking-widest text-sm font-bold border-b-2 transition-colors ${activeTab === 'overview' ? 'border-[#ff8e80] text-[#ff8e80]' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
           >
             Overview
           </button>
           <button 
             onClick={() => setActiveTab('videos')}
             className={`pb-4 font-headline uppercase tracking-widest text-sm font-bold border-b-2 transition-colors ${activeTab === 'videos' ? 'border-[#ff8e80] text-[#ff8e80]' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
           >
             Videos
           </button>
        </div>

        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
            <div className="lg:col-span-7 space-y-8">
              <AccountInfo />
              <WalletHistoryMini />
            </div>
            
            <div className="lg:col-span-5">
              <ActiveMemberships />
            </div>
          </div>
        ) : (
          <MockVideos />
        )}

      </div>
    </main>
  );
}
