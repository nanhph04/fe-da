"use client";

import Image from "next/image";
import { type FormEvent, useEffect, useState } from "react";
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
  const { user, isLoading: isAuthLoading, fetchProfile } = useAuth();

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.isCreator || user.role === "creator") {
      router.replace("/studio");
    }
  }, [isAuthLoading, router, user]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await mediaService.createChannel({ name, bio });
      if (res.success || res.code === 201) {
        await fetchProfile(); // Cập nhật lại thông tin user trong context
        router.push("/studio"); // Đi tới Studio
      } else {
        setError(res.mess || "Không thể tạo kênh.");
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Không thể tạo kênh. Vui lòng thử lại."));
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading || (!user && !error)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background pt-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-background pt-24 pb-12 text-foreground">
      <div className="fixed inset-0 z-0 bg-black">
        <Image
          className="object-cover opacity-30"
          src="/images/complete-profile-bg.jpg"
          alt="Nền điện ảnh"
          fill
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-background/35" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(229,9,20,0.12)_0%,transparent_70%)]" />
      </div>

      <PublicHeader currentPath="/onboarding" subtitle="Creator Onboarding" showAuthActions={false} />

      {/* Main Content Canvas */}
      <main className="relative z-10 w-full max-w-2xl px-6">
        <div className="rounded-lg border border-border/30 bg-muted p-8 shadow-2xl shadow-black/50 md:p-12">
          <header className="mb-10 text-center">
            <h1 className="mb-3 font-headline text-4xl font-extrabold tracking-tight text-primary md:text-5xl">Tạo kênh sáng tạo</h1>
            <p className="text-sm tracking-wide text-zinc-200">Thiết lập không gian creator của bạn trên Velvet Gallery.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="px-1 font-headline text-xs font-bold uppercase tracking-widest text-zinc-200">Tên kênh *</label>
              <Input 
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 border-border/40 bg-black/80 text-lg text-foreground shadow-inner placeholder:text-zinc-500 focus-visible:border-primary focus-visible:ring-primary" 
                placeholder="Ví dụ: Velvet Productions" 
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="px-1 font-headline text-xs font-bold uppercase tracking-widest text-zinc-200">Mô tả kênh *</label>
              <textarea 
                required
                maxLength={1000}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="min-h-[120px] w-full resize-none rounded-md border border-border/40 bg-black/80 px-4 py-3 text-foreground shadow-inner transition-all placeholder:text-zinc-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" 
                placeholder="Mô tả nội dung kênh của bạn..." 
              ></textarea>
            </div>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3">
                <p className="text-center text-sm font-medium text-destructive">{error}</p>
              </div>
            )}

            <div className="pt-6">
              <Button 
                type="submit"
                disabled={isLoading}
                className="h-14 w-full bg-primary font-black uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {isLoading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : null}
                {isLoading ? "Đang tạo kênh..." : "Tạo kênh"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
