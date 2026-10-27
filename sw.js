// Niki fungi app – service worker (offline működés)
// Az app fájljai a gyorsítótárból töltődnek (azonnal, offline is), a háttérben frissülnek.
const CACHE = 'niki-fungi-394bdfa051';
const FAJLOK = [
  "./",
  "./css/app.css",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-64.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./index.html",
  "./js/app.js",
  "./js/data.js",
  "./js/fotok.js",
  "./js/ikonok.js",
  "./js/logika.js",
  "./manifest.webmanifest",
  "./vendor/exifr/exifr.lite.umd.js",
  "./vendor/leaflet/images/layers-2x.png",
  "./vendor/leaflet/images/layers.png",
  "./vendor/leaflet/images/marker-icon-2x.png",
  "./vendor/leaflet/images/marker-icon.png",
  "./vendor/leaflet/images/marker-shadow.png",
  "./vendor/leaflet/leaflet.css",
  "./vendor/leaflet/leaflet.js"
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FAJLOK)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(kulcsok => Promise.all(kulcsok.filter(k => k.startsWith('niki-fungi-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Csak a saját fájlokat kezeljük; a térképcsempék a böngésző normál gyorsítótárát használják.
  if (url.origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const kulcs = req.mode === 'navigate' ? './' : req;
    const tarolt = await cache.match(kulcs, { ignoreSearch: true });
    const halozat = fetch(req).then(r => {
      if (r && r.ok && r.type === 'basic') cache.put(kulcs, r.clone());
      return r;
    }).catch(() => null);
    if (tarolt) {
      e.waitUntil(halozat);
      return tarolt;
    }
    const r = await halozat;
    return r || new Response('Offline – az oldal még nincs elmentve.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  })());
});
