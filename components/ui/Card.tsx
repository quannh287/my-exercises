import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-card border border-line bg-surface ${className}`}>
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="px-4 pb-2 pt-6 text-xs font-semibold uppercase tracking-wide text-muted">
      {children}
    </h2>
  );
}
