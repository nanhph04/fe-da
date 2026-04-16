import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function CreatorSection() {
  return (
    <div className="space-y-6 mt-8">
      {/* Creator Info Box */}
      <div className="bg-zinc-950/50 p-8 rounded-xl flex items-center justify-between border border-[#48474a]/10 shadow-xl">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-[#ff8e80] to-[#fdc003]">
            <Avatar className="w-full h-full border-4 border-zinc-950">
              <AvatarImage src="https://lh3.googleusercontent.com/aida-public/AB6AXuALPW-_1eopLS1mSsfTWunZxnhrFBYgOmYoIOerOXx0j0FNL8SpZP9G5FL4kFbIc31VCawODRqVekiTHsnUXMJhkseRuIY-frJHa3yK9AkwV6FFv6iIdgUqrLQw4Y0P3oTsEtW4OrQz8q82Ss3i1NEdAy0GRVbZiUsM1h5Cb_ZagZUQxghzKmxsIkHLsoAc-k8QT9KxcTDs7eJ5QtLnAQCa1uzGR1MhfY-cK88EeqWuWh-dK5vLKWW5S8qf0jenHfbYt5LXHwj_rIX8" alt="Channel logo" />
              <AvatarFallback>CV</AvatarFallback>
            </Avatar>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-headline font-bold text-xl text-[#f9f5f8]">CyberVisuals Studio</h3>
              <span className="material-symbols-outlined text-[#ff8e80] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
            <p className="text-zinc-500 text-sm font-medium">2.4M subscribers • 156 videos</p>
          </div>
        </div>
        
        <Button 
          variant="secondary" 
          className="bg-white text-black hover:bg-zinc-200 px-8 py-6 rounded-full font-bold transition-colors active:scale-95"
        >
          Subscribe
        </Button>
      </div>

      {/* Description Box */}
      <div className="bg-zinc-950/30 p-8 rounded-xl border border-[#48474a]/10">
        <p className="text-zinc-400 leading-relaxed text-sm font-medium">
          Dive deep into the mesmerizing urban landscapes of neo-Tokyo 2099. This cinematic exploration uses advanced neural rendering techniques to visualize a future defined by light, density, and technological sprawl. Unlock full access with Aura Coins to join the exclusive community of futurists.
        </p>
        <button className="mt-6 text-[#ff8e80] font-bold text-xs uppercase tracking-widest hover:underline">
          Show More
        </button>
      </div>
    </div>
  );
}
