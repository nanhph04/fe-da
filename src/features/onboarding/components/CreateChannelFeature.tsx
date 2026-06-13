"use client";

import Image from "next/image";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { Loader2, Camera, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mediaService } from "@/features/watch/services/mediaService";
import { useAuth } from "@/features/auth/context/AuthContext";
import { authService, type UserProfileResponse } from "@/features/auth/services/authService";
import { getErrorMessage } from "@/shared/api/client";
import { PublicHeader } from "@/components/layout/public/PublicHeader";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function validateImageFile(file: File, maxSizeMB: number): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Định dạng tệp không hợp lệ. Vui lòng chọn ảnh dạng JPEG, PNG hoặc WebP.";
  }
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `Dung lượng tệp vượt quá giới hạn cho phép (${maxSizeMB}MB).`;
  }
  return null;
}

function isChannelConflict(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const apiError = error as { statusCode?: number; code?: number; status?: number; mess?: string; message?: string };
  const message = `${apiError.message ?? ""} ${apiError.mess ?? ""}`.toLowerCase();
  const statusCode = apiError.statusCode ?? apiError.status ?? apiError.code;

  return statusCode === 409 || message.includes("conflict");
}

function canAccessStudio(profile: UserProfileResponse | null) {
  return !!profile && (profile.isCreator || profile.role === "creator");
}

const CREATOR_SYNC_MAX_ATTEMPTS = 10;
const CREATOR_SYNC_RETRY_DELAY_MS = 500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function CreateChannelFeature() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: isAuthLoading, fetchProfile } = useAuth();
  const shouldSyncStudioAccess = searchParams.get("studioAccess") === "pending";

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file, 5);
    if (validationError) {
      setError(validationError);
      return;
    }

    setAvatarFile(file);
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file, 10);
    if (validationError) {
      setError(validationError);
      return;
    }

    setBannerFile(file);
    if (bannerPreview) {
      URL.revokeObjectURL(bannerPreview);
    }
    setBannerPreview(URL.createObjectURL(file));
    setError(null);
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    };
  }, [avatarPreview, bannerPreview]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent("/onboarding")}`);
      return;
    }

    if (!shouldSyncStudioAccess && (user.isCreator || user.role === "creator")) {
      router.replace("/studio");
    }
  }, [isAuthLoading, router, shouldSyncStudioAccess, user]);

  const syncCreatorAccess = useCallback(async () => {
    for (let attempt = 1; attempt <= CREATOR_SYNC_MAX_ATTEMPTS; attempt += 1) {
      await fetchProfile();

      try {
        const sessionProfile = await authService.getSessionProfile();
        if (canAccessStudio(sessionProfile.data ?? null)) {
          await fetchProfile();
          return true;
        }
      } catch (err) {
        console.error("Failed to resolve session profile while syncing creator access:", err);
      }

      try {
        const channel = await mediaService.getMyChannel();
        if (channel.success && channel.data?.channelId) {
          await fetchProfile();
        }
      } catch (err) {
        console.error("Failed to verify channel while syncing creator access:", err);
      }

      if (attempt < CREATOR_SYNC_MAX_ATTEMPTS) {
        await sleep(CREATOR_SYNC_RETRY_DELAY_MS);
      }
    }

    return false;
  }, [fetchProfile]);

  useEffect(() => {
    if (isAuthLoading || !shouldSyncStudioAccess || !user) {
      return;
    }

    let isCancelled = false;

    const recoverStudioAccess = async () => {
      setIsLoading(true);
      setError(null);
      setLoadingMessage("Đang kiểm tra quyền Studio...");

      const canEnterStudio = await syncCreatorAccess();
      if (isCancelled) {
        return;
      }

      if (canEnterStudio) {
        router.refresh();
        router.replace("/studio");
        return;
      }

      setIsLoading(false);
      setLoadingMessage("");
    };

    void recoverStudioAccess();

    return () => {
      isCancelled = true;
    };
  }, [isAuthLoading, router, shouldSyncStudioAccess, syncCreatorAccess, user]);

  const goToStudioWhenReady = async () => {
    const canEnterStudio = await syncCreatorAccess();
    if (!canEnterStudio) {
      setError("Kênh đã được tạo nhưng phiên đăng nhập chưa đồng bộ quyền Creator. Vui lòng thử lại sau vài giây.");
      return;
    }

    router.refresh();
    router.replace("/studio");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedBio = bio.trim();

    if (!trimmedName || !trimmedBio) {
      setError("Vui lòng nhập đầy đủ tên kênh và mô tả kênh.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingMessage("Đang tạo kênh của bạn...");

    try {
      const res = await mediaService.createChannel({ name: trimmedName, bio: trimmedBio });
      if (res.success || res.statusCode === 201) {
        if (avatarFile) {
          setLoadingMessage("Đang tải lên ảnh đại diện...");
          try {
            await mediaService.uploadAvatarChannel(avatarFile);
          } catch (uploadErr) {
            console.error("Failed to upload avatar:", uploadErr);
          }
        }

        if (bannerFile) {
          setLoadingMessage("Đang tải lên ảnh bìa...");
          try {
            await mediaService.uploadBannerChannel(bannerFile);
          } catch (uploadErr) {
            console.error("Failed to upload banner:", uploadErr);
          }
        }

        setLoadingMessage("Đang đồng bộ quyền nhà sáng tạo...");
        await goToStudioWhenReady();
      } else {
        setError(res.message || "Không thể tạo kênh.");
      }
    } catch (err: unknown) {
      if (isChannelConflict(err)) {
        setLoadingMessage("Đang đồng bộ quyền nhà sáng tạo...");
        await goToStudioWhenReady();
        return;
      }

      setError(getErrorMessage(err, "Không thể tạo kênh. Vui lòng thử lại."));
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
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
      <div className="fixed inset-0 z-0 bg-input">
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
            {/* Premium Channel Design Preview Area */}
            <div className="relative mb-8 rounded-lg overflow-hidden border border-border/30 bg-black/40 shadow-inner">
              {/* Banner Slot */}
              <div 
                onClick={() => document.getElementById("banner-input")?.click()}
                className="group relative flex h-32 w-full cursor-pointer items-center justify-center overflow-hidden bg-zinc-900/60 transition-all hover:bg-zinc-900/80"
              >
                {bannerPreview ? (
                  <Image
                    src={bannerPreview}
                    alt="Banner preview"
                    fill
                    sizes="(min-width: 640px) 640px, 100vw"
                    className="object-cover opacity-85 transition-opacity"
                    unoptimized
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-zinc-500 transition-colors group-hover:text-zinc-300">
                    <Upload className="h-5 w-5" />
                    <span className="font-mono text-[9px] font-bold uppercase tracking-widest">Chọn ảnh bìa (Max 10MB)</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/45 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-white flex items-center gap-1.5">
                    <Upload className="h-4 w-4" /> Thay đổi ảnh bìa
                  </span>
                </div>
              </div>

              {/* Profile Bar below Banner */}
              <div className="flex flex-col sm:flex-row items-center gap-4 px-6 py-4 bg-muted/20 border-t border-border/10">
                {/* Avatar Slot */}
                <div 
                  onClick={() => document.getElementById("avatar-input")?.click()}
                  className="group relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-primary/30 bg-zinc-950 transition-all hover:border-primary -mt-10 sm:-mt-12 shadow-md z-10"
                >
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Avatar preview"
                      fill
                      sizes="80px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-zinc-500 transition-colors group-hover:text-zinc-300">
                      <Camera className="h-4 w-4" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                    <Camera className="h-4 w-4 text-white" />
                  </div>
                </div>
                
                {/* Channel Details preview */}
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <h3 className="font-headline text-base font-extrabold text-foreground truncate">
                    {name || "Tên kênh của bạn"}
                  </h3>
                  <p className="mt-0.5 font-mono text-[10px] text-zinc-400 truncate">
                    {bio || "Chưa có mô tả kênh..."}
                  </p>
                </div>
              </div>

              {/* Hidden Inputs */}
              <input 
                type="file" 
                id="banner-input" 
                accept="image/jpeg,image/png,image/webp" 
                className="hidden" 
                onChange={handleBannerChange}
              />
              <input 
                type="file" 
                id="avatar-input" 
                accept="image/jpeg,image/png,image/webp" 
                className="hidden" 
                onChange={handleAvatarChange}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="px-1 font-headline text-xs font-bold uppercase tracking-widest text-zinc-200">Tên kênh *</label>
              <Input 
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 border-border/40 bg-black/80 text-lg text-foreground shadow-inner placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary" 
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
                className="min-h-[120px] w-full resize-none rounded-md border border-border/40 bg-black/80 px-4 py-3 text-foreground shadow-inner transition-all placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" 
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
                {isLoading ? (loadingMessage || "Đang xử lý...") : "Tạo kênh"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
