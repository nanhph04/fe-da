"use client";

import { useState, useRef, type FormEvent } from "react";
import { Loader2, X, Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { mediaService } from "@/features/watch/services/mediaService";
import { getErrorMessage } from "@/shared/api/client";
import type { PublicChannelDetail } from "@/features/watch/services/publicMediaService";

interface EditChannelDialogProps {
  channel: PublicChannelDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function EditChannelDialog({ channel, open, onOpenChange, onSaved }: EditChannelDialogProps) {
  const [name, setName] = useState(channel.name);
  const [bio, setBio] = useState(channel.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(channel.avatarUrl || "");
  const [bannerUrl, setBannerUrl] = useState(channel.bannerUrl || "");

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleAvatarFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("Ảnh đại diện phải nhỏ hơn 5MB.");
      return;
    }

    // Validate type
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn tệp ảnh hợp lệ (JPEG, PNG, WebP).");
      return;
    }

    setError(null);
    setIsUploadingAvatar(true);

    try {
      const response = await mediaService.uploadAvatarChannel(file);
      if (response.success && response.data) {
        setAvatarUrl(response.data.avatarUrl);
      } else {
        setError(response.message || "Không thể tải lên ảnh đại diện.");
      }
    } catch (uploadError) {
      setError(getErrorMessage(uploadError, "Không thể tải lên ảnh đại diện."));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleBannerFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError("Ảnh banner phải nhỏ hơn 10MB.");
      return;
    }

    // Validate type
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn tệp ảnh hợp lệ (JPEG, PNG, WebP).");
      return;
    }

    setError(null);
    setIsUploadingBanner(true);

    try {
      const response = await mediaService.uploadBannerChannel(file);
      if (response.success && response.data) {
        setBannerUrl(response.data.bannerUrl);
      } else {
        setError(response.message || "Không thể tải lên ảnh bìa.");
      }
    } catch (uploadError) {
      setError(getErrorMessage(uploadError, "Không thể tải lên ảnh bìa."));
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Tên kênh không được để trống.");
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const response = await mediaService.updateChannel(channel.id, {
        name: name.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl || undefined,
        bannerUrl: bannerUrl || undefined,
      });

      if (response.success) {
        onSaved();
        onOpenChange(false);
      } else {
        setError(response.message || "Không thể cập nhật thông tin kênh.");
      }
    } catch (saveError) {
      setError(getErrorMessage(saveError, "Không thể cập nhật thông tin kênh."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-2xl rounded-lg border border-border/30 bg-card p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Channel customization</p>
            <h2 className="mt-2 font-headline text-2xl font-black tracking-tight text-foreground">Tùy chỉnh kênh</h2>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-11 w-11 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Đóng tùy chỉnh kênh"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Banner Upload Area */}
        <div className="mb-6">
          <Label className="mb-2 block">Ảnh bìa kênh (Tối đa 10MB)</Label>
          <div
            onClick={() => bannerInputRef.current?.click()}
            className="group relative h-40 w-full cursor-pointer overflow-hidden rounded-md border border-dashed border-border/60 bg-muted transition-all hover:border-primary/50"
          >
            {bannerUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bannerUrl} alt="New Banner Preview" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <Upload className="h-8 w-8" />
                <span className="text-xs font-medium">Tải lên ảnh bìa</span>
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="h-6 w-6 text-white" />
              <span className="ml-2 text-xs font-bold text-white uppercase">Thay đổi ảnh bìa</span>
            </div>
            {isUploadingBanner && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>
          <input
            type="file"
            ref={bannerInputRef}
            onChange={handleBannerFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Avatar Upload Area */}
        <div className="mb-6 flex items-center gap-6">
          <div>
            <Label className="mb-2 block">Ảnh đại diện (Tối đa 5MB)</Label>
            <div
              onClick={() => avatarInputRef.current?.click()}
              className="group relative h-24 w-24 cursor-pointer overflow-hidden rounded-lg border-2 border-border/40 bg-muted transition-all hover:border-primary/50"
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="New Avatar Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                  <Upload className="h-6 w-6" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-5 w-5 text-white" />
              </div>
              {isUploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
            </div>
            <input
              type="file"
              ref={avatarInputRef}
              onChange={handleAvatarFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <div className="text-xs text-muted-foreground leading-relaxed">
            <p className="font-semibold text-foreground">Định dạng khuyên dùng:</p>
            <p>• Hình vuông, kích thước khuyên dùng 98x98 px trở lên.</p>
            <p>• Định dạng PNG, JPEG hoặc WebP.</p>
          </div>
        </div>

        {/* Meta Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="channel-name">Tên kênh</Label>
            <Input
              id="channel-name"
              value={name}
              onChange={event => setName(event.target.value)}
              placeholder="Nhập tên kênh"
              maxLength={100}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="channel-bio">Giới thiệu kênh</Label>
            <Textarea
              id="channel-bio"
              value={bio}
              onChange={event => setBio(event.target.value)}
              placeholder="Mô tả về kênh của bạn..."
              maxLength={1000}
              rows={4}
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {/* Footer Actions */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving || isUploadingAvatar || isUploadingBanner}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isSaving || isUploadingAvatar || isUploadingBanner}
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </div>
  );
}
