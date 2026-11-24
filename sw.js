const CACHE='certifia-hub-demo-v61-trainer-availability-reset';
const URLS=[
  './', './index.html', './amo-phase1.js', './hub.js', './agenda-v2.js', './agenda-v2.css', './kpi-v2.js', './kpi-v2.css', './scoping-calls.js', './scoping-calls.css', './extra.css', './proposition.css', './proposition.js', './operations.js', './operations.css', './manifest.webmanifest', './assets/certifia-logo.png',
  './favicon.ico',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/favicon-16.png',
  './assets/icons/favicon-32.png',
  './assets/icons/favicon-48.png',
  './assets/icons/pwa-192.png',
  './assets/icons/pwa-512.png',
  './assets/icons/pwa-maskable-192.png',
  './assets/icons/pwa-maskable-512.png',
  './manifest-blanc.webmanifest',
  './manifest-degrade.webmanifest',
  './assets/documents/charte-collaboration-certif-ia-2026.pdf',
  './assets/icons/gradient/apple-touch-icon.png',
  './assets/icons/gradient/favicon-16.png',
  './assets/icons/gradient/favicon-32.png',
  './assets/icons/gradient/favicon-48.png',
  './assets/icons/gradient/favicon.ico',
  './assets/icons/gradient/pwa-192.png',
  './assets/icons/gradient/pwa-512.png',
  './assets/icons/gradient/pwa-maskable-192.png',
  './assets/icons/gradient/pwa-maskable-512.png',
  './assets/icons/white/apple-touch-icon.png',
  './assets/icons/white/favicon-16.png',
  './assets/icons/white/favicon-32.png',
  './assets/icons/white/favicon-48.png',
  './assets/icons/white/favicon.ico',
  './assets/icons/white/pwa-192.png',
  './assets/icons/white/pwa-512.png',
  './assets/icons/white/pwa-maskable-192.png',
  './assets/icons/white/pwa-maskable-512.png'
];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(URLS))));
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin)return;event.respondWith(fetch(event.request).catch(()=>caches.match(event.request)));});