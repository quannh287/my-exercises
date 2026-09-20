"use client";

import Image from "next/image";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

/** Animated GIFs gain nothing from the optimizer, so they bypass it entirely. */
export function ExerciseGif({ src, alt, size }: { src: string; alt: string; size: number }) {
  // Build đã loại bài mất gif, nhưng CDN vẫn có thể chết sau đó — ô xám còn hơn icon ảnh vỡ.
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <span className="grid size-full place-items-center bg-bg text-muted" role="img" aria-label={alt}>
        <Icon name="dumbbell" className="size-1/4 max-h-16 min-h-6" />
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      unoptimized
      onError={() => setBroken(true)}
      className="size-full bg-bg object-contain"
    />
  );
}
