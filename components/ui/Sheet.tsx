"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end" role="dialog" aria-modal aria-label={title}>
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Đóng" />
      <div className="safe-b relative max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-surface">
        <div className="sticky top-0 flex items-center gap-3 border-b border-line bg-surface px-4 py-3">
          <h2 className="flex-1 text-base font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="text-base text-accent">
            Đóng
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
