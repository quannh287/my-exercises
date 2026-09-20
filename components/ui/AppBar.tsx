import Link from "next/link";
import type { ReactNode } from "react";

export function AppBar({ title, back, right }: { title: string; back?: string; right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 flex min-h-13 items-center gap-2 border-b border-line bg-surface/95 px-4 backdrop-blur">
      {back ? (
        <Link href={back} className="-ml-1 flex items-center gap-1 pr-1 text-base text-accent">
          <svg viewBox="0 0 8 14" className="size-3.5" aria-hidden>
            <path d="M7 1L1 7l6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Quay lại
        </Link>
      ) : null}
      <h1 className="flex-1 truncate text-center text-base font-semibold">{title}</h1>
      <span className="flex min-w-[4.5rem] justify-end text-base text-accent empty:min-w-0">{right}</span>
      {back ? <span className="w-0" /> : null}
    </header>
  );
}
