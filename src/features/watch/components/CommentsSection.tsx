"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/context/AuthContext";

export function CommentsSection() {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "Alex Rivera",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlAz-JwXXXb4_REc99eC3DPwNAMKt1DP0soyAKK3l1fHKwNGg_7AduchEIuK2IY8ApAfmkhdntggx0nLClzsctsnb3bB9q6zOGmZub6cq9234FR5VIh6IAdircVGNhDGGxut2aMunxaYG66TdCJ8kqo57fJdDmwdsN0Kfp_5ysPW4AfeLHoxqsT1gVtN5CHwFeDn89UhDbh8YQHniuRoucRwul2AWJh9qpQeDDupzuIa8c30rxlgadEcCIgKwRgIo01YNky4_ofTRZ",
      text: "The grading on this is absolutely incredible. That shot at 04:20 where the rain hits the neon signs is pure art. Well done!",
      time: "2 days ago",
      likes: 1200
    }
  ]);

  const handleComment = () => {
    if (!commentText.trim()) return;
    if (!user) {
      alert("Please sign in to comment");
      return;
    }
    const newComment = {
      id: Date.now(),
      author: user.displayName || user.email || "User",
      avatar: user.avatarUrl || "",
      text: commentText,
      time: "Just now",
      likes: 0
    };
    setComments([newComment, ...comments]);
    setCommentText("");
  };

  return (
    <div className="pt-10 space-y-10">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-headline font-bold text-[#f9f5f8]">{comments.length + 2481} Comments</h3>
        <div className="flex items-center gap-3 text-sm font-bold text-zinc-400 cursor-pointer hover:text-white transition-colors">
          <span className="material-symbols-outlined">sort</span>
          <span>Sort by</span>
        </div>
      </div>

      {/* Comment Input */}
      <div className="flex gap-6">
        <Avatar className="w-12 h-12 border border-[#48474a]/20">
          <AvatarImage src={user?.avatarUrl || ""} alt="User avatar" />
          <AvatarFallback>{user ? (user.displayName || user.email || 'U')[0] : 'U'}</AvatarFallback>
        </Avatar>
        
        <div className="flex-grow space-y-4">
          <Input 
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter') handleComment(); }}
            className="w-full bg-transparent border-0 border-b border-zinc-800 rounded-none px-0 py-3 focus-visible:ring-0 focus-visible:border-[#ff8e80] transition-colors text-sm placeholder:text-zinc-600 text-white" 
            placeholder={user ? "Add a public comment..." : "Sign in to add a public comment..."} 
            disabled={!user}
          />
          <div className="flex justify-end gap-4 md:gap-6">
            <Button 
              variant="ghost" 
              className="text-sm font-bold text-zinc-500 hover:text-white hover:bg-transparent"
              onClick={() => setCommentText("")}
              disabled={!commentText}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleComment}
              disabled={!commentText || !user}
              className={`px-8 rounded-full text-sm font-bold transition-all ${commentText ? 'bg-[#ff8e80] text-black hover:bg-[#ff7668]' : 'bg-zinc-800 text-zinc-400'}`}
            >
              Comment
            </Button>
          </div>
        </div>
      </div>

      {/* Individual Comments */}
      <div className="space-y-10 mt-8">
        {comments.map(c => (
          <div key={c.id} className="flex gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <Avatar className="w-12 h-12 border border-[#48474a]/20">
              <AvatarImage src={c.avatar} alt={c.author} />
              <AvatarFallback>{c.author.substring(0,2)}</AvatarFallback>
            </Avatar>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className={`font-bold text-sm ${c.author === (user?.displayName || user?.email) ? 'text-[#ff8e80]' : 'text-[#f9f5f8]'}`}>{c.author}</span>
                <span className="text-zinc-600 text-xs">{c.time}</span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">
                {c.text}
              </p>
              <div className="flex items-center gap-6 pt-3">
                <div className="flex items-center gap-2 cursor-pointer text-zinc-500 hover:text-[#ff8e80] transition-colors">
                  <span className="material-symbols-outlined text-sm">thumb_up</span>
                  <span className="text-xs font-bold">{c.likes > 0 ? c.likes : ''}</span>
                </div>
                <span className="material-symbols-outlined text-sm text-zinc-500 hover:text-red-500 cursor-pointer transition-colors">thumb_down</span>
                <span className="text-xs font-bold text-zinc-500 hover:text-white cursor-pointer transition-colors uppercase tracking-widest">Reply</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
