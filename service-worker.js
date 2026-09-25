const CACHE_NAME = "manabi-log-v18";
const APP_ASSETS = [
  "./design.css?v=18", "./design-ui.js?v=18",
  "./study-flow.js?v=18", "./study-flow-ui.js?v=18", "./analysis-engine.js?v=18", "./analysis-ui.js?v=18",
  "./schedule-edit.js?v=18",
  "./schedule-engine.js?v=18",
  "./schedule-ui.js?v=18",
  "./schedule.css?v=18",
  "./",
  "./index.html",
  "./style.css?v=18",
  "./app.js?v=18",
  "./manifest.webmanifest?v=18",
  "./icon.svg",
  "./theme.js?v=18",
  "./ui.js?v=18",
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
