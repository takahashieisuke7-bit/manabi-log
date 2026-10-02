const CACHE_NAME = "manabi-log-v35";
const APP_ASSETS = [
  "./theme.css?v=35",
  "./design.css?v=35", "./design-ui.js?v=35",
  "./study-flow.js?v=35", "./study-flow-ui.js?v=35", "./analysis-engine.js?v=35", "./analysis-ui.js?v=35",
  "./schedule-edit.js?v=35",
  "./schedule-engine.js?v=35",
  "./schedule-ui.js?v=35",
  "./schedule.css?v=35",
  "./",
  "./index.html",
  "./style.css?v=35",
  "./app.js?v=35",
  "./manifest.webmanifest?v=35",
  "./icon.svg",
  "./theme.js?v=35",
  "./ui.js?v=35",
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
