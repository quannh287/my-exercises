"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Lịch", icon: "M3 5h18M3 12h18M3 19h18" },
  { href: "/exercises", label: "Bài tập", icon: "M4 9v6M8 7v10M16 7v10M20 9v6M8 12h8" },
  { href: "/history", label: "Lịch sử", icon: "M12 7v5l3 2M3 12a9 9 0 1 0 2-5.6M3 4v3h3" },
  { href: "/me", label: "Tôi", icon: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 0116 0" },
] as const;

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="safe-b sticky bottom-0 z-40 flex border-t border-line bg-surface/95 backdrop-blur">
      {TABS.map((tab) => {
        const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-13 flex-1 flex-col items-center justify-center gap-1 py-2 text-xs ${
              active ? "text-accent" : "text-muted"
            }`}
          >
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
              <path d={tab.icon} />
            </svg>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
