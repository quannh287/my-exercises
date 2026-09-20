"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { prefetchMedia } from "@/lib/media";

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
      {running
        ? `Đang tải ${progress.done}/${progress.total}…`
        : finished
          ? `✓ Đã tải ${progress.total} GIF`
          : "Tải trước GIF"}
    </Button>
  );
}
