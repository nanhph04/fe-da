"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Camera, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context/AuthContext";
import { getErrorMessage } from "@/shared/api/client";
import { profileService } from "../services/profile.service";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function AvatarUploadButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { fetchProfile } = useAuth();
  const t = useTranslations("ProfilePage.avatar");
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!ALLOWED_AVATAR_TYPES.includes(file.type as (typeof ALLOWED_AVATAR_TYPES)[number])) {
      setMessage(t("validation.unsupportedType"));
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      setMessage(t("validation.sizeLimit"));
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      const res = await profileService.uploadAvatar(file);
      if (res.success) {
        await fetchProfile();
        setMessage(t("success"));
      } else {
        setMessage(res.message || t("errors.uploadFailed"));
      }
    } catch (error) {
      setMessage(getErrorMessage(error, t("errors.uploadFailed")));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="absolute -bottom-2 -right-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFileChange}
        aria-label={t("ariaLabel")}
      />
      <Button
        type="button"
        size="icon"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        className="h-11 w-11 rounded-lg bg-primary text-primary-foreground shadow-lg transition-transform duration-300 hover:-translate-y-0.5 hover:opacity-90"
        aria-label={t("ariaLabel")}
        title={message || t("ariaLabel")}
      >
        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
      </Button>
    </div>
  );
}
