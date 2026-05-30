"use client";

import { useState } from "react";

const FALLBACK_THUMBNAIL = "/images/thumbnail.png";

interface VideoThumbnailProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  alt: string;
  src: string | null | undefined;
}

export function VideoThumbnail({ alt, src, className, ...props }: VideoThumbnailProps) {
  const [fallbackActive, setFallbackActive] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  // Sync state with src changes at render time to avoid useEffect cascading renders
  if (src !== prevSrc) {
    setPrevSrc(src);
    setFallbackActive(false);
  }

  const resolvedSrc = src && !fallbackActive ? src : FALLBACK_THUMBNAIL;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      className={className || "h-full w-full object-cover"}
      src={resolvedSrc}
      alt={alt}
      onError={() => {
        console.error("[VideoThumbnail] thumbnail failed to load", {
          alt,
          requestedSrc: resolvedSrc,
          fallback: FALLBACK_THUMBNAIL,
        });
        setFallbackActive(true);
      }}
    />
  );
}

