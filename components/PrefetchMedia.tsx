"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { prefetchMedia } from "@/lib/media";
import { Icon } from "@/components/ui/Icon";

export function PrefetchMedia({ urls }: { urls: string[] }) {
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const running = progress !== null && progress.done < progress.total;
  const finished = progress !== null && progress.done >= progress.total;

  if (!urls.length) return null;

  const start = () => {
    setProgress({ done: 0, total: urls.length });
    prefetchMedia(urls, (done, total) => setProgress({ done, total }));
  };

  return (
    <Button variant="secondary" onClick={start} disabled={running || finished}>
      <span className="flex items-center justify-center gap-2">
        {finished ? <Icon name="check" className="size-4" strokeWidth={2.4} /> : null}
        {running
          ? `Đang tải ${progress.done}/${progress.total}…`
          : finished
            ? `Đã tải ${progress.total} GIF`
            : "Tải trước GIF"}
      </span>
    </Button>
  );
}
