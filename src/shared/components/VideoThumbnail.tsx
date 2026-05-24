"use client";

import { useEffect, useState } from "react";

const FALLBACK_THUMBNAIL = "/images/thumbnail.png";

interface VideoThumbnailProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  alt: string;
  src: string | null | undefined;
}

function resolveThumbnailSrc(src: string | null | undefined, currentSrc: string) {
  if (src) {
    return src;
  }

  return currentSrc === FALLBACK_THUMBNAIL ? FALLBACK_THUMBNAIL : currentSrc;
}

export function VideoThumbnail({ alt, src, className, ...props }: VideoThumbnailProps) {
  const [resolvedSrc, setResolvedSrc] = useState(src || FALLBACK_THUMBNAIL);

  useEffect(() => {
    console.log("[VideoThumbnail] source updated", {
      alt,
      src,
      fallback: FALLBACK_THUMBNAIL,
    });

    setResolvedSrc((currentSrc) => {
      const nextSrc = resolveThumbnailSrc(src, currentSrc);
      console.log("[VideoThumbnail] resolved thumbnail source", {
        alt,
        inputSrc: src,
        currentSrc,
        nextSrc,
      });
      return nextSrc;
    });
  }, [alt, src]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      className={className || "h-full w-full object-cover"}
      src={resolvedSrc}
      alt={alt}
      onError={(event) => {
        console.error("[VideoThumbnail] thumbnail failed to load", {
          alt,
          requestedSrc: event.currentTarget.src,
          resolvedSrc,
          fallback: FALLBACK_THUMBNAIL,
        });
        setResolvedSrc(FALLBACK_THUMBNAIL);
      }}
    />
  );
}
