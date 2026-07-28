const CACHE = 'invoice-studio-v1.11.6';
const FILES = [
  './', './index.html', './calculators.html',
  './styles.css', './styles.css?v=1.11.6',
  './invoice-renderer.js', './invoice-renderer.js?v=1.11.6',
  './app.js', './app.js?v=1.11.6',
  './export.js', './export.js?v=1.11.6',
  './calculators.js', './calculators.js?v=1.11.6',
  './manifest.webmanifest', './assets/icon.svg', './robots.txt'
];
self.addEventListener('install', (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', (event) => event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(event.request, copy)); return response;
  }).catch(() => caches.match('./index.html'))));
});
