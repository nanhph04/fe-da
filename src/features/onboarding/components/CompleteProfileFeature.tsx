"use client";

import Image from "next/image";
import { type ChangeEvent, useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PublicHeader } from "@/components/layout/public/PublicHeader";
import { useAuth } from "@/features/auth/context/AuthContext";
import { authService } from "@/features/auth/services/authService";
import { useRouter } from "@/i18n/routing";
import { getErrorMessage } from "@/shared/api/client";
import { Loader2 } from "lucide-react";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

const profileSchema = z.object({
  displayName: z.string().min(1, "Vui lòng nhập tên hiển thị").max(100),
  bio: z.string().optional(),
  phone: z.string().optional(),
  gender: z.string().optional(),
  birthday: z.string().optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

function isAllowedAvatarType(file: File) {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (allowedMimeTypes.includes(file.type)) {
    return true;
  }
  const extension = file.name.split(".").pop()?.toLowerCase();
  return ["jpg", "jpeg", "png", "webp"].includes(extension || "");
}

function normalizePhoneNumber(value?: string) {
  if (!value) {
    return undefined;
  }

  const digitsOnly = value.replace(/\D/g, "");

  if (!digitsOnly) {
    return undefined;
  }

  const normalized = Number(digitsOnly);

  return Number.isFinite(normalized) ? normalized : undefined;
}

export function CompleteProfileFeature() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const { user, fetchProfile } = useAuth();
  const router = useRouter();

  // Crop image states
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropTargetUrl, setCropTargetUrl] = useState<string | null>(null);
  const [rawSelectedFile, setRawSelectedFile] = useState<File | null>(null);
  const [cropScale, setCropScale] = useState(1);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const cropImageRef = useRef<HTMLImageElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  const { register, handleSubmit: handleSubmitForm, formState: { errors } } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
      bio: "",
      phone: "",
      gender: "",
      birthday: "",
    },
  });

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(avatarFile);
    setAvatarPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarFile]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const W = img.naturalWidth;
    const H = img.naturalHeight;
    const D = 256;
    let wRender = D;
    let hRender = D;

    if (W > H) {
      hRender = D;
      wRender = W * (D / H);
    } else {
      wRender = D;
      hRender = H * (D / W);
    }

    setImageSize({ width: wRender, height: hRender });
    setCropScale(1);
    // Center the image initially inside the circular frame
    setCropPosition({
      x: -Math.round((wRender - D) / 2),
      y: -Math.round((hRender - D) / 2),
    });
  };

  const getConstrainedPosition = (x: number, y: number, scale: number) => {
    const D = 256;
    const wZoomed = imageSize.width * scale;
    const hZoomed = imageSize.height * scale;
    const minX = -(wZoomed - D);
    const maxX = 0;
    const minY = -(hZoomed - D);
    const maxY = 0;

    return {
      x: Math.min(maxX, Math.max(minX, x)),
      y: Math.min(maxY, Math.max(minY, y)),
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX - cropPosition.x,
      y: e.clientY - cropPosition.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    const constrained = getConstrainedPosition(newX, newY, cropScale);
    setCropPosition(constrained);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    isDraggingRef.current = true;
    const touch = e.touches[0];
    dragStartRef.current = {
      x: touch.clientX - cropPosition.x,
      y: touch.clientY - cropPosition.y,
    };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const newX = touch.clientX - dragStartRef.current.x;
    const newY = touch.clientY - dragStartRef.current.y;
    const constrained = getConstrainedPosition(newX, newY, cropScale);
    setCropPosition(constrained);
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextScale = parseFloat(e.target.value);
    setCropScale(nextScale);
    setCropPosition(current => getConstrainedPosition(current.x, current.y, nextScale));
  };

  const handleApplyCrop = () => {
    if (!cropImageRef.current || !rawSelectedFile) return;

    const canvas = document.createElement("canvas");
    const D_canvas = 500;
    canvas.width = D_canvas;
    canvas.height = D_canvas;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, D_canvas, D_canvas);

    const D = 256;
    const M = D_canvas / D;

    const xCanvas = cropPosition.x * M;
    const yCanvas = cropPosition.y * M;
    const wCanvas = imageSize.width * cropScale * M;
    const hCanvas = imageSize.height * cropScale * M;

    ctx.drawImage(cropImageRef.current, xCanvas, yCanvas, wCanvas, hCanvas);

    const outputType = rawSelectedFile.type === "image/jpg" ? "image/jpeg" : rawSelectedFile.type;

    canvas.toBlob(blob => {
      if (blob) {
        const croppedFile = new File([blob], rawSelectedFile.name, { type: outputType });
        setAvatarFile(croppedFile);
        setShowCropModal(false);
        if (cropTargetUrl) {
          URL.revokeObjectURL(cropTargetUrl);
        }
        setCropTargetUrl(null);
      }
    }, outputType);
  };

  const handleCancelCrop = () => {
    if (cropTargetUrl) {
      URL.revokeObjectURL(cropTargetUrl);
    }
    setCropTargetUrl(null);
    setRawSelectedFile(null);
    setShowCropModal(false);
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setAvatarFile(null);
      return;
    }

    if (!isAllowedAvatarType(file)) {
      setAvatarFile(null);
      setServerError("Ảnh đại diện chỉ hỗ trợ JPG, PNG hoặc WebP.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarFile(null);
      setServerError("Ảnh đại diện không được vượt quá 5MB.");
      event.target.value = "";
      return;
    }

    setServerError(null);
    setRawSelectedFile(file);

    const originalUrl = URL.createObjectURL(file);
    setCropTargetUrl(originalUrl);
    setShowCropModal(true);

    event.target.value = "";
  };

  const uploadAvatarIfSelected = async () => {
    if (!avatarFile) {
      return;
    }

    if (!isAllowedAvatarType(avatarFile)) {
      throw new Error("Ảnh đại diện chỉ hỗ trợ JPG, PNG hoặc WebP.");
    }

    const res = await authService.uploadAvatar(avatarFile);
    if (!res.success) {
      throw new Error(res.message || "Không thể tải lên ảnh đại diện.");
    }
  };

  const onSubmit = async (data: ProfileValues) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      const res = await authService.updateProfile({
        displayName: data.displayName,
        bio: data.bio || undefined,
        phone: normalizePhoneNumber(data.phone),
        gender: data.gender && ["male", "female"].includes(data.gender)
          ? (data.gender as "male" | "female")
          : undefined,
        birthday: data.birthday || undefined,
      });
      if (res.success) {
        try {
          await uploadAvatarIfSelected();
          await fetchProfile();
          router.push("/library");
        } catch (avatarErr: unknown) {
          setServerError(getErrorMessage(avatarErr, "Hồ sơ đã lưu nhưng không thể tải lên ảnh đại diện. Vui lòng thử ảnh khác."));
          await fetchProfile(); // Still fetch profile so the rest of the app knows it's completed
        }
      } else {
        setServerError(res.message || "Không thể cập nhật hồ sơ");
      }
    } catch (err: unknown) {
      setServerError(getErrorMessage(err, "Không thể cập nhật hồ sơ"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSkipping(true);
    setServerError(null);
    try {
      // Derive default displayName from user email in AuthContext
      const emailPrefix = user?.email?.split("@")[0] || "user";
      const defaultDisplayName = emailPrefix.slice(0, 100); // Respect maxLength

      const res = await authService.updateProfile({
        displayName: defaultDisplayName,
      });
      if (res.success) {
        await fetchProfile(); // Refresh AuthContext so guard won't redirect back
        router.push("/library");
      } else {
        setServerError(res.message || "Không thể thiết lập hồ sơ mặc định");
      }
    } catch (err: unknown) {
      setServerError(getErrorMessage(err, "Không thể bỏ qua. Vui lòng thử lại."));
    } finally {
      setIsSkipping(false);
    }
  };

  const isBusy = isSubmitting || isSkipping;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 pt-28 pb-16 font-body">
      <div className="fixed inset-0 z-0">
        <Image
          className="object-cover opacity-35"
          src="/images/complete-profile-bg.jpg"
          alt="Nền điện ảnh"
          fill
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/65 to-background/25" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(245,158,11,0.16)_0%,rgba(229,9,20,0.08)_36%,transparent_72%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(14,14,16,0.72)_0%,rgba(14,14,16,0.28)_48%,rgba(14,14,16,0.72)_100%)]" />
      </div>

      <PublicHeader currentPath="/onboarding/profile" showAuthActions={false} />

      <main className="relative z-10 mt-8 w-full max-w-2xl px-4">
        <div className="rounded-lg border border-border/50 bg-muted p-6 shadow-2xl shadow-black/50 md:p-8">
          <header className="mb-6 text-center">
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground">Hoàn thiện hồ sơ của bạn</h1>
            <p className="mt-2 text-sm leading-relaxed tracking-wide text-zinc-200">Tạo dấu ấn cá nhân cho trải nghiệm điện ảnh của bạn.</p>
          </header>

          <form onSubmit={handleSubmitForm(onSubmit)} className="space-y-6">
            <div className="flex flex-col items-center gap-3">
              <input
                id="avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={isBusy}
                onChange={handleAvatarChange}
              />
              <label htmlFor="avatar" className="flex flex-col items-center gap-3 cursor-pointer group">
                <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-primary/40 bg-input shadow-lg shadow-black/30">
                  {avatarPreviewUrl || user?.avatarUrl ? (
                    <div
                      className="h-full w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${avatarPreviewUrl || user?.avatarUrl})` }}
                      aria-hidden="true"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-5xl text-foreground/80">person</span>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    <span className="material-symbols-outlined text-2xl text-primary">add_a_photo</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">Đổi ảnh đại diện</p>
                  <p className="mt-1 text-xs text-foreground/80">
                    {avatarFile ? avatarFile.name : "JPG, PNG hoặc WebP, tối đa 5MB"}
                  </p>
                </div>
              </label>
            </div>

            {serverError && (
              <div className="rounded-sm border border-destructive/30 bg-destructive/10 p-3">
                <p className="text-center text-xs font-medium text-destructive">{serverError}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="px-1 font-headline text-xs font-bold uppercase tracking-widest text-zinc-200">Tên hiển thị</label>
                <Input
                  {...register("displayName")}
                  placeholder="Ví dụ: CinemaLover99"
                  className={`h-11 border-border/40 bg-black/90 text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-primary ${errors.displayName ? "ring-1 ring-destructive" : ""}`}
                />
                {errors.displayName && <p className="text-xs text-destructive">{errors.displayName.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="px-1 font-headline text-xs font-bold uppercase tracking-widest text-zinc-200">Giới tính</label>
                <select
                  {...register("gender")}
                  className="h-11 rounded-md border border-border/40 bg-black/90 px-3 text-base text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="px-1 font-headline text-xs font-bold uppercase tracking-widest text-zinc-200">Tiểu sử</label>
                <Textarea
                  {...register("bio")}
                  placeholder="Chia sẻ gu điện ảnh của bạn..."
                  rows={2}
                  className="min-h-24 resize-none border-border/40 bg-black/90 text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="px-1 font-headline text-xs font-bold uppercase tracking-widest text-zinc-200">Số điện thoại</label>
                <Input
                  {...register("phone")}
                  placeholder="+84 901 234 567"
                  className="h-11 border-border/40 bg-black/90 text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="px-1 font-headline text-xs font-bold uppercase tracking-widest text-zinc-200">Ngày sinh</label>
                <Input
                  type="date"
                  {...register("birthday")}
                  className="h-11 border-border/40 bg-black/90 text-base text-foreground focus-visible:ring-primary"
                />
              </div>
            </div>

            {/* <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border/20" />
                <span className="px-2 font-headline text-xs font-bold uppercase tracking-widest text-zinc-200">Sở thích nội dung</span>
                <div className="h-px flex-1 bg-border/20" />
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  ["Hành động", true],
                  ["Chính kịch", false],
                  ["Khoa học viễn tưởng", true],
                  ["Trinh thám đen", false],
                  ["Tài liệu", false],
                  ["Kinh dị", false],
                  ["Độc lập", true],
                  ["Hài", false],
                ].map(([label, active]) => (
                  <button
                    key={String(label)}
                    type="button"
                    className={active ? "rounded-full border border-primary/50 bg-primary/15 px-4 py-2 text-xs font-bold tracking-tight text-primary transition-all duration-300" : "rounded-full border border-border/50 bg-card px-4 py-2 text-xs font-bold tracking-tight text-zinc-200 transition-all duration-300 hover:border-primary/50"}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div> */}

            <div className="flex flex-col gap-3 pt-4">
              <Button type="submit" disabled={isBusy} className="w-full rounded-sm bg-gradient-to-br from-primary to-primary/75 py-3 font-headline text-sm font-extrabold uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98]">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? "Đang lưu..." : "Lưu và tiếp tục"}
              </Button>
              <Button type="button" variant="ghost" onClick={handleSkip} disabled={isBusy} className="w-full text-xs uppercase tracking-widest text-zinc-200 hover:text-foreground">
                {isSkipping ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                {isSkipping ? "Đang thiết lập..." : "Bỏ qua lúc này"}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <footer className="absolute bottom-4 z-10 flex w-full justify-center gap-8 opacity-40">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[12px]">lock</span>
          <span className="text-[9px] uppercase tracking-widest">Phiên bảo mật</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[12px]">verified_user</span>
          <span className="text-[9px] uppercase tracking-widest">Kho phim được bảo vệ</span>
        </div>
      </footer>

      {showCropModal && cropTargetUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex w-full max-w-md flex-col overflow-hidden rounded-lg border border-border/40 bg-card shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <header className="flex items-center justify-between border-b border-border/30 bg-muted/40 px-6 py-4">
              <h3 className="font-headline text-lg font-bold text-foreground">Điều chỉnh ảnh đại diện</h3>
              <button
                type="button"
                onClick={handleCancelCrop}
                className="rounded p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            <div className="flex flex-col items-center justify-center p-6 space-y-6">
              {/* Circular crop area */}
              <div 
                className="relative h-64 w-64 overflow-hidden rounded-full border-2 border-primary/50 bg-black cursor-move select-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={cropImageRef}
                  src={cropTargetUrl}
                  alt="Crop preview"
                  onLoad={handleImageLoad}
                  className="absolute pointer-events-none max-w-none origin-top-left"
                  style={{
                    width: imageSize.width,
                    height: imageSize.height,
                    transform: `translate3d(${cropPosition.x}px, ${cropPosition.y}px, 0) scale(${cropScale})`,
                  }}
                />
              </div>

              {/* Slider for Zoom */}
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between font-headline text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <span>Thu nhỏ</span>
                  <span>Phóng to</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={cropScale}
                  onChange={handleScaleChange}
                  className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                />
              </div>
            </div>

            <footer className="flex gap-4 border-t border-border/30 bg-muted/40 p-6">
              <button
                type="button"
                onClick={handleCancelCrop}
                className="flex-1 py-3 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleApplyCrop}
                className="flex-[2] rounded-sm bg-gradient-to-br from-primary to-primary/75 py-3 font-headline text-sm font-extrabold uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98]"
              >
                Áp dụng
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
