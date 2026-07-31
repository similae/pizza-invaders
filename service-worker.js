const CACHE_VERSION = "pizza-invaders-v1.0.20";
const CORE_CACHE = `${CACHE_VERSION}-core`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const CORE_FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/pwa-icon-192.png",
  "./assets/pwa-icon-512.png",
  "./assets/pwa-icon-maskable-512.png",
  "./assets/apple-touch-icon.png",
  "./assets/PIZZAINVADERS-PINEAPPLE-BOSS-INTRO-MOBILE.png",
  "./assets/embedded-canvas-04-mobile.png",
  "./assets/PIZZAINVADERS-MASA-FERMENTADA-MOBILE.png",
  "./assets/PIZZAINVADERS-POPOCOLA-INTRO-MOBILE.png",
  "./assets/PIZZAINVADERS-FROZENPIZZA-VIDEO-MOBILE.mp4",
  "./assets/PIZZAINVADERS-LOGO-SIMILAE-LOADING.png",
  "./assets/sfx-confirm.wav",
  "./assets/sfx-powerup.wav",
  "./assets/sfx-hurt.wav",
  "./assets/sfx-boss.wav"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CORE_CACHE)
      .then(cache => cache.addAll(CORE_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CORE_CACHE && key !== RUNTIME_CACHE)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request, { cache: "no-store" })
        .then(response => {
          const copy = response.clone();
          caches.open(CORE_CACHE).then(cache => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const copy = response.clone();
        caches.open(RUNTIME_CACHE).then(cache => cache.put(request, copy));
        return response;
      });
    })
  );
});
