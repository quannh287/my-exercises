"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";
import { prefetchMedia } from "@/lib/media";
import { Icon } from "@/components/ui/Icon";

type Progress = { done: number; total: number };

// ponytail: state ở module nên tiến trình sống qua remount khi đổi tab; reset khi reload app.
let snapshot: Progress | null = null;
const subs = new Set<() => void>();

const subscribe = (fn: () => void) => {
  subs.add(fn);
  return () => void subs.delete(fn);
};

const emit = (p: Progress) => {
  snapshot = p;
  subs.forEach((fn) => fn());
};

const start = (urls: string[]) => {
  if (snapshot || !urls.length) return;
  emit({ done: 0, total: urls.length });
  prefetchMedia(urls, (done, total) => emit({ done, total }));
};

export function PrefetchMedia({ urls }: { urls: string[] }) {
  const progress = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => null,
  );

  useEffect(() => {
    start(urls);
  }, [urls]);

  const running = progress !== null && progress.done < progress.total;
  const finished = progress !== null && progress.done >= progress.total;

  if (!urls.length) return null;

  return (
    <Button variant="secondary" onClick={() => start(urls)} disabled={running || finished}>
      <span className="flex items-center justify-center gap-2">
        {finished ? <Icon name="check" className="size-4" strokeWidth={2.4} /> : null}
        {running
          ? `Đang tải ${progress.done}/${progress.total}…`
          : finished
            ? `Đã tải ${progress.total} ảnh`
            : "Tải trước ảnh"}
      </span>
    </Button>
  );
}
