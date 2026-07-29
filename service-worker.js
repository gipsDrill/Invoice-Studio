const CACHE = 'billora-1.14.1-local-only';
const FILES = [
  './','./index.html','./followup.html','./calculators.html',
  './styles.css','./styles.css?v=1.14.1','./followup.css','./followup.css?v=1.14.1',
  './invoice-renderer.js','./invoice-renderer.js?v=1.14.1','./app.js','./app.js?v=1.14.1',
  './export.js','./export.js?v=1.14.1','./calculators.js','./calculators.js?v=1.14.1',
  './followup.js','./followup.js?v=1.14.1','./manifest.webmanifest','./assets/icon.svg','./robots.txt'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match('./index.html'))))});
