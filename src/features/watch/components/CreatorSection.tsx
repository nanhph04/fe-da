"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useAuth } from "@/features/auth/context/AuthContext";

interface CreatorSectionProps {
  description: string;
}

export function CreatorSection({ description }: CreatorSectionProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth();

  return (
    <div className="space-y-6 mt-8">
      {/* Creator Info Box */}
      <div className="bg-zinc-950/50 p-8 rounded-xl flex items-center justify-between border border-[#48474a]/10 shadow-xl">
        <Link href="/profile" className="flex items-center gap-5 cursor-pointer group">
          <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-[#ff8e80] to-[#fdc003] group-hover:scale-105 transition-transform">
            <Avatar className="w-full h-full border-4 border-zinc-950">
              <AvatarImage src="https://lh3.googleusercontent.com/aida-public/AB6AXuALPW-_1eopLS1mSsfTWunZxnhrFBYgOmYoIOerOXx0j0FNL8SpZP9G5FL4kFbIc31VCawODRqVekiTHsnUXMJhkseRuIY-frJHa3yK9AkwV6FFv6iIdgUqrLQw4Y0P3oTsEtW4OrQz8q82Ss3i1NEdAy0GRVbZiUsM1h5Cb_ZagZUQxghzKmxsIkHLsoAc-k8QT9KxcTDs7eJ5QtLnAQCa1uzGR1MhfY-cK88EeqWuWh-dK5vLKWW5S8qf0jenHfbYt5LXHwj_rIX8" alt="Channel logo" />
              <AvatarFallback>CV</AvatarFallback>
            </Avatar>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-headline font-bold text-xl text-[#f9f5f8] group-hover:text-white transition-colors">CyberVisuals Studio</h3>
              <span className="material-symbols-outlined text-[#ff8e80] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
            <p className="text-zinc-500 text-sm font-medium">2.4M subscribers • 156 videos</p>
          </div>
        </Link>
        
        <div className="flex gap-4 items-center">
          <Link href="/memberships" className="hidden sm:flex text-[#fdc003] font-bold text-sm tracking-widest hover:underline uppercase items-center gap-1">
             <span className="material-symbols-outlined text-[18px]">stars</span> Join Tier
          </Link>
          <Button 
            onClick={() => {
              if(!user) return alert("Please sign in first");
              setIsSubscribed(!isSubscribed);
            }}
            variant="secondary" 
            className={`px-8 py-6 rounded-full font-bold transition-all active:scale-95 ${isSubscribed ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-white text-black hover:bg-zinc-200'}`}
          >
            {isSubscribed ? 'Subscribed' : 'Subscribe'}
          </Button>
        </div>
      </div>

      {/* Description Box */}
      <div className="bg-zinc-950/30 p-8 rounded-xl border border-[#48474a]/10 transition-all duration-300">
        <p className={`text-zinc-400 leading-relaxed text-sm font-medium ${isExpanded ? '' : 'line-clamp-2'} whitespace-pre-wrap`}>
          {description || "No description provided."}
        </p>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-6 text-[#ff8e80] font-bold text-xs uppercase tracking-widest hover:underline"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      </div>
    </div>
  );
}
