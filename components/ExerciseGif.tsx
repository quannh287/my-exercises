import Image from "next/image";

/** Animated GIFs gain nothing from the optimizer, so they bypass it entirely. */
export function ExerciseGif({ src, alt, size }: { src: string; alt: string; size: number }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      unoptimized
      className="size-full bg-bg object-contain"
    />
  );
}
