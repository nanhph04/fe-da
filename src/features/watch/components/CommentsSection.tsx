import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export function CommentsSection() {
  return (
    <div className="pt-10 space-y-10">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-headline font-bold text-[#f9f5f8]">2,482 Comments</h3>
        <div className="flex items-center gap-3 text-sm font-bold text-zinc-400 cursor-pointer hover:text-white transition-colors">
          <span className="material-symbols-outlined">sort</span>
          <span>Sort by</span>
        </div>
      </div>

      {/* Comment Input */}
      <div className="flex gap-6">
        <Avatar className="w-12 h-12 border border-[#48474a]/20">
          <AvatarImage src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOW03Sbr3WRJ3OzOHGlsTd2RtowPTf_2JjsofdXrnyY6Z4Q7dFf0LeMclepKmGKV1HR8teap9_e67-1Yao6iSAvVlPkTIpp2i44r5mNvGLlS91mPgfIHv4KpOmF4MH2u9U3xv91GeXzlISxhgA-Tk2170qZKg2aBIQDxGvarzXzgJWtseTyQCiZs162L1xx83tdigDSdOAzajQl6eCCKpbLzUO2XkwTrhR-sLBi4HMiEP0hfwnlYIkCWteP7idsbVCxblKrSjPgFPi" alt="User avatar" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        
        <div className="flex-grow space-y-4">
          <Input 
            className="w-full bg-transparent border-0 border-b border-zinc-800 rounded-none px-0 py-3 focus-visible:ring-0 focus-visible:border-[#ff8e80] transition-colors text-sm placeholder:text-zinc-600 text-white" 
            placeholder="Add a public comment..." 
          />
          <div className="flex justify-end gap-4 md:gap-6">
            <Button variant="ghost" className="text-sm font-bold text-zinc-500 hover:text-white hover:bg-transparent">
              Cancel
            </Button>
            <Button className="px-8 bg-zinc-800 rounded-full text-sm font-bold text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all">
              Comment
            </Button>
          </div>
        </div>
      </div>

      {/* Individual Comment */}
      <div className="space-y-10">
        <div className="flex gap-6">
          <Avatar className="w-12 h-12 border border-[#48474a]/20">
            <AvatarImage src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlAz-JwXXXb4_REc99eC3DPwNAMKt1DP0soyAKK3l1fHKwNGg_7AduchEIuK2IY8ApAfmkhdntggx0nLClzsctsnb3bB9q6zOGmZub6cq9234FR5VIh6IAdircVGNhDGGxut2aMunxaYG66TdCJ8kqo57fJdDmwdsN0Kfp_5ysPW4AfeLHoxqsT1gVtN5CHwFeDn89UhDbh8YQHniuRoucRwul2AWJh9qpQeDDupzuIa8c30rxlgadEcCIgKwRgIo01YNky4_ofTRZ" alt="Alex Rivera" />
            <AvatarFallback>AR</AvatarFallback>
          </Avatar>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm text-[#f9f5f8]">Alex Rivera</span>
              <span className="text-zinc-600 text-xs">2 days ago</span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              The grading on this is absolutely incredible. That shot at 04:20 where the rain hits the neon signs is pure art. Well done!
            </p>
            <div className="flex items-center gap-6 pt-3">
              <div className="flex items-center gap-2 cursor-pointer text-zinc-500 hover:text-[#ff8e80] transition-colors">
                <span className="material-symbols-outlined text-sm">thumb_up</span>
                <span className="text-xs font-bold">1.2K</span>
              </div>
              <span className="material-symbols-outlined text-sm text-zinc-500 hover:text-red-500 cursor-pointer transition-colors">thumb_down</span>
              <span className="text-xs font-bold text-zinc-500 hover:text-white cursor-pointer transition-colors uppercase tracking-widest">Reply</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
