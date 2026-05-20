"use client";

import { useEffect, useState } from "react";
import { api, getLocalAccessToken } from "@/shared/api/client";

const FALLBACK_THUMBNAIL = "/images/thumbnail.png";

function isOwnerThumbnailUrl(url: string) {
  return url.startsWith("/api/media/videos/me/");
}

interface StudioThumbnailProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  alt: string;
  src: string | null | undefined;
}

export function StudioThumbnail({ alt, src, className, ...props }: StudioThumbnailProps) {
  const [resolvedSrc, setResolvedSrc] = useState(() => {
    if (src && isOwnerThumbnailUrl(src)) {
      return FALLBACK_THUMBNAIL;
    }
    return src || FALLBACK_THUMBNAIL;
  });

  useEffect(() => {
    if (!src || !isOwnerThumbnailUrl(src)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResolvedSrc(src || FALLBACK_THUMBNAIL);
      return;
    }

    const controller = new AbortController();
    let objectUrl: string | null = null;

    const loadPrivateThumbnail = async () => {
      try {
        const token = getLocalAccessToken();
        if (!token) {
          // AuthContext will handle redirecting unauthenticated users.
          return;
        }

        const blob = (await api.get(src, {
          requireAuth: true,
          responseType: "blob",
          signal: controller.signal,
        })) as unknown as Blob;

        objectUrl = URL.createObjectURL(blob);
        setResolvedSrc(objectUrl);
      } catch {
        if (!controller.signal.aborted) {
          setResolvedSrc(FALLBACK_THUMBNAIL);
        }
      }
    };

    void loadPrivateThumbnail();

    return () => {
      controller.abort();
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      className={className || "h-full w-full object-cover"}
      src={resolvedSrc}
      alt={alt}
      onError={event => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = FALLBACK_THUMBNAIL;
      }}
    />
  );
}
