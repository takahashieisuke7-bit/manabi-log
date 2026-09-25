const CACHE_NAME = "manabi-log-v19";
const APP_ASSETS = [
  "./design.css?v=19", "./design-ui.js?v=19",
  "./study-flow.js?v=19", "./study-flow-ui.js?v=19", "./analysis-engine.js?v=19", "./analysis-ui.js?v=19",
  "./schedule-edit.js?v=19",
  "./schedule-engine.js?v=19",
  "./schedule-ui.js?v=19",
  "./schedule.css?v=19",
  "./",
  "./index.html",
  "./style.css?v=19",
  "./app.js?v=19",
  "./manifest.webmanifest?v=19",
  "./icon.svg",
  "./theme.js?v=19",
  "./ui.js?v=19",
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
