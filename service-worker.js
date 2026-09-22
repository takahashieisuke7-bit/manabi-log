const CACHE_NAME = "manabi-log-v17";
const APP_ASSETS = [
  "./study-flow.js?v=17", "./study-flow-ui.js?v=17", "./analysis-engine.js?v=17", "./analysis-ui.js?v=17",
  "./schedule-edit.js?v=17",
  "./schedule-engine.js?v=17",
  "./schedule-ui.js?v=17",
  "./schedule.css?v=17",
  "./",
  "./index.html",
  "./style.css?v=17",
  "./app.js?v=17",
  "./manifest.webmanifest?v=17",
  "./icon.svg",
  "./theme.js?v=17",
  "./ui.js?v=17",
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
