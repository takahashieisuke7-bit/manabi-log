const CACHE_NAME = "manabi-log-v33";
const APP_ASSETS = [
  "./theme.css?v=33",
  "./design.css?v=33", "./design-ui.js?v=33",
  "./study-flow.js?v=33", "./study-flow-ui.js?v=33", "./analysis-engine.js?v=33", "./analysis-ui.js?v=33",
  "./schedule-edit.js?v=33",
  "./schedule-engine.js?v=33",
  "./schedule-ui.js?v=33",
  "./schedule.css?v=33",
  "./",
  "./index.html",
  "./style.css?v=33",
  "./app.js?v=33",
  "./manifest.webmanifest?v=33",
  "./icon.svg",
  "./theme.js?v=33",
  "./ui.js?v=33",
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
