const CACHE_NAME = "manabi-log-v14";
const APP_ASSETS = [
  "./schedule-engine.js?v=14",
  "./schedule-ui.js?v=14",
  "./schedule.css?v=14",
  "./",
  "./index.html",
  "./style.css?v=14",
  "./app.js?v=14",
  "./manifest.webmanifest?v=14",
  "./icon.svg",
  "./theme.js?v=14",
  "./ui.js?v=14",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => (
        caches.match(event.request)
          .then((cached) => cached || caches.match("./index.html"))
      )),
  );
});
