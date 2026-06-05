"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

const FALLBACK_THUMBNAIL = "/images/thumbnail.png";
const DEFAULT_THUMBNAIL_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px";
const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^::1$/,
];

function isPrivateImageUrl(src: string) {
  try {
    const { hostname } = new URL(src);
    return PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(hostname));
  } catch {
    return false;
  }
}

type VideoThumbnailProps = Omit<ImageProps, "src" | "alt" | "fill"> & {
  alt: string;
  src: string | null | undefined;
  wrapperClassName?: string;
};

export function VideoThumbnail({
  alt,
  src,
  className,
  sizes = DEFAULT_THUMBNAIL_SIZES,
  onError,
  wrapperClassName = "relative block h-full w-full overflow-hidden",
  ...props
}: VideoThumbnailProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const hasFailed = Boolean(src && failedSrc === src);
  const resolvedSrc = src && !hasFailed ? src : FALLBACK_THUMBNAIL;
  const shouldBypassOptimizer = isPrivateImageUrl(resolvedSrc);

  return (
    <span className={wrapperClassName}>
      <Image
        {...props}
        fill
        sizes={sizes}
        className={className || "h-full w-full object-cover"}
        src={resolvedSrc}
        alt={alt}
        unoptimized={shouldBypassOptimizer || props.unoptimized}
        onError={(event) => {
          onError?.(event);
          setFailedSrc(resolvedSrc);
        }}
      />
    </span>
  );
}
