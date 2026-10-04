const CACHE_NAME = "manabi-log-v37";
const APP_ASSETS = [
  "./theme.css?v=37",
  "./design.css?v=37", "./design-ui.js?v=37",
  "./study-flow.js?v=37", "./study-flow-ui.js?v=37", "./analysis-engine.js?v=37", "./analysis-ui.js?v=37",
  "./schedule-edit.js?v=37",
  "./schedule-engine.js?v=37",
  "./schedule-ui.js?v=37",
  "./schedule.css?v=37",
  "./",
  "./index.html",
  "./style.css?v=37",
  "./app.js?v=37",
  "./manifest.webmanifest?v=37",
  "./icon.svg",
  "./theme.js?v=37",
  "./ui.js?v=37",
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
