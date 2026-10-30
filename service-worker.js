const CACHE_NAME = "manabi-log-v38";
const APP_ASSETS = [
  "./theme.css?v=38",
  "./design.css?v=38", "./design-ui.js?v=38",
  "./study-flow.js?v=38", "./study-flow-ui.js?v=38", "./analysis-engine.js?v=38", "./analysis-ui.js?v=38",
  "./schedule-edit.js?v=38",
  "./schedule-engine.js?v=38",
  "./schedule-ui.js?v=38",
  "./schedule.css?v=38",
  "./",
  "./index.html",
  "./style.css?v=38",
  "./app.js?v=38",
  "./manifest.webmanifest?v=38",
  "./icon.svg",
  "./theme.js?v=38",
  "./ui.js?v=38", "./schedule-settings-ui.js?v=38",
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
