import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  href?: string;
  onClick?: () => void;
  muted?: boolean;
};

const Chevron = () => (
  <svg viewBox="0 0 8 14" className="size-3.5 shrink-0 text-muted" aria-hidden>
    <path d="M1 1l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export function ListRow({ title, subtitle, right, href, onClick, muted }: Props) {
  const body = (
    <>
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-base ${muted ? "text-muted" : "text-ink"}`}>{title}</span>
        {subtitle ? <span className="mt-0.5 block truncate text-sm text-muted">{subtitle}</span> : null}
      </span>
      {right}
      {href || onClick ? <Chevron /> : null}
    </>
  );

  const cls =
    "flex min-h-13 w-full items-center gap-3 px-4 py-2.5 text-left not-last:border-b not-last:border-line active:bg-line/30";

  if (href) return <Link href={href} className={cls}>{body}</Link>;
  if (onClick) return <button type="button" onClick={onClick} className={cls}>{body}</button>;
  return <div className={cls}>{body}</div>;
}
