const CACHE_NAME = "manabi-log-v31";
const APP_ASSETS = [
  "./theme.css?v=31",
  "./design.css?v=31", "./design-ui.js?v=31",
  "./study-flow.js?v=31", "./study-flow-ui.js?v=31", "./analysis-engine.js?v=31", "./analysis-ui.js?v=31",
  "./schedule-edit.js?v=31",
  "./schedule-engine.js?v=31",
  "./schedule-ui.js?v=31",
  "./schedule.css?v=31",
  "./",
  "./index.html",
  "./style.css?v=31",
  "./app.js?v=31",
  "./manifest.webmanifest?v=31",
  "./icon.svg",
  "./theme.js?v=31",
  "./ui.js?v=31",
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
