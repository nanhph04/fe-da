"use client";

import { useState, type FormEvent } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/shared/api/client";
import { profileService } from "../services/profile.service";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 8) {
      setError("Mật khẩu mới cần tối thiểu 8 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsSubmitting(true);
    try {
      await profileService.changePassword({ oldPassword, newPassword });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Đã đổi mật khẩu thành công.");
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Không thể đổi mật khẩu."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-lg border border-border/30 bg-card p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Security</p>
            <h2 className="mt-2 font-headline text-2xl font-black tracking-tight text-foreground">Đổi mật khẩu</h2>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-11 w-11 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Đóng form đổi mật khẩu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="old-password">Mật khẩu hiện tại</Label>
            <Input id="old-password" type="password" value={oldPassword} onChange={event => setOldPassword(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Mật khẩu mới</Label>
            <Input id="new-password" type="password" value={newPassword} onChange={event => setNewPassword(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
            <Input id="confirm-password" type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} required />
          </div>
        </div>

        {error && <p className="mt-4 rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        {success && <p className="mt-4 rounded-sm border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">{success}</p>}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Đóng
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Cập nhật mật khẩu
          </Button>
        </div>
      </form>
    </div>
  );
}
