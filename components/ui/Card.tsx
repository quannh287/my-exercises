import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-card bg-surface shadow-soft ${className}`}>
      {children}
    </div>
  );
}
