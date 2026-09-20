import type { ReactNode } from "react";

type Tone = "neutral" | "accent" | "amber" | "danger";

const TONES: Record<Tone, string> = {
  neutral: "bg-bg text-muted",
  accent: "bg-accent-soft text-accent",
  amber: "bg-tertiary-soft text-tertiary",
  danger: "bg-danger/10 text-danger",
};

export function Chip({
  tone = "neutral",
  className = "",
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-tertiary">{children}</span>
  );
}
