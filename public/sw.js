// Cache-first for the two things that make the app work offline: the bundled catalog and the GIFs already seen.
const CACHE = "workout-v2";
const CACHEABLE = (url) =>
  url.pathname.startsWith("/data/") || url.hostname === "static.exercisedb.dev";

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
  if (!CACHEABLE(url)) return;

  event.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ??
        fetch(request).then((res) => {
          if (res.ok) caches.open(CACHE).then((c) => c.put(request, res.clone()));
          return res;
        }),
    ),
  );
});
