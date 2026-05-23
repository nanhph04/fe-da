"use client";

import { useState } from "react";

const FALLBACK_THUMBNAIL = "/images/thumbnail.png";

interface VideoThumbnailProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  alt: string;
  src: string | null | undefined;
}

export function VideoThumbnail({ alt, src, className, ...props }: VideoThumbnailProps) {
  const [prevSrc, setPrevSrc] = useState(src);
  const [resolvedSrc, setResolvedSrc] = useState(src || FALLBACK_THUMBNAIL);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setResolvedSrc(src || FALLBACK_THUMBNAIL);
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      className={className || "h-full w-full object-cover"}
      src={resolvedSrc}
      alt={alt}
      onError={() => {
        setResolvedSrc(FALLBACK_THUMBNAIL);
      }}
    />
  );
}
