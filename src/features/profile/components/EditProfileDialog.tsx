"use client";

import { useState, type FormEvent } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth/context/AuthContext";
import { getErrorMessage } from "@/shared/api/client";
import { profileService } from "../services/profile.service";
import type { ProfileUser } from "../types/profile.types";

interface EditProfileDialogProps {
  user: ProfileUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileDialog({ user, open, onOpenChange }: EditProfileDialogProps) {
  const { fetchProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [bio, setBio] = useState(user.bio || "");
  const [phone, setPhone] = useState(user.phone ? String(user.phone) : "");
  const [gender, setGender] = useState(user.gender || "");
  const [birthday, setBirthday] = useState(user.birthday ? user.birthday.slice(0, 10) : "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const normalizedPhone = phone.trim();
    if (normalizedPhone && !/^\d{8,15}$/.test(normalizedPhone)) {
      setError("Số điện thoại chỉ gồm 8-15 chữ số.");
      return;
    }

    setIsSubmitting(true);
    try {
      await profileService.updateProfile({
        displayName: displayName.trim() || undefined,
        bio: bio.trim() || undefined,
        phone: normalizedPhone ? Number(normalizedPhone) : undefined,
        gender: gender ? (gender as "male" | "women" | "female") : undefined,
        birthday: birthday || undefined,
      });
      await fetchProfile();
      onOpenChange(false);
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Không thể cập nhật hồ sơ."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl rounded-lg border border-border/30 bg-card p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Profile settings</p>
            <h2 className="mt-2 font-headline text-2xl font-black tracking-tight text-foreground">Cập nhật hồ sơ</h2>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-11 w-11 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Đóng form cập nhật hồ sơ"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="profile-display-name">Tên hiển thị</Label>
            <Input id="profile-display-name" value={displayName} onChange={event => setDisplayName(event.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="profile-bio">Giới thiệu</Label>
            <Textarea id="profile-bio" value={bio} onChange={event => setBio(event.target.value)} rows={4} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-phone">Số điện thoại</Label>
            <Input id="profile-phone" inputMode="numeric" value={phone} onChange={event => setPhone(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-birthday">Ngày sinh</Label>
            <Input id="profile-birthday" type="date" value={birthday} onChange={event => setBirthday(event.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="profile-gender">Giới tính</Label>
            <select
              id="profile-gender"
              value={gender}
              onChange={event => setGender(event.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Không chọn</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="women">Nữ (legacy)</option>
            </select>
          </div>
        </div>

        {error && <p className="mt-4 rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </div>
  );
}
