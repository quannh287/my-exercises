import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

export function AppBar({ title, back, right }: { title: string; back?: string; right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 flex min-h-13 items-center gap-2 border-b border-line/60 bg-surface/95 px-4 backdrop-blur">
      {back ? (
        <Link href={back} className="-ml-1 flex items-center gap-1 pr-1 text-base text-accent">
          <Icon name="chevronLeft" className="size-4" strokeWidth={2} />
          Quay lại
        </Link>
      ) : null}
      <h1 className="flex-1 truncate text-center font-serif text-base font-semibold">{title}</h1>
      <span className="flex min-w-[4.5rem] justify-end text-base text-accent empty:min-w-0">{right}</span>
      {back ? <span className="w-0" /> : null}
    </header>
  );
}
