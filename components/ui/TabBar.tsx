"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";

const TABS = [
  { href: "/", label: "Lịch", icon: "calendar" },
  { href: "/exercises", label: "Bài tập", icon: "dumbbell" },
  { href: "/history", label: "Lịch sử", icon: "history" },
  { href: "/me", label: "Tôi", icon: "user" },
] as const satisfies readonly { href: string; label: string; icon: IconName }[];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="safe-b sticky bottom-0 z-40 flex border-t border-line/60 bg-surface/95 backdrop-blur">
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
            <Icon name={tab.icon} className="size-6" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
