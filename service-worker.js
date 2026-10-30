const CACHE_NAME = "manabi-log-v39";
const APP_ASSETS = [
  "./theme.css?v=39",
  "./design.css?v=39", "./design-ui.js?v=39",
  "./study-flow.js?v=39", "./study-flow-ui.js?v=39", "./analysis-engine.js?v=39", "./analysis-ui.js?v=39",
  "./schedule-edit.js?v=39",
  "./schedule-engine.js?v=39",
  "./schedule-ui.js?v=39",
  "./schedule.css?v=39",
  "./",
  "./index.html",
  "./style.css?v=39",
  "./app.js?v=39",
  "./manifest.webmanifest?v=39",
  "./icon.svg",
  "./theme.js?v=39",
  "./ui.js?v=39", "./schedule-settings-ui.js?v=39",
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
