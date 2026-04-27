import { HeroSection } from "./HeroSection";
import { MediaRow } from "./MediaRow";
import { TopNavHome } from "./TopNavHome";

const featuredContent = {
  title: "Midnight Cinema",
  subtitle: "An exclusive collection of curated films for the discerning viewer. Experience cinema as it was meant to be seen.",
  imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee35cede8780?w=1920&q=80",
};

const trendingContent = [
  { title: "Neon Dreams", creator: "Studio Velvet", views: "2.4M", imageUrl: "https://images.unsplash.com/photo-1536440132228-1ce5fe87afda?w=400&q=80", duration: "1:45:30" },
  { title: "The Last Frame", creator: "Indie Labs", views: "890K", imageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=80", duration: "52:18" },
  { title: "Velvet Road", creator: "Cinema Arts", views: "1.2M", imageUrl: "https://images.unsplash.com/photo-1478720568477-152d9b944e37?w=400&q=80", duration: "1:12:45" },
  { title: "Echoes of Tomorrow", creator: "Future Films", views: "567K", imageUrl: "https://images.unsplash.com/photo-1440404653325-ed123b367a68?w=400&q=80", duration: "48:32" },
  { title: "Silent Revolution", creator: "Art House", views: "3.1M", imageUrl: "https://images.unsplash.com/photo-1598899134739-24c46f58a8cc?w=400&q=80", duration: "2:15:00" },
  { title: "The Golden Age", creator: "Classic Reels", views: "780K", imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&q=80", duration: "1:38:22" },
];

const newReleases = [
  { title: "Crimson Tide", creator: "Ocean Studios", views: "1.8M", imageUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400&q=80", duration: "2:05:00" },
  { title: "Abstract Mind", creator: "Digital Dreams", views: "445K", imageUrl: "https://images.unsplash.com/photo-1550745165-9bc1b2c8b71d?w=400&q=80", duration: "1:15:30" },
  { title: "Urban Legends", creator: "City Films", views: "920K", imageUrl: "https://images.unsplash.com/photo-1518676596569-951898a26023?w=400&q=80", duration: "58:45" },
  { title: "The Artisan", creator: "Craft Studios", views: "340K", imageUrl: "https://images.unsplash.com/photo-1511690656952-34342d5c71ce?w=400&q=80", duration: "1:42:18" },
  { title: "Night Shift", creator: "Evening Productions", views: "1.1M", imageUrl: "https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?w=400&q=80", duration: "1:28:33" },
  { title: "Forgotten Paths", creator: "Memory Lane", views: "620K", imageUrl: "https://images.unsplash.com/photo-1519125323398-6755e320bfaf?w=400&q=80", duration: "47:55" },
];

const forYouContent = [
  { title: "Your Weekly Mix", creator: "Curated for You", views: "Based on watch history", imageUrl: "https://images.unsplash.com/photo-1460881680093-7cc0101ad639?w=400&q=80", duration: "3:45:00" },
  { title: "Trending Now", creator: "Community Picks", views: "Hot this week", imageUrl: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=400&q=80", duration: "Multiple" },
  { title: "Staff Picks", creator: "Velvet Selection", views: "Editor's choice", imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&q=80", duration: "Various" },
  { title: "Hidden Gems", creator: "Underground", views: "Rare finds", imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee35cede8780?w=400&q=80", duration: "Various" },
  { title: "Classics Reimagined", creator: "Retro Collection", views: "Timeless", imageUrl: "https://images.unsplash.com/photo-1478720568477-152d9b944e37?w=400&q=80", duration: "Various" },
  { title: "Director's Cut", creator: "Extended Editions", views: "Uncut", imageUrl: "https://images.unsplash.com/photo-1440404653325-ed123b367a68?w=400&q=80", duration: "Various" },
];

export function HomeFeature() {
  return (
    <div className="bg-[#0e0e0e] min-h-screen">
      <TopNavHome>
        <HeroSection {...featuredContent} />
        
        <div className="max-w-7xl mx-auto -mt-32 relative z-20">
          <MediaRow title="Trending Now" items={trendingContent} />
          <MediaRow title="New Releases" items={newReleases} />
          <MediaRow title="Recommended for You" items={forYouContent} />
          
          {/* Footer Spacing */}
          <div className="h-24" />
        </div>
      </TopNavHome>
    </div>
  );
}