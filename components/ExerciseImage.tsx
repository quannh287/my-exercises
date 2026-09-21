"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";

const SWAP_MS = 1200;

/** free-exercise-db chỉ có ảnh tĩnh start/finish, nên đổi qua lại để thấy được động tác. */
export function ExerciseImage({ srcs, alt, size }: { srcs: string[]; alt: string; size: number }) {
  // Build đã loại bài không ảnh, nhưng CDN vẫn có thể chết sau đó — ô xám còn hơn icon ảnh vỡ.
  const [broken, setBroken] = useState(false);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (srcs.length < 2) return;
    const id = setInterval(() => setFrame((f) => (f + 1) % srcs.length), SWAP_MS);
    return () => clearInterval(id);
  }, [srcs.length]);

  if (broken || !srcs.length) {
    return (
      <span className="grid size-full place-items-center bg-bg text-muted" role="img" aria-label={alt}>
        <Icon name="dumbbell" className="size-1/4 max-h-16 min-h-6" />
      </span>
    );
  }

  return (
    <span className="relative block size-full bg-bg">
      {srcs.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={i === 0 ? alt : ""}
          width={size}
          height={size}
          unoptimized
          onError={() => setBroken(true)}
          // Cả hai khung cùng nằm sẵn trong DOM: đổi opacity không phải tải lại ảnh mỗi nhịp.
          className={`absolute inset-0 size-full object-contain transition-opacity duration-300 ${
            i === frame ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </span>
  );
}
