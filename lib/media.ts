/**
 * Warms the service worker cache with exercise GIFs.
 * Uses `new Image()` rather than `fetch()`: the CDN sends no CORS header, so a plain fetch fails,
 * and an image request is byte-for-byte what <img> will later ask for — so the SW caches the right entry.
 */
export async function prefetchMedia(
  urls: string[],
  onProgress?: (done: number, total: number) => void,
  concurrency = 4,
): Promise<number> {
  const queue = [...new Set(urls)];
  const total = queue.length;
  let done = 0;

  const worker = async () => {
    for (let url = queue.shift(); url; url = queue.shift()) {
      await load(url);
      onProgress?.(++done, total);
    }
  };

  await Promise.all(Array.from({ length: Math.min(concurrency, total) }, worker));
  return total;
}

// ponytail: a failed image just resolves — one dead URL must not stall the batch, and there is nothing useful to retry.
const load = (src: string) =>
  new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
  });
