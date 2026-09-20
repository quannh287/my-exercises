// Cache-first for the two things that make the app work offline: the bundled catalog and the GIFs already seen.
const CACHE = "workout-v3";
const CACHE_FIRST = (url) =>
  url.pathname.startsWith("/data/") ||
  url.pathname.startsWith("/_next/static/") ||
  url.hostname === "static.exercisedb.dev";

// The GIF CDN sends no CORS header, so <img> requests come back opaque (status 0, ok === false) — still worth storing.
const storable = (res) => res.ok || res.type === "opaque";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (request.mode === "navigate") {
    const fromCache = () => caches.match(request).then((hit) => hit ?? caches.match("/"));
    // A gym basement gives weak signal, not none: without this the page hangs on a stalled fetch instead of using the cache.
    const timeout = new Promise((_, reject) => setTimeout(reject, 3000));
    event.respondWith(
      Promise.race([
        fetch(request).then((res) => {
          if (storable(res)) caches.open(CACHE).then((c) => c.put(request, res.clone()));
          return res;
        }),
        timeout,
      ]).catch(fromCache),
    );
    return;
  }

  if (!CACHE_FIRST(url)) return;

  event.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ??
        fetch(request).then((res) => {
          if (storable(res)) caches.open(CACHE).then((c) => c.put(request, res.clone()));
          return res;
        }),
    ),
  );
});
