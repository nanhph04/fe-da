"use client";

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
    <div className="min-h-screen bg-background pt-16 md:ml-64">
      <section className="relative flex h-[870px] w-full items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="h-full w-full object-cover object-center"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYf9be3P4n_BhpF5Bu6ghvVDfdDHU6iW6q2Isp9JRDD1HF8CgNVrHi8H2pIMs6-Qo0w8VXqWZoXCnzrG-dUfGczoCZWJLAdi8Cs0EIPLhGG_pKPiBtGzO8X6HOvClz-JyamX73Vl6Jc17nyADy9aYONesmezf8Sv4RNQJ110Oi1lHRVIILjihnwzeA5ekNP2mRUTLIQaEKO08BNDLLvb7LwCOLMtWeQr3MjxQ6PKwKk11vnbH2B6pNpD0jYrlPCEbLlCAM1V1W5r7_"
            alt="Category Hero"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
        <div className="relative z-10 max-w-4xl px-8 pb-20 md:px-16">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-sm bg-secondary px-3 py-1 text-[10px] font-black uppercase tracking-widest text-secondary-foreground">Lv3: Exclusive</span>
            <span className="text-sm font-medium tracking-wide text-foreground/80">{category.name} Collection</span>
          </div>
          <h1 className="mb-6 font-headline text-6xl font-black leading-[0.9] tracking-tight text-foreground md:text-8xl">{category.name.toUpperCase()}</h1>
          <p className="mb-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">{category.description}</p>
          <div className="flex flex-wrap gap-4">
            <button className="flex items-center gap-3 rounded-sm bg-primary px-10 py-4 font-headline text-lg font-extrabold text-primary-foreground shadow-[0_0_30px_rgba(229,9,20,0.25)] transition-all hover:scale-[1.02] active:scale-95">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
              Watch Now
            </button>
            <button className="rounded-sm border border-white/10 bg-white/10 px-10 py-4 font-headline text-lg font-bold text-foreground backdrop-blur-md transition-all hover:bg-white/20">
              View Details
            </button>
          </div>
        </div>
      </section>

      <div className="space-y-24 px-8 py-20 md:px-16">
        <section>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="mb-2 font-headline text-3xl font-bold tracking-tight">Exclusive Gallery</h2>
              <p className="font-label text-muted-foreground">Available for Gold Members or per-view unlock.</p>
            </div>
            <span className="text-sm font-bold text-primary">View All</span>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video, index) => (
              <div key={video.id} className={`group relative aspect-video overflow-hidden rounded-sm bg-card transition-transform duration-500 hover:scale-[1.02] ${index === 1 ? "border border-secondary/20 shadow-[0_0_20px_rgba(251,191,36,0.1)]" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className={`h-full w-full object-cover ${index === 0 ? "grayscale-[0.5] group-hover:grayscale-0" : ""} transition-all`} src={video.imageUrl} alt={video.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="rounded-sm bg-secondary px-2 py-0.5 text-[10px] font-black text-secondary-foreground">Lv3: Exclusive</span>
                  {index === 1 ? <span className="rounded-sm bg-green-600 px-2 py-0.5 text-[10px] font-black uppercase text-foreground">Unlocked</span> : null}
                </div>
                {index === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="rounded-lg border border-secondary/30 bg-card/90 p-6 text-center backdrop-blur-xl">
                      <span className="material-symbols-outlined mb-2 text-4xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                      <div className="font-headline font-bold text-foreground">Unlock for 150 AC</div>
                      <div className="text-xs text-muted-foreground">Lifetime access</div>
                    </div>
                  </div>
                ) : null}
                <div className="absolute bottom-4 left-4">
                  <h3 className="font-headline text-xl font-bold text-foreground">{video.title}</h3>
                  <div className="text-xs text-muted-foreground font-label">{video.creator} • {video.duration} • {video.views}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
