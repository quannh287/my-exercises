import Image from "next/image";
import { Chip } from "@/components/ui/Chip";

export function BrandBar() {
  return (
    <header className="sticky top-0 z-30 flex min-h-13 items-center gap-2 border-b border-line/50 bg-surface/95 px-4 backdrop-blur">
      <Image src="/icon-192.png" alt="" width={32} height={32} className="size-8 rounded-lg" priority />
      <span className="font-serif text-base font-semibold">Lịch tập</span>
      <span className="flex-1" />
      <Chip>OFFLINE</Chip>
    </header>
  );
}
