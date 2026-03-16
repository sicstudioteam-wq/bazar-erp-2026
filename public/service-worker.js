// Gantikan dengan versi baharu setiap kali anda buat perubahan besar sebelum build!
const CACHE_NAME = 'bazar-erp-v2'; // <--- Tukar v1 kepada v2, v3 dan seterusnya.

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Pasang versi baharu dan paksa ia mengambil alih serta-merta
self.addEventListener('install', event => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Buang cache lama apabila Service Worker versi baharu diaktifkan
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Memadam cache dari versi terdahulu
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Memaksa klien (browser) untuk terus menggunakan versi baharu
  );
});

// Strategi Rangkaian: Utamakan Rangkaian (Network First), jatuh balik kepada Cache (jika tiada internet)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});