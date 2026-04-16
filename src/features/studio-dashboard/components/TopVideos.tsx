const VIDEOS = [
  {
    id: 1,
    title: "Midnight Noir: The Final Cut",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwo39c_bCjAfTM0tlTqof2-BFinX21jeoT328DZmUwPOxAuMVx1AjWDrne7z9rg2VUaG3qSWHZHYueLI2_LlSjAliiC-vpzjRh9CiPE7__Ynj2k8n8ZXGwuvEfycItFERZ74rwRSHUHJAyEBSNvYH4baaVAaE2CijqfAwCwvlt4yk2gMO_tjt33q4cgsJXB2v6DZkNQuglA9sj1ifceqomnFkjM014rD-aI3F7QFGpKru4QfvvA01IlV9SuL1V37FRuQdfHqV9qzu5",
    views: "452K",
    likes: "24K",
    earnings: "12.4K",
    badgeLabel: "Trending #1",
    badgeColor: "text-[#ff8e80] bg-[#ff8e80]/10"
  },
  {
    id: 2,
    title: "Velvet Minimalism | 8K HDR",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDpfjehT38eFD_YsZTfEgdYKe6QRfc5wKi4mFFE7C71eVECr1RgcqgsnNadgHl9HjZxhT68av2423bUnrXxY_Lmgoy7y4QIlL9MGNJ-htcXV08mCF57u0HQoGJ3S2B2L49Puyhos9h9ntQANlBY89pKl7Q6PssCnbiRJb-8RqU-cMo0fXLOh6UgMm0Xn1kSrbqkuXOKqhgb79VS5o8JS5UTN4OTYCX-xK6tnvKmrdlcAEZxfiWzFpdfdl3UAdHYWfBGrlmOjbBPSIL8",
    views: "312K",
    likes: "18K",
    earnings: "9.8K",
    badgeLabel: "Top Rated",
    badgeColor: "text-zinc-400 bg-zinc-800"
  },
  {
    id: 3,
    title: "Sonic Textures: Ambient Pulse",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxQTFLO1GVhuwoKFABLZam9T8aqnH8gTkNfVKHex-Gce0KVyChXN5-GOav0ulxhOceUxcJiOFF-NW2IYlKm6sDq1Vts5jdqXwOjy0fTRWjAsJ1lEQK0km1aNwFllmtPMFKIx2lX7VJVpY-GOM_Q2fNC8LS2H2cDWQUz1M4sejM0UTq_xIHj_ASEgOepK1cnzL20tZbYq01Lezri6Q40e44acTVoHUX2tv6V98Ec9Sxr_yOFDrf9ccl_n2fYlC9vy4T6jnekeeGjt6c",
    views: "210K",
    likes: "15K",
    earnings: "5.2K",
    badgeLabel: "Evergreen",
    badgeColor: "text-zinc-400 bg-zinc-800"
  }
];

export function TopVideos() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-headline font-extrabold tracking-tight text-[#f9f5f8]">Top Performing Videos</h2>
        <button className="text-sm font-bold text-zinc-500 hover:text-white transition-colors">See Statistics</button>
      </div>

      <div className="space-y-4">
        {VIDEOS.map(video => (
          <div key={video.id} className="bg-[#19191c] hover:bg-[#1f1f22] border border-[#262528] transition-colors p-4 rounded-sm flex items-center gap-6 group">
            <div className="w-32 aspect-video rounded-sm overflow-hidden flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                src={video.image} 
                alt={video.title} 
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-headline font-bold text-sm truncate text-[#f9f5f8]">{video.title}</h4>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                  <span className="material-symbols-outlined text-xs">visibility</span> {video.views}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                  <span className="material-symbols-outlined text-xs">favorite</span> {video.likes}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[#fdc003] font-bold">
                  <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span> {video.earnings}
                </div>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-tighter ${video.badgeColor}`}>
                {video.badgeLabel}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
