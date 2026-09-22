const CACHE_NAME = "manabi-log-v16";
const APP_ASSETS = [
  "./study-flow.js?v=16", "./study-flow-ui.js?v=16", "./analysis-engine.js?v=16", "./analysis-ui.js?v=16",
  "./schedule-edit.js?v=16",
  "./schedule-engine.js?v=16",
  "./schedule-ui.js?v=16",
  "./schedule.css?v=16",
  "./",
  "./index.html",
  "./style.css?v=16",
  "./app.js?v=16",
  "./manifest.webmanifest?v=16",
  "./icon.svg",
  "./theme.js?v=16",
  "./ui.js?v=16",
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
