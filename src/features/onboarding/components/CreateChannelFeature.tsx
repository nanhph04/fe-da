"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mediaService } from "@/features/watch/services/mediaService";
import { useAuth } from "@/features/auth/context/AuthContext";
import { getErrorMessage } from "@/shared/api/client";
import { PublicHeader } from "@/components/layout/public/PublicHeader";

export function CreateChannelFeature() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { fetchProfile } = useAuth(); // Reload profile after creating channel so that isCreator might update, although we might just navigate directly.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await mediaService.createChannel({ name, bio });
      if (res.success || res.code === 201) {
        await fetchProfile(); // Cập nhật lại thông tin user trong context
        router.push("/studio"); // Đi tới Studio
      } else {
        setError(res.mess || "Failed to create channel.");
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, "An error occurred"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#0e0e10] text-[#f9f5f8] min-h-screen flex flex-col items-center justify-center relative overflow-x-hidden pt-24 pb-12">
      {/* Background Cinematic Layer */}
      <div className="fixed inset-0 z-0 bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          className="w-full h-full object-cover opacity-20 blur-sm" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCc0awPNg2padXqW3KRRlLy86UFjQm37q3ChOzynRQgStdOGAqgyiLgUX1wkVrb7tmcdiHspcnwScDstHxAch1KOI2_Ls6Iqlk2aTJD1KcUC7gzFJW6CuzhLCxt5vvLyJICVhuxloBoATcQOdeEbVWpQJTd_T-F4kOJ0obEEOyByVVvW5loPfx0Ir4Am2xIWnZZtFhL-YM9ali71sbRDQrk9OSAtuPm3nfhBmO2OTb7uYpWnGLmY5aCVc5seNtl6B6xcNASAnmUT3dA" 
          alt="Cinematic Background" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e10] via-[#0e0e10]/80 to-[#0e0e10]/40"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,142,128,0.08)_0%,transparent_70%)]"></div>
      </div>

      <PublicHeader currentPath="/onboarding" subtitle="Auth / Onboarding" showAuthActions={false} />

      {/* Main Content Canvas */}
      <main className="relative z-10 w-full max-w-2xl px-6">
        <div className="bg-[#19191c]/70 backdrop-blur-xl border border-[#48474a]/10 rounded-xl p-8 md:p-12 shadow-2xl">
          <header className="text-center mb-10">
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-3 text-red-500">Create Your Channel</h1>
            <p className="text-zinc-400 text-sm tracking-wide">Establish your presence as a Creator.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="font-headline text-xs font-bold tracking-widest uppercase text-zinc-500 px-1">Channel Name *</label>
              <Input 
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-black/50 border-[#48474a]/20 h-14 text-[#f9f5f8] shadow-inner focus-visible:ring-red-600 focus-visible:border-red-600 text-lg" 
                placeholder="e.g. Velvet Productions" 
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="font-headline text-xs font-bold tracking-widest uppercase text-zinc-500 px-1">Channel Bio *</label>
              <textarea 
                required
                maxLength={1000}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-black/50 border border-[#48474a]/20 rounded-md px-4 py-3 text-[#f9f5f8] placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600 transition-all resize-none shadow-inner min-h-[120px]" 
                placeholder="Describe your channel content..." 
              ></textarea>
            </div>

            {error && (
              <div className="p-3 bg-red-600/10 border border-red-600/30 rounded-md">
                <p className="text-sm text-red-500 text-center font-medium">{error}</p>
              </div>
            )}

            <div className="pt-6">
              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-red-600 text-white font-black tracking-widest uppercase hover:bg-red-500 transition-colors"
              >
                {isLoading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : null}
                {isLoading ? "Creating Channel..." : "Establish Channel"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
