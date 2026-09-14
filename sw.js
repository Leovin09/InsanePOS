const APP_VERSION = '1.0.2';
const CACHE_NAME = `insane-cache-v${APP_VERSION}`;
const PRECACHE_URLS = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) =>
        /* Each file is cached independently (allSettled, not addAll) so that
           one missing/renamed file — like a mistyped icon path — can't take
           down the whole install and leave the app uninstallable. Anything
           that fails here will simply be fetched fresh over the network the
           next time it's needed. */
        Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)))
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

/* Network-first, cache-fallback: whenever the tablet is online, always try
   to fetch the latest copy of a file first (so edits made on GitHub show up
   on next open, with no manual versioning step). If that fails — no signal,
   airplane mode, wifi down — fall straight to whatever's cached so the app
   keeps working exactly the same offline. Successful network responses are
   also re-cached, so the offline copy keeps itself reasonably fresh too. */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match('./index.html'))
      )
  );
});
