const CACHE_NAME = "manabi-log-v15";
const APP_ASSETS = [
  "./schedule-edit.js?v=15",
  "./schedule-engine.js?v=15",
  "./schedule-ui.js?v=15",
  "./schedule.css?v=15",
  "./",
  "./index.html",
  "./style.css?v=15",
  "./app.js?v=15",
  "./manifest.webmanifest?v=15",
  "./icon.svg",
  "./theme.js?v=15",
  "./ui.js?v=15",
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
